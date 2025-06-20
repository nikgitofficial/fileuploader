import { useEffect, useState } from 'react';
import {
  Typography, Container, Box, Card, CardContent, Grid
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
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        👑 Admin Dashboard
      </Typography>

      <Grid container spacing={4} mt={4}>
        {/* 📁 Total Files Uploaded */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, borderLeft: '5px solid #1976d2' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Files Uploaded
              </Typography>
              <Typography variant="h3" color="primary">
                {files.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 👤 Total Registered Users */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, borderLeft: '5px solid #388e3c' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Registered Users
              </Typography>
              <Typography variant="h3" color="success.main">
                {users.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
