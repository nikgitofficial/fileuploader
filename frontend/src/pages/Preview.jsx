import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
  Box, Typography, CircularProgress,
  Button, useTheme, useMediaQuery
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

        // Correctly force .ext for Google Viewer / PDF previewing fallback
        const ext = data.filename.split('.').pop().toLowerCase();
        if (!data.url.includes(`.${ext}`)) {
          data.url += `.${ext}`;
        }

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

  if (loading) return <CircularProgress />;
  if (!file) return <Typography>❌ File not found</Typography>;

  const ext = file.filename.split('.').pop().toLowerCase();
  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isPreviewable = isImage || isPDF;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: isMobile ? 0 : '50%',
        left: '50%',
        transform: isMobile ? 'translateX(-50%)' : 'translate(-50%,-50%)',
        width: '100%',
        px: isMobile ? 1 : 4,
        py: isMobile ? 2 : 6,
        maxHeight: '100vh',
        overflowY: 'auto'
      }}
    >
      <Box
        sx={{
          mx: 'auto',
          maxWidth: 1000,
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
        ) : isPDF && !previewError ? (
          <embed
            src={file.url}
            type="application/pdf"
            width="100%"
            height={isMobile ? '60vh' : '80vh'}
            onError={() => setPreviewError(true)}
          />
        ) : (
          <Typography mt={2}>
            ⚠️ No preview available.{' '}
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              Open or Download
            </a>
          </Typography>
        )}

        <Button
          onClick={handleSecureDownload}
          disabled={!file}
          fullWidth={isMobile}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          ⬇️ Secure Download
        </Button>
      </Box>
    </Box>
  );
}
