import axios from 'axios'
import { env } from '../config/env'

/**
 * Email service using Resend
 * Docs: https://resend.com/docs
 */

const resendClient = axios.create({
  baseURL: 'https://api.resend.com',
  headers: {
    Authorization: `Bearer ${env.resendApiKey}`,
    'Content-Type': 'application/json',
  },
})

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resendClient.post('/emails', {
      from: 'LocalStake <noreply@localstake.in>',
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error: any) {
    console.error('[Email Error]', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

// ─── OTP Email ───────────────────────────────────────────
export async function sendOtpEmail(email: string, otp: string) {
  return sendEmail(
    email,
    'Your LocalStake Login OTP',
    `
    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0F172A;">Your OTP Code</h2>
      <p style="color: #64748B;">Use this code to log in to LocalStake:</p>
      <div style="background: #F1F5F9; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10B981;">${otp}</span>
      </div>
      <p style="color: #94A3B8; font-size: 12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
    `
  )
}

// ─── Investment Confirmation ─────────────────────────────
export async function sendInvestmentConfirmation(email: string, params: {
  investorName: string
  businessName: string
  amount: number
  expectedReturn: number
  duration: number
}) {
  return sendEmail(
    email,
    `Investment Confirmed — ${params.businessName}`,
    `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0F172A;">Investment Confirmed! 🎉</h2>
      <p>Hi ${params.investorName},</p>
      <p>Your investment in <strong>${params.businessName}</strong> has been confirmed.</p>
      <div style="background: #F1F5F9; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <p><strong>Amount:</strong> ₹${params.amount.toLocaleString('en-IN')}</p>
        <p><strong>Expected Return:</strong> ₹${params.expectedReturn.toLocaleString('en-IN')}</p>
        <p><strong>Est. Duration:</strong> ~${params.duration} months</p>
      </div>
      <p style="color: #64748B; font-size: 14px;">Your funds are held in escrow until the funding goal is met.</p>
    </div>
    `
  )
}

// ─── Payout Notification ─────────────────────────────────
export async function sendPayoutNotification(email: string, params: {
  investorName: string
  businessName: string
  amount: number
  month: string
  totalReceived: number
  targetReturn: number
}) {
  return sendEmail(
    email,
    `Payout Received — ${params.month}`,
    `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0F172A;">Payout Received 💰</h2>
      <p>Hi ${params.investorName},</p>
      <p>You've received a royalty payout from <strong>${params.businessName}</strong>.</p>
      <div style="background: #D1FAE5; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <p style="font-size: 24px; font-weight: bold; color: #10B981;">₹${params.amount.toLocaleString('en-IN')}</p>
        <p style="color: #64748B;">for ${params.month}</p>
      </div>
      <p style="color: #64748B; font-size: 14px;">
        Total received: ₹${params.totalReceived.toLocaleString('en-IN')} / ₹${params.targetReturn.toLocaleString('en-IN')}
      </p>
    </div>
    `
  )
}

// ─── Funding Complete Notification (to owner) ────────────
export async function sendFundingCompleteEmail(email: string, params: {
  ownerName: string
  businessName: string
  totalRaised: number
  investorCount: number
}) {
  return sendEmail(
    email,
    `Funding Complete — ${params.businessName}`,
    `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0F172A;">Funding Goal Reached! 🚀</h2>
      <p>Hi ${params.ownerName},</p>
      <p>Your listing for <strong>${params.businessName}</strong> has been fully funded.</p>
      <div style="background: #F1F5F9; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <p><strong>Total Raised:</strong> ₹${params.totalRaised.toLocaleString('en-IN')}</p>
        <p><strong>Investors:</strong> ${params.investorCount}</p>
      </div>
      <p>Funds will be released from escrow to your account shortly.</p>
    </div>
    `
  )
}

// ─── KYC Status Update ───────────────────────────────────
export async function sendKycStatusEmail(email: string, name: string, status: 'verified' | 'rejected', reason?: string) {
  const isVerified = status === 'verified'
  return sendEmail(
    email,
    `KYC ${isVerified ? 'Verified' : 'Update Required'}`,
    `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0F172A;">KYC ${isVerified ? 'Verified ✅' : 'Update Required'}</h2>
      <p>Hi ${name},</p>
      ${isVerified
        ? '<p>Your KYC has been verified. You can now invest on LocalStake.</p>'
        : `<p>Your KYC verification needs attention.</p><p style="color: #EF4444;">${reason || 'Please re-upload your documents.'}</p>`
      }
    </div>
    `
  )
}
