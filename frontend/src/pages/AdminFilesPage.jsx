import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
  Alert,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from '../api/axios';
import CircularProgress from '@mui/material/CircularProgress';

const AdminFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [editedFilename, setEditedFilename] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('');
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
  open: false,
  msg: '',
  severity: 'info',
});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

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
  setLoading(true);
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
    setSnack({ open: true, msg: '✅ Filename updated', severity: 'success' });
  } catch (err) {
    console.error('❌ Edit failed:', err);
    setSnack({ open: true, msg: '❌ Failed to update filename', severity: 'error' });
  } finally {
    setLoading(false);
  }
};

const confirmDelete = async () => {
  setLoading(true);
  try {
    await axios.delete(`/admin/files/${deleteTarget._id}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    setFiles((prev) => prev.filter((file) => file._id !== deleteTarget._id));
    setSnack({ open: true, msg: '🗑️ File deleted successfully', severity: 'success' });
  } catch (err) {
    console.error('❌ Delete failed:', err);
    setSnack({ open: true, msg: '❌ Failed to delete file', severity: 'error' });
  } finally {
    setLoading(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }
};

   


return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        px: 2,
        py: 6,
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 1000,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <Container sx={{ p: isMobile ? 2 : 4 }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
          📁 All Uploaded Files
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin')}
          sx={{ mb: 3 }}
        >
          Go to Admin Dashboard
        </Button>

        <TextField
          label="Filter by filename or email"
          variant="outlined"
          size="small"
          fullWidth
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Box sx={{ overflowX: isMobile ? 'auto' : 'visible', mt: 2 }}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: '60vh',
              overflowY: 'auto',
              minWidth: isMobile ? 600 : 'auto',
            }}
          >
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
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
                      <TableCell sx={{ wordBreak: 'break-word' }}>
                        <Link
                          to={`/preview/${file._id}`}
                          style={{
                            color: 'black',
                            textDecoration: 'underline',
                            fontWeight: 500,
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.filename}
                        </Link>
                      </TableCell>
                      <TableCell>{file.userId?.email || 'Unknown'}</TableCell>
                      <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleEditOpen(file)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setDeleteTarget(file);
                            setDeleteOpen(true);
                          }}
                          color="error"
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

        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
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
            <Button onClick={() => setEditOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{deleteTarget?.filename}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
               <Button onClick={() => setDeleteOpen(false)} disabled={loading}>Cancel</Button>
               <Button onClick={confirmDelete} variant="contained" color="error" disabled={loading}>
               {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
               </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
       <Snackbar
  open={snack.open}
  autoHideDuration={3000}
  onClose={() => setSnack({ ...snack, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    onClose={() => setSnack({ ...snack, open: false })}
    severity={snack.severity}
    sx={{ width: '100%' }}
  >
    {snack.msg}
  </Alert>
</Snackbar>
      </Container>
      
    </Box>
  );
};

export default AdminFilesPage;
