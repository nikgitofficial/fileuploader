// src/pages/Contact.jsx
import React from 'react';
import {
  Box, Typography, Paper, Link, Grid, Avatar
} from '@mui/material';
import { Email, Facebook, Phone, Language } from '@mui/icons-material';

const Contact = () => {
  return (
    <Box sx={
      { mt: 10, 
        px: 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200%',
        maxWidth: 600,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',

     }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 600, mx: 'auto', borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom align="center" color="primary">
          📞 Contact Information
        </Typography>

        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Feel free to reach out to me through any of the platforms below.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: '#3b5998' }}>
                <Facebook />
              </Avatar>
              <Link href="https://www.facebook.com/Nikko Mirafuentes Paceno" target="_blank" underline="hover">
                facebook.com/Nikko Mirafuentes Paceno
              </Link>
            </Box>
          </Grid>

        <Grid item xs={12}>
  <Box display="flex" alignItems="center" gap={2}>
    <Avatar
      src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png"
      alt="Gmail"
      sx={{ bgcolor: 'white', width: 40, height: 40 }}
    />
    <Typography variant="body1">nickforjobacc@gmail.com</Typography>
  </Box>
</Grid>

          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Phone />
              </Avatar>
              <Typography variant="body1">+63 951 419 0949</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Language />
              </Avatar>
              <Link href="https://nikkoboy123.github.io/nik" target="_blank" underline="hover">
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
