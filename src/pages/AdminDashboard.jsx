import { useEffect, useState } from 'react';
import {
  Typography, Container, Card, CardContent, Grid, Box
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchAdminData();
  }, [token, navigate]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, sm: 8 } }}>
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 3,
          boxShadow: 5,
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          color="primary"
          sx={{ fontSize: { xs: '1.8rem', sm: '2rem' } }}
        >
          Admin Dashboard
        </Typography>

        <Grid container spacing={4} mt={2}>
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
      </Box>
    </Container>
  );
};

export default AdminDashboard;
