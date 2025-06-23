// src/pages/YouTubeDownloader.jsx
import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Box
} from '@mui/material';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleDownload = () => {
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL}/api/youtube/download-audio?url=${encodeURIComponent(url)}`;
    link.setAttribute('download', true);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setError('');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, p: 3, boxShadow: 3,

       position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 400,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',

     }}>
      <Typography variant="h5" gutterBottom>YouTube to Music (.m4a)</Typography>
      <TextField
        fullWidth
        label="YouTube Video URL"
        variant="outlined"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        sx={{ my: 2 }}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" fullWidth onClick={handleDownload}>
        Download Audio
      </Button>
    </Container>
  );
};

export default YouTubeDownloader;
