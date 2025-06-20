import express from 'express';
import { uploadFile, getUserFiles, deleteFile, updateFileName } from '../controllers/fileController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js'; // ✅ import clean multer setup

const router = express.Router();

// ✅ POST /api/files/upload
router.post('/upload', verifyToken, upload.single('file'), uploadFile);

// ✅ GET /api/files/ → list all user's files
router.get('/', verifyToken, getUserFiles);

// ✅ DELETE /api/files/:id
router.delete('/:id', verifyToken, deleteFile);
    
// ✅ update /api/files/:id
router.put('/:id', verifyToken, updateFileName);

export default router;
