import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../config/db'
import { env } from '../config/env'
import { releaseEscrow } from '../services/payoutEngine'

const router = Router()

// ─── Razorpay Webhook ────────────────────────────────────
router.post('/razorpay', async (req: Request, res: Response) => {
  // Verify webhook signature
  const signature = req.headers['x-razorpay-signature'] as string
  const body = JSON.stringify(req.body)
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature) {
    res.status(400).json({ error: 'Invalid signature' })
    return
  }

  const event = req.body.event
  const payload = req.body.payload

  switch (event) {
    case 'payment.captured': {
      const paymentId = payload.payment.entity.id
      const orderId = payload.payment.entity.order_id

      // Find investment by order ID
      const investment = await prisma.investment.findFirst({
        where: { razorpayOrderId: orderId },
      })

      if (investment) {
        await prisma.investment.update({
          where: { id: investment.id },
          data: { razorpayPaymentId: paymentId },
        })

        await prisma.transaction.create({
          data: {
            investmentId: investment.id,
            type: 'INVESTMENT',
            amount: investment.amount,
            status: 'SUCCESS',
            razorpayId: paymentId,
          },
        })

        // Update listing
        const listing = await prisma.listing.update({
          where: { id: investment.listingId },
          data: {
            raisedAmount: { increment: investment.amount },
            investorCount: { increment: 1 },
            escrowBalance: { increment: investment.amount },
          },
        })

        // Check if funding goal met
        const investorTarget = listing.fundingGoal - listing.ownerContribution
        if (listing.raisedAmount >= investorTarget) {
          await releaseEscrow(listing.id)
        }
      }
      break
    }

    case 'payment.failed': {
      const orderId = payload.payment.entity.order_id
      const investment = await prisma.investment.findFirst({
        where: { razorpayOrderId: orderId },
      })

      if (investment) {
        await prisma.transaction.create({
          data: {
            investmentId: investment.id,
            type: 'INVESTMENT',
            amount: investment.amount,
            status: 'FAILED',
            metadata: { reason: payload.payment.entity.error_description },
          },
        })
      }
      break
    }

    case 'refund.processed': {
      const paymentId = payload.refund.entity.payment_id
      const investment = await prisma.investment.findFirst({
        where: { razorpayPaymentId: paymentId },
      })

      if (investment) {
        await prisma.investment.update({
          where: { id: investment.id },
          data: { status: 'REFUNDED' },
        })
      }
      break
    }
  }

  res.json({ status: 'ok' })
})

// ─── Leegality Webhook (eSign callback) ──────────────────
router.post('/leegality', async (req: Request, res: Response) => {
  const { document_id, status, signed_document_url } = req.body

  if (status === 'completed' && document_id) {
    // Find investment with this agreement ID
    const investment = await prisma.investment.findFirst({
      where: { agreementId: document_id },
    })

    if (investment) {
      await prisma.investment.update({
        where: { id: investment.id },
        data: { agreementSignedAt: new Date() },
      })

      // Store signed document
      if (signed_document_url) {
        await prisma.document.create({
          data: {
            userId: investment.userId,
            listingId: investment.listingId,
            type: 'INVESTMENT_AGREEMENT',
            fileName: `agreement_${investment.id}.pdf`,
            fileUrl: signed_document_url,
          },
        })
      }

      // Notify investor
      await prisma.notification.create({
        data: {
          userId: investment.userId,
          title: 'Agreement Signed',
          message: 'Your investment agreement has been signed by all parties.',
          link: `/dashboard`,
        },
      })
    }
  }

  res.json({ status: 'ok' })
})

// ─── Digio Webhook (KYC callback) ────────────────────────
router.post('/digio', async (req: Request, res: Response) => {
  const { request_id, status, entity_id } = req.body

  if (request_id && status === 'completed') {
    const user = await prisma.user.findFirst({
      where: { digioKycId: request_id },
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          kycStatus: 'VERIFIED',
          kycVerifiedAt: new Date(),
        },
      })

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'KYC Verified',
          message: 'Your identity has been verified. You can now invest on LocalStake.',
          link: '/explore',
        },
      })
    }
  }

  res.json({ status: 'ok' })
})

export default router
