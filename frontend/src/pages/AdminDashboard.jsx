import { useEffect, useState } from 'react';
import {
  Typography, Container, Card, CardContent, Grid, useMediaQuery
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: isMobile ? '90%' : 400,
        p: isMobile ? 2 : 4,
        boxShadow: 5,
        borderRadius: 2,
        backgroundColor: 'white',
        textAlign: 'center',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        gutterBottom
        textAlign="center"
      >
        Admin Dashboard
      </Typography>

      <Grid container spacing={isMobile ? 4 : 10} mt={isMobile ? 4 : 10}>
        {/* 📁 Files Card */}
        <Grid item xs={12} sm={6}>
          <Link to="/admin/files" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                p: isMobile ? 1.5 : 2,
                borderLeft: '5px solid #1976d2',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Typography
                  variant={isMobile ? 'body2' : 'h6'}
                  color="text.secondary"
                  gutterBottom
                >
                  Total Files Uploaded
                </Typography>
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  color="primary"
                >
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
                p: isMobile ? 1.5 : 2,
                borderLeft: '5px solid #228B22',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Typography
                  variant={isMobile ? 'body2' : 'h6'}
                  color="text.secondary"
                  gutterBottom
                >
                  Total Registered Users
                </Typography>
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  color="success.main"
                >
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
