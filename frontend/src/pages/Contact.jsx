// src/pages/Contact.jsx
import React, { useState } from 'react';
import {
  Box, Grid, TextField, Typography, Button, Paper, Snackbar, Alert
} from '@mui/material';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send to backend or email service
    setSnackbar({ open: true, message: 'Message sent successfully!', severity: 'success' });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Box sx={{ mt: 10, px: 2 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 600, mx: 'auto', borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Get in Touch
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          We'd love to hear from you. Please fill out the form below.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                value={form.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                name="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Your Message"
                name="message"
                fullWidth
                multiline
                minRows={4}
                value={form.message}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" size="large">
                Send Message
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
