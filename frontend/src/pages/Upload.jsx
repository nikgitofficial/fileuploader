import { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box,
  TextField, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import axios from '../api/axios';
import DeleteIcon from '@mui/icons-material/Delete';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
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
      await axios.post('/files/upload', formData);
      setFile(null);
      fetchFiles();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/files/${id}`);
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Upload Files</Typography>
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
