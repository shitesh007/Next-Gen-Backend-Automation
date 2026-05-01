import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  published: { type: Boolean, required: false }
}, { timestamps: true });

export default mongoose.model('Post', schema);