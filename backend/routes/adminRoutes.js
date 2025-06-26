import express from 'express';
import {
  getAllFiles,
  getAllUsers,
  updateFile,
  deleteFile
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Get all uploaded files
router.get('/files', verifyToken, isAdmin, getAllFiles);

// Get all users
router.get('/users', verifyToken, isAdmin, getAllUsers);

// Edit a file's metadata (e.g., filename)
router.put('/files/:id', verifyToken, isAdmin, updateFile);

// Delete a file
router.delete('/files/:id', verifyToken, isAdmin, deleteFile);



export default router;
