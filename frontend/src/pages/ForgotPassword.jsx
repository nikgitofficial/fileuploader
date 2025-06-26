import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const MAX_RESEND_ATTEMPTS = 3;
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_SECONDS = 30;

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Resend OTP lockout & cooldown state
  const [resendAttempts, setResendAttempts] = useState(0);
  const [otpLockTime, setOtpLockTime] = useState(0);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Snackbar control
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  // Load resend attempts and lock time from localStorage on mount
  useEffect(() => {
    const attempts = localStorage.getItem('resendAttempts');
    const lock = localStorage.getItem('otpLockTime');
    if (attempts) setResendAttempts(parseInt(attempts, 10));
    if (lock) setOtpLockTime(parseInt(lock, 10));
  }, []);

  // Save resendAttempts to localStorage on change
  useEffect(() => {
    localStorage.setItem('resendAttempts', resendAttempts.toString());
  }, [resendAttempts]);

  // Lockout countdown timer
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

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Snackbar open/close for errors or success messages
  useEffect(() => {
    if (error) {
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } else if (successMsg) {
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  }, [error, successMsg]);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  // Clear lock and resend attempt state (dev/testing purpose)
  const clearLock = () => {
    setResendAttempts(0);
    setOtpLockTime(0);
    setLockCountdown(0);
    setResendCooldown(0);
    setError('');
    localStorage.removeItem('otpLockTime');
    localStorage.removeItem('resendAttempts');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear lock if email changes
    if (name === 'email' && value !== form.email) clearLock();
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Password validation rules
  const isValidPassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  });

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    const rules = isValidPassword(password);
    const passed = Object.values(rules).filter(Boolean).length;
    return (passed / 5) * 100;
  };

  // Suggest strong password autofill
  const suggestStrongPassword = () => {
    const strongPwd =
      Math.random().toString(36).slice(2, 6) +
      'Aa1!' +
      Math.random().toString(36).slice(2, 6);
    setForm((prev) => ({
      ...prev,
      password: strongPwd,
      confirmPassword: strongPwd,
    }));
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccessMsg('');
    if (!form.email) {
      setError('Please enter your email');
      return;
    }
    if (otpLockTime > Date.now()) {
      setError(`Too many attempts. Try again in ${lockCountdown}s`);
      return;
    }
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION_MS;
      setOtpLockTime(lockUntil);
      localStorage.setItem('otpLockTime', lockUntil.toString());
      setError(`Too many attempts. Locked for 10 minutes.`);
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/send-reset-otp', { email: form.email }); // Make sure backend route matches
      setStep(2);
      setSuccessMsg('OTP sent successfully');
      setResendAttempts((prev) => prev + 1);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setSuccessMsg('');
    try {
      setLoading(true);
      const res = await axios.post('/auth/verify-reset-otp', {
        email: form.email,
        otp: form.otp,
      });
      setOtpToken(res.data.otpToken);
      setStep(3);
      setSuccessMsg('OTP verified successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccessMsg('');
    if (!form.password || !form.confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordRules = isValidPassword(form.password);
    if (!Object.values(passwordRules).every(Boolean)) {
      setError('Password does not meet all strength requirements.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/reset-password', {
        email: form.email,
        password: form.password,
        otpToken,
      });
      setSuccessMsg('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = isValidPassword(form.password);

  const otpLocked = otpLockTime > Date.now();
  const retryMessage = otpLocked
    ? `Too many attempts. Try again in ${lockCountdown}s`
    : resendCooldown > 0
    ? `Please wait ${resendCooldown}s before resending OTP`
    : '';

  return (
    <>
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
          Forgot Password
        </Typography>

        {step === 1 && (
          <>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendOtp}
              disabled={loading || otpLocked || resendCooldown > 0}
              sx={{ mt: 2 }}
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </Button>
            {retryMessage && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
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
              value={form.otp}
              onChange={handleChange}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyOtp}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={handleSendOtp}
              disabled={loading || otpLocked || resendCooldown > 0}
              sx={{ mt: 1 }}
            >
              Resend OTP
            </Button>
            {retryMessage && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {retryMessage}
              </Typography>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <TextField
              label="New Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box textAlign="left" mt={1}>
              {Object.entries(passwordRules).map(([rule, passed]) => (
                <Typography
                  key={rule}
                  variant="caption"
                  color={passed ? 'green' : 'error'}
                >
                  {passed ? '✅' : '❌'}{' '}
                  {rule.charAt(0).toUpperCase() + rule.slice(1)}
                </Typography>
              ))}
            </Box>
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={getPasswordStrength(form.password)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            <Button
              variant="text"
              size="small"
              onClick={suggestStrongPassword}
              sx={{ mt: 1 }}
            >
              🧠 Suggest Strong Password
            </Button>

            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleResetPassword}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </>
        )}

        {/* Dev clear lock button */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={clearLock}
          sx={{ mt: 2 }}
        >
          Clear Lock (Dev)
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarSeverity === 'error' ? error : successMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForgotPassword;
