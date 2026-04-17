import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { mockListings } from '@/data/mock'
import type { Listing } from '@/types'

export function useListings(params?: Record<string, string>) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    api.getListings(params)
      .then((data) => {
        if (cancelled) return
        // Map API response to match our Listing type
        const mapped = data.listings.map((l: any) => ({
          ...l,
          images: [],
          createdAt: l.createdAt,
        }))
        setListings(mapped)
        setTotal(data.pagination.total)
      })
      .catch(() => {
        if (cancelled) return
        // Fallback to mock data
        let filtered = [...mockListings]
        if (params?.category && params.category !== 'All') {
          filtered = filtered.filter(l => l.business.category === params.category)
        }
        if (params?.city && params.city !== 'All') {
          filtered = filtered.filter(l => l.business.city === params.city)
        }
        setListings(filtered)
        setTotal(filtered.length)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [JSON.stringify(params)])

  return { listings, loading, total }
}

export function useListing(id: string) {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    api.getListing(id)
      .then((data: any) => {
        if (cancelled) return
        setListing({ ...data, images: [], investorCount: data._count?.investments || 0 })
      })
      .catch(() => {
        if (cancelled) return
        const mock = mockListings.find(l => l.id === id) || null
        setListing(mock)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  return { listing, loading }
}
