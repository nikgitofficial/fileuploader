import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!token;

  const [localUser, setLocalUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const isAdmin = localUser?.role === 'admin';

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setLocalUser(storedUser);
  }, [token]); // runs when token changes (login/logout)

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navButtonStyle = {
    position: 'relative',
    mx: 1,
    textTransform: 'none',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '2px',
      width: '0%',
      backgroundColor: 'white',
      transition: 'width 0.3s ease-in-out',
    },
    '&:hover::after': {
      width: '100%',
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

        <Box>
          {isAdmin && (
            <Button color="inherit" onClick={() => navigate('/admin')}>
              Admin
            </Button>
          )}
          {isLoggedIn ? (
            <>
              <Button color="inherit" sx={navButtonStyle} onClick={() => navigate('/')}>
                Home
              </Button>
              <Button color="inherit" sx={navButtonStyle} onClick={() => navigate('/about')}>
                About
              </Button>
              <Button color="inherit" sx={navButtonStyle} onClick={() => navigate('/upload')}>
                Upload
              </Button>
              <Button color="inherit" sx={navButtonStyle} onClick={() => navigate('/youtube-downloader')}>
                Download
              </Button>
              <Button color="inherit" sx={navButtonStyle} onClick={() => navigate('/contact')}>
                Contact
              </Button>
              <Button color="inherit" sx={navButtonStyle} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" sx={navButtonStyle} onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" sx={navButtonStyle} onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
