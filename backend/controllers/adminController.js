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

// Update a file's filename
export const updateFile = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      { filename },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json(updatedFile);
  } catch (err) {
    console.error('❌ Admin updateFile error:', err);
    res.status(500).json({ error: 'Failed to update file' });
  }
};

// Delete a file
export const deleteFile = async (req, res) => {
  try {
    const deleted = await File.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'File not found' });
    }

    // TODO: Optionally delete from Cloudinary here
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('❌ Admin deleteFile error:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
