import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/db'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { param } from '../middleware/params'
import { distributePayouts } from '../services/payoutEngine'

const router = Router()

// ─── Get investor's payouts ──────────────────────────────
router.get('/mine', authenticate, async (req: Request, res: Response) => {
  const investments = await prisma.investment.findMany({ where: { userId: req.user!.userId }, select: { id: true } })
  const payouts = await prisma.payout.findMany({
    where: { investmentId: { in: investments.map((i) => i.id) } },
    include: {
      investment: { include: { listing: { include: { business: { select: { name: true, category: true } } } } } },
      revenueReport: { select: { month: true, revenue: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalReceived = payouts.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const totalPending = payouts.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)

  res.json({ payouts, summary: { totalReceived, totalPending, count: payouts.length } })
})

// ─── Submit monthly revenue (owner) ─────────────────────
const submitRevenueSchema = z.object({
  listingId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  revenue: z.number().positive(),
})

router.post('/submit-revenue', authenticate, authorize('OWNER'), validate(submitRevenueSchema), async (req: Request, res: Response) => {
  const { listingId, month, revenue } = req.body

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { business: true } })
  if (!listing) throw new AppError('Listing not found', 404)
  if (listing.business.ownerId !== req.user!.userId) throw new AppError('Not your listing', 403)
  if (listing.status !== 'FUNDED') throw new AppError('Listing must be funded to submit revenue')

  const existing = await prisma.revenueReport.findUnique({ where: { listingId_month: { listingId, month } } })
  if (existing) throw new AppError('Revenue already submitted for this month')

  const result = await distributePayouts(listingId, month, revenue)
  res.json({ message: 'Revenue submitted and payouts distributed', ...result })
})

// ─── Get revenue reports for a listing ───────────────────
router.get('/revenue-reports/:listingId', authenticate, async (req: Request, res: Response) => {
  const reports = await prisma.revenueReport.findMany({
    where: { listingId: param(req, 'listingId') },
    include: { _count: { select: { payouts: true } } },
    orderBy: { month: 'desc' },
  })
  res.json(reports)
})

// ─── Get payout details for a specific investment ────────
router.get('/investment/:investmentId', authenticate, async (req: Request, res: Response) => {
  const investmentId = param(req, 'investmentId')
  const investment = await prisma.investment.findFirst({ where: { id: investmentId, userId: req.user!.userId } })
  if (!investment) throw new AppError('Investment not found', 404)

  const payouts = await prisma.payout.findMany({
    where: { investmentId },
    include: { revenueReport: { select: { month: true, revenue: true, payoutPool: true } } },
    orderBy: { createdAt: 'desc' },
  })

  res.json({
    payouts,
    summary: {
      totalPaid: investment.totalPaid, expectedReturn: investment.expectedReturn,
      remaining: investment.expectedReturn - investment.totalPaid,
      progress: (investment.totalPaid / investment.expectedReturn) * 100,
    },
  })
})

export default router
