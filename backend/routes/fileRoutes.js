import express from 'express';
import { uploadFile, getUserFiles, deleteFile } from '../controllers/fileController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.post('/upload', verifyToken, upload.single('file'), uploadFile);
router.get('/', verifyToken, getUserFiles);
router.delete('/:id', verifyToken, deleteFile);
export default router;