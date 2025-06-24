import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import axios from '../api/axios';

const PreviewFile = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await axios.get(`/files/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setFile(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch file:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!file) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h6" color="error">File not found or access denied.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>{file.filename}</Typography>

      {file.type.startsWith('image/') ? (
        <img src={file.url} alt={file.filename} style={{ maxWidth: '100%' }} />
      ) : file.type === 'application/pdf' ? (
        <iframe
          src={file.url}
          title="PDF Preview"
          width="100%"
          height="600px"
          style={{ border: '1px solid #ccc', borderRadius: 4 }}
        />
      ) : (
        <Typography variant="body1">
          This file type can’t be previewed.{' '}
          <a href={file.url} target="_blank" rel="noopener noreferrer">Click here to download</a>.
        </Typography>
      )}

      <Box mt={2}>
        <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    </Box>
  );
};

export default PreviewFile;
