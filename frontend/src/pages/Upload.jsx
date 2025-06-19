import { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box,
  TextField, List, ListItem, ListItemText, IconButton, Stack
} from '@mui/material';
import axios from '../api/axios';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // or get from context

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/files', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setFiles(res.data);
    } catch (err) {
      console.error('❌ Error fetching files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setFile(null);
      fetchFiles();
    } catch (err) {
      console.error('❌ Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/files/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      fetchFiles();
    } catch (err) {
      console.error('❌ Delete error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('❌ Logout failed:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Upload Files</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>

      <form onSubmit={handleUpload}>
        <TextField
          type="file"
          fullWidth
          onChange={(e) => setFile(e.target.files[0])}
          inputProps={{ accept: '*' }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Your Files:</Typography>
        <List>
          {files.map((f) => (
            <ListItem key={f._id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(f._id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.filename}
                  </a>
                }
                secondary={new Date(f.uploadedAt).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default Upload;
