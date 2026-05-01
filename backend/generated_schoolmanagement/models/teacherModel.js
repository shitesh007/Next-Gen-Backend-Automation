import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  qualification: { type: String, required: true },
  phone: { type: String, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Teacher', schema);
