import { Typography, Button, Box, Paper } from '@mui/material';
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
    <Box
      sx={{
       
        
        alignItems: 'center',
        justifyContent: 'center',
    
        px: 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          🚫 Locked Out
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

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={resetLock}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Try in ${formatTime(countdown)}` : 'Try Again'}
          </Button>
        <Button
            variant="outlined"
            color="secondary"
            onClick={resetLock}
          >
            Clear Lock (Dev)
</Button>
         
        </Box>
      </Paper>
    </Box>
  );
};

export default Locked;
