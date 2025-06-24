import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import YouTubeDownloader from './pages/YouTubeDownloader';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminFilesPage from './pages/AdminFilesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import FilePreview from './pages/FilePreview'; 
import Preview from './pages/Preview';
function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, pt: 8, pb: 4 }}>
            <Routes>
              <Route path="/" element={<Home />}/>
              <Route path="/about" element={<About />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/youtube-downloader" element={<YouTubeDownloader />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/files" element={<AdminFilesPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/file/:id" element={<FilePreview />} />
              <Route path="/preview/:id" element={<Preview />} />
             
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
