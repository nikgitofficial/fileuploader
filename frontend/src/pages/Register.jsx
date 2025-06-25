import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Box,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  LinearProgress
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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

  const isValidPassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  };

  const getPasswordStrength = () => {
    const rules = isValidPassword(form.password);
    const passed = Object.values(rules).filter(Boolean).length;
    return (passed / 5) * 100;
  };

  const suggestStrongPassword = () => {
    const strong = Math.random().toString(36).slice(2, 6) + 
                   'Aa1!' + 
                   Math.random().toString(36).slice(2, 6);
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
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box textAlign="left" mt={1}>
              <Typography variant="caption" color={passwordRules.length ? 'green' : 'error'}>
                ✅ At least 8 characters
              </Typography><br />
              <Typography variant="caption" color={passwordRules.uppercase ? 'green' : 'error'}>
                ✅ At least 1 uppercase
              </Typography><br />
              <Typography variant="caption" color={passwordRules.lowercase ? 'green' : 'error'}>
                ✅ At least 1 lowercase
              </Typography><br />
              <Typography variant="caption" color={passwordRules.number ? 'green' : 'error'}>
                ✅ At least 1 number
              </Typography><br />
              <Typography variant="caption" color={passwordRules.special ? 'green' : 'error'}>
                ✅ At least 1 special character
              </Typography>
            </Box>

            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={getPasswordStrength()}
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
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={form.confirmPassword}
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
