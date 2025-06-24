// src/pages/Preview.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Box, Typography, CircularProgress } from '@mui/material';

const Preview = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await axios.get(`/files/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setFile(res.data);
      } catch (err) {
        console.error('Error fetching file:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!file) return <Typography>File not found</Typography>;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isText = file.type.startsWith('text/');
  const isDocOrSheet = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(file.type);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>{file.filename}</Typography>

      {isImage ? (
        <img src={file.url} alt={file.filename} style={{ maxWidth: '100%' }} />
      ) : isPDF ? (
        <iframe
          src={`${file.url}#toolbar=0`}
          title="PDF Preview"
          style={{ width: '100%', height: '80vh', border: 'none' }}
        />
      ) : isText ? (
        <iframe
          src={file.url}
          title="Text File Preview"
          style={{ width: '100%', height: '80vh', border: '1px solid #ccc' }}
        />
      ) : isDocOrSheet ? (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
          title="Office Preview"
          style={{ width: '100%', height: '80vh', border: 'none' }}
        />
      ) : (
        <Typography>
          No preview available.{' '}
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            Open or Download
          </a>
        </Typography>
      )}
    </Box>
  );
};

export default Preview;
