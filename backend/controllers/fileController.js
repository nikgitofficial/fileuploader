import cloudinary from '../utils/cloudinary.js';
import File from '../models/File.js';
import { Readable } from 'stream';
import mongoose from 'mongoose'; // ✅ for ObjectId validation

// 📤 Upload File Controller
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bufferToStream = (buffer) => {
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      return readable;
    };

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      async (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }

        const file = await File.create({
          filename: req.file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          type: req.file.mimetype,
          userId: req.userId,
        });

        res.status(201).json(file);
      }
    );

    bufferToStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// 🗑️ Delete File Controller
export const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // ✅ Authorization check
    if (file.userId?.toString() !== req.userId?.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // ✅ Delete from Cloudinary
    if (file.public_id) {
      try {
        await cloudinary.uploader.destroy(file.public_id, {
          resource_type: 'auto',
        });
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary delete failed:', cloudErr.message);
      }
    } else {
      console.warn(`⚠️ No public_id for file "${file.filename}", skipping Cloudinary deletion.`);
    }

    // ✅ Delete from MongoDB
    await File.findByIdAndDelete(fileId);

    console.log(`✅ Deleted file: ${file.filename} (${fileId})`);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

// 📄 Get User Files Controller
export const getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    console.error('❌ Get files error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
};
