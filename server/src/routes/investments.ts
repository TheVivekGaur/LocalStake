import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/db'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { param } from '../middleware/params'
import { createInvestmentOrder, verifyPaymentSignature } from '../services/razorpay'
import { createAgreementFromTemplate } from '../services/leegality'
import { sendInvestmentConfirmation } from '../services/email'
import { releaseEscrow } from '../services/payoutEngine'
import { env } from '../config/env'

const router = Router()

// ─── Create investment (initiate) ────────────────────────
const investSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.number().positive(),
})

router.post('/', authenticate, authorize('INVESTOR'), validate(investSchema), async (req: Request, res: Response) => {
  const { listingId, amount } = req.body
  const userId = req.user!.userId

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found', 404)
  if (user.kycStatus !== 'VERIFIED') throw new AppError('KYC verification required before investing', 403)

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { business: { include: { owner: true } } },
  })
  if (!listing) throw new AppError('Listing not found', 404)
  if (listing.status !== 'ACTIVE') throw new AppError('Listing is not accepting investments')
  if (amount < listing.minInvestment) throw new AppError(`Minimum investment is ₹${listing.minInvestment}`)
  if (amount > listing.maxInvestment) throw new AppError(`Maximum investment is ₹${listing.maxInvestment}`)

  const remaining = listing.fundingGoal - listing.ownerContribution - listing.raisedAmount
  if (amount > remaining) throw new AppError(`Only ₹${remaining} remaining in this listing`)

  const expectedReturn = amount * listing.returnMultiple

  const investment = await prisma.investment.create({
    data: { userId, listingId, amount, expectedReturn, status: 'ESCROW' },
  })

  const order = await createInvestmentOrder({
    amount, investmentId: investment.id,
    investorEmail: user.email, investorName: user.name, listingTitle: listing.title,
  })

  await prisma.investment.update({ where: { id: investment.id }, data: { razorpayOrderId: order.id } })

  let signingUrl: string | undefined
  if (listing.agreementTemplateId) {
    const agreement = await createAgreementFromTemplate({
      templateId: listing.agreementTemplateId,
      fields: {
        investor_name: user.name, investor_email: user.email,
        business_name: listing.business.name, investment_amount: amount.toString(),
        expected_return: expectedReturn.toString(), royalty_percent: listing.royaltyPercent.toString(),
        return_multiple: listing.returnMultiple.toString(), duration: listing.estimatedDuration.toString(),
      },
      signers: [
        { name: user.name, email: user.email, phone: user.phone || '' },
        { name: listing.business.owner.name, email: listing.business.owner.email, phone: listing.business.owner.phone || '' },
      ],
      callbackUrl: `${env.frontendUrl}/api/webhooks/leegality`,
    })
    if (agreement.success) {
      await prisma.investment.update({ where: { id: investment.id }, data: { agreementId: agreement.documentId } })
      signingUrl = agreement.signingUrl
    }
  }

  res.status(201).json({
    investment: { id: investment.id, amount, expectedReturn, status: 'ESCROW' },
    razorpayOrder: { id: order.id, amount: order.amount, currency: order.currency },
    signingUrl,
    razorpayKeyId: env.razorpayKeyId,
  })
})

// ─── Verify payment ──────────────────────────────────────
const verifyPaymentSchema = z.object({
  investmentId: z.string().uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
})

router.post('/verify-payment', authenticate, validate(verifyPaymentSchema), async (req: Request, res: Response) => {
  const { investmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  const isValid = verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature })
  if (!isValid) throw new AppError('Payment verification failed', 400)

  const investment = await prisma.investment.update({
    where: { id: investmentId },
    data: { razorpayPaymentId },
    include: { listing: { include: { business: true } }, user: true },
  })

  const listing = await prisma.listing.update({
    where: { id: investment.listingId },
    data: { raisedAmount: { increment: investment.amount }, investorCount: { increment: 1 }, escrowBalance: { increment: investment.amount } },
  })

  await prisma.transaction.create({
    data: { investmentId: investment.id, type: 'INVESTMENT', amount: investment.amount, status: 'SUCCESS', razorpayId: razorpayPaymentId },
  })

  sendInvestmentConfirmation(investment.user.email, {
    investorName: investment.user.name, businessName: investment.listing.business.name,
    amount: investment.amount, expectedReturn: investment.expectedReturn, duration: investment.listing.estimatedDuration,
  }).catch(console.error)

  await prisma.notification.create({
    data: {
      userId: investment.userId, title: 'Investment Confirmed',
      message: `Your ₹${investment.amount.toLocaleString('en-IN')} investment in ${investment.listing.business.name} is confirmed.`,
      link: '/dashboard',
    },
  })

  const investorTarget = listing.fundingGoal - listing.ownerContribution
  if (listing.raisedAmount + investment.amount >= investorTarget) {
    await releaseEscrow(listing.id)
  }

  res.json({ success: true, investment: { id: investment.id, amount: investment.amount, expectedReturn: investment.expectedReturn, status: investment.status } })
})

// ─── Get investor's investments ──────────────────────────
router.get('/mine', authenticate, async (req: Request, res: Response) => {
  const investments = await prisma.investment.findMany({
    where: { userId: req.user!.userId },
    include: {
      listing: { include: { business: { select: { id: true, name: true, category: true, city: true } } } },
      _count: { select: { payouts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(investments)
})

// ─── Get single investment ───────────────────────────────
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const id = param(req, 'id')
  const investment = await prisma.investment.findFirst({
    where: { id, userId: req.user!.userId },
    include: {
      listing: { include: { business: { select: { id: true, name: true, category: true, city: true } } } },
      payouts: { orderBy: { createdAt: 'desc' } },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!investment) throw new AppError('Investment not found', 404)
  res.json(investment)
})

export default router
