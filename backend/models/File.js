import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  public_id: String,
  type: String,
  folder: {type:String,default:'root'},
  userId: { type: mongoose.Schema.Types.ObjectId, 
  ref: 'User',
  required: true, }
}, {
  timestamps: true // <-- this adds createdAt and updatedAt
});

export default mongoose.model('File', fileSchema);
