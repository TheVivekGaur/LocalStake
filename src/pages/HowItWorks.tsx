import { Link } from 'react-router-dom'
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, Paper, Stack, Chip,
} from '@mui/material'
import { Search, CreditCard, TrendingUp, Shield, AccountBalance, BarChart, ArrowForward } from '@mui/icons-material'

export function HowItWorks() {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" sx={{ mb: 1.5 }}>How LocalStake Works</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520, mx: 'auto' }}>
          A simple, transparent way to invest in local businesses or raise capital for expansion.
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ textAlign: 'center', mb: 5 }}>For Investors</Typography>
      <Grid container spacing={3} sx={{ mb: 10 }}>
        {[
          { icon: <Search />, title: 'Explore', desc: 'Browse verified local businesses raising capital. Filter by category, city, ROI, and ticket size.' },
          { icon: <CreditCard />, title: 'Invest', desc: 'Choose your amount, review terms, accept the agreement, and pay securely via Razorpay.' },
          { icon: <TrendingUp />, title: 'Earn', desc: 'Receive monthly royalty payouts proportional to your investment. Track everything on your dashboard.' },
        ].map((s, i) => (
          <Grid key={s.title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ textAlign: 'center', height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 4 }}>
                <Chip label={`Step ${i + 1}`} color="success" size="small" sx={{ mb: 2 }} />
                <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <Box sx={{ color: '#059669' }}>{s.icon}</Box>
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>{s.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{s.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" sx={{ textAlign: 'center', mb: 5 }}>For Business Owners</Typography>
      <Grid container spacing={3} sx={{ mb: 10 }}>
        {[
          { icon: <Shield />, title: 'Register & Verify', desc: 'Sign up, submit your business details and documents. Our team verifies and approves your profile.' },
          { icon: <AccountBalance />, title: 'Create Listing', desc: 'Set your funding goal, owner contribution, royalty terms, and upload photos and financials.' },
          { icon: <BarChart />, title: 'Grow & Pay', desc: 'Track funding progress. Once funded, report monthly revenue and payouts are auto-distributed.' },
        ].map((s, i) => (
          <Grid key={s.title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ textAlign: 'center', height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 4 }}>
                <Chip label={`Step ${i + 1}`} color="primary" size="small" sx={{ mb: 2 }} />
                <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <Box sx={{ color: '#0F172A' }}>{s.icon}</Box>
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>{s.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{s.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Royalty explainer */}
      <Paper elevation={0} sx={{ p: 5, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 4, mb: 8 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 3 }}>How Royalty Returns Work</Typography>
        <Stack spacing={1.5} sx={{ maxWidth: 500, mx: 'auto' }}>
          {[
            '1. Business reports monthly net revenue to the platform.',
            '2. A fixed royalty percentage (e.g. 8%) is taken as the payout pool.',
            '3. Each investor receives a share proportional to their investment.',
            '4. Payouts continue until the return multiple (e.g. 1.6x) is achieved.',
            '5. Once the target return is reached, payouts stop automatically.',
          ].map((t) => <Typography key={t} variant="body2" color="text.secondary">{t}</Typography>)}
        </Stack>
        <Paper variant="outlined" sx={{ p: 3, mt: 3, maxWidth: 360, mx: 'auto', textAlign: 'center', bgcolor: '#fff' }}>
          <Typography variant="body2" color="text.secondary">Example: You invest ₹2L at 1.6x return</Typography>
          <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 800, mt: 1 }}>₹2L → ₹3.2L</Typography>
          <Typography variant="caption" color="text.secondary">Monthly payouts until ₹3.2L total received</Typography>
        </Paper>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Button component={Link} to="/explore" variant="contained" color="secondary" size="large" endIcon={<ArrowForward />} disableElevation>
          Explore Opportunities
        </Button>
      </Box>
    </Container>
  )
}
