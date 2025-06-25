import { Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Locked = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const lockUntil = localStorage.getItem('lockExpiration');
    if (!lockUntil) return;

    const expiresAt = parseInt(lockUntil);
    const updateCountdown = () => {
      const remaining = Math.floor((expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setCountdown(0);
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockExpiration');
      } else {
        setCountdown(remaining);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetLock = () => {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockExpiration');
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 10, px: 2 }}>
      <Typography variant="h4" color="error" gutterBottom>
        🚫 You have been locked out!
      </Typography>
      <Typography variant="body1" gutterBottom>
        You have exceeded the maximum number of login attempts.
      </Typography>

      {countdown > 0 ? (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Please try again after: <strong>{formatTime(countdown)}</strong>
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Lockout expired — you may try again now.
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={resetLock}
        sx={{ mt: 2, mr: 1 }}
        disabled={countdown > 0}
      >
        {countdown > 0 ? `Try Again in ${formatTime(countdown)}` : 'Try Again'}
      </Button>

      {/* DEV/TESTING ONLY: Clear lock instantly */}
      <Button
        variant="outlined"
        color="secondary"
        onClick={resetLock}
        sx={{ mt: 2, ml: 1 }}
      >
        Clear Lock (Dev)
      </Button>
    </Box>
  );
};

export default Locked;
