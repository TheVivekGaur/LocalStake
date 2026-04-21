import { prisma } from '../config/db'
import { distributePayouts } from './payoutEngine'

/**
 * Auto Payout Cron Job
 * 
 * Runs on the 5th of every month. For each FUNDED listing:
 * 1. Checks if owner has submitted revenue for last month
 * 2. If yes → payouts already distributed (skip)
 * 3. If no → sends reminder email to owner
 * 
 * For fully automated mode (with eMandate/NACH):
 * 1. Auto-debits royalty from owner's bank account
 * 2. Distributes payouts to all investors
 * 
 * Usage: Call runMonthlyPayouts() from a cron scheduler
 * In production, use node-cron or an external scheduler (Railway cron, AWS EventBridge)
 */

function getLastMonth(): string {
  const now = new Date()
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const month = now.getMonth() === 0 ? 12 : now.getMonth()
  return `${year}-${String(month).padStart(2, '0')}`
}

export async function runMonthlyPayouts() {
  const lastMonth = getLastMonth()
  console.log(`[Cron] Running monthly payouts for ${lastMonth}`)

  // Get all funded listings
  const listings = await prisma.listing.findMany({
    where: { status: 'FUNDED' },
    include: {
      business: { include: { owner: true } },
      investments: { where: { status: 'ACTIVE' } },
    },
  })

  for (const listing of listings) {
    // Check if revenue already submitted for this month
    const existing = await prisma.revenueReport.findUnique({
      where: { listingId_month: { listingId: listing.id, month: lastMonth } },
    })

    if (existing) {
      console.log(`[Cron] ${listing.title}: already processed for ${lastMonth}`)
      continue
    }

    if (listing.investments.length === 0) {
      console.log(`[Cron] ${listing.title}: no active investments, skipping`)
      continue
    }

    // ─── OPTION 1: Use last known revenue (auto-estimate) ───
    // If owner hasn't submitted, use the listing's expected revenue as estimate
    // This is a fallback — in production you'd auto-debit via eMandate
    const lastReport = await prisma.revenueReport.findFirst({
      where: { listingId: listing.id },
      orderBy: { month: 'desc' },
    })

    const estimatedRevenue = lastReport?.revenue || listing.monthlyRevenue

    // ─── OPTION 2: Auto-debit via RazorpayX eMandate ───
    // Uncomment this when you have eMandate set up:
    //
    // const debitAmount = estimatedRevenue * (listing.royaltyPercent / 100)
    // const debitResult = await autoDebitOwner(listing.business.owner, debitAmount)
    // if (!debitResult.success) {
    //   // Send alert to admin, notify owner
    //   await sendPaymentFailedAlert(listing, debitResult.error)
    //   continue
    // }

    try {
      const result = await distributePayouts(listing.id, lastMonth, estimatedRevenue)
      console.log(`[Cron] ${listing.title}: distributed ₹${result.totalDistributed} to ${result.payoutsCreated} investors`)

      // Notify owner that auto-payout was processed
      await prisma.notification.create({
        data: {
          userId: listing.business.ownerId,
          title: 'Monthly Payout Processed',
          message: `Auto-payout for ${lastMonth} processed. Revenue used: ₹${estimatedRevenue.toLocaleString('en-IN')}. Please verify and update if different.`,
          link: '/owner/payouts',
        },
      })
    } catch (err: any) {
      console.error(`[Cron] ${listing.title}: failed — ${err.message}`)
    }
  }

  console.log(`[Cron] Monthly payout run complete`)
}

/**
 * Check for overdue revenue reports and send reminders
 */
export async function sendPayoutReminders() {
  const lastMonth = getLastMonth()

  const listings = await prisma.listing.findMany({
    where: { status: 'FUNDED' },
    include: { business: { include: { owner: true } } },
  })

  for (const listing of listings) {
    const report = await prisma.revenueReport.findUnique({
      where: { listingId_month: { listingId: listing.id, month: lastMonth } },
    })

    if (!report) {
      // Owner hasn't submitted revenue — send reminder
      await prisma.notification.create({
        data: {
          userId: listing.business.ownerId,
          title: 'Revenue Report Overdue',
          message: `Please submit your revenue report for ${lastMonth} for "${listing.title}". Investors are waiting for their payouts.`,
          link: '/owner/payouts',
        },
      })
      console.log(`[Reminder] Sent to ${listing.business.owner.name} for ${listing.title}`)
    }
  }
}
