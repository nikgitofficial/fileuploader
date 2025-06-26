import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    setError('');
    if (!form.email) return setError('Please enter your email');
    try {
      setLoading(true);
      await axios.post('/auth/send-otp', { email: form.email }); // ✅ updated route
      setStep(2);
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
      const res = await axios.post('/auth/verify-otp', { // ✅ updated route
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

  const handleResetPassword = async () => {
    setError('');
    if (!form.password || !form.confirmPassword) {
      return setError('Please enter and confirm your new password.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    try {
      setLoading(true);
      await axios.post('/auth/reset-password', {
        email: form.email,
        password: form.password,
        otpToken
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
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
        textAlign: 'center'
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
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Sending...' : 'Send Reset OTP'}
          </Button>
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
        </>
      )}

      {step === 3 && (
        <>
          <TextField
            label="New Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
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

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ForgotPassword;
