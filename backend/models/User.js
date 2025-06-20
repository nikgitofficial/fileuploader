import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
});

export default mongoose.model('User', userSchema);