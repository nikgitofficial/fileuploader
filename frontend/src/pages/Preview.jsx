import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
  Box, Typography, CircularProgress,
  useTheme, useMediaQuery
} from '@mui/material';

export default function Preview() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const token = localStorage.getItem('token');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const { data } = await axios.get(`/files/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        console.log('🔍 File URL:', data.url);
        setFile(data);
      } catch (e) {
        console.error('❌ File fetch error:', e);
        setPreviewError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id, token]);

  const handleSecureDownload = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/files/download/${file._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      window.open(data.url, '_blank');
    } catch (e) {
      console.error('❌ Download error:', e);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 400,
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress size={60} color="success" />
  <Typography mt={2} variant="body1" color="text.secondary">
    Loading file preview...
  </Typography>
      </Box>
    );
  }

  if (!file) return <Typography>❌ File not found</Typography>;

  const ext = file.filename.split('.').pop().toLowerCase();
  const isImage = file.type.startsWith('image/');
  const isPreviewableDoc = ['pdf', 'docx', 'pptx', 'xlsx'].includes(ext);
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 800,
        minHeight: '100vh',
        pt: isMobile ? theme.spacing(8) : 0,
        px: isMobile ? 1 : 4,
        py: isMobile ? 2 : 6,
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: isMobile ? '95vw' : '60vw',
          p: isMobile ? 2 : 4,
          bgcolor: 'background.paper',
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
          {file.filename}
        </Typography>

        {isImage && !previewError ? (
          <img
            src={file.url}
            alt={file.filename}
            onError={() => setPreviewError(true)}
            style={{
              width: '100%',
              maxHeight: isMobile ? '50vh' : '70vh',
              objectFit: 'contain',
              marginBottom: 16
            }}
          />
        ) : isPreviewableDoc && !previewError ? (
          <iframe
            title="Document Preview"
            src={googleViewerUrl}
            width="100%"
            height={isMobile ? '600vh' : '700vh'}
            frameBorder="0"
            onError={() => setPreviewError(true)}
            style={{
              borderRadius: 8,
              marginBottom: theme.spacing(2)
            }}
          />
        ) : (
          <Typography mt={2}>
            ⚠️ No preview available.{' '}
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              Open or Download
            </a>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
