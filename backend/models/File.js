import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  public_id: String,
  type: String, // MIME type (e.g., "application/pdf")
  resource_type: String, // <-- add this (e.g., "raw", "image", "video", etc.)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true // adds createdAt and updatedAt
});

export default mongoose.model('File', fileSchema);
