import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { mockInvestments, mockPayouts } from '@/data/mock'

export function useMyInvestments() {
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyInvestments()
      .then((data) => setInvestments(data))
      .catch(() => setInvestments(mockInvestments))
      .finally(() => setLoading(false))
  }, [])

  return { investments, loading }
}

export function useMyPayouts() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalReceived: 0, totalPending: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyPayouts()
      .then((data) => {
        setPayouts(data.payouts)
        setSummary(data.summary)
      })
      .catch(() => {
        setPayouts(mockPayouts as any)
        const paid = mockPayouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
        const pending = mockPayouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
        setSummary({ totalReceived: paid, totalPending: pending, count: mockPayouts.length })
      })
      .finally(() => setLoading(false))
  }, [])

  return { payouts, summary, loading }
}
