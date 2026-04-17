import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import {
  Box, Container, Typography, Grid, Card, CardContent, Stack,
  Button, Chip, Tabs, Tab, CircularProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import { People, Description, CreditCard, Shield, CheckCircle, Cancel } from '@mui/icons-material'

export function AdminPanel() {
  const [tab, setTab] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getAdminStats().catch(() => null),
      api.getAdminListings().catch(() => ({ listings: [] })),
      api.getAdminUsers().catch(() => ({ users: [] })),
    ]).then(([s, l, u]) => {
      setStats(s); setListings((l as any)?.listings || []); setUsers((u as any)?.users || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3">Admin Panel</Typography>
        <Typography color="text.secondary">Manage users, listings, and platform operations.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { icon: <People />, label: 'Total Users', value: String(stats?.totalUsers || users.length), color: '#3B82F6' },
          { icon: <Description />, label: 'Active Listings', value: String(stats?.activeListings || 0), color: '#10B981' },
          { icon: <CreditCard />, label: 'Total Funded', value: formatCurrency(stats?.totalFunded || 0), color: '#8B5CF6' },
          { icon: <Shield />, label: 'Pending KYC', value: String(stats?.pendingKyc || 0), color: '#F59E0B' },
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Listings" />
          <Tab label="Users" />
          <Tab label="Payments" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Raised / Goal</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((l: any) => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{l.title}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{l.business?.category} · {l.business?.city}</TableCell>
                  <TableCell align="right">{formatCurrency(l.raisedAmount)} / {formatCurrency(l.fundingGoal)}</TableCell>
                  <TableCell align="center"><Chip label={l.status} size="small" color={l.status === 'ACTIVE' ? 'success' : l.status === 'FUNDED' ? 'warning' : 'default'} /></TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button size="small" color="success" startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                        onClick={() => { api.updateListingStatus(l.id, 'ACTIVE').then(() => setListings(p => p.map(x => x.id === l.id ? { ...x, status: 'ACTIVE' } : x))).catch(() => {}) }}>
                        Approve
                      </Button>
                      <Button size="small" color="error" startIcon={<Cancel sx={{ fontSize: 16 }} />}
                        onClick={() => { api.updateListingStatus(l.id, 'REJECTED').then(() => setListings(p => p.map(x => x.id === l.id ? { ...x, status: 'REJECTED' } : x))).catch(() => {}) }}>
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>KYC</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                  <TableCell align="center"><Chip label={u.role} size="small" variant="outlined" /></TableCell>
                  <TableCell align="center"><Chip label={u.kycStatus} size="small" color={u.kycStatus === 'VERIFIED' ? 'success' : 'warning'} /></TableCell>
                  <TableCell align="center">
                    {u.kycStatus !== 'VERIFIED' && (
                      <Button size="small" color="success"
                        onClick={() => { api.updateUserKyc(u.id, 'VERIFIED').then(() => setUsers(p => p.map(x => x.id === u.id ? { ...x, kycStatus: 'VERIFIED' } : x))).catch(() => {}) }}>
                        Verify KYC
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <Card variant="outlined">
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Payment Overview</Typography>
            <Table size="small">
              <TableBody>
                {[
                  ['Total Escrow Balance', formatCurrency(listings.reduce((s: number, l: any) => s + (l.escrowBalance || 0), 0))],
                  ['Total Raised', formatCurrency(listings.reduce((s: number, l: any) => s + (l.raisedAmount || 0), 0))],
                  ['Active Listings', String(listings.filter((l: any) => l.status === 'ACTIVE').length)],
                  ['Funded Listings', String(listings.filter((l: any) => l.status === 'FUNDED').length)],
                ].map(([label, value]) => (
                  <TableRow key={label} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ color: 'text.secondary', pl: 0 }}>{label}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, pr: 0 }}>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
