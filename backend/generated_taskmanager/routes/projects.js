import express from 'express';
import Model from '../models/projectModel.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try { res.json(await Model.find()); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try { const d = await Model.findById(req.params.id); d ? res.json(d) : res.status(404).json({ message: 'Not found' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await Model.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

export default router;