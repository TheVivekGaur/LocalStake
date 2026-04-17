import { formatCurrency } from '@/lib/utils'
import { useMyPayouts } from '@/hooks/useInvestments'
import {
  Box, Container, Typography, Grid, Card, CardContent, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button, CircularProgress,
} from '@mui/material'
import { AccountBalanceWallet, Schedule, CheckCircle, Download } from '@mui/icons-material'

export function Payouts() {
  const { payouts, summary, loading } = useMyPayouts()

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3">Payout History</Typography>
        <Typography color="text.secondary">Track all your monthly royalty payouts.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { icon: <AccountBalanceWallet />, label: 'Total Received', value: formatCurrency(summary.totalReceived), color: '#10B981' },
          { icon: <Schedule />, label: 'Pending', value: formatCurrency(summary.totalPending), color: '#F59E0B' },
          { icon: <CheckCircle />, label: 'Payouts Count', value: String(summary.count), color: '#3B82F6' },
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

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Business</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue Reported</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Your Share</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography color="text.secondary">No payouts yet. Invest in a business to start receiving returns.</Typography>
                </TableCell>
              </TableRow>
            ) : payouts.map((p: any) => {
              const month = p.revenueReport?.month || p.month || '—'
              const revenue = p.revenueReport?.revenue || p.revenueReported || 0
              const businessName = p.investment?.listing?.business?.name || p.businessName || '—'
              const status = (p.status || '').toLowerCase()
              const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : (p.date || '—')
              return (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{month}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{businessName}</TableCell>
                  <TableCell align="right">{revenue ? formatCurrency(revenue) : '—'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.main' }}>{formatCurrency(p.amount)}</TableCell>
                  <TableCell align="center">
                    <Chip label={status} size="small" color={status === 'paid' ? 'success' : 'warning'} />
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'text.secondary' }}>{date}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button startIcon={<Download />} color="secondary">Download Statement</Button>
      </Stack>
    </Container>
  )
}
