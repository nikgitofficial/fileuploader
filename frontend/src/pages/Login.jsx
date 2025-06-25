import { useState, useContext, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link as MuiLink,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cooldownDurations = [0, 0, 15, 15, 30]; // per attempt
  const maxAttempts = 5;
  const LOCK_DURATION_HOURS = 4; // 5th failed attempt = 4hr lock

  // Load stored attempts + expiration
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

  // Countdown for temporary locks
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

      navigate(user?.role === 'admin' ? '/admin' : '/');
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
          type="password"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

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
    </Box>
  );
};

export default Login;
