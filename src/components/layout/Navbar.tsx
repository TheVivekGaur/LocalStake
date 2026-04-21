import { Link, useLocation } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { useState } from 'react'
import {
  AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItemButton,
  ListItemText, Typography, Chip, Avatar, Divider, Container,
} from '@mui/material'
import { Menu as MenuIcon, Close, TrendingUp, SwapHoriz, Logout } from '@mui/icons-material'

const investorLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/payouts', label: 'Payouts' },
]
const ownerLinks = [
  { to: '/', label: 'Home' },
  { to: '/owner/dashboard', label: 'Dashboard' },
  { to: '/owner/create-listing', label: 'Create Listing' },
  { to: '/owner/payouts', label: 'Payouts' },
]
const adminLinks = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin Panel' },
  { to: '/explore', label: 'Explore' },
]

export function Navbar() {
  const { isAuthenticated, activeRole, user, logout, switchRole } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const links = activeRole === 'admin' ? adminLinks : activeRole === 'owner' ? ownerLinks : investorLinks

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 70 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: 'secondary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.2rem' }}>LocalStake</Typography>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {links.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                sx={{
                  color: location.pathname === link.to ? 'secondary.main' : 'text.secondary',
                  bgcolor: location.pathname === link.to ? 'rgba(16,185,129,0.08)' : 'transparent',
                  fontWeight: location.pathname === link.to ? 700 : 500,
                  borderRadius: 2, px: 2, py: 1, fontSize: '0.875rem',
                  '&:hover': { bgcolor: 'rgba(16,185,129,0.06)' },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, ml: 2 }}>
            {isAuthenticated ? (
              <>
                <Chip
                  icon={<SwapHoriz sx={{ fontSize: 16 }} />}
                  label={activeRole === 'investor' ? 'Switch to Owner' : 'Switch to Investor'}
                  size="small"
                  onClick={() => switchRole(activeRole === 'investor' ? 'owner' : 'investor')}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  avatar={<Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main', fontSize: 12 }}>{user?.name?.[0]}</Avatar>}
                  label={user?.name}
                  variant="outlined"
                  size="small"
                />
                <IconButton size="small" onClick={logout} sx={{ color: 'text.secondary' }}>
                  <Logout sx={{ fontSize: 18 }} />
                </IconButton>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" sx={{ color: 'text.secondary' }}>Log in</Button>
                <Button component={Link} to="/signup" variant="contained" color="secondary" disableElevation>Get Started</Button>
              </>
            )}
          </Box>

          <IconButton sx={{ display: { md: 'none' }, color: 'text.primary' }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 280 } }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
        </Box>
        <List>
          {links.map((link) => (
            <ListItemButton key={link.to} component={Link} to={link.to} onClick={() => setDrawerOpen(false)}
              selected={location.pathname === link.to}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        {!isAuthenticated && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button component={Link} to="/login" fullWidth variant="outlined" onClick={() => setDrawerOpen(false)}>Log in</Button>
            <Button component={Link} to="/signup" fullWidth variant="contained" color="secondary" onClick={() => setDrawerOpen(false)}>Get Started</Button>
          </Box>
        )}
      </Drawer>
    </AppBar>
  )
}
