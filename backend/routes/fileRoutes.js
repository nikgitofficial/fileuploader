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

// ✅ List user's files
router.get('/', verifyToken, getUserFiles);

// ✅ Get file by ID (for preview)
router.get('/:id', verifyToken, getFileById); // ✅ Add this route

// ✅ Delete file
router.delete('/:id', verifyToken, deleteFile);

// ✅ Update filename
router.put('/:id', verifyToken, updateFileName);
// ✅ download filename
router.get('/download/:id', verifyToken, downloadFile);

export default router;
