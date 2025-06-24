import React from 'react';
import {
  Box, Typography, Paper, Link, Grid, Avatar
} from '@mui/material';
import { Email, Facebook, Phone, Language } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        mt: isMobile ? 4 : 10,
        px: isMobile ? 2 : 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: isMobile ? 2 : 4,
          maxWidth: 600,
          width: '100%',
          position: 'absolute',
          top: isMobile ? '50%' : '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom align="center" color="primary">
          📞 Contact Information
        </Typography>

        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Feel free to reach out to me through any of the platforms below.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems="center"
              justifyContent="center"
              textAlign={isMobile ? 'center' : 'left'}
              gap={2}
            >
              <Avatar sx={{ bgcolor: '#3b5998' }}>
                <Facebook />
              </Avatar>
              <Link
                href="https://www.facebook.com/Nikko%20Mirafuentes%20Paceno"
                target="_blank"
                underline="hover"
                sx={{ wordBreak: 'break-word' }}
              >
                facebook.com/Nikko Mirafuentes Paceno
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems="center"
              justifyContent="center"
              textAlign={isMobile ? 'center' : 'left'}
              gap={2}
            >
              <Avatar
                src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png"
                alt="Gmail"
                sx={{ bgcolor: 'white', width: 40, height: 40 }}
              />
              <Typography variant="body1">nickforjobacc@gmail.com</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems="center"
              justifyContent="center"
              textAlign={isMobile ? 'center' : 'left'}
              gap={2}
            >
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Phone />
              </Avatar>
              <Typography variant="body1">+63 951 419 0949</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems="center"
              justifyContent="center"
              textAlign={isMobile ? 'center' : 'left'}
              gap={2}
            >
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Language />
              </Avatar>
              <Link
                href="https://nikkoboy123.github.io/nik"
                target="_blank"
                underline="hover"
              >
                nikkoboy123.github.io/nik
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Contact;
