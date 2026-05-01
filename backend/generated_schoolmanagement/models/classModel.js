import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  room: { type: String, required: false },
  capacity: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Class', schema);
