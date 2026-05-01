import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  enrollmentNo: { type: String, required: true },
  grade: { type: String, required: true },
  section: { type: String, required: false },
  dateOfBirth: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Student', schema);
