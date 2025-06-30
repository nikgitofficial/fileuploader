import express from 'express';
import {
  uploadFile,
  getUserFiles,
  deleteFile,
  updateFileName,
  
 
 
  
} from '../controllers/fileController.js';

import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// ✅ Upload file
router.post('/upload', verifyToken, upload.single('file'), uploadFile);

// 📄 Get Signed Preview URL (for iframe)
router.get('/preview-url/:id', verifyToken, getFilePreview);

// ✅ Download file — must be BEFORE '/:id'
router.get('/download/:id',verifyToken, downloadFile); // ← Optional: remove verifyToken for public download

// ✅ List user's files
router.get('/', verifyToken, getUserFiles);




// ✅ Delete file
router.delete('/:id', verifyToken, deleteFile);

// ✅ Update filename
router.put('/:id', verifyToken, updateFileName);




export default router;
