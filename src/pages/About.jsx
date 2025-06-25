import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Link,
  Divider,
  useTheme
} from '@mui/material';
import {
  GitHub,
  Language,
  YouTube,
  Cloud,
  Storage,
  Security,
  MusicNote,
  Lock
} from '@mui/icons-material';

const techStack = [
  { name: 'React + Vite', icon: <Language /> },
  { name: 'Node.js + Express', icon: <Storage /> },
  { name: 'MongoDB + Mongoose', icon: <Storage /> },
  { name: 'JWT Auth', icon: <Security /> },
  { name: 'Cloudinary', icon: <Cloud /> },
  { name: 'YouTube MP3 Downloader', icon: <MusicNote /> },
  { name: 'OTP Verification', icon: <Security /> },
  { name: 'Login Lockout Security', icon: <Lock /> },
];

const socialLinks = [
  { name: 'GitHub', icon: <GitHub />, url: 'https://github.com/nikgitofficial' },
  { name: 'YouTube', icon: <YouTube />, url: 'https://youtube.com/@nikkopacenio@gmail.com' },
  { name: 'Website', icon: <Language />, url: 'https://nikkoboy123.github.io/nik' },
];

const About = () => {
  const theme = useTheme();

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: { xs: 6, sm: 8 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.08)`,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          color="primary"
          sx={{ fontSize: { xs: '1.8rem', sm: '2rem' } }}
        >
          About This App
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
          This app is a full-stack web application where users can:
        </Typography>

        <Box component="ul" sx={{ textAlign: 'left', pl: 3, mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          <li>Upload and manage files (stored in Cloudinary)</li>
          <li>Download audio from YouTube as MP3</li>
          <li>Use a secure login system powered by JWT</li>
          <li>Verify identity via OTP before registration</li>
          <li>Get locked out after multiple failed login attempts</li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="medium" gutterBottom>
          🛠 Tech Stack
        </Typography>
        <Grid container spacing={2}>
          {techStack.map((tech, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.grey[200],
                    width: 40,
                    height: 40,
                    color: theme.palette.primary.main,
                  }}
                >
                  {tech.icon}
                </Avatar>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {tech.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="medium" gutterBottom>
          🌐 Connect with Me
        </Typography>
        <Box
          display="flex"
          justifyContent="center"
          flexDirection={{ xs: 'column', sm: 'row' }}
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
                justifyContent: 'center',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                color: theme.palette.text.primary,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.grey[200],
                  color: theme.palette.text.primary,
                }}
              >
                {link.icon}
              </Avatar>
              <Typography>{link.name}</Typography>
            </Link>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
