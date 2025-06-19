import cloudinary from '../utils/cloudinary.js';
import File from '../models/File.js';
import { Readable } from 'stream';

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
          type: req.file.mimetype,
          userId: req.userId,
        });

        res.status(201).json(file);
      }
    );

    bufferToStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
