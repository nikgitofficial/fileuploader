import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
}, {
  timestamps: true // <-- adds createdAt and updatedAt
});

export default mongoose.model('User', userSchema);
