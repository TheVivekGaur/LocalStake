import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  Box, Container, Typography, TextField, Button, Paper, Alert, Stack,
  MenuItem, Stepper, Step, StepLabel, Grid,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

export function CreateListing() {
  const [step, setStep] = useState(0)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [businessId, setBusinessId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Sports')
  const [city, setCity] = useState('Bangalore')
  const [businessName, setBizName] = useState('')
  const [bizDesc, setBizDesc] = useState('')
  const [monthlyRevenue, setMonthlyRevenue] = useState('')
  const [expectedRevenue, setExpectedRevenue] = useState('')
  const [fundingGoal, setFundingGoal] = useState('')
  const [ownerContribution, setOwnerContribution] = useState('')
  const [royaltyPercent, setRoyaltyPercent] = useState('8')
  const [returnMultiple, setReturnMultiple] = useState('1.6')
  const [minInvestment, setMinInvestment] = useState('100000')
  const [maxInvestment, setMaxInvestment] = useState('500000')
  const [estimatedDuration, setEstimatedDuration] = useState('24')

  useEffect(() => { api.getMyBusinesses().then(setBusinesses).catch(() => {}) }, [])

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      let bid = businessId
      if (!bid) {
        const biz = await api.createBusiness({ name: businessName || title, category, city, description: bizDesc || description })
        bid = (biz as any).id
      }
      await api.createListing({
        businessId: bid, title, description, fundingGoal: Number(fundingGoal), ownerContribution: Number(ownerContribution),
        royaltyPercent: Number(royaltyPercent), returnMultiple: Number(returnMultiple), estimatedDuration: Number(estimatedDuration),
        minInvestment: Number(minInvestment), maxInvestment: Number(maxInvestment), monthlyRevenue: Number(monthlyRevenue), expectedRevenue: Number(expectedRevenue),
      })
      navigate('/owner/dashboard')
    } catch (err: any) { setError(err.message || 'Failed') } finally { setLoading(false) }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/owner/dashboard')} sx={{ mb: 3, color: 'text.secondary' }}>Back</Button>
      <Typography variant="h3" sx={{ mb: 1 }}>Create New Listing</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Fill in the details to list your business for funding.</Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {['Business Info', 'Financials', 'Terms'].map((l) => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
      </Stepper>

      <Paper elevation={2} sx={{ p: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 0 && (
          <Stack spacing={2.5}>
            {businesses.length > 0 && (
              <TextField select fullWidth label="Select Existing Business" value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
                <MenuItem value="">Create new business</MenuItem>
                {businesses.map((b: any) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
            )}
            {!businessId && (
              <>
                <TextField fullWidth label="Business Name" value={businessName} onChange={(e) => setBizName(e.target.value)} />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField select fullWidth label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {['Sports', 'Gym', 'Café', 'EV Fleet', 'Cloud Kitchen', 'Salon'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={6}>
                    <TextField select fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)}>
                      {['Bangalore', 'Delhi NCR', 'Mumbai', 'Hyderabad'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
                <TextField fullWidth label="Business Description" multiline rows={2} value={bizDesc} onChange={(e) => setBizDesc(e.target.value)} />
              </>
            )}
            <TextField fullWidth label="Listing Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <TextField fullWidth label="Listing Description" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Stack>
        )}

        {step === 1 && (
          <Grid container spacing={2.5}>
            <Grid size={6}><TextField fullWidth label="Current Monthly Revenue (₹)" type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} /></Grid>
            <Grid size={6}><TextField fullWidth label="Expected Monthly Revenue (₹)" type="number" value={expectedRevenue} onChange={(e) => setExpectedRevenue(e.target.value)} /></Grid>
          </Grid>
        )}

        {step === 2 && (
          <Grid container spacing={2.5}>
            <Grid size={6}><TextField fullWidth label="Funding Required (₹)" type="number" value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)} /></Grid>
            <Grid size={6}><TextField fullWidth label="Your Contribution (₹)" type="number" value={ownerContribution} onChange={(e) => setOwnerContribution(e.target.value)} /></Grid>
            <Grid size={6}><TextField fullWidth label="Royalty %" type="number" value={royaltyPercent} onChange={(e) => setRoyaltyPercent(e.target.value)} /></Grid>
            <Grid size={6}><TextField fullWidth label="Return Multiple" type="number" slotProps={{ htmlInput: { step: 0.1 } }} value={returnMultiple} onChange={(e) => setReturnMultiple(e.target.value)} /></Grid>
            <Grid size={6}><TextField fullWidth label="Min Investment (₹)" type="number" value={minInvestment} onChange={(e) => setMinInvestment(e.target.value)} /></Grid>
            <Grid size={6}><TextField fullWidth label="Max Investment (₹)" type="number" value={maxInvestment} onChange={(e) => setMaxInvestment(e.target.value)} /></Grid>
            <Grid size={6}><TextField fullWidth label="Est. Duration (months)" type="number" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} /></Grid>
          </Grid>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          {step > 0 && <Button variant="outlined" fullWidth onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 2 ? (
            <Button variant="contained" color="secondary" fullWidth disableElevation onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button variant="contained" color="secondary" fullWidth disableElevation onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
