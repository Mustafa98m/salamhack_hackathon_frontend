// File: src/layouts/AppLayout.jsx

import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/photo_2025-03-20_19-07-30.jpg';
import {
  AppBar,
  Box,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  Menu,
  Button,
  MenuItem,
  Container,
  CssBaseline,
  Badge,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Headphones as HeadphonesIcon,
  Logout as LogoutIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

// Drawer width
const drawerWidth = 260;

// Custom styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // For Safari
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  color: theme.palette.text.primary,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  minHeight: '64px',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  margin: theme.spacing(0.8, 1),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  ...(selected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.18),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    border: 'none',
    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
    backgroundColor: theme.palette.background.default,
  },
}));

const AppLayout = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle profile menu open
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle profile menu close
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Podcasts', icon: <HeadphonesIcon />, path: '/podcasts' },
    { text: 'Progress', icon: <AssessmentIcon />, path: '/progress' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  // Close mobile drawer when location changes
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location]);

  // Drawer content
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
          <img
            src={logo}
            alt='PodLearn'
            style={{ width: '32px', height: '32px', marginRight: '10px' }}
          />
          <Typography variant='h6' noWrap component='div' fontWeight='bold'>
            LingoAI
          </Typography>
        </Box>
        <IconButton sx={{ color: 'inherit' }} onClick={handleDrawerToggle}>
          {theme.direction === 'ltr' ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <StyledBadge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant='dot'
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </StyledBadge>
          <Box sx={{ ml: 2 }}>
            <Typography variant='subtitle1' fontWeight='medium' noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography variant='body2' color='text.secondary' noWrap>
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography
        variant='overline'
        sx={{
          px: 3,
          mb: 1,
          mt: 2,
          color: 'text.secondary',
          fontWeight: 'fontWeightBold',
        }}
      >
        MAIN MENU
      </Typography>

      <List sx={{ px: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <StyledListItemButton
                component={Link}
                to={item.path}
                selected={isSelected}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 'bold' : 'regular',
                  }}
                />
                {item.text === 'Podcasts' && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      mr: 1,
                    }}
                  />
                )}
              </StyledListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mt: 2 }} />

      <Box p={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            backgroundImage:
              'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
            position: 'relative',
            overflow: 'hidden',
            color: 'white',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -24,
              right: -24,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 0,
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant='subtitle1' fontWeight='bold' mb={1}>
              Upgrade to PRO
            </Typography>
            <Typography variant='body2' mb={2} sx={{ opacity: 0.8 }}>
              Get access to all premium features
            </Typography>
            <Button
              variant='contained'
              size='small'
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
                fontWeight: 'bold',
              }}
            >
              Upgrade Now
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(
      (item) => item.path === location.pathname
    );
    if (currentItem) return currentItem.text;

    // Check if we're on a quiz page
    if (location.pathname.startsWith('/quiz/')) {
      return 'Quiz';
    }

    return 'Dashboard';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* App Bar */}
      <StyledAppBar
        position='fixed'
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
            }}
          >
            {getCurrentPageTitle()}
          </Typography>

          {/* Notification */}
          <IconButton color='inherit' sx={{ ml: 1 }}>
            <Badge badgeContent={3} color='error'>
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton color='inherit' sx={{ ml: 1 }}>
            <SettingsIcon />
          </IconButton>

          {/* User profile */}
          <IconButton
            size='large'
            edge='end'
            aria-label='account of current user'
            aria-haspopup='true'
            onClick={handleProfileMenuOpen}
            color='inherit'
            sx={{ ml: 1 }}
          >
            <StyledBadge
              overlap='circular'
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant='dot'
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </StyledBadge>
          </IconButton>

          {/* Profile menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                width: 200,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography variant='subtitle1' fontWeight='bold'>
                {user?.name || 'User'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                navigate('/profile');
              }}
              sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
            >
              <ListItemIcon>
                <PersonIcon fontSize='small' color='primary' />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                navigate('/progress');
              }}
              sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
            >
              <ListItemIcon>
                <AssessmentIcon fontSize='small' color='primary' />
              </ListItemIcon>
              <ListItemText>Progress</ListItemText>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 1,
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize='small' color='error' />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>

      {/* Navigation Drawer */}
      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <StyledDrawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {drawer}
        </StyledDrawer>

        {/* Desktop drawer */}
        <StyledDrawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>

      {/* Main content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          minHeight: '100vh',
        }}
      >
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
