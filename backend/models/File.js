import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  public_id: String,
  type: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true // <-- this adds createdAt and updatedAt
});

export default mongoose.model('File', fileSchema);
