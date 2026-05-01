import express from 'express';
import Model from '../models/classModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected — user must be authenticated
// All queries are scoped to the authenticated user (req.user.id)

// @desc    Get all Classes for the logged-in user
// @route   GET /api/classes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const data = await Model.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a single Class by ID (only if owned by user)
// @route   GET /api/classes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const data = await Model.findOne({ _id: req.params.id, user: req.user.id });
    if (!data) return res.status(404).json({ message: 'Class not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new Class (auto-assigned to logged-in user)
// @route   POST /api/classes
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const data = await Model.create({ ...req.body, user: req.user.id });
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a Class by ID (only if owned by user)
// @route   PUT /api/classes/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!data) return res.status(404).json({ message: 'Class not found or not authorized' });
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a Class by ID (only if owned by user)
// @route   DELETE /api/classes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const data = await Model.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!data) return res.status(404).json({ message: 'Class not found or not authorized' });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
