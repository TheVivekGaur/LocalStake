import { create } from 'zustand'
import type { UserRole } from '@/types'
import { api } from '@/lib/api'

// Normalize role to lowercase to match frontend expectations
function normalizeRole(role: string): UserRole {
  return role.toLowerCase() as UserRole
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  kycStatus: string
  city?: string
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  activeRole: UserRole
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; role: string; phone?: string }) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void
  setUser: (user: User, token: string) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  activeRole: normalizeRole(localStorage.getItem('activeRole') || 'investor'),
  loading: false,

  setUser: (user, token) => {
    api.setToken(token)
    const role = normalizeRole(user.role)
    localStorage.setItem('activeRole', role)
    set({ user: { ...user, role }, isAuthenticated: true, activeRole: role })
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { user, token } = await api.login(email, password)
      api.setToken(token)
      const role = normalizeRole(user.role)
      localStorage.setItem('activeRole', role)
      set({ user: { ...user, role }, isAuthenticated: true, activeRole: role, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  register: async (data) => {
    set({ loading: true })
    try {
      const { user, token } = await api.register(data)
      api.setToken(token)
      const role = normalizeRole(user.role)
      localStorage.setItem('activeRole', role)
      set({ user: { ...user, role }, isAuthenticated: true, activeRole: role, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  sendOtp: async (email) => {
    await api.sendOtp(email)
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true })
    try {
      const { user, token } = await api.verifyOtp(email, otp)
      api.setToken(token)
      const role = normalizeRole(user.role)
      localStorage.setItem('activeRole', role)
      set({ user: { ...user, role }, isAuthenticated: true, activeRole: role, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  fetchMe: async () => {
    try {
      const user = await api.getMe()
      const role = normalizeRole(user.role)
      set({ user: { ...user, role }, isAuthenticated: true, activeRole: role })
    } catch {
      api.setToken(null)
      set({ user: null, isAuthenticated: false })
    }
  },

  logout: () => {
    api.setToken(null)
    localStorage.removeItem('activeRole')
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false, activeRole: 'investor' })
  },

  switchRole: (role) => {
    const normalized = normalizeRole(role)
    localStorage.setItem('activeRole', normalized)
    set({ activeRole: normalized })
  },
}))
