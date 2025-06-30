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
router.get('/download/:id',verifyToken, downloadFile); // ← Optional: remove verifyToken for public download

// ✅ List user's files
router.get('/', verifyToken, getUserFiles);

// ✅ Get file by ID (for preview)
router.get('/:id', verifyToken, getFileById);

// ✅ Delete file
router.delete('/:id', verifyToken, deleteFile);

// ✅ Update filename
router.put('/:id', verifyToken, updateFileName);

router.get('/folders', verifyToken, async (req, res) => {
  try {
    const folders = await File.distinct('folder', { userId: req.userId });
    res.status(200).json(folders);
  } catch (err) {
    console.error('❌ Folder fetch error:', err);
    res.status(500).json({ error: 'Failed to load folders' });
  }
});


export default router;
