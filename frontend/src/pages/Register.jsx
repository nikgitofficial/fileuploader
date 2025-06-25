import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from '../api/axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', otp: '' });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [otpToken, setOtpToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Cooldown timer
  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setError('');
    if (!form.email) return setError('Please enter your email.');
    try {
      setLoading(true);
      await axios.post('/auth/send-otp', { email: form.email });
      setStep(2);
      startCooldown();
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
        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              onChange={handleChange}
              type="email"
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendOtp}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </>
        )}

        {/* Step 2: OTP */}
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
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </Button>
          </>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <>
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
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
    </Box>
  );
};

export default Register;
