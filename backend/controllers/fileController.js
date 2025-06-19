import cloudinary from '../utils/cloudinary.js';
import File from '../models/File.js';

export const uploadFile = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const file = await File.create({
      filename: req.file.originalname,
      url: result.secure_url,
      type: req.file.mimetype,
      userId: req.userId,
    });
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const getUserFiles = async (req, res) => {
  const files = await File.find({ userId: req.userId }).sort({ uploadedAt: -1 });
  res.json(files);
};

export const deleteFile = async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, userId: req.userId });
  if (!file) return res.status(404).json({ error: 'Not found' });

  await cloudinary.uploader.destroy(file.url.split('/').pop().split('.')[0]);
  await File.findByIdAndDelete(file._id);
  res.json({ message: 'Deleted' });
};
