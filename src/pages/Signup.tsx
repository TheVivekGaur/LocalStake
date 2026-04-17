import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import {
  Box, Container, Typography, TextField, Button, Paper, Alert, Stack,
  InputAdornment, ToggleButtonGroup, ToggleButton, LinearProgress,
} from '@mui/material'
import { TrendingUp, Person, Email, Phone, Lock, Business } from '@mui/icons-material'

export function Signup() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'INVESTOR' | 'OWNER'>('INVESTOR')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useStore()

  const handleComplete = async () => {
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password, role, phone })
      navigate(role === 'INVESTOR' ? '/dashboard' : '/owner/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', py: 6 }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 56, height: 56, bgcolor: 'secondary.main', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <TrendingUp sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Typography variant="h4">Create your account</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Join LocalStake in 2 simple steps</Typography>
        </Box>

        <LinearProgress variant="determinate" value={step * 50} color="secondary" sx={{ mb: 3, borderRadius: 2, height: 4 }} />

        <Paper elevation={2} sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          {step === 1 && (
            <Stack spacing={3}>
              <Typography variant="h6">I want to...</Typography>
              <ToggleButtonGroup value={role} exclusive onChange={(_, v) => v && setRole(v)} fullWidth color="success">
                <ToggleButton value="INVESTOR" sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: '12px !important' }}>
                  <Person sx={{ fontSize: 28 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Invest</Typography>
                  <Typography variant="caption" color="text.secondary">Earn returns</Typography>
                </ToggleButton>
                <ToggleButton value="OWNER" sx={{ py: 3, flexDirection: 'column', gap: 1, borderRadius: '12px !important' }}>
                  <Business sx={{ fontSize: 28 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Raise Capital</Typography>
                  <Typography variant="caption" color="text.secondary">List business</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
              <Button variant="contained" color="secondary" size="large" fullWidth disableElevation onClick={() => setStep(2)}>
                Continue
              </Button>
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={2.5}>
              <Typography variant="h6">Your Details</Typography>
              <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                helperText="Min 6 characters"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" fullWidth onClick={() => setStep(1)}>Back</Button>
                <Button variant="contained" color="secondary" fullWidth disableElevation onClick={handleComplete}
                  disabled={loading || !name || !email || !password}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </Typography>
      </Container>
    </Box>
  )
}
