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
              <Route path="/upload" element={<Upload />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/youtube-downloader" element={<YouTubeDownloader />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
