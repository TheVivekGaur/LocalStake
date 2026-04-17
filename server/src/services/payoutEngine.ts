import { prisma } from '../config/db'
import { InvestmentStatus, PayoutStatus } from '@prisma/client'
import { sendPayoutNotification } from './email'

/**
 * Royalty Payout Engine
 *
 * Logic (from PRD):
 *   monthly_payout_pool = business_monthly_revenue × royalty_percentage
 *   investor_share = (investor_amount / total_raised) × monthly_payout_pool
 *   Stop payouts when total_paid >= investment × return_multiple
 */

export async function distributePayouts(listingId: string, month: string, reportedRevenue: number) {
  // 1. Get listing with its investments
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      business: { include: { owner: true } },
      investments: {
        where: { status: InvestmentStatus.ACTIVE },
        include: { user: true },
      },
    },
  })

  if (!listing) throw new Error('Listing not found')
  if (listing.investments.length === 0) throw new Error('No active investments')

  // 2. Calculate payout pool
  const payoutPool = reportedRevenue * (listing.royaltyPercent / 100)

  // 3. Create revenue report
  const report = await prisma.revenueReport.create({
    data: {
      listingId,
      month,
      revenue: reportedRevenue,
      payoutPool,
    },
  })

  // 4. Calculate and create individual payouts
  const totalRaised = listing.raisedAmount
  const payouts = []

  for (const investment of listing.investments) {
    // Check if return target already achieved
    const remaining = investment.expectedReturn - investment.totalPaid
    if (remaining <= 0) continue

    // Calculate share
    const share = (investment.amount / totalRaised) * payoutPool
    const payoutAmount = Math.min(share, remaining) // don't overpay

    const payout = await prisma.payout.create({
      data: {
        investmentId: investment.id,
        revenueReportId: report.id,
        amount: payoutAmount,
        status: PayoutStatus.PENDING,
      },
    })

    payouts.push({ payout, investment })
  }

  // 5. Process payouts (mark as paid — in production, trigger RazorpayX)
  for (const { payout, investment } of payouts) {
    // Update payout status
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: PayoutStatus.PAID },
    })

    // Update investment totalPaid
    const newTotalPaid = investment.totalPaid + payout.amount
    const isComplete = newTotalPaid >= investment.expectedReturn

    await prisma.investment.update({
      where: { id: investment.id },
      data: {
        totalPaid: newTotalPaid,
        status: isComplete ? InvestmentStatus.COMPLETED : InvestmentStatus.ACTIVE,
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        investmentId: investment.id,
        type: 'PAYOUT',
        amount: payout.amount,
        status: 'SUCCESS',
        metadata: { month, revenueReportId: report.id },
      },
    })

    // Send email notification
    sendPayoutNotification(investment.user.email, {
      investorName: investment.user.name,
      businessName: listing.business.name,
      amount: payout.amount,
      month,
      totalReceived: newTotalPaid,
      targetReturn: investment.expectedReturn,
    }).catch(console.error) // fire and forget
  }

  // 6. Mark report as distributed
  await prisma.revenueReport.update({
    where: { id: report.id },
    data: { distributed: true },
  })

  return {
    reportId: report.id,
    payoutPool,
    payoutsCreated: payouts.length,
    totalDistributed: payouts.reduce((sum, p) => sum + p.payout.amount, 0),
  }
}

/**
 * Handle escrow release when funding goal is met
 */
export async function releaseEscrow(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      business: { include: { owner: true } },
      investments: { where: { status: InvestmentStatus.ESCROW } },
    },
  })

  if (!listing) throw new Error('Listing not found')
  if (listing.raisedAmount < listing.fundingGoal) {
    throw new Error('Funding goal not yet met')
  }

  // Move all investments from ESCROW to ACTIVE
  await prisma.investment.updateMany({
    where: { listingId, status: InvestmentStatus.ESCROW },
    data: { status: InvestmentStatus.ACTIVE },
  })

  // Update listing
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: 'FUNDED',
      escrowReleased: true,
      fundedAt: new Date(),
    },
  })

  // Create transaction records
  for (const inv of listing.investments) {
    await prisma.transaction.create({
      data: {
        investmentId: inv.id,
        type: 'ESCROW_RELEASE',
        amount: inv.amount,
        status: 'SUCCESS',
      },
    })
  }

  return { released: true, investorCount: listing.investments.length }
}

/**
 * Handle refunds when funding fails
 */
export async function refundEscrow(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      investments: {
        where: { status: InvestmentStatus.ESCROW },
        include: { user: true },
      },
    },
  })

  if (!listing) throw new Error('Listing not found')

  for (const inv of listing.investments) {
    // In production: trigger Razorpay refund via inv.razorpayPaymentId
    await prisma.investment.update({
      where: { id: inv.id },
      data: { status: InvestmentStatus.REFUNDED },
    })

    await prisma.transaction.create({
      data: {
        investmentId: inv.id,
        type: 'REFUND',
        amount: inv.amount,
        status: 'SUCCESS',
      },
    })
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'CLOSED', closedAt: new Date(), escrowBalance: 0 },
  })

  return { refunded: true, count: listing.investments.length }
}
