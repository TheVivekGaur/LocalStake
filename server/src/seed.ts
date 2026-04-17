import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.payout.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.revenueReport.deleteMany()
  await prisma.investment.deleteMany()
  await prisma.document.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 12)

  // ─── Users ─────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User', email: 'admin@localstake.in', phone: '+919000000000',
      passwordHash, role: 'ADMIN', kycStatus: 'VERIFIED', kycVerifiedAt: new Date(),
    },
  })

  const investor1 = await prisma.user.create({
    data: {
      name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+919876543210',
      passwordHash, role: 'INVESTOR', kycStatus: 'VERIFIED', kycVerifiedAt: new Date(),
      city: 'Bangalore', budgetMin: 100000, budgetMax: 500000, categories: ['Sports', 'Gym'],
    },
  })

  const investor2 = await prisma.user.create({
    data: {
      name: 'Priya Mehta', email: 'priya@example.com', phone: '+919876543211',
      passwordHash, role: 'INVESTOR', kycStatus: 'VERIFIED', kycVerifiedAt: new Date(),
      city: 'Delhi NCR', budgetMin: 50000, budgetMax: 300000, categories: ['Café', 'Cloud Kitchen'],
    },
  })

  const owner1 = await prisma.user.create({
    data: {
      name: 'Vikram Singh', email: 'vikram@example.com', phone: '+919876543212',
      passwordHash, role: 'OWNER', kycStatus: 'VERIFIED', kycVerifiedAt: new Date(), city: 'Bangalore',
    },
  })

  const owner2 = await prisma.user.create({
    data: {
      name: 'Anita Desai', email: 'anita@example.com', phone: '+919876543213',
      passwordHash, role: 'OWNER', kycStatus: 'VERIFIED', kycVerifiedAt: new Date(), city: 'Delhi NCR',
    },
  })

  // ─── Businesses ────────────────────────────────────────
  const biz1 = await prisma.business.create({
    data: {
      ownerId: owner1.id, name: 'SmashZone Pickleball', category: 'Sports',
      city: 'Bangalore', description: 'Premium pickleball courts in Koramangala', verified: true,
    },
  })

  const biz2 = await prisma.business.create({
    data: {
      ownerId: owner2.id, name: 'IronPulse Gym', category: 'Gym',
      city: 'Delhi NCR', description: 'Boutique gym chain in Gurgaon', verified: true,
    },
  })

  const biz3 = await prisma.business.create({
    data: {
      ownerId: owner1.id, name: 'BrewBox Café', category: 'Café',
      city: 'Bangalore', description: 'Specialty coffee café in Indiranagar', verified: true,
    },
  })

  // ─── Listings ──────────────────────────────────────────
  const listing1 = await prisma.listing.create({
    data: {
      businessId: biz1.id, title: 'SmashZone Pickleball — Court Expansion',
      description: 'Expanding from 4 to 8 courts in Koramangala. Current occupancy at 92%.',
      fundingGoal: 3500000, raisedAmount: 400000, ownerContribution: 1500000,
      royaltyPercent: 8, returnMultiple: 1.6, estimatedDuration: 24,
      minInvestment: 100000, maxInvestment: 500000,
      monthlyRevenue: 850000, expectedRevenue: 1400000,
      status: 'ACTIVE', investorCount: 2,
    },
  })

  const listing2 = await prisma.listing.create({
    data: {
      businessId: biz2.id, title: 'IronPulse Gym — New Gurgaon Outlet',
      description: 'Opening 2nd outlet in Sector 49. First outlet profitable within 8 months.',
      fundingGoal: 4000000, raisedAmount: 0, ownerContribution: 1200000,
      royaltyPercent: 10, returnMultiple: 1.8, estimatedDuration: 30,
      minInvestment: 100000, maxInvestment: 1000000,
      monthlyRevenue: 600000, expectedRevenue: 1100000,
      status: 'ACTIVE', investorCount: 0,
    },
  })

  const listing3 = await prisma.listing.create({
    data: {
      businessId: biz3.id, title: 'BrewBox Café — Second Outlet Launch',
      description: 'Launching in HSR Layout. Current outlet does ₹4.5L/month.',
      fundingGoal: 2000000, raisedAmount: 300000, ownerContribution: 800000,
      royaltyPercent: 7, returnMultiple: 1.5, estimatedDuration: 20,
      minInvestment: 50000, maxInvestment: 300000,
      monthlyRevenue: 450000, expectedRevenue: 750000,
      status: 'ACTIVE', investorCount: 2,
    },
  })

  // ─── Investments ───────────────────────────────────────
  const inv1 = await prisma.investment.create({
    data: {
      userId: investor1.id, listingId: listing1.id,
      amount: 200000, expectedReturn: 320000, totalPaid: 48000, status: 'ACTIVE',
    },
  })

  const inv2 = await prisma.investment.create({
    data: {
      userId: investor1.id, listingId: listing3.id,
      amount: 100000, expectedReturn: 150000, totalPaid: 21000, status: 'ACTIVE',
    },
  })

  const inv3 = await prisma.investment.create({
    data: {
      userId: investor2.id, listingId: listing1.id,
      amount: 200000, expectedReturn: 320000, totalPaid: 48000, status: 'ACTIVE',
    },
  })

  const inv4 = await prisma.investment.create({
    data: {
      userId: investor2.id, listingId: listing3.id,
      amount: 200000, expectedReturn: 300000, totalPaid: 42000, status: 'ACTIVE',
    },
  })

  // ─── Revenue Reports & Payouts ─────────────────────────
  const months = ['2026-01', '2026-02', '2026-03']
  const revenues = [850000, 880000, 920000]

  for (let i = 0; i < months.length; i++) {
    const report = await prisma.revenueReport.create({
      data: {
        listingId: listing1.id, month: months[i],
        revenue: revenues[i], payoutPool: revenues[i] * 0.08, distributed: true,
      },
    })

    // Payouts for each investor in listing1
    for (const inv of [inv1, inv3]) {
      const share = (inv.amount / 400000) * (revenues[i] * 0.08)
      await prisma.payout.create({
        data: {
          investmentId: inv.id, revenueReportId: report.id,
          amount: Math.round(share), status: 'PAID',
        },
      })
    }
  }

  console.log('✅ Seed complete!')
  console.log(`   Admin: admin@localstake.in / password123`)
  console.log(`   Investor: rahul@example.com / password123`)
  console.log(`   Owner: vikram@example.com / password123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
