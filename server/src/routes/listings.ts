import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/db'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { param } from '../middleware/params'

const router = Router()

// ─── Browse listings (public) ────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const {
    category, city, minInvestment, maxInvestment,
    minRoi, status, sort, page = '1', limit = '12',
  } = req.query

  const where: any = {}
  if (status) where.status = status
  else where.status = 'ACTIVE'
  if (category) where.business = { category: String(category) }
  if (city) {
    where.business = { ...where.business, city: String(city) }
  }
  if (minInvestment) where.minInvestment = { lte: Number(minInvestment) }
  if (minRoi) where.returnMultiple = { gte: Number(minRoi) }

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'roi') orderBy = { returnMultiple: 'desc' }
  if (sort === 'progress') orderBy = { raisedAmount: 'desc' }
  if (sort === 'newest') orderBy = { createdAt: 'desc' }

  const skip = (Number(page) - 1) * Number(limit)

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        business: { select: { id: true, name: true, category: true, city: true, verified: true } },
      },
      orderBy,
      skip,
      take: Number(limit),
    }),
    prisma.listing.count({ where }),
  ])

  res.json({
    listings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
})

// ─── Get single listing ─────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const listing = await prisma.listing.findUnique({
    where: { id: param(req, 'id') },
    include: {
      business: {
        select: {
          id: true, name: true, category: true, city: true,
          description: true, verified: true, address: true,
        },
      },
      documents: {
        select: { id: true, type: true, fileName: true, fileUrl: true },
      },
      _count: { select: { investments: true } },
    },
  })

  if (!listing) throw new AppError('Listing not found', 404)
  res.json(listing)
})

// ─── Create listing (owner only) ─────────────────────────
const createListingSchema = z.object({
  businessId: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().min(20),
  fundingGoal: z.number().positive(),
  ownerContribution: z.number().positive(),
  royaltyPercent: z.number().min(1).max(30),
  returnMultiple: z.number().min(1.1).max(3),
  estimatedDuration: z.number().int().positive(),
  minInvestment: z.number().positive(),
  maxInvestment: z.number().positive(),
  monthlyRevenue: z.number().positive(),
  expectedRevenue: z.number().positive(),
})

router.post('/', authenticate, authorize('OWNER'), validate(createListingSchema), async (req: Request, res: Response) => {
  // Verify business belongs to this owner
  const business = await prisma.business.findFirst({
    where: { id: req.body.businessId, ownerId: req.user!.userId },
  })
  if (!business) throw new AppError('Business not found or not owned by you', 403)

  // Validate owner contribution >= 25%
  const ownerPercent = (req.body.ownerContribution / req.body.fundingGoal) * 100
  if (ownerPercent < 25) throw new AppError('Owner must contribute at least 25% of funding goal')

  const listing = await prisma.listing.create({
    data: {
      ...req.body,
      status: 'PENDING_REVIEW',
    },
    include: {
      business: { select: { id: true, name: true, category: true, city: true } },
    },
  })

  res.status(201).json(listing)
})

// ─── Update listing (owner only, draft/pending only) ─────
router.patch('/:id', authenticate, authorize('OWNER'), async (req: Request, res: Response) => {
  const listing = await prisma.listing.findUnique({
    where: { id: param(req, 'id') },
    include: { business: true },
  })

  if (!listing) throw new AppError('Listing not found', 404)
  if (listing.business.ownerId !== req.user!.userId) throw new AppError('Not your listing', 403)
  if (!['DRAFT', 'PENDING_REVIEW'].includes(listing.status)) {
    throw new AppError('Cannot edit active/funded listing')
  }

  const updated = await prisma.listing.update({
    where: { id: param(req, 'id') },
    data: req.body,
  })

  res.json(updated)
})

// ─── Get owner's listings ────────────────────────────────
router.get('/owner/mine', authenticate, authorize('OWNER'), async (req: Request, res: Response) => {
  const businesses = await prisma.business.findMany({
    where: { ownerId: req.user!.userId },
    select: { id: true },
  })

  const listings = await prisma.listing.findMany({
    where: { businessId: { in: businesses.map((b) => b.id) } },
    include: {
      business: { select: { id: true, name: true, category: true, city: true } },
      _count: { select: { investments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(listings)
})

export default router
