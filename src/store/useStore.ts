import { create } from 'zustand'
import type { UserRole } from '@/types'
import { api } from '@/lib/api'

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
  activeRole: (localStorage.getItem('activeRole') as UserRole) || 'investor',
  loading: false,

  setUser: (user, token) => {
    api.setToken(token)
    localStorage.setItem('activeRole', user.role)
    set({ user, isAuthenticated: true, activeRole: user.role as UserRole })
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { user, token } = await api.login(email, password)
      api.setToken(token)
      localStorage.setItem('activeRole', user.role)
      set({ user, isAuthenticated: true, activeRole: user.role, loading: false })
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
      localStorage.setItem('activeRole', user.role)
      set({ user, isAuthenticated: true, activeRole: user.role, loading: false })
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
      localStorage.setItem('activeRole', user.role)
      set({ user, isAuthenticated: true, activeRole: user.role, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  fetchMe: async () => {
    try {
      const user = await api.getMe()
      set({ user, isAuthenticated: true, activeRole: user.role })
    } catch {
      api.setToken(null)
      set({ user: null, isAuthenticated: false })
    }
  },

  logout: () => {
    api.setToken(null)
    localStorage.removeItem('activeRole')
    set({ user: null, isAuthenticated: false })
  },

  switchRole: (role) => {
    localStorage.setItem('activeRole', role)
    set({ activeRole: role })
  },
}))
