import { useEffect, useState } from 'react';
import {
  Typography, Container, Card, CardContent, Grid
} from '@mui/material';
import { Link } from 'react-router-dom';
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
    <Container
      maxWidth="md"
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 400,
        p: 4,
        boxShadow: 5,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom textAlign="center">
        Admin Dashboard
      </Typography>

      <Grid container spacing={10} mt={10}>
        {/* 📁 Files Card */}
        <Grid item xs={12} sm={6}>
          <Link to="/admin/files" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                p: 2,
                borderLeft: '5px solid #1976d2',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Files Uploaded
                </Typography>
                <Typography variant="h3" color="primary">
                  {files.length}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>

        {/* 👤 Users Card */}
        <Grid item xs={12} sm={6}>
          <Link to="/admin/users" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                p: 2,
                borderLeft: '5px solid #228B22',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Registered Users
                </Typography>
                <Typography variant="h3" color="success.main">
                  {users.length}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
