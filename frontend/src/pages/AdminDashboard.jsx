import { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Container, Box
} from '@mui/material';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const filesRes = await axios.get('/admin/files', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        const usersRes = await axios.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        setFiles(filesRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('❌ Error loading admin data:', err);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>📁 All Uploaded Files</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>User Email</TableCell>
                <TableCell>Uploaded At</TableCell>
                <TableCell>Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file._id}>
                  <TableCell>{file.filename}</TableCell>
                  <TableCell>{file.userId?.email}</TableCell>
                  <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">Download</a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mt={5}>
        <Typography variant="h4" gutterBottom>👤 Registered Users</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
