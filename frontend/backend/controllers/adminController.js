import File from '../models/File.js';
import User from '../models/User.js';

// Get all files
export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().populate('userId', 'email').sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    console.error('❌ Admin getAllFiles error:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'email role createdAt');
    res.status(200).json(users);
  } catch (err) {
    console.error('❌ Admin getAllUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
