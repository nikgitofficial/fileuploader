import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from '../api/axios';

const AdminFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [editedFilename, setEditedFilename] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/admin/files', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setFiles(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch files:', err);
    }
  };

  const handleEditOpen = (file) => {
    setCurrentFile(file);
    setEditedFilename(file.filename);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `/admin/files/${currentFile._id}`,
        { filename: editedFilename },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setFiles((prev) =>
        prev.map((f) =>
          f._id === currentFile._id ? { ...f, filename: editedFilename } : f
        )
      );
      setEditOpen(false);
      setSnackMsg('✏️ Filename updated');
      setSnackOpen(true);
    } catch (err) {
      console.error('❌ Edit failed:', err);
      setSnackMsg('❌ Failed to update filename');
      setSnackOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/admin/files/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setFiles((prev) =>
        prev.filter((file) => file._id !== deleteTarget._id)
      );
      setSnackMsg('🗑️ File deleted successfully');
    } catch (err) {
      console.error('❌ Delete failed:', err);
      setSnackMsg('❌ Failed to delete file');
    } finally {
      setSnackOpen(true);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Container
      sx={{
        mt: 10,
        mb: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
          position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 400,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" gutterBottom textAlign="center">
        📁 All Uploaded Files
      </Typography>

      {/* Filter Input */}
      <TextField
        label="Filter by filename or email"
        variant="outlined"
        size="small"
        fullWidth
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mt: 2 }}
      />

      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          maxHeight: '60vh',
          overflowY: 'auto',
          width: '100%',
        }}
      >
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Filename</strong></TableCell>
              <TableCell><strong>Uploader Email</strong></TableCell>
              <TableCell><strong>Uploaded At</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files
              .filter((file) => {
                const keyword = filter.toLowerCase();
                return (
                  file.filename.toLowerCase().includes(keyword) ||
                  file.userId?.email?.toLowerCase().includes(keyword)
                );
              })
              .map((file) => (
                <TableRow key={file._id}>
                  <TableCell>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      {file.filename}
                    </a>
                  </TableCell>
                  <TableCell>{file.userId?.email || 'Unknown'}</TableCell>
                  <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditOpen(file)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      setDeleteTarget(file);
                      setDeleteOpen(true);
                    }} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Filename</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Filename"
            fullWidth
            value={editedFilename}
            onChange={(e) => setEditedFilename(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.filename}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
  open={snackOpen}
  autoHideDuration={3000}
  onClose={() => setSnackOpen(false)}
  anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
>
  <Alert onClose={() => setSnackOpen(false)} severity="info" sx={{ width: '100%' }}>
    {snackMsg}
  </Alert>
</Snackbar>
    </Container>
  );
};

export default AdminFilesPage;
