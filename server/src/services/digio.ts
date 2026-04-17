import axios from 'axios'
import { env } from '../config/env'

/**
 * Digio KYC Integration
 * Docs: https://docs.digio.in
 *
 * Supports: PAN verification, Aadhaar eKYC, Bank account verification
 * You'll need to fill in DIGIO_CLIENT_ID and DIGIO_CLIENT_SECRET in .env
 */

const digioClient = axios.create({
  baseURL: env.digioBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: env.digioClientId,
    password: env.digioClientSecret,
  },
})

// ─── Verify PAN ──────────────────────────────────────────
export async function verifyPAN(panNumber: string, name: string) {
  try {
    const response = await digioClient.post('/v3/client/kyc/analyze', {
      id_no: panNumber,
      id_type: 'PAN',
      name,
    })
    return {
      success: true,
      verified: response.data?.result?.name_match || false,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      verified: false,
      error: error.response?.data?.message || 'PAN verification failed',
    }
  }
}

// ─── Aadhaar eKYC — Generate OTP ────────────────────────
export async function aadhaarGenerateOtp(aadhaarNumber: string) {
  try {
    const response = await digioClient.post('/v3/client/kyc/aadhaar/otp/generate', {
      aadhaar_no: aadhaarNumber,
    })
    return {
      success: true,
      requestId: response.data?.id,
      message: 'OTP sent to Aadhaar-linked mobile',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Aadhaar OTP generation failed',
    }
  }
}

// ─── Aadhaar eKYC — Verify OTP ──────────────────────────
export async function aadhaarVerifyOtp(requestId: string, otp: string) {
  try {
    const response = await digioClient.post(`/v3/client/kyc/aadhaar/otp/verify/${requestId}`, {
      otp,
    })
    return {
      success: true,
      verified: true,
      data: {
        name: response.data?.name,
        dob: response.data?.dob,
        gender: response.data?.gender,
        address: response.data?.address,
        photo: response.data?.photo,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      verified: false,
      error: error.response?.data?.message || 'Aadhaar OTP verification failed',
    }
  }
}

// ─── Bank Account Verification ───────────────────────────
export async function verifyBankAccount(accountNumber: string, ifsc: string) {
  try {
    const response = await digioClient.post('/v3/client/kyc/bank_account/verify', {
      account_no: accountNumber,
      ifsc_code: ifsc,
    })
    return {
      success: true,
      verified: response.data?.verified || false,
      beneficiaryName: response.data?.beneficiary_name,
    }
  } catch (error: any) {
    return {
      success: false,
      verified: false,
      error: error.response?.data?.message || 'Bank verification failed',
    }
  }
}

// ─── GST Verification ────────────────────────────────────
export async function verifyGST(gstNumber: string) {
  try {
    const response = await digioClient.post('/v3/client/kyc/analyze', {
      id_no: gstNumber,
      id_type: 'GST',
    })
    return {
      success: true,
      verified: true,
      businessName: response.data?.result?.business_name,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      verified: false,
      error: error.response?.data?.message || 'GST verification failed',
    }
  }
}
