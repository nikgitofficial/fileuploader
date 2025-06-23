import { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableHead, TableBody,
  TableCell, TableRow, Paper, TableContainer
} from '@mui/material';
import axios from '../api/axios';

const AdminFilesPage = () => {
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
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

    fetchFiles();
  }, []);

  return (
    <Container
      sx={{
        mt: 10, // margin from top to clear navbar
        mb: 10, // margin from bottom to clear footer
      }}
    >
      <Typography variant="h5" gutterBottom textAlign="center">
        📁 All Uploaded Files
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Filename</strong></TableCell>
              <TableCell><strong>Uploader Email</strong></TableCell>
              <TableCell><strong>Uploaded At</strong></TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminFilesPage;
