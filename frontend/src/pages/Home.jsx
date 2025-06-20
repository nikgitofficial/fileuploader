import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { EmojiEmotions, Info } from '@mui/icons-material';

const Home = () => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setEmail(userObj.email || '');
      } catch (err) {
        console.error('Failed to parse user:', err);
      }
    }
  }, []);

  const [fileCount, setFileCount] = useState(0);

useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);
      setEmail(userObj.email || '');
    } catch (err) {
      console.error('Failed to parse user:', err);
    }
  }

  // Fetch user's uploaded files
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFileCount(res.data.length);
    } catch (error) {
      console.error('Error fetching file count:', error);
    }
  };

  fetchFiles();
}, []);

const navigate = useNavigate();

  return (
    <Container maxWidth="sm" 
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
      }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
          <EmojiEmotions color="primary" />
          <Typography variant="h4" fontWeight="bold" color="primary">
            Welcome!
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Hello <strong>{email || 'Guest'}</strong>, we're glad you're here.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This is your home dashboard. From here, you can upload files, download YouTube MP3s, and explore the app features.
        </Typography>
<Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
  <CardContent>
  

    <Typography variant="body2" sx={{ mt: 2 }}>
      📂 You have uploaded <strong>{fileCount}</strong> {fileCount === 1 ? 'file' : 'files'}.
    </Typography>
  </CardContent>
  <CardActions>
    <Button  variant="contained"
  size="small"
  onClick={() => navigate('/upload')}>
      Upload File
    </Button>
  </CardActions>
</Card>

        
      </Paper>
    </Container>
  );
};

export default Home;
