import { Router, Request, Response } from 'express'
import { prisma } from '../config/db'
import { authenticate } from '../middleware/auth'
import { param } from '../middleware/params'

const router = Router()

router.get('/', authenticate, async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId }, orderBy: { createdAt: 'desc' }, take: 50,
  })
  const unreadCount = await prisma.notification.count({ where: { userId: req.user!.userId, read: false } })
  res.json({ notifications, unreadCount })
})

router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { id: param(req, 'id'), userId: req.user!.userId }, data: { read: true } })
  res.json({ message: 'Marked as read' })
})

router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.userId, read: false }, data: { read: true } })
  res.json({ message: 'All marked as read' })
})

export default router
