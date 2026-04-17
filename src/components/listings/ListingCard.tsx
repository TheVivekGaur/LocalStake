import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import type { Listing } from '@/types'
import {
  Card, CardContent, Box, Typography, Chip, LinearProgress, Stack,
} from '@mui/material'
import { LocationOn, TrendingUp, Schedule, People, CheckCircle } from '@mui/icons-material'

const catGradients: Record<string, string> = {
  Sports: 'linear-gradient(135deg, #3B82F6, #6366F1)',
  Gym: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  Café: 'linear-gradient(135deg, #F59E0B, #EA580C)',
  'EV Fleet': 'linear-gradient(135deg, #10B981, #0D9488)',
  'Cloud Kitchen': 'linear-gradient(135deg, #F97316, #EF4444)',
  Salon: 'linear-gradient(135deg, #EC4899, #E11D48)',
}

const catIcons: Record<string, string> = {
  Sports: '🏸', Gym: '💪', Café: '☕', 'EV Fleet': '⚡', 'Cloud Kitchen': '🍳', Salon: '💇',
}

export function ListingCard({ listing }: { listing: Listing }) {
  const progress = (listing.raisedAmount / listing.fundingGoal) * 100
  const cat = listing.business?.category || 'Sports'

  return (
    <Link to={`/listing/${listing.id}`} style={{ textDecoration: 'none' }}>
      <Card sx={{
        height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'all 0.25s ease', cursor: 'pointer',
        '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' },
      }}>
        {/* Gradient header */}
        <Box sx={{
          height: 140, background: catGradients[cat] || catGradients.Sports,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <Typography sx={{ fontSize: 52, opacity: 0.85 }}>{catIcons[cat] || '🏢'}</Typography>
          <Chip label={cat} size="small"
            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)', fontWeight: 700, fontSize: '0.7rem' }} />
          {listing.business?.verified && (
            <Chip icon={<CheckCircle sx={{ fontSize: 14, color: '#fff !important' }} />} label="Verified" size="small"
              sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
        </Box>

        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{listing.business?.city || '—'}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {listing.description}
          </Typography>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Raised {formatCurrency(listing.raisedAmount)}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={Math.min(progress, 100)} color="success"
              sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0' }} />
          </Box>

          {/* Stats */}
          <Stack direction="row" spacing={0} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
            {[
              { icon: <TrendingUp sx={{ fontSize: 14, color: 'secondary.main' }} />, val: `${listing.returnMultiple}x`, label: 'Returns' },
              { icon: <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />, val: `${listing.estimatedDuration}mo`, label: 'Duration' },
              { icon: <People sx={{ fontSize: 14, color: 'text.secondary' }} />, val: String(listing.investorCount), label: 'Investors' },
            ].map((s) => (
              <Box key={s.label} sx={{ flex: 1, textAlign: 'center' }}>
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  {s.icon}
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.val}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{s.label}</Typography>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 2 }}>
            <Typography variant="caption" color="text.secondary">Min. Investment</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{formatCurrency(listing.minInvestment)}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  )
}
