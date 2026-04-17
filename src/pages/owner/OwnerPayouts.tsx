import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import {
  Box, Container, Typography, Grid, Card, CardContent, Stack,
  TextField, Button, MenuItem, Paper, Alert, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress,
} from '@mui/material'
import { AccountBalanceWallet, Upload, CheckCircle } from '@mui/icons-material'

export function OwnerPayouts() {
  const [listings, setListings] = useState<any[]>([])
  const [selectedListing, setSelectedListing] = useState('')
  const [month, setMonth] = useState('2026-04')
  const [revenue, setRevenue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    api.getMyListings().then((data) => { setListings(data); if (data.length > 0) setSelectedListing(data[0].id) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedListing) api.getRevenueReports(selectedListing).then(setReports).catch(() => setReports([]))
  }, [selectedListing, submitted])

  const royaltyPercent = listings.find((l: any) => l.id === selectedListing)?.royaltyPercent || 8

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      await api.submitRevenue(selectedListing, month, Number(revenue))
      setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); setRevenue('')
    } catch (err: any) { setError(err.message || 'Failed') } finally { setLoading(false) }
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3">Payout Management</Typography>
        <Typography color="text.secondary">Submit monthly revenue and manage investor payouts.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { icon: <AccountBalanceWallet />, label: 'Reports Submitted', value: String(reports.length), color: '#10B981' },
          { icon: <Upload />, label: 'This Month', value: submitted ? 'Submitted ✓' : 'Pending', color: '#F59E0B' },
          { icon: <CheckCircle />, label: 'Royalty Rate', value: `${royaltyPercent}%`, color: '#3B82F6' },
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

      <Card variant="outlined" sx={{ mb: 5 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Submit Monthly Revenue</Typography>
          {submitted ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 56, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5">Revenue Submitted!</Typography>
              <Typography color="text.secondary">Payouts have been calculated and distributed.</Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}
              {listings.length > 0 && (
                <TextField select fullWidth label="Select Listing" value={selectedListing} onChange={(e) => setSelectedListing(e.target.value)}>
                  {listings.map((l: any) => <MenuItem key={l.id} value={l.id}>{l.title}</MenuItem>)}
                </TextField>
              )}
              <Grid container spacing={2}>
                <Grid size={6}><TextField fullWidth label="Month (YYYY-MM)" value={month} onChange={(e) => setMonth(e.target.value)} /></Grid>
                <Grid size={6}><TextField fullWidth label="Net Revenue (₹)" type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} /></Grid>
              </Grid>
              {revenue && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F0FDF4' }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated payout pool: <strong>{formatCurrency(Number(revenue) * (royaltyPercent / 100))}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{royaltyPercent}% royalty × {formatCurrency(Number(revenue))}</Typography>
                </Paper>
              )}
              <Button variant="contained" color="secondary" disableElevation onClick={handleSubmit} disabled={!revenue || !selectedListing || loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Revenue & Trigger Payouts'}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>Past Reports</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Payout Pool</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((r: any) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.month}</TableCell>
                    <TableCell align="right">{formatCurrency(r.revenue)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.main' }}>{formatCurrency(r.payoutPool)}</TableCell>
                    <TableCell align="center"><Chip label={r.distributed ? 'Distributed' : 'Pending'} size="small" color={r.distributed ? 'success' : 'warning'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  )
}
