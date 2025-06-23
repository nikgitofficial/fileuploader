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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from '../api/axios';

const AdminFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [editedFilename, setEditedFilename] = useState('');
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

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (err) {
      console.error('❌ Delete failed:', err);
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
        prev.map((f) => (f._id === currentFile._id ? { ...f, filename: editedFilename } : f))
      );
      setEditOpen(false);
    } catch (err) {
      console.error('❌ Edit failed:', err);
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
      }}
    >
      <Typography variant="h5" gutterBottom textAlign="center">
        📁 All Uploaded Files
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          mt: 3,
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
            {files.map((file) => (
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
                  <IconButton onClick={() => handleDelete(file._id)} color="error">
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
    </Container>
  );
};

export default AdminFilesPage;
