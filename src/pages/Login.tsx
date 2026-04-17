import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import {
  Box, Container, Typography, TextField, Button, Paper, Alert, Divider, Stack, InputAdornment,
} from '@mui/material'
import { TrendingUp, Email, Lock } from '@mui/icons-material'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
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
          <Typography variant="h4">Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Log in to your LocalStake account</Typography>
        </Box>

        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={loading} disableElevation>
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }} />

          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>Demo accounts (password: password123)</Typography>
            <Typography variant="caption" color="text.secondary">Investor: rahul@example.com</Typography><br />
            <Typography variant="caption" color="text.secondary">Owner: vikram@example.com</Typography><br />
            <Typography variant="caption" color="text.secondary">Admin: admin@localstake.in</Typography>
          </Paper>
        </Paper>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </Typography>
      </Container>
    </Box>
  )
}
