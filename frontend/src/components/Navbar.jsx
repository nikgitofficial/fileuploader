import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!token;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [localUser, setLocalUser] = useState(() =>
    JSON.parse(localStorage.getItem('user'))
  );
  const isAdmin = localUser?.role === 'admin';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setLocalUser(storedUser);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login',{ state: { logoutSuccess: true } });
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (route) => {
    setAnchorEl(null);
    if (route) navigate(route);
  };

  const navLinks = [
    ...(isAdmin ? [{ label: 'Admin', route: '/admin' }] : []),
    ...(isLoggedIn
      ? [
          { label: 'Home', route: '/' },
          { label: 'About', route: '/about' },
          { label: 'Upload', route: '/upload' },
          { label: 'Download', route: '/youtube-downloader' },
          { label: 'Contact', route: '/contact' },
          { label: 'Logout', action: handleLogout }
        ]
      : [
          { label: 'Login', route: '/login' },
          { label: 'Register', route: '/register' }
        ])
  ];

  const navButtonStyle = (isActive) => ({
    position: 'relative',
    mx: 1,
    color: isActive ? '#fff' : 'inherit',
    backgroundColor: isActive ? '#1565c0' : 'transparent',
    borderRadius: 1,
    textTransform: 'none',
    fontWeight: isActive ? 'bold' : 'normal',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '2px',
      width: isActive ? '100%' : '0%',
      backgroundColor: '#64b5f6',
      transition: 'width 0.3s ease-in-out',
    },
    '&:hover::after': {
      width: '100%',
    },
  });

  const menuItemHoverStyle = {
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#1976d2',
      color: '#fff',
      transform: 'translateX(4px)',
    },
  };

  return (
    <AppBar position="fixed" elevation={2}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          📁 NikFileUploader
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMenuClick}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              open={open}
              onClose={() => handleMenuClose()}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {navLinks.map((item, idx) =>
                item.action ? (
                  <MenuItem
                    key={idx}
                    onClick={() => {
                      handleMenuClose();
                      item.action();
                    }}
                    sx={menuItemHoverStyle}
                  >
                    {item.label}
                  </MenuItem>
                ) : (
                  <MenuItem
                    key={idx}
                    onClick={() => handleMenuClose(item.route)}
                    sx={menuItemHoverStyle}
                  >
                    {item.label}
                  </MenuItem>
                )
              )}
            </Menu>
          </>
        ) : (
          <Box>
            {navLinks.map((item, idx) =>
              item.action ? (
                <Button
                  key={idx}
                  color="inherit"
                  sx={navButtonStyle(false)}
                  onClick={item.action}
                >
                  {item.label}
                </Button>
              ) : (
                <Button
                  key={idx}
                  color="inherit"
                  sx={navButtonStyle(location.pathname === item.route)}
                  onClick={() => navigate(item.route)}
                >
                  {item.label}
                </Button>
              )
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
