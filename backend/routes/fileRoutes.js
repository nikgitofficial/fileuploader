import express from 'express';
import {
  uploadFile,
  getUserFiles,
  deleteFile,
  updateFileName,
  getFileById,
  downloadFile
  
} from '../controllers/fileController.js';

import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// ✅ Upload file
router.post('/upload', verifyToken, upload.single('file'), uploadFile);

// ✅ Download file — must be BEFORE '/:id'
router.get('/download/:id', downloadFile); // ← Optional: remove verifyToken for public download

// ✅ List user's files
router.get('/', verifyToken, getUserFiles);

// ✅ Get file by ID (for preview)
router.get('/:id', verifyToken, getFileById);

// ✅ Delete file
router.delete('/:id', verifyToken, deleteFile);

// ✅ Update filename
router.put('/:id', verifyToken, updateFileName);


export default router;
