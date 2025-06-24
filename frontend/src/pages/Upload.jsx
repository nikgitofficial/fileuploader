import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box,
  TextField, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Snackbar, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from '../api/axios';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Upload = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialog, setEditDialog] = useState({ open: false, id: '', oldName: '', newName: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: '' });
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/files', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setFiles(res.data);
    } catch (err) {
      console.error('❌ Error fetching files:', err);
      showSnackbar('❌ Error fetching files', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/files/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setFile(null);
      e.target.reset();
      fetchFiles();
      showSnackbar('✅ File uploaded successfully!');
    } catch (err) {
      console.error('❌ Upload error:', err);
      showSnackbar('❌ Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`/files/${editDialog.id}`, { filename: editDialog.newName }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setEditDialog({ open: false, id: '', oldName: '', newName: '' });
      fetchFiles();
      showSnackbar('✏️ Filename updated successfully!');
    } catch (err) {
      console.error('❌ Edit error:', err);
      showSnackbar('❌ Failed to update filename', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/files/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setDeleteDialog({ open: false, id: '' });
      fetchFiles();
      showSnackbar('🗑️ File deleted successfully');
    } catch (err) {
      console.error('❌ Delete error:', err);
      showSnackbar('❌ Failed to delete file', 'error');
    }
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{
      p: { xs: 2, sm: 4 },
      mt: { xs: 4, sm: 0 },
      position: 'absolute',
        top: '58%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 1000,
        
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
    }}>
      <Container maxWidth="md">
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
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search files by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Your Files:</Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : filteredFiles.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No matching files found.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <Box sx={{ overflowX: isMobile ? 'auto' : 'visible' }}>
                <TableContainer component={Paper} elevation={3}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell><strong>Filename</strong></TableCell>
                        <TableCell><strong>Uploaded At</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFiles.map((f) => (
                        <TableRow key={f._id} hover>
                          <TableCell sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                           <Button
  onClick={() => navigate(`/preview/${f._id}`)}
  sx={{ textTransform: 'none', padding: 0 }}
>
  {f.filename}
</Button>
                          </TableCell>
                          <TableCell>
                            {new Date(f.createdAt || f.uploadedAt || f.updatedAt).toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                          <IconButton
                onClick={() => {
    const link = document.createElement('a');
    // Append Cloudinary download parameter
    link.href = `${f.url}?fl_attachment=true`; 
    link.setAttribute('download', f.filename); // fallback for older browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }}
  color="primary"
  title="Download"
>
  <DownloadIcon />
</IconButton>

                            <IconButton
                              onClick={() => setEditDialog({ open: true, id: f._id, oldName: f.filename, newName: f.filename })}
                              color="secondary"
                              title="Edit"
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              onClick={() => setDeleteDialog({ open: true, id: f._id })}
                              color="error"
                              title="Delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ top: '10vh' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })}>
          <DialogTitle>Edit Filename</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              autoFocus
              margin="dense"
              label="New filename"
              value={editDialog.newName}
              onChange={(e) => setEditDialog({ ...editDialog, newName: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: '' })}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: '' })}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Upload;
