import express from 'express';
import { getAllFiles, getAllUsers } from '../controllers/adminController.js';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.get('/files', verifyToken, isAdmin, getAllFiles);
router.get('/users', verifyToken, isAdmin, getAllUsers);

export default router;
