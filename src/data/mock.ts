import type { Listing, Investment, Payout, User } from '@/types'

export const currentUser: User = {
  id: 'u1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  phone: '+91 98765 43210',
  role: 'investor',
  kycStatus: 'verified',
  createdAt: '2025-01-15',
}

export const mockListings: Listing[] = [
  {
    id: 'l1',
    businessId: 'b1',
    business: {
      id: 'b1', ownerId: 'o1', name: 'SmashZone Pickleball', category: 'Sports',
      city: 'Bangalore', description: 'Premium pickleball courts in Koramangala',
      verified: true, images: [], documents: [],
    },
    title: 'SmashZone Pickleball — Court Expansion',
    description: 'Expanding from 4 to 8 courts in Koramangala. Current occupancy at 92%. Revenue growing 15% MoM.',
    fundingGoal: 3500000, raisedAmount: 2450000, ownerContribution: 1500000,
    royaltyPercent: 8, returnMultiple: 1.6, estimatedDuration: 24,
    minInvestment: 100000, maxInvestment: 500000,
    monthlyRevenue: 850000, expectedRevenue: 1400000,
    status: 'active', investorCount: 12, images: [],
    createdAt: '2025-11-01',
  },
  {
    id: 'l2',
    businessId: 'b2',
    business: {
      id: 'b2', ownerId: 'o2', name: 'IronPulse Gym', category: 'Gym',
      city: 'Delhi NCR', description: 'Boutique gym chain in Gurgaon',
      verified: true, images: [], documents: [],
    },
    title: 'IronPulse Gym — New Gurgaon Outlet',
    description: 'Opening 2nd outlet in Sector 49. First outlet profitable within 8 months. 400+ active members.',
    fundingGoal: 4000000, raisedAmount: 1200000, ownerContribution: 1200000,
    royaltyPercent: 10, returnMultiple: 1.8, estimatedDuration: 30,
    minInvestment: 100000, maxInvestment: 1000000,
    monthlyRevenue: 600000, expectedRevenue: 1100000,
    status: 'active', investorCount: 6, images: [],
    createdAt: '2025-12-10',
  },
  {
    id: 'l3',
    businessId: 'b3',
    business: {
      id: 'b3', ownerId: 'o3', name: 'BrewBox Café', category: 'Café',
      city: 'Bangalore', description: 'Specialty coffee café in Indiranagar',
      verified: true, images: [], documents: [],
    },
    title: 'BrewBox Café — Second Outlet Launch',
    description: 'Launching in HSR Layout. Current outlet does ₹4.5L/month. Strong Instagram following of 12K.',
    fundingGoal: 2000000, raisedAmount: 1800000, ownerContribution: 800000,
    royaltyPercent: 7, returnMultiple: 1.5, estimatedDuration: 20,
    minInvestment: 50000, maxInvestment: 300000,
    monthlyRevenue: 450000, expectedRevenue: 750000,
    status: 'active', investorCount: 18, images: [],
    createdAt: '2025-10-20',
  },
  {
    id: 'l4',
    businessId: 'b4',
    business: {
      id: 'b4', ownerId: 'o4', name: 'GreenCharge EV', category: 'EV Fleet',
      city: 'Delhi NCR', description: 'EV charging stations across Noida',
      verified: true, images: [], documents: [],
    },
    title: 'GreenCharge — 10 New Charging Stations',
    description: 'Deploying 10 fast-charging stations across Noida. Current 5 stations at 78% utilization.',
    fundingGoal: 5000000, raisedAmount: 800000, ownerContribution: 2000000,
    royaltyPercent: 6, returnMultiple: 1.7, estimatedDuration: 36,
    minInvestment: 100000, maxInvestment: 500000,
    monthlyRevenue: 300000, expectedRevenue: 900000,
    status: 'active', investorCount: 4, images: [],
    createdAt: '2026-01-05',
  },
  {
    id: 'l5',
    businessId: 'b5',
    business: {
      id: 'b5', ownerId: 'o5', name: 'CloudBite Kitchen', category: 'Cloud Kitchen',
      city: 'Bangalore', description: 'Multi-brand cloud kitchen in Whitefield',
      verified: true, images: [], documents: [],
    },
    title: 'CloudBite — Multi-Brand Kitchen Expansion',
    description: 'Adding 3 new brands to existing kitchen. Current 2 brands doing ₹6L/month combined.',
    fundingGoal: 1500000, raisedAmount: 1500000, ownerContribution: 600000,
    royaltyPercent: 9, returnMultiple: 1.5, estimatedDuration: 18,
    minInvestment: 50000, maxInvestment: 200000,
    monthlyRevenue: 600000, expectedRevenue: 950000,
    status: 'funded', investorCount: 15, images: [],
    createdAt: '2025-09-15',
  },
]

export const mockInvestments: Investment[] = [
  {
    id: 'inv1', userId: 'u1', listingId: 'l1',
    listing: mockListings[0],
    amount: 200000, expectedReturn: 320000, totalPaid: 48000,
    status: 'active', createdAt: '2025-11-15',
  },
  {
    id: 'inv2', userId: 'u1', listingId: 'l3',
    listing: mockListings[2],
    amount: 100000, expectedReturn: 150000, totalPaid: 21000,
    status: 'active', createdAt: '2025-11-01',
  },
  {
    id: 'inv3', userId: 'u1', listingId: 'l5',
    listing: mockListings[4],
    amount: 150000, expectedReturn: 225000, totalPaid: 67500,
    status: 'active', createdAt: '2025-10-01',
  },
]

export const mockPayouts: Payout[] = [
  { id: 'p1', investmentId: 'inv1', amount: 8000, status: 'paid', month: 'Mar 2026', revenueReported: 920000, date: '2026-04-05' },
  { id: 'p2', investmentId: 'inv1', amount: 8500, status: 'paid', month: 'Feb 2026', revenueReported: 880000, date: '2026-03-05' },
  { id: 'p3', investmentId: 'inv1', amount: 7800, status: 'paid', month: 'Jan 2026', revenueReported: 850000, date: '2026-02-05' },
  { id: 'p4', investmentId: 'inv2', amount: 3500, status: 'paid', month: 'Mar 2026', revenueReported: 480000, date: '2026-04-05' },
  { id: 'p5', investmentId: 'inv2', amount: 3200, status: 'paid', month: 'Feb 2026', revenueReported: 460000, date: '2026-03-05' },
  { id: 'p6', investmentId: 'inv3', amount: 9000, status: 'paid', month: 'Mar 2026', revenueReported: 650000, date: '2026-04-05' },
  { id: 'p7', investmentId: 'inv1', amount: 8200, status: 'pending', month: 'Apr 2026', revenueReported: 0, date: '2026-05-05' },
]

export const categories = ['All', 'Sports', 'Gym', 'Café', 'EV Fleet', 'Cloud Kitchen', 'Salon']
export const cities = ['All', 'Bangalore', 'Delhi NCR', 'Mumbai', 'Hyderabad']
