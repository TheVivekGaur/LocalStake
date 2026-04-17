import axios from 'axios'
import { env } from '../config/env'

/**
 * Leegality eSign Integration
 * Docs: https://docs.leegality.com
 *
 * Used for: Investment agreement signing between investor and business owner
 * You'll need to fill in LEEGALITY_API_KEY in .env
 */

const leegalityClient = axios.create({
  baseURL: env.leegalityBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-Auth-Token': env.leegalityApiKey,
  },
})

// ─── Create a document signing request ───────────────────
export async function createSigningRequest(params: {
  documentName: string
  documentUrl: string // URL to the PDF agreement
  signers: Array<{
    name: string
    email: string
    phone: string
    signType: 'aadhaar' | 'dsc' | 'electronic'
  }>
  callbackUrl: string
  metadata?: Record<string, string>
}) {
  try {
    const response = await leegalityClient.post('/api/v3.1/document/create', {
      document: {
        name: params.documentName,
        file_url: params.documentUrl,
      },
      invitees: params.signers.map((signer, index) => ({
        name: signer.name,
        email: signer.email,
        phone: signer.phone,
        sign_type: signer.signType,
        sequence: index + 1,
      })),
      callback_url: params.callbackUrl,
      metadata: params.metadata || {},
    })

    return {
      success: true,
      documentId: response.data?.document_id,
      signingUrl: response.data?.signing_url,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create signing request',
    }
  }
}

// ─── Get document status ─────────────────────────────────
export async function getDocumentStatus(documentId: string) {
  try {
    const response = await leegalityClient.get(`/api/v3.1/document/${documentId}`)
    return {
      success: true,
      status: response.data?.status, // 'pending', 'partially_signed', 'completed'
      signers: response.data?.invitees?.map((inv: any) => ({
        name: inv.name,
        email: inv.email,
        signed: inv.signed,
        signedAt: inv.signed_at,
      })),
      signedDocumentUrl: response.data?.signed_document_url,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch document status',
    }
  }
}

// ─── Download signed document ────────────────────────────
export async function downloadSignedDocument(documentId: string) {
  try {
    const response = await leegalityClient.get(`/api/v3.1/document/${documentId}/download`, {
      responseType: 'arraybuffer',
    })
    return {
      success: true,
      buffer: response.data,
      contentType: 'application/pdf',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to download document',
    }
  }
}

// ─── Generate investment agreement from template ─────────
export async function createAgreementFromTemplate(params: {
  templateId: string
  fields: Record<string, string> // template field values
  signers: Array<{
    name: string
    email: string
    phone: string
  }>
  callbackUrl: string
}) {
  try {
    const response = await leegalityClient.post('/api/v3.1/document/template/create', {
      template_id: params.templateId,
      fields: params.fields,
      invitees: params.signers.map((signer, index) => ({
        name: signer.name,
        email: signer.email,
        phone: signer.phone,
        sign_type: 'electronic',
        sequence: index + 1,
      })),
      callback_url: params.callbackUrl,
    })

    return {
      success: true,
      documentId: response.data?.document_id,
      signingUrl: response.data?.signing_url,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create agreement from template',
    }
  }
}
