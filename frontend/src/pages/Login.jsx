  import { useState, useContext, useEffect } from 'react';
import {
  TextField, Button, Typography, Box, Link as MuiLink, IconButton,
  InputAdornment, useTheme, useMediaQuery, Snackbar, Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cooldownDurations = [0, 0, 15, 15, 30];
  const maxAttempts = 5;
  const LOCK_DURATION_HOURS = 4;

  // Show logout success message if redirected from logout
  useEffect(() => {
    if (location.state?.logoutSuccess) {
      setSnackbarMessage('Successfully logged out');
      setSnackbarOpen(true);
          
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const storedAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
    const lockExpiration = localStorage.getItem('lockExpiration');

    if (storedAttempts >= maxAttempts && lockExpiration) {
      const expiresAt = parseInt(lockExpiration);
      if (Date.now() < expiresAt) {
        navigate('/locked');
      } else {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockExpiration');
        setAttemptCount(0);
      }
    } else {
      setAttemptCount(storedAttempts);
    }
  }, [navigate]);

  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.floor((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (attemptCount >= maxAttempts) {
      navigate('/locked');
      return;
    }

    if (lockoutUntil && Date.now() < lockoutUntil) {
      setError(`⏳ Too many failed attempts. Try again in ${countdown} seconds.`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/auth/login', form);
      const { token, user } = res.data;
      login(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lockExpiration');
      setAttemptCount(0);
      setSnackbarMessage('Login successful');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate(user?.role === 'admin' ? '/admin' : '/');
      }, 1000); // Short delay to show message
    } catch (err) {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      localStorage.setItem('loginAttempts', newCount);

      if (newCount >= maxAttempts) {
        const lockUntil = Date.now() + LOCK_DURATION_HOURS * 60 * 60 * 1000;
        localStorage.setItem('lockExpiration', lockUntil);
        navigate('/locked');
      } else {
        setError(err.response?.data?.error || 'Login failed');
        const delay = cooldownDurations[newCount] || 0;
        if (delay > 0) {
          const until = Date.now() + delay * 1000;
          setLockoutUntil(until);
          setCountdown(delay);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 400,
        px: isMobile ? 2 : 4,
        py: isMobile ? 3 : 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        Login
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <MuiLink component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </MuiLink>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        {attemptCount > 0 && attemptCount < maxAttempts && (
          <Typography color="error" sx={{ mt: 1 }}>
            ⚠️ You have made {attemptCount} failed {attemptCount === 1 ? 'attempt' : 'attempts'} out of {maxAttempts}.
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading || countdown > 0 || attemptCount >= maxAttempts}
        >
          {countdown > 0
            ? `Try again in ${countdown}s`
            : loading
            ? 'Logging in...'
            : 'Login'}
        </Button>
      </form>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Don&apos;t have an account?{' '}
          <MuiLink component={RouterLink} to="/register">
            Register here
          </MuiLink>
        </Typography>
      </Box>

      {/* ✅ Snackbar for login/logout message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
