import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const Preview = () => {
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
        const res = await axios.get(`/files/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setFile(res.data);
      } catch (err) {
        console.error('❌ Error fetching file:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!file) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
        }}
      >
        <Typography>❌ File not found</Typography>
      </Box>
    );
  }

  const isImage = file.type?.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isText = file.type?.startsWith('text/');
  const isDocOrSheet = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(file.type);

  const fallbackLink = (
    <Typography mt={2}>
      ⚠️ No preview available.{' '}
      <a href={file.url} target="_blank" rel="noopener noreferrer">
        Open or Download
      </a>
    </Typography>
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        top: isMobile ? 0 : '50%',
        left: '50%',
        transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
        width: '100%',
        px: isMobile ? 1 : 4,
        py: isMobile ? 2 : 6,
        maxHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1000,
          margin: '0 auto',
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
          {file.filename}
        </Typography>

        {previewError && fallbackLink}

        {!previewError && (
          <>
            {isImage ? (
              <Box>
                <img
                  src={file.url}
                  alt={file.filename}
                  style={{
                    width: '100%',
                    maxHeight: isMobile ? '50vh' : '70vh',
                    objectFit: 'contain',
                    marginBottom: '16px',
                  }}
                  onError={() => setPreviewError(true)}
                />
 <Button
  variant="outlined"
  href={`${import.meta.env.VITE_API_URL}/files/download/${file._id}`}
  target="_blank"
  rel="noopener noreferrer"
  fullWidth={isMobile}
>
  ⬇️ Download Image
</Button>
              </Box>
            ) : isPDF || isText || isDocOrSheet ? (
              <iframe
                src={
                  isPDF || isDocOrSheet
                    ? `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`
                    : file.url
                }
                title="File Preview"
                style={{
                  width: '100%',
                  height: isMobile ? '60vh' : '80vh',
                  border: '1px solid #ccc',
                  marginBottom: '16px',
                }}
                onError={() => setPreviewError(true)}
              />
            ) : (
              fallbackLink
            )}
          </>
        )}

        {!isImage && (
            <Button
  variant="outlined"
  sx={{ mt: 2 }}
  href={`${import.meta.env.VITE_API_URL}/files/download/${file._id}`}
  target="_blank"
  rel="noopener noreferrer"
  fullWidth={isMobile}
>
  ⬇️ Download File
</Button>
        )}
      </Box>
    </Box>
  );
};

export default Preview;
