import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box,
  TextField, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Snackbar, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, MenuItem
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
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderName, setFolderName] = useState('');
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

      const fetchedFolders = [...new Set(res.data.map(f => f.folder).filter(Boolean))];

      // ✅ Preserve selected folder even if it has no files
      if (selectedFolder && !fetchedFolders.includes(selectedFolder)) {
        fetchedFolders.push(selectedFolder);
      }

      setFolders(fetchedFolders);
    } catch (err) {
      console.error('❌ Error fetching files:', err);
      showSnackbar('❌ Error fetching files', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCreateFolder = () => {
    const trimmed = folderName.trim();
    if (!trimmed) return;

    if (!folders.includes(trimmed)) {
      const updatedFolders = [...folders, trimmed];
      setFolders(updatedFolders);
      showSnackbar(`📁 Folder "${trimmed}" created`);
    }
    setSelectedFolder(trimmed); // ✅ Always select folder (existing or new)
    setFolderName('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    if (selectedFolder) formData.append('folder', selectedFolder);

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

  const handleSecureDownload = async (fileId, filename) => {
    try {
      const response = await axios.get(`/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showSnackbar('✅ File downloaded successfully!');
    } catch (err) {
      console.error('❌ Secure download failed:', err);
      showSnackbar('❌ Download failed', 'error');
    }
  };

  return (
    <Box sx={{ position: 'absolute', top: isMobile ? '0' : '52%', left: '50%', transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)', width: '100%', px: { xs: 1, sm: 4 }, py: { xs: 2, sm: 4 }, maxWidth: isMobile ? '98%' : 1000, height: isMobile ? '100%' : 'auto', overflowY: 'auto' }}>
      <Container sx={{ p: { xs: 2, sm: 4 }, backgroundColor: 'white', boxShadow: 3, borderRadius: 2, textAlign: 'center', minHeight: '70vh' }}>
        <Typography variant="h6" align="center" gutterBottom>
          📤 Upload a File
        </Typography>

        <form onSubmit={handleUpload}>
          <TextField type="file" fullWidth onChange={(e) => setFile(e.target.files[0])} inputProps={{ accept: '*' }} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField label="Create Folder" size="small" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
            <Button variant="outlined" onClick={handleCreateFolder}>➕ Create</Button>
          </Box>

          {folders.length > 0 && (
            <TextField
              select
              fullWidth
              label="Select Folder"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              sx={{ mt: 2 }}
            >
              <MenuItem value="">-- No Folder --</MenuItem>
              {folders.map((f) => (
                <MenuItem key={f} value={f}>📁 {f}</MenuItem>
              ))}
            </TextField>
          )}

          {selectedFolder && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'gray' }}>
              Destination Folder: <strong>{selectedFolder}</strong>
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth disabled={uploading} sx={{ mt: 2 }}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>

        {/* TODO: Your file table, search, snackbar, and dialogs go here */}
      </Container>
    </Box>
  );
};

export default Upload;
