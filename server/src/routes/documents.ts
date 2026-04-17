import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import path from 'path'
import { prisma } from '../config/db'
import { authenticate } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { param } from '../middleware/params'

const router = Router()

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    cb(null, `${uuid()}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    cb(null, allowed.includes(file.mimetype))
  },
})

router.post('/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded')
  const { type, businessId, listingId } = req.body
  const doc = await prisma.document.create({
    data: {
      userId: req.user!.userId, businessId: businessId || null, listingId: listingId || null,
      type: type || 'OTHER', fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`, fileSize: req.file.size, mimeType: req.file.mimetype,
    },
  })
  res.status(201).json(doc)
})

router.get('/mine', authenticate, async (req: Request, res: Response) => {
  const docs = await prisma.document.findMany({ where: { userId: req.user!.userId }, orderBy: { createdAt: 'desc' } })
  res.json(docs)
})

router.get('/business/:businessId', authenticate, async (req: Request, res: Response) => {
  const docs = await prisma.document.findMany({ where: { businessId: param(req, 'businessId') }, orderBy: { createdAt: 'desc' } })
  res.json(docs)
})

router.get('/listing/:listingId', authenticate, async (req: Request, res: Response) => {
  const docs = await prisma.document.findMany({ where: { listingId: param(req, 'listingId') }, orderBy: { createdAt: 'desc' } })
  res.json(docs)
})

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const id = param(req, 'id')
  const doc = await prisma.document.findFirst({ where: { id, userId: req.user!.userId } })
  if (!doc) throw new AppError('Document not found', 404)
  await prisma.document.delete({ where: { id } })
  res.json({ message: 'Document deleted' })
})

export default router
