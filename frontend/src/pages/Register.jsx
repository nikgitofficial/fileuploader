import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Box
} from '@mui/material';
import axios from '../api/axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed');
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
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
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
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
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
