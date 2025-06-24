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

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (!file) return <Box p={4}><Typography>File not found</Typography></Box>;

  const isImage = file.type.includes('image');
  const isPDF = file.type.includes('pdf');
  const isVideo = file.type.includes('video');
  const isDoc = file.type.includes('word') || file.type.includes('presentation') || file.type.includes('spreadsheet');

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
      ) : isVideo ? (
        <video controls style={{ maxWidth: '100%' }}>
          <source src={file.url} type={file.type} />
          Your browser does not support the video tag.
        </video>
      ) : isDoc ? (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`}
          title="Document Preview"
          style={{ width: '100%', height: '80vh', border: 'none' }}
        />
      ) : (
        <Typography>
          No preview available.{' '}
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            Open or download file
          </a>
        </Typography>
      )}
    </Box>
  );
};

export default Preview;
