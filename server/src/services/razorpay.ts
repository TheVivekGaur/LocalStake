import Razorpay from 'razorpay'
import crypto from 'crypto'
import { env } from '../config/env'

// Only initialize Razorpay if keys are provided
const razorpay = env.razorpayKeyId
  ? new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret })
  : null

// ─── Create order for investment ─────────────────────────
export async function createInvestmentOrder(params: {
  amount: number // in INR (will convert to paise)
  investmentId: string
  investorEmail: string
  investorName: string
  listingTitle: string
}) {
  if (!razorpay) {
    // Return mock order when Razorpay not configured
    return { id: `mock_order_${params.investmentId}`, amount: Math.round(params.amount * 100), currency: 'INR' }
  }
  const order = await razorpay.orders.create({
    amount: Math.round(params.amount * 100), // paise
    currency: 'INR',
    receipt: `inv_${params.investmentId}`,
    notes: {
      investmentId: params.investmentId,
      investorEmail: params.investorEmail,
      listingTitle: params.listingTitle,
    },
  })
  return order
}

// ─── Verify payment signature ────────────────────────────
export function verifyPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const body = `${params.orderId}|${params.paymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex')
  return expectedSignature === params.signature
}

// ─── Fetch payment details ───────────────────────────────
export async function fetchPayment(paymentId: string) {
  if (!razorpay) return { id: paymentId, status: 'captured' }
  return razorpay.payments.fetch(paymentId)
}

// ─── Initiate refund ─────────────────────────────────────
export async function initiateRefund(paymentId: string, amount?: number) {
  if (!razorpay) return { id: 'mock_refund', status: 'processed' }
  const refundParams: Record<string, unknown> = {}
  if (amount) {
    refundParams.amount = Math.round(amount * 100)
  }
  return razorpay.payments.refund(paymentId, refundParams)
}

// ─── Create payout via RazorpayX (for investor payouts) ──
// Note: RazorpayX requires separate activation
export async function createPayout(params: {
  accountNumber: string
  ifsc: string
  amount: number
  name: string
  referenceId: string
}) {
  // RazorpayX payout API — requires RazorpayX account
  // This is a placeholder structure; actual implementation
  // depends on your RazorpayX setup
  const axios = (await import('axios')).default
  const response = await axios.post(
    'https://api.razorpay.com/v1/payouts',
    {
      account_number: env.razorpayKeyId, // your RazorpayX account
      fund_account: {
        account_type: 'bank_account',
        bank_account: {
          name: params.name,
          ifsc: params.ifsc,
          account_number: params.accountNumber,
        },
      },
      amount: Math.round(params.amount * 100),
      currency: 'INR',
      mode: 'NEFT',
      purpose: 'payout',
      reference_id: params.referenceId,
    },
    {
      auth: {
        username: env.razorpayKeyId,
        password: env.razorpayKeySecret,
      },
    }
  )
  return response.data
}

export default razorpay
