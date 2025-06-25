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
  useMediaQuery,
  Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from '../api/axios';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 5,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 600,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          px: isMobile ? 2 : 4,
         
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          gutterBottom
          textAlign="center"
        >
          👤 Registered Usersssss
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            mt: 3,
            maxHeight: '100vh',
            overflowY: 'auto',
            borderRadius: 2,
          }}
        >
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Created At</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{user.email}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{user.role}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default AdminUsersPage;
