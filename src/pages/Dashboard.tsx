import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { useMyInvestments } from '@/hooks/useInvestments'
import { useStore } from '@/store/useStore'
import {
  Box, Container, Typography, Grid, Card, CardContent, Stack,
  LinearProgress, Chip, Button, CircularProgress, Paper,
} from '@mui/material'
import { AccountBalanceWallet, TrendingUp, BarChart, Schedule, ArrowForward, LocationOn } from '@mui/icons-material'

export function Dashboard() {
  const { investments, loading } = useMyInvestments()
  const user = useStore((s) => s.user)

  const totalInvested = investments.reduce((s: number, inv: any) => s + inv.amount, 0)
  const totalReturns = investments.reduce((s: number, inv: any) => s + (inv.totalPaid || 0), 0)
  const activeDeals = investments.filter((inv: any) => ['active', 'ACTIVE'].includes(inv.status)).length

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3">{user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}</Typography>
        <Typography color="text.secondary">Track your investments and returns.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { icon: <AccountBalanceWallet />, label: 'Total Invested', value: formatCurrency(totalInvested), color: '#3B82F6' },
          { icon: <TrendingUp />, label: 'Returns Received', value: formatCurrency(totalReturns), color: '#10B981', trend: totalInvested > 0 ? `+${((totalReturns / totalInvested) * 100).toFixed(1)}%` : undefined },
          { icon: <BarChart />, label: 'Active Investments', value: String(activeDeals), color: '#8B5CF6' },
          { icon: <Schedule />, label: 'Portfolio Value', value: formatCurrency(totalInvested + totalReturns), color: '#F59E0B' },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box>
                  </Box>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{s.value}</Typography>
                {s.trend && <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600 }}>{s.trend} overall</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Your Investments</Typography>
        <Button component={Link} to="/payouts" endIcon={<ArrowForward />} color="secondary">View Payouts</Button>
      </Stack>

      {investments.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>You haven't made any investments yet.</Typography>
          <Button component={Link} to="/explore" variant="contained" color="secondary" disableElevation>Explore Opportunities</Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {investments.map((inv: any) => {
            const listing = inv.listing || {}
            const business = listing.business || {}
            const returnProgress = inv.expectedReturn > 0 ? ((inv.totalPaid || 0) / inv.expectedReturn) * 100 : 0
            return (
              <Link key={inv.id} to={`/listing/${inv.listingId}`} style={{ textDecoration: 'none' }}>
                <Card variant="outlined" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{listing.title || 'Investment'}</Typography>
                          <Chip label={inv.status} size="small" color={['active', 'ACTIVE'].includes(inv.status) ? 'success' : 'default'} />
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{business.city || '—'} · {business.category || '—'}</Typography>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={4} sx={{ textAlign: 'center' }}>
                        <Box><Typography variant="caption" color="text.secondary">Invested</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatCurrency(inv.amount)}</Typography></Box>
                        <Box><Typography variant="caption" color="text.secondary">Received</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{formatCurrency(inv.totalPaid || 0)}</Typography></Box>
                        <Box><Typography variant="caption" color="text.secondary">Target</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatCurrency(inv.expectedReturn)}</Typography></Box>
                      </Stack>
                      <Box sx={{ width: { xs: '100%', md: 160 } }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Progress</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{returnProgress.toFixed(0)}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={Math.min(returnProgress, 100)} color="success" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </Stack>
      )}
    </Container>
  )
}
