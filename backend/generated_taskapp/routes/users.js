import express from 'express';
import Model from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all
router.get('/', protect, async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const data = await Model.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new
router.post('/', async (req, res) => {
  try {
    const data = await Model.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
