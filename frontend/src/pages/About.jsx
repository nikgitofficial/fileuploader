import React from 'react';
import {
  Box, Container, Typography, Paper, Grid, Avatar, Link, Divider, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  GitHub, Language, YouTube, Cloud, Storage, Security, MusicNote
} from '@mui/icons-material';

const techStack = [
  { name: 'React + Vite', icon: <Language color="primary" /> },
  { name: 'Node.js + Express', icon: <Storage color="success" /> },
  { name: 'MongoDB + Mongoose', icon: <Storage color="success" /> },
  { name: 'JWT Auth', icon: <Security color="warning" /> },
  { name: 'Cloudinary', icon: <Cloud color="info" /> },
  { name: 'YouTube MP3 Downloader', icon: <MusicNote color="error" /> },
];

const socialLinks = [
  { name: 'GitHub', icon: <GitHub />, url: 'https://github.com/nikgitofficial' },
  { name: 'YouTube', icon: <YouTube />, url: 'https://youtube.com/@nikkopacenio@gmail.com' },
  { name: 'Website', icon: <Language />, url: 'https://nikkoboy123.github.io/nik' },
];

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: isMobile ? '90%' : 400,
        p: isMobile ? 2 : 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 4,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight="bold"
          gutterBottom
          color="primary"
        >
          About This App
        </Typography>

        <Typography variant="body1" paragraph>
        This app is a full-stack web application where users can:
        </Typography>
          
     <Box component="ul" sx={{ textAlign: 'left', pl: 3, mb: 3 }}>
     <li>Upload and manage files (stored in Cloudinary)</li>
     <li>Download audio from YouTube as MP3</li>
     <li>Use a secure login system powered by JWT</li>
     <li>🔐 Lockout feature after multiple failed login attempts</li>
     <li>📩 OTP verification during user registration</li>
     <li>🔄 Password reset functionality via email OTP</li>
     </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="medium" gutterBottom>
          🛠 Tech Stack
        </Typography>
        <Grid container spacing={2}>
          {techStack.map((tech, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'background.paper' }}>{tech.icon}</Avatar>
                <Typography variant="body2">{tech.name}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="medium" gutterBottom>
          🌐 Connect with Me
        </Typography>
        <Box
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          gap={2}
          mt={2}
        >
          {socialLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.url}
              target="_blank"
              underline="hover"
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              {link.icon}
              <Typography variant="body2">{link.name}</Typography>
            </Link>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
