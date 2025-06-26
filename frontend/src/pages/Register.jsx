// ... your existing imports
import { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Link as MuiLink, Box, useTheme,
  useMediaQuery, InputAdornment, IconButton, LinearProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../api/axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

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
  const [emailTaken, setEmailTaken] = useState(false); // 👈 new state

  const MAX_RESEND_ATTEMPTS = 3;
  const LOCK_DURATION_MS = 10 * 60 * 1000;

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
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
    localStorage.removeItem('otpLockTime');
    localStorage.removeItem('resendAttempts');
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'email' && value !== prev.email) clearLock();
      return { ...prev, [name]: value };
    });

    if (name === 'email') {
      setEmailTaken(false);
      setError('');
      if (value.includes('@') && value.length > 5) {
        try {
          await axios.post('/auth/check-email', { email: value });
          setEmailTaken(false);
        } catch (err) {
          if (err.response?.status === 409) {
            setEmailTaken(true);
            setError('Email is already registered');
          } else {
            setError('Failed to validate email');
          }
        }
      }
    }
  };

  const handleSendOtp = async () => {
    setError('');
    if (!form.email) return setError('Please enter your email.');
    if (emailTaken) return setError('Email is already registered');
    if (otpLockTime > Date.now()) return;

    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION_MS;
      setOtpLockTime(lockUntil);
      localStorage.setItem('otpLockTime', lockUntil.toString());
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/send-otp', { email: form.email });
      setStep(2);
      setResendAttempts(prev => prev + 1);
      setResendCooldown(30);
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
        email: form.email,
        otp: form.otp
      });
      setOtpToken(res.data.otpToken);
      setStep(3);
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
    if (!form.password || !form.confirmPassword) {
      return setError('Please enter and confirm your password.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      await axios.post('/auth/register', {
        email: form.email,
        password: form.password,
        otpToken
      });
      navigate('/login');
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
              helperText={emailTaken ? 'Email already registered' : ''}
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

        {/* Step 2 & 3 stay unchanged */}
        {/* ...continue with step === 2 and step === 3 blocks from your version... */}

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
    </Box>
  );
};

export default Register;
