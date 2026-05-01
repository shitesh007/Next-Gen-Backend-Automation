import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  status: { type: String, required: true },
  priority: { type: String, required: true },
  dueDate: { type: Date, required: false }
}, { timestamps: true });

export default mongoose.model('Task', schema);