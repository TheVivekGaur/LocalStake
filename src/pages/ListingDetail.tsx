import { useParams, Link } from 'react-router-dom'
import { useListing } from '@/hooks/useListings'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/api'
import { useState } from 'react'
import {
  Box, Container, Typography, Button, Grid, Card, CardContent, Stack,
  Chip, LinearProgress, Paper, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stepper, Step, StepLabel, Alert, Slider,
  CircularProgress, Table, TableBody, TableRow, TableCell, Checkbox, FormControlLabel,
} from '@mui/material'
import {
  ArrowBack, LocationOn, Business, TrendingUp, Percent, Schedule,
  People, Shield, CheckCircle, Warning, Description, Calculate,
} from '@mui/icons-material'

export function ListingDetail() {
  const { id } = useParams()
  const { listing, loading: listingLoading } = useListing(id!)
  const { isAuthenticated } = useStore()
  const [open, setOpen] = useState(false)
  const [investAmount, setInvestAmount] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [investLoading, setInvestLoading] = useState(false)
  const [investError, setInvestError] = useState('')
  const [agreed, setAgreed] = useState(false)

  if (listingLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>
  if (!listing) return (
    <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Listing not found.</Typography>
      <Button component={Link} to="/explore" color="secondary">Back to Explore</Button>
    </Container>
  )

  const progress = (listing.raisedAmount / listing.fundingGoal) * 100
  const totalReturn = investAmount * listing.returnMultiple
  const profit = totalReturn - investAmount
  const monthlyEst = listing.estimatedDuration > 0 ? profit / listing.estimatedDuration : 0

  const handleInvest = async () => {
    if (activeStep < 2) { setActiveStep(activeStep + 1); return }
    setInvestLoading(true)
    setInvestError('')
    try {
      await api.createInvestment(listing.id, investAmount)
      setActiveStep(3)
    } catch (err: any) {
      setInvestError(err.message || 'Investment failed')
    } finally {
      setInvestLoading(false)
    }
  }

  const openModal = () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    setInvestAmount(listing.minInvestment)
    setActiveStep(0)
    setInvestError('')
    setAgreed(false)
    setOpen(true)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button component={Link} to="/explore" startIcon={<ArrowBack />} sx={{ mb: 3, color: 'text.secondary' }}>Back to Explore</Button>

      <Grid container spacing={4}>
        {/* Main */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Header card */}
            <Card variant="outlined">
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                  <Chip icon={listing.business?.verified ? <CheckCircle sx={{ fontSize: 14 }} /> : undefined}
                    label={listing.business?.verified ? 'Verified' : 'Pending'} color={listing.business?.verified ? 'success' : 'default'} size="small" />
                  <Chip label={listing.business?.category} size="small" variant="outlined" />
                  {(listing.status === 'funded' || listing.status === 'FUNDED') && <Chip label="Fully Funded" color="warning" size="small" />}
                </Stack>
                <Typography variant="h4" sx={{ mb: 1 }}>{listing.title}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{listing.business?.city}</Typography>
                  <Typography variant="body2" color="text.secondary">·</Typography>
                  <Business sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{listing.business?.name}</Typography>
                </Stack>

                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">{formatCurrency(listing.raisedAmount)} raised of {formatCurrency(listing.fundingGoal)}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{progress.toFixed(0)}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.min(progress, 100)} color="success" sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                <Grid container spacing={2}>
                  {[
                    { icon: <TrendingUp />, val: `${listing.returnMultiple}x`, label: 'Return Multiple', color: '#10B981' },
                    { icon: <Percent />, val: `${listing.royaltyPercent}%`, label: 'Royalty Share', color: '#3B82F6' },
                    { icon: <Schedule />, val: `${listing.estimatedDuration}mo`, label: 'Est. Duration', color: '#F59E0B' },
                    { icon: <People />, val: String(listing.investorCount), label: 'Investors', color: '#8B5CF6' },
                  ].map((s) => (
                    <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ color: s.color, display: 'flex', justifyContent: 'center', mb: 0.5 }}>{s.icon}</Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{s.val}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* About */}
            <Card variant="outlined">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>About This Opportunity</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>{listing.description}</Typography>
              </CardContent>
            </Card>

            {/* Financials */}
            <Card variant="outlined">
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Financial Overview</Typography>
                <Table size="small">
                  <TableBody>
                    {[
                      ['Funding Goal', formatCurrency(listing.fundingGoal)],
                      ['Owner Contribution', formatCurrency(listing.ownerContribution)],
                      ['Investor Contribution', formatCurrency(listing.fundingGoal - listing.ownerContribution)],
                      ['Current Monthly Revenue', formatCurrency(listing.monthlyRevenue)],
                      ['Expected Monthly Revenue', formatCurrency(listing.expectedRevenue)],
                      ['Royalty Percentage', formatPercent(listing.royaltyPercent)],
                      ['Return Multiple', `${listing.returnMultiple}x`],
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

            {/* Risk */}
            <Card variant="outlined">
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Warning sx={{ color: 'warning.main' }} />
                  <Typography variant="h6">Risk Factors</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {[
                    'Returns depend on actual business revenue performance.',
                    'Estimated duration may vary based on market conditions.',
                    'Investment is illiquid — no secondary market in MVP.',
                    'Business default risk exists despite verification.',
                  ].map((r) => (
                    <Stack key={r} direction="row" spacing={1} alignItems="flex-start">
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', mt: 1, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">{r}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 90 } }}>
            {/* ROI Calculator */}
            <Card sx={{ bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <Calculate sx={{ color: 'secondary.main' }} />
                  <Typography variant="h6">ROI Calculator</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Investment Amount</Typography>
                <Slider value={investAmount || listing.minInvestment} min={listing.minInvestment} max={listing.maxInvestment} step={10000}
                  onChange={(_, v) => setInvestAmount(v as number)} color="success" valueLabelDisplay="auto"
                  valueLabelFormat={(v) => formatCurrency(v)} />
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">{formatCurrency(listing.minInvestment)}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.main' }}>{formatCurrency(investAmount || listing.minInvestment)}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatCurrency(listing.maxInvestment)}</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Total Return', val: formatCurrency(totalReturn || listing.minInvestment * listing.returnMultiple), color: 'secondary.main' },
                    { label: 'Profit', val: formatCurrency(profit || listing.minInvestment * (listing.returnMultiple - 1)) },
                    { label: 'Monthly (est.)', val: formatCurrency(Math.round(monthlyEst || (listing.minInvestment * (listing.returnMultiple - 1)) / listing.estimatedDuration)) },
                    { label: 'Annualized ROI', val: `${(((listing.returnMultiple - 1) / (listing.estimatedDuration / 12)) * 100).toFixed(1)}%` },
                  ].map((s) => (
                    <Grid key={s.label} size={6}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: '#fff' }}>
                        <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: s.color || 'text.primary' }}>{s.val}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Invest CTA */}
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Button variant="contained" color="secondary" size="large" fullWidth disableElevation onClick={openModal}
                  disabled={listing.status === 'funded' || listing.status === 'FUNDED'} sx={{ mb: 2, py: 1.5 }}>
                  {(listing.status === 'funded' || listing.status === 'FUNDED') ? 'Fully Funded' : 'Invest Now'}
                </Button>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Shield sx={{ fontSize: 18, color: 'secondary.main' }} />
                    <Typography variant="body2" color="text.secondary">Escrow protected</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle sx={{ fontSize: 18, color: 'secondary.main' }} />
                    <Typography variant="body2" color="text.secondary">KYC verified business</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Invest Dialog */}
      <Dialog open={open} onClose={() => activeStep < 3 && setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
            {['Amount', 'Summary', 'Agreement', 'Done'].map((l) => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
          </Stepper>
        </DialogTitle>
        <DialogContent>
          {investError && <Alert severity="error" sx={{ mb: 2 }}>{investError}</Alert>}

          {activeStep === 0 && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Enter Investment Amount</Typography>
              <TextField fullWidth type="number" value={investAmount} onChange={(e) => setInvestAmount(Number(e.target.value))}
                slotProps={{ input: { inputProps: { min: listing.minInvestment, max: listing.maxInvestment, step: 10000 } } }}
                sx={{ '& input': { fontSize: '1.5rem', fontWeight: 700 } }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Min: {formatCurrency(listing.minInvestment)} · Max: {formatCurrency(listing.maxInvestment)}
              </Typography>
            </Box>
          )}

          {activeStep === 1 && (
            <Paper variant="outlined" sx={{ p: 3, mt: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">You invest</Typography><Typography sx={{ fontWeight: 700 }}>{formatCurrency(investAmount)}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">You receive</Typography><Typography sx={{ fontWeight: 700, color: 'secondary.main' }}>{formatCurrency(investAmount * listing.returnMultiple)}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Timeline</Typography><Typography sx={{ fontWeight: 700 }}>~{listing.estimatedDuration} months</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Monthly (est.)</Typography><Typography sx={{ fontWeight: 700 }}>{formatCurrency(Math.round((investAmount * (listing.returnMultiple - 1)) / listing.estimatedDuration))}</Typography></Stack>
              </Stack>
            </Paper>
          )}

          {activeStep === 2 && (
            <Box sx={{ pt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, maxHeight: 160, overflow: 'auto', bgcolor: '#F8FAFC' }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  By proceeding, you acknowledge that: Returns are based on actual business revenue and are not guaranteed.
                  Your investment will be held in escrow until the funding goal is met. If the funding goal is not met, your investment will be refunded.
                  This investment is illiquid and cannot be traded.
                </Typography>
              </Paper>
              <FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} color="success" />}
                label={<Typography variant="body2">I understand the risks and agree to the investment terms.</Typography>} />
            </Box>
          )}

          {activeStep === 3 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1 }}>Investment Created!</Typography>
              <Typography color="text.secondary">Your investment of {formatCurrency(investAmount)} is now in escrow.</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>In production, Razorpay checkout would open here.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {activeStep < 3 && (
            <Button onClick={() => activeStep === 0 ? setOpen(false) : setActiveStep(activeStep - 1)} sx={{ mr: 'auto' }}>
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
          )}
          {activeStep < 3 ? (
            <Button variant="contained" color="secondary" disableElevation onClick={handleInvest}
              disabled={investLoading || (activeStep === 2 && !agreed)}>
              {investLoading ? 'Processing...' : activeStep === 2 ? 'Confirm Investment' : 'Continue'}
            </Button>
          ) : (
            <Button variant="contained" color="secondary" disableElevation onClick={() => setOpen(false)}>Done</Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  )
}
