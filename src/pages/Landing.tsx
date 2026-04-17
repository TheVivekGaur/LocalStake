import { Link } from 'react-router-dom'
import { mockListings } from '@/data/mock'
import { ListingCard } from '@/components/listings/ListingCard'
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  Chip, Paper, Stack, LinearProgress,
} from '@mui/material'
import {
  ArrowForward, CheckCircle, Shield, AccountBalance, BarChart,
  TrendingUp, People, Business, Verified, AutoAwesome,
} from '@mui/icons-material'

export function Landing() {
  const featured = mockListings.filter(l => l.status === 'active').slice(0, 3)

  return (
    <Box>
      {/* ═══ HERO ═══ */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 40%)' }} />
        <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 }, position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 640 }}>
            <Chip
              icon={<Box sx={{ width: 8, height: 8, bgcolor: '#34D399', borderRadius: '50%' }} />}
              label="Now live in Bangalore & Delhi NCR"
              size="small"
              sx={{ mb: 4, bgcolor: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600, '& .MuiChip-icon': { ml: 1 } }}
            />
            <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '2.5rem', md: '3.75rem' }, lineHeight: 1.1, mb: 3 }}>
              Invest in businesses{' '}
              <Box component="span" sx={{ background: 'linear-gradient(90deg, #34D399, #6EE7B7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                you see every day
              </Box>
            </Typography>
            <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 400, mb: 5, lineHeight: 1.6, maxWidth: 520 }}>
              Earn monthly returns from gyms, cafés & sports arenas. Start with as little as ₹50K. Escrow-protected. Fully transparent.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
              <Button component={Link} to="/explore" variant="contained" color="secondary" size="large" endIcon={<ArrowForward />} disableElevation
                sx={{ px: 4, py: 1.5, fontSize: '1rem' }}>
                Explore Opportunities
              </Button>
              <Button component={Link} to="/how-it-works" variant="outlined" size="large"
                sx={{ px: 4, py: 1.5, fontSize: '1rem', color: '#fff', borderColor: '#475569', '&:hover': { borderColor: '#94A3B8', bgcolor: 'rgba(255,255,255,0.04)' } }}>
                How It Works
              </Button>
            </Stack>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {['₹1.2Cr+ Funded', '55+ Investors', '5 Businesses'].map((s) => (
                <Stack key={s} direction="row" spacing={0.75} alignItems="center">
                  <CheckCircle sx={{ fontSize: 16, color: '#34D399' }} />
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>{s}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ═══ STATS ═══ */}
      <Container maxWidth="md" sx={{ mt: -5, position: 'relative', zIndex: 2 }}>
        <Paper elevation={8} sx={{ p: 4, borderRadius: 4 }}>
          <Grid container spacing={3}>
            {[
              { val: '₹1.2Cr+', label: 'Capital Funded' },
              { val: '55+', label: 'Active Investors' },
              { val: '5', label: 'Businesses Listed' },
              { val: '₹8.2L', label: 'Payouts Distributed' },
            ].map((s) => (
              <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{s.val}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* ═══ TRUST ═══ */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={3}>
          {[
            { icon: <Shield />, title: 'Verified Businesses', desc: 'Every business is KYC verified and admin-approved before listing.' },
            { icon: <AccountBalance />, title: 'Escrow Protected', desc: 'Your money is held safely until the funding goal is met.' },
            { icon: <BarChart />, title: 'Transparent Returns', desc: 'Track every payout with real revenue data from the business.' },
          ].map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <Box sx={{ color: '#059669' }}>{item.icon}</Box>
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ═══ HOW IT WORKS ═══ */}
      <Box sx={{ bgcolor: '#F1F5F9', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip icon={<AutoAwesome sx={{ fontSize: 16 }} />} label="Simple Process" color="success" variant="outlined" size="small" sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ mb: 1.5 }}>How It Works</Typography>
            <Typography color="text.secondary">Three simple steps to start earning from local businesses.</Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { num: 1, icon: '🔍', title: 'Explore', desc: 'Browse verified local businesses raising capital for expansion in your city.' },
              { num: 2, icon: '💰', title: 'Invest', desc: 'Choose your amount. Funds go to escrow until the business is fully funded.' },
              { num: 3, icon: '📈', title: 'Earn', desc: 'Receive monthly royalty payouts proportional to your investment amount.' },
            ].map((step) => (
              <Grid key={step.num} size={{ xs: 12, md: 4 }}>
                <Card sx={{ textAlign: 'center', p: 4, height: '100%', position: 'relative', overflow: 'visible', transition: 'all 0.2s', '&:hover': { boxShadow: 8, transform: 'translateY(-4px)' } }}>
                  <Box sx={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                    {step.num}
                  </Box>
                  <Typography sx={{ fontSize: 48, mt: 1, mb: 2 }}>{step.icon}</Typography>
                  <Typography variant="h5" sx={{ mb: 1 }}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{step.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══ FEATURED ═══ */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 5 }}>
          <Box>
            <Chip icon={<TrendingUp sx={{ fontSize: 16 }} />} label="Live Opportunities" color="primary" variant="outlined" size="small" sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ mb: 1 }}>Featured Opportunities</Typography>
            <Typography color="text.secondary">Verified businesses raising capital right now.</Typography>
          </Box>
          <Button component={Link} to="/explore" endIcon={<ArrowForward />} sx={{ display: { xs: 'none', md: 'flex' } }}>
            View All
          </Button>
        </Stack>
        <Grid container spacing={3}>
          {featured.map((listing) => (
            <Grid key={listing.id} size={{ xs: 12, md: 4 }}>
              <ListingCard listing={listing} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ═══ ROI ═══ */}
      <Box sx={{ bgcolor: '#F1F5F9', py: 10 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 1 }}>See Your Returns</Typography>
          <Typography color="text.secondary" sx={{ mb: 5 }}>Here's what a typical investment looks like.</Typography>
          <Paper elevation={6} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 3, p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>You Invest</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>₹5L</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
                  <ArrowForward sx={{ color: '#059669', fontSize: 28 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>~30 months</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ bgcolor: '#ECFDF5', borderRadius: 3, p: 3 }}>
                  <Typography variant="body2" sx={{ color: '#059669', mb: 0.5 }}>You Receive</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#059669' }}>₹7.5L</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            *Illustrative example. Actual returns depend on business performance.
          </Typography>
        </Container>
      </Box>

      {/* ═══ WHY TRUST ═══ */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" sx={{ textAlign: 'center', mb: 6 }}>Why Investors Trust LocalStake</Typography>
        <Grid container spacing={3}>
          {[
            { icon: <Business />, title: 'Tangible Assets', desc: 'Invest in real businesses you can visit — gyms, cafés, sports courts.' },
            { icon: <People />, title: 'Owner Skin in the Game', desc: 'Every owner contributes 25-30% of their own capital.' },
            { icon: <Verified />, title: 'Capped Returns', desc: 'Royalty model with defined return multiples (1.5x-2x).' },
          ].map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                    <Box sx={{ color: '#fff' }}>{item.icon}</Box>
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ═══ CTA ═══ */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', py: 10, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.2), transparent 60%)' }} />
        <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ color: '#fff', mb: 2 }}>
            Own a piece of the places you visit every day
          </Typography>
          <Typography sx={{ color: '#94A3B8', mb: 5, fontSize: '1.1rem' }}>
            Join 55+ investors already earning monthly returns from local businesses.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={Link} to="/explore" variant="contained" color="secondary" size="large" endIcon={<ArrowForward />} disableElevation sx={{ px: 4 }}>
              Start Investing
            </Button>
            <Button component={Link} to="/signup" variant="outlined" size="large"
              sx={{ px: 4, color: '#fff', borderColor: '#475569', '&:hover': { borderColor: '#94A3B8', bgcolor: 'rgba(255,255,255,0.04)' } }}>
              Create Account
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
