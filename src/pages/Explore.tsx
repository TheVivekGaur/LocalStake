import { useState, useMemo } from 'react'
import { ListingCard } from '@/components/listings/ListingCard'
import { useListings } from '@/hooks/useListings'
import { categories, cities } from '@/data/mock'
import {
  Box, Container, Typography, TextField, MenuItem, Grid, Stack,
  InputAdornment, Chip, CircularProgress,
} from '@mui/material'
import { Search, FilterList } from '@mui/icons-material'

export function Explore() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [city, setCity] = useState('All')
  const [sortBy, setSortBy] = useState('recent')

  const params: Record<string, string> = {}
  if (category !== 'All') params.category = category
  if (city !== 'All') params.city = city
  params.sort = sortBy === 'roi' ? 'roi' : sortBy === 'progress' ? 'progress' : 'newest'

  const { listings, loading } = useListings(params)

  const filtered = useMemo(() => {
    if (!search) return listings
    return listings.filter((l: any) =>
      (l.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.business?.name || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [listings, search])

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>Explore Opportunities</Typography>
          <Typography color="text.secondary">Discover verified local businesses raising capital for expansion.</Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <TextField fullWidth size="small" placeholder="Search businesses..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment> } }} />
          <TextField select size="small" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 160 }}>
            {categories.map((c) => <MenuItem key={c} value={c}>{c === 'All' ? 'All Categories' : c}</MenuItem>)}
          </TextField>
          <TextField select size="small" value={city} onChange={(e) => setCity(e.target.value)} sx={{ minWidth: 140 }}>
            {cities.map((c) => <MenuItem key={c} value={c}>{c === 'All' ? 'All Cities' : c}</MenuItem>)}
          </TextField>
          <TextField select size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="roi">Highest ROI</MenuItem>
            <MenuItem value="progress">Most Funded</MenuItem>
          </TextField>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <FilterList sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">{filtered.length} opportunities found</Typography>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : filtered.length > 0 ? (
          <Grid container spacing={3}>
            {filtered.map((listing: any) => (
              <Grid key={listing.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <ListingCard listing={listing} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>No opportunities match your filters.</Typography>
            <Chip label="Clear filters" color="secondary" variant="outlined" onClick={() => { setCategory('All'); setCity('All'); setSearch('') }} sx={{ cursor: 'pointer' }} />
          </Box>
        )}
      </Container>
    </Box>
  )
}
