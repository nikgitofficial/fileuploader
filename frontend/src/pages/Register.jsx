import { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Link as MuiLink, Box, useTheme,
  useMediaQuery, InputAdornment, IconButton, LinearProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../api/axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';


const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', otp: '' });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [otpToken, setOtpToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [otpLockTime, setOtpLockTime] = useState(0);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [otpVerifiedSnackbar, setOtpVerifiedSnackbar] = useState(false);
  const [otpSentSnackbar, setOtpSentSnackbar] = useState(false);

  const MAX_RESEND_ATTEMPTS = 3;
  const LOCK_DURATION_MS = 10 * 60 * 1000;

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load lock state from localStorage
  useEffect(() => {
    const attempts = localStorage.getItem('resendAttempts');
    const lock = localStorage.getItem('otpLockTime');
    if (attempts) setResendAttempts(parseInt(attempts));
    if (lock) setOtpLockTime(parseInt(lock));
  }, []);

  useEffect(() => {
    localStorage.setItem('resendAttempts', resendAttempts.toString());
  }, [resendAttempts]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!otpLockTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = otpLockTime - now;
      if (remaining <= 0) {
        clearInterval(interval);
        setOtpLockTime(0);
        setResendAttempts(0);
        setLockCountdown(0);
        localStorage.removeItem('otpLockTime');
        localStorage.removeItem('resendAttempts');
      } else {
        setLockCountdown(Math.floor(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpLockTime]);

  const clearLock = () => {
    setResendAttempts(0);
    setResendCooldown(0);
    setOtpLockTime(0);
    setLockCountdown(0);
    setError('');
    setEmailTaken(false);
    setEmailValid(false);
    localStorage.removeItem('otpLockTime');
    localStorage.removeItem('resendAttempts');
  };

  // Debounced email validation and availability check
  useEffect(() => {
    if (!form.email) {
      setEmailTaken(false);
      setEmailValid(false);
      setError('');
      return;
    }
    const trimmed = form.email.trim().toLowerCase();
    const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!validFormat) {
      setEmailTaken(false);
      setEmailValid(false);
      setError('');
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        await axios.post('/auth/check-email', { email: trimmed });
        setEmailTaken(false);
        setEmailValid(true);
        setError('');
      } catch (err) {
        if (err.response?.status === 409) {
          setEmailTaken(true);
          setEmailValid(false);
          setError('please use another email');
        } else {
          setEmailTaken(false);
          setEmailValid(false);
          setError('Failed to validate email');
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [form.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'email') clearLock();
  };

  // Important: Re-check email availability before sending OTP to avoid race conditions
  const handleSendOtp = async () => {
    setError('');
    const trimmedEmail = form.email.trim().toLowerCase();
    if (!trimmedEmail) return setError('Please enter your email.');

    // Final server-side email check before sending OTP
    try {
      await axios.post('/auth/check-email', { email: trimmedEmail });
      setEmailTaken(false);
      setEmailValid(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setEmailTaken(true);
        setEmailValid(false);
        setError('Email is already registered');
        return; // block sending OTP
      } else {
        setError('Failed to validate email');
        return;
      }
    }

    if (otpLockTime > Date.now()) return;

    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION_MS;
      setOtpLockTime(lockUntil);
      localStorage.setItem('otpLockTime', lockUntil.toString());
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/send-otp', { email: trimmedEmail });
      setStep(2);
      setResendAttempts(prev => prev + 1);
      setResendCooldown(30);
      setOtpSentSnackbar(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    try {
      setLoading(true);
      const res = await axios.post('/auth/verify-otp', {
        email: form.email.trim().toLowerCase(),
        otp: form.otp
      });
      setOtpToken(res.data.otpToken);
      setStep(3);
      setOtpVerifiedSnackbar(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const isValidPassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  });

  const getPasswordStrength = () => {
    const rules = isValidPassword(form.password);
    const passed = Object.values(rules).filter(Boolean).length;
    return (passed / 5) * 100;
  };

  const suggestStrongPassword = () => {
    const strong = Math.random().toString(36).slice(2, 6) + 'Aa1!' + Math.random().toString(36).slice(2, 6);
    setForm({ ...form, password: strong, confirmPassword: strong });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.password || !form.confirmPassword) return setError('Please enter and confirm your password.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    try {
      setLoading(true);
      await axios.post('/auth/register', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        otpToken
      });
         setSnackbarOpen(true); 
         setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = isValidPassword(form.password);
  const otpLocked = otpLockTime > Date.now();
  const retryMessage = otpLocked
    ? `Too many attempts. Try again in ${lockCountdown}s`
    : resendCooldown > 0
    ? `Please wait ${resendCooldown}s`
    : '';

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
        Register
      </Typography>

      <form onSubmit={step === 3 ? handleRegister : (e) => e.preventDefault()}>
        {step === 1 && (
          <>
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              onChange={handleChange}
              type="email"
              value={form.email}
              error={emailTaken}
              helperText={emailTaken ? 'User already exists' : ''}
              InputProps={{
                endAdornment:
                  emailValid && !emailTaken ? (
                    <InputAdornment position="end">
                      <Typography color="green" fontWeight={600}>✅</Typography>
                    </InputAdornment>
                  ) : null,
              }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendOtp}
              sx={{ mt: 2 }}
              disabled={loading || otpLocked || resendCooldown > 0 || emailTaken}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
            {retryMessage && (
              <Typography variant="caption" color="error">
                {retryMessage}
              </Typography>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              OTP sent to <strong>{form.email}</strong>
            </Typography>
            <TextField
              label="Enter OTP"
              name="otp"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyOtp}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              variant="text"
              fullWidth
              sx={{ mt: 1 }}
              onClick={handleSendOtp}
              disabled={loading || otpLocked || resendCooldown > 0}
            >
              Resend OTP
            </Button>
            {retryMessage && (
              <Typography variant="caption" color="error">
                {retryMessage}
              </Typography>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box textAlign="left" mt={1}>
              {Object.entries(passwordRules).map(([rule, passed]) => (
                <Typography key={rule} variant="caption" color={passed ? 'green' : 'error'}>
                  ✅ {rule.charAt(0).toUpperCase() + rule.slice(1)}
                </Typography>
              ))}
            </Box>
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={getPasswordStrength()} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
            <Button variant="text" size="small" onClick={suggestStrongPassword} sx={{ mt: 1 }}>
              🧠 Suggest Strong Password
            </Button>
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={clearLock} sx={{ mt: 2 }}>
              Clear Lock (Dev)
            </Button>
          </>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </form>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login">
            Login
          </MuiLink>
        </Typography>
      </Box>
      <Snackbar
  open={snackbarOpen}
  autoHideDuration={2000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
    Successfully registered! Redirecting to login...
  </Alert>
</Snackbar>

<Snackbar
  open={otpVerifiedSnackbar}
  autoHideDuration={2000}
  onClose={() => setOtpVerifiedSnackbar(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert onClose={() => setOtpVerifiedSnackbar(false)} severity="success" sx={{ width: '100%' }}>
    ✅ OTP Verified! You can now set your password.
  </Alert>
</Snackbar>

<Snackbar
  open={otpSentSnackbar}
  autoHideDuration={2000}
  onClose={() => setOtpSentSnackbar(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert onClose={() => setOtpSentSnackbar(false)} severity="info" sx={{ width: '100%' }}>
    📧 OTP sent! Please check your email.
  </Alert>
</Snackbar>

    </Box>
  );
};

export default Register;
