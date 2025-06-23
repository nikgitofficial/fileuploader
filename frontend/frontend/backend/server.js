import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import youtubeRoutes from './routes/youtube.js';
import adminRoutes from './routes/adminRoutes.js';
dotenv.config();
const app = express();

// ✅ 1. Allow JSON parsing
app.use(express.json());

// ✅ 2. CORS configuration
const allowedOrigins = [
  'http://localhost:5173',                    // dev frontend
  'https://fileuploader-dun.vercel.app'          // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl or postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/youtube', youtubeRoutes)
app.use('/api/admin', adminRoutes);

// ✅ 4. Connect to DB and start server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
