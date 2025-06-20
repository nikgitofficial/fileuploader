import { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableHead, TableBody, TableCell, TableRow, Paper, TableContainer
} from '@mui/material';
import axios from '../api/axios';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        👤 Registered Users
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Created At</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminUsersPage;
