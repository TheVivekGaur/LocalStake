export type UserRole = 'investor' | 'owner' | 'admin'
export type KycStatus = 'pending' | 'verified' | 'rejected'
export type ListingStatus = 'draft' | 'pending' | 'active' | 'funded' | 'closed'
export type InvestmentStatus = 'escrow' | 'active' | 'completed' | 'refunded'
export type PayoutStatus = 'paid' | 'pending' | 'processing'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  kycStatus: KycStatus
  avatar?: string
  createdAt: string
}

export interface Business {
  id: string
  ownerId: string
  name: string
  category: string
  city: string
  description: string
  verified: boolean
  images: string[]
  documents: string[]
}

export interface Listing {
  id: string
  businessId: string
  business: Business
  title: string
  description: string
  fundingGoal: number
  raisedAmount: number
  ownerContribution: number
  royaltyPercent: number
  returnMultiple: number
  estimatedDuration: number // months
  minInvestment: number
  maxInvestment: number
  monthlyRevenue: number
  expectedRevenue: number
  status: ListingStatus
  investorCount: number
  images: string[]
  createdAt: string
}

export interface Investment {
  id: string
  userId: string
  listingId: string
  listing: Listing
  amount: number
  expectedReturn: number
  totalPaid: number
  status: InvestmentStatus
  createdAt: string
}

export interface Payout {
  id: string
  investmentId: string
  amount: number
  status: PayoutStatus
  month: string
  revenueReported: number
  date: string
}
