import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        py: 2,
        px: 2,
        backgroundColor: (theme) => theme.palette.grey[200],
        textAlign: 'center',
        zIndex: 1200, // same or higher than AppBar
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} NikFileUploader. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
