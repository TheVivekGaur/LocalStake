import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/db'
import { validate } from '../middleware/validate'
import { authenticate, generateToken } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { sendOtpEmail } from '../services/email'

const router = Router()

// ─── Register ────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['INVESTOR', 'OWNER']),
  city: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  categories: z.array(z.string()).optional(),
})

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, name, phone, role, city, budgetMin, budgetMax, categories } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new AppError('Email already registered', 409)

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email, name, phone, passwordHash, role, city,
      budgetMin, budgetMax, categories: categories || [],
    },
    select: { id: true, email: true, name: true, role: true, kycStatus: true },
  })

  const token = generateToken(user.id, user.role)
  res.status(201).json({ user, token })
})

// ─── Login with password ─────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401)

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new AppError('Invalid credentials', 401)

  const token = generateToken(user.id, user.role)
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, kycStatus: user.kycStatus },
    token,
  })
})

// ─── Send OTP ────────────────────────────────────────────
const otpSchema = z.object({ email: z.string().email() })

router.post('/send-otp', validate(otpSchema), async (req: Request, res: Response) => {
  const { email } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new AppError('User not found', 404)

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  await prisma.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiresAt },
  })

  await sendOtpEmail(email, otp)
  res.json({ message: 'OTP sent to email' })
})

// ─── Verify OTP ──────────────────────────────────────────
const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

router.post('/verify-otp', validate(verifyOtpSchema), async (req: Request, res: Response) => {
  const { email, otp } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new AppError('User not found', 404)
  if (!user.otpCode || !user.otpExpiresAt) throw new AppError('No OTP requested', 400)
  if (user.otpExpiresAt < new Date()) throw new AppError('OTP expired', 400)
  if (user.otpCode !== otp) throw new AppError('Invalid OTP', 400)

  // Clear OTP
  await prisma.user.update({
    where: { email },
    data: { otpCode: null, otpExpiresAt: null },
  })

  const token = generateToken(user.id, user.role)
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, kycStatus: user.kycStatus },
    token,
  })
})

// ─── Get current user ────────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, name: true, phone: true, role: true,
      kycStatus: true, avatar: true, city: true, budgetMin: true,
      budgetMax: true, categories: true, createdAt: true,
    },
  })
  if (!user) throw new AppError('User not found', 404)
  res.json(user)
})

// ─── Update profile ──────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  categories: z.array(z.string()).optional(),
})

router.patch('/me', authenticate, validate(updateProfileSchema), async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: req.body,
    select: {
      id: true, email: true, name: true, phone: true, role: true,
      kycStatus: true, city: true, budgetMin: true, budgetMax: true, categories: true,
    },
  })
  res.json(user)
})

export default router
