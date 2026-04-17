import { Router, Request, Response } from 'express'
import { prisma } from '../config/db'
import { authenticate, authorize } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { param } from '../middleware/params'
import { sendKycStatusEmail } from '../services/email'
import { releaseEscrow, refundEscrow } from '../services/payoutEngine'

const router = Router()
router.use(authenticate, authorize('ADMIN'))

// ─── Dashboard stats ─────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response) => {
  const [totalUsers, totalListings, activeListings, totalInvestments, totalFunded, pendingKyc] = await Promise.all([
    prisma.user.count(), prisma.listing.count(),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.investment.count(),
    prisma.listing.aggregate({ _sum: { raisedAmount: true } }),
    prisma.user.count({ where: { kycStatus: 'PENDING' } }),
  ])
  res.json({ totalUsers, totalListings, activeListings, totalInvestments, totalFunded: totalFunded._sum.raisedAmount || 0, pendingKyc })
})

// ─── List all users ──────────────────────────────────────
router.get('/users', async (req: Request, res: Response) => {
  const { role, kycStatus, page = '1', limit = '20' } = req.query
  const where: any = {}
  if (role) where.role = role
  if (kycStatus) where.kycStatus = kycStatus

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        kycStatus: true, city: true, createdAt: true,
        _count: { select: { investments: true, businesses: true } },
      },
      skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])
  res.json({ users, total, page: Number(page), limit: Number(limit) })
})

// ─── Verify/Reject KYC ──────────────────────────────────
router.patch('/users/:id/kyc', async (req: Request, res: Response) => {
  const { status, reason } = req.body
  if (!['VERIFIED', 'REJECTED'].includes(status)) throw new AppError('Status must be VERIFIED or REJECTED')

  const user = await prisma.user.update({
    where: { id: param(req, 'id') },
    data: { kycStatus: status, kycVerifiedAt: status === 'VERIFIED' ? new Date() : undefined },
  })
  sendKycStatusEmail(user.email, user.name, status === 'VERIFIED' ? 'verified' : 'rejected', reason).catch(console.error)
  res.json({ message: `KYC ${status.toLowerCase()}`, userId: user.id })
})

// ─── List all listings ───────────────────────────────────
router.get('/listings', async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query
  const where: any = {}
  if (status) where.status = status

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        business: { select: { name: true, category: true, city: true, verified: true }, include: { owner: { select: { name: true, email: true } } } },
        _count: { select: { investments: true } },
      },
      skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { createdAt: 'desc' },
    }),
    prisma.listing.count({ where }),
  ])
  res.json({ listings, total })
})

// ─── Approve/Reject listing ─────────────────────────────
router.patch('/listings/:id/status', async (req: Request, res: Response) => {
  const { status, reason } = req.body
  if (!['ACTIVE', 'REJECTED'].includes(status)) throw new AppError('Status must be ACTIVE or REJECTED')

  const id = param(req, 'id')
  const listing = await prisma.listing.update({
    where: { id },
    data: { status },
    include: { business: true },
  })

  await prisma.notification.create({
    data: {
      userId: listing.business.ownerId,
      title: status === 'ACTIVE' ? 'Listing Approved' : 'Listing Rejected',
      message: status === 'ACTIVE'
        ? `Your listing "${listing.title}" has been approved and is now live.`
        : `Your listing "${listing.title}" was rejected. ${reason || ''}`,
      link: '/owner/dashboard',
    },
  })
  res.json({ message: `Listing ${status.toLowerCase()}`, listingId: listing.id })
})

// ─── Verify business ─────────────────────────────────────
router.patch('/businesses/:id/verify', async (req: Request, res: Response) => {
  const business = await prisma.business.update({ where: { id: param(req, 'id') }, data: { verified: true } })
  res.json({ message: 'Business verified', businessId: business.id })
})

// ─── Force release/refund escrow ─────────────────────────
router.post('/listings/:id/release-escrow', async (req: Request, res: Response) => {
  const result = await releaseEscrow(param(req, 'id'))
  res.json(result)
})

router.post('/listings/:id/refund-escrow', async (req: Request, res: Response) => {
  const result = await refundEscrow(param(req, 'id'))
  res.json(result)
})

// ─── Transactions overview ───────────────────────────────
router.get('/transactions', async (req: Request, res: Response) => {
  const { type, page = '1', limit = '50' } = req.query
  const where: any = {}
  if (type) where.type = type

  const transactions = await prisma.transaction.findMany({
    where,
    include: { investment: { select: { user: { select: { name: true, email: true } }, listing: { select: { title: true } } } } },
    skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { createdAt: 'desc' },
  })

  const aggregates = await prisma.transaction.groupBy({
    by: ['type'], _sum: { amount: true }, _count: true, where: { status: 'SUCCESS' },
  })
  res.json({ transactions, aggregates })
})

export default router
