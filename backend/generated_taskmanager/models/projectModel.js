import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  status: { type: String, required: true },
  deadline: { type: Date, required: false }
}, { timestamps: true });

export default mongoose.model('Project', schema);