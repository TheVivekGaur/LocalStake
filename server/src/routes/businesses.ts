import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/db'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { param } from '../middleware/params'

const router = Router()

const createBusinessSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  city: z.string(),
  address: z.string().optional(),
  description: z.string().min(10),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
})

router.post('/', authenticate, authorize('OWNER'), validate(createBusinessSchema), async (req: Request, res: Response) => {
  const business = await prisma.business.create({
    data: { ...req.body, ownerId: req.user!.userId },
  })
  res.status(201).json(business)
})

router.get('/mine', authenticate, authorize('OWNER'), async (req: Request, res: Response) => {
  const businesses = await prisma.business.findMany({
    where: { ownerId: req.user!.userId },
    include: { _count: { select: { listings: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(businesses)
})

router.get('/:id', async (req: Request, res: Response) => {
  const id = param(req, 'id')
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      listings: { where: { status: 'ACTIVE' }, select: { id: true, title: true, fundingGoal: true, raisedAmount: true, status: true } },
      documents: { select: { id: true, type: true, fileName: true } },
    },
  })
  if (!business) throw new AppError('Business not found', 404)
  res.json(business)
})

router.patch('/:id', authenticate, authorize('OWNER'), async (req: Request, res: Response) => {
  const id = param(req, 'id')
  const business = await prisma.business.findFirst({ where: { id, ownerId: req.user!.userId } })
  if (!business) throw new AppError('Business not found or not owned by you', 403)
  const updated = await prisma.business.update({ where: { id }, data: req.body })
  res.json(updated)
})

export default router
