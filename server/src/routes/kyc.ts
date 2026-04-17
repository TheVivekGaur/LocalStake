import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/db'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'
import { verifyPAN, aadhaarGenerateOtp, aadhaarVerifyOtp, verifyBankAccount, verifyGST } from '../services/digio'
import { sendKycStatusEmail } from '../services/email'

const router = Router()

// ─── Verify PAN ──────────────────────────────────────────
const panSchema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
})

router.post('/verify-pan', authenticate, validate(panSchema), async (req: Request, res: Response) => {
  const { panNumber } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) throw new AppError('User not found', 404)

  const result = await verifyPAN(panNumber, user.name)

  if (result.verified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { panNumber, kycStatus: 'IN_REVIEW' },
    })
  }

  res.json({
    verified: result.verified,
    message: result.verified ? 'PAN verified successfully' : 'PAN verification failed',
  })
})

// ─── Aadhaar — Send OTP ─────────────────────────────────
const aadhaarOtpSchema = z.object({
  aadhaarNumber: z.string().length(12, 'Aadhaar must be 12 digits'),
})

router.post('/aadhaar/send-otp', authenticate, validate(aadhaarOtpSchema), async (req: Request, res: Response) => {
  const { aadhaarNumber } = req.body
  const result = await aadhaarGenerateOtp(aadhaarNumber)

  if (!result.success) throw new AppError(result.error || 'Failed to send Aadhaar OTP')

  // Store request ID for verification
  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { digioKycId: result.requestId, aadhaarNumber },
  })

  res.json({ message: 'OTP sent to Aadhaar-linked mobile', requestId: result.requestId })
})

// ─── Aadhaar — Verify OTP ───────────────────────────────
const aadhaarVerifySchema = z.object({
  otp: z.string().length(6),
})

router.post('/aadhaar/verify-otp', authenticate, validate(aadhaarVerifySchema), async (req: Request, res: Response) => {
  const { otp } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user?.digioKycId) throw new AppError('No Aadhaar verification in progress')

  const result = await aadhaarVerifyOtp(user.digioKycId, otp)

  if (result.verified) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        kycStatus: 'VERIFIED',
        kycVerifiedAt: new Date(),
      },
    })

    sendKycStatusEmail(user.email, user.name, 'verified').catch(console.error)
  }

  res.json({
    verified: result.verified,
    data: result.data,
    message: result.verified ? 'Aadhaar verified successfully' : 'Verification failed',
  })
})

// ─── Verify Bank Account ─────────────────────────────────
const bankSchema = z.object({
  accountNumber: z.string().min(8),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format'),
})

router.post('/verify-bank', authenticate, validate(bankSchema), async (req: Request, res: Response) => {
  const { accountNumber, ifsc } = req.body
  const result = await verifyBankAccount(accountNumber, ifsc)

  res.json({
    verified: result.verified,
    beneficiaryName: result.beneficiaryName,
    message: result.verified ? 'Bank account verified' : 'Verification failed',
  })
})

// ─── Verify GST (for business owners) ───────────────────
const gstSchema = z.object({
  gstNumber: z.string().length(15, 'GST must be 15 characters'),
})

router.post('/verify-gst', authenticate, validate(gstSchema), async (req: Request, res: Response) => {
  const { gstNumber } = req.body
  const result = await verifyGST(gstNumber)

  res.json({
    verified: result.verified,
    businessName: result.businessName,
    message: result.verified ? 'GST verified' : 'Verification failed',
  })
})

// ─── Get KYC status ──────────────────────────────────────
router.get('/status', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      kycStatus: true,
      panNumber: true,
      kycVerifiedAt: true,
    },
  })
  if (!user) throw new AppError('User not found', 404)

  res.json({
    status: user.kycStatus,
    panVerified: !!user.panNumber,
    verifiedAt: user.kycVerifiedAt,
  })
})

export default router
