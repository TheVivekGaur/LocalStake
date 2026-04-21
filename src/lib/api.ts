const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data as T
  }

  // ─── Auth ────────────────────────────────────────────
  register(body: { name: string; email: string; password: string; role: string; phone?: string }) {
    return this.request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) })
  }

  login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  }

  sendOtp(email: string) {
    return this.request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) })
  }

  verifyOtp(email: string, otp: string) {
    return this.request<{ user: any; token: string }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) })
  }

  getMe() {
    return this.request<any>('/auth/me')
  }

  updateProfile(data: any) {
    return this.request('/auth/me', { method: 'PATCH', body: JSON.stringify(data) })
  }

  // ─── KYC ─────────────────────────────────────────────
  verifyPan(panNumber: string) {
    return this.request('/kyc/verify-pan', { method: 'POST', body: JSON.stringify({ panNumber }) })
  }

  sendAadhaarOtp(aadhaarNumber: string) {
    return this.request('/kyc/aadhaar/send-otp', { method: 'POST', body: JSON.stringify({ aadhaarNumber }) })
  }

  verifyAadhaarOtp(otp: string) {
    return this.request('/kyc/aadhaar/verify-otp', { method: 'POST', body: JSON.stringify({ otp }) })
  }

  verifyBank(accountNumber: string, ifsc: string) {
    return this.request('/kyc/verify-bank', { method: 'POST', body: JSON.stringify({ accountNumber, ifsc }) })
  }

  verifyGst(gstNumber: string) {
    return this.request('/kyc/verify-gst', { method: 'POST', body: JSON.stringify({ gstNumber }) })
  }

  getKycStatus() {
    return this.request('/kyc/status')
  }

  // ─── Listings ────────────────────────────────────────
  getListings(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ listings: any[]; pagination: any }>(`/listings${query}`)
  }

  getListing(id: string) {
    return this.request<any>(`/listings/${id}`)
  }

  createListing(data: any) {
    return this.request('/listings', { method: 'POST', body: JSON.stringify(data) })
  }

  updateListing(id: string, data: any) {
    return this.request(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  getMyListings() {
    return this.request<any[]>('/listings/owner/mine')
  }

  // ─── Businesses ──────────────────────────────────────
  createBusiness(data: any) {
    return this.request('/businesses', { method: 'POST', body: JSON.stringify(data) })
  }

  getMyBusinesses() {
    return this.request<any[]>('/businesses/mine')
  }

  // ─── Investments ─────────────────────────────────────
  createInvestment(listingId: string, amount: number) {
    return this.request<{
      investment: any
      razorpayOrder: { id: string; amount: number; currency: string }
      signingUrl?: string
      razorpayKeyId: string
    }>('/investments', { method: 'POST', body: JSON.stringify({ listingId, amount }) })
  }

  verifyPayment(data: { investmentId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.request('/investments/verify-payment', { method: 'POST', body: JSON.stringify(data) })
  }

  getMyInvestments() {
    return this.request<any[]>('/investments/mine')
  }

  getInvestment(id: string) {
    return this.request<any>(`/investments/${id}`)
  }

  // ─── Payouts ─────────────────────────────────────────
  getMyPayouts() {
    return this.request<{ payouts: any[]; summary: any }>('/payouts/mine')
  }

  submitRevenue(listingId: string, month: string, revenue: number) {
    return this.request('/payouts/submit-revenue', { method: 'POST', body: JSON.stringify({ listingId, month, revenue }) })
  }

  getRevenueReports(listingId: string) {
    return this.request<any[]>(`/payouts/revenue-reports/${listingId}`)
  }

  getInvestmentPayouts(investmentId: string) {
    return this.request<{ payouts: any[]; summary: any }>(`/payouts/investment/${investmentId}`)
  }

  // ─── Documents ───────────────────────────────────────
  async uploadDocument(file: File, type: string, businessId?: string, listingId?: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    if (businessId) formData.append('businessId', businessId)
    if (listingId) formData.append('listingId', listingId)

    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return res.json()
  }

  getMyDocuments() {
    return this.request<any[]>('/documents/mine')
  }

  // ─── Notifications ───────────────────────────────────
  getNotifications() {
    return this.request<{ notifications: any[]; unreadCount: number }>('/notifications')
  }

  markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' })
  }

  // ─── Admin ───────────────────────────────────────────
  getAdminStats() {
    return this.request('/admin/stats')
  }

  getAdminUsers(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ users: any[]; total: number }>(`/admin/users${query}`)
  }

  updateUserKyc(userId: string, status: string, reason?: string) {
    return this.request(`/admin/users/${userId}/kyc`, { method: 'PATCH', body: JSON.stringify({ status, reason }) })
  }

  getAdminListings(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request<{ listings: any[]; total: number }>(`/admin/listings${query}`)
  }

  updateListingStatus(listingId: string, status: string, reason?: string) {
    return this.request(`/admin/listings/${listingId}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) })
  }

  verifyBusiness(businessId: string) {
    return this.request(`/admin/businesses/${businessId}/verify`, { method: 'PATCH' })
  }

  releaseEscrow(listingId: string) {
    return this.request(`/admin/listings/${listingId}/release-escrow`, { method: 'POST' })
  }

  refundEscrow(listingId: string) {
    return this.request(`/admin/listings/${listingId}/refund-escrow`, { method: 'POST' })
  }

  getAdminTransactions(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/admin/transactions${query}`)
  }
}

export const api = new ApiClient()
