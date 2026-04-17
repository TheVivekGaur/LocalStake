import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import { mockListings } from '@/data/mock'
import {
  Box, Container, Typography, Grid, Card, CardContent, Stack,
  Button, Chip, LinearProgress, CircularProgress, Paper,
} from '@mui/material'
import { AccountBalanceWallet, People, ListAlt, Add, ArrowForward } from '@mui/icons-material'

export function OwnerDashboard() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyListings().then(setListings).catch(() => setListings(mockListings.slice(0, 2))).finally(() => setLoading(false))
  }, [])

  const totalRaised = listings.reduce((s: number, l: any) => s + (l.raisedAmount || 0), 0)
  const totalInvestors = listings.reduce((s: number, l: any) => s + (l.investorCount || l._count?.investments || 0), 0)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3">Owner Dashboard</Typography>
          <Typography color="text.secondary">Manage your listings and track funding.</Typography>
        </Box>
        <Button component={Link} to="/owner/create-listing" variant="contained" color="secondary" startIcon={<Add />} disableElevation>
          Create Listing
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { icon: <AccountBalanceWallet />, label: 'Total Raised', value: formatCurrency(totalRaised), color: '#10B981' },
          { icon: <People />, label: 'Total Investors', value: String(totalInvestors), color: '#3B82F6' },
          { icon: <ListAlt />, label: 'Active Listings', value: String(listings.length), color: '#8B5CF6' },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box>
                  </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Your Listings</Typography>
        <Button component={Link} to="/owner/payouts" endIcon={<ArrowForward />} color="secondary">Manage Payouts</Button>
      </Stack>

      {listings.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>You haven't created any listings yet.</Typography>
          <Button component={Link} to="/owner/create-listing" variant="contained" color="secondary" disableElevation>Create Your First Listing</Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {listings.map((listing: any) => {
            const progress = listing.fundingGoal > 0 ? (listing.raisedAmount / listing.fundingGoal) * 100 : 0
            const business = listing.business || {}
            return (
              <Card key={listing.id} variant="outlined" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 4 } }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{listing.title}</Typography>
                        <Chip label={listing.status} size="small" color={listing.status === 'ACTIVE' ? 'success' : 'warning'} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{business.category || '—'} · {business.city || '—'}</Typography>
                    </Box>
                    <Stack direction="row" spacing={4} sx={{ textAlign: 'center' }}>
                      <Box><Typography variant="caption" color="text.secondary">Goal</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatCurrency(listing.fundingGoal)}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">Raised</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{formatCurrency(listing.raisedAmount)}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">Investors</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{listing.investorCount || listing._count?.investments || 0}</Typography></Box>
                    </Stack>
                    <Box sx={{ width: { xs: '100%', md: 160 } }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Funding</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress.toFixed(0)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={Math.min(progress, 100)} color="success" sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}
    </Container>
  )
}
