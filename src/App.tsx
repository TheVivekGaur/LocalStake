import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Landing } from '@/pages/Landing'
import { Explore } from '@/pages/Explore'
import { ListingDetail } from '@/pages/ListingDetail'
import { Dashboard } from '@/pages/Dashboard'
import { Payouts } from '@/pages/Payouts'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { HowItWorks } from '@/pages/HowItWorks'
import { OwnerDashboard } from '@/pages/owner/OwnerDashboard'
import { CreateListing } from '@/pages/owner/CreateListing'
import { OwnerPayouts } from '@/pages/owner/OwnerPayouts'
import { AdminPanel } from '@/pages/admin/AdminPanel'
import { useStore } from '@/store/useStore'

export default function App() {
  const { isAuthenticated, fetchMe } = useStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/create-listing" element={<CreateListing />} />
          <Route path="/owner/payouts" element={<OwnerPayouts />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
