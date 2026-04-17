import { Link } from 'react-router-dom'
import { Box, Container, Typography, Grid, IconButton } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'

export function Footer() {
  return (
    <Box sx={{ bgcolor: '#0F172A', color: '#fff', mt: 10 }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'secondary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>LocalStake</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 280 }}>
              Own a piece of the places you visit every day. India's platform for local business investing.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#CBD5E1' }}>Platform</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/explore" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Explore</Link>
              <Link to="/how-it-works" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>How It Works</Link>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#CBD5E1' }}>Company</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>About</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Contact</a>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#CBD5E1' }}>Legal</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Terms</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Privacy</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Risk Disclosure</a>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ borderTop: '1px solid #1E293B', mt: 6, pt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            © 2026 LocalStake. All rights reserved. Investments are subject to market risks.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
