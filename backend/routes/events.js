const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/events
router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/events
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Event name required'),
    body('date').notEmpty().withMessage('Date required'),
    body('location').notEmpty().withMessage('Location required'),
    body('needed').isInt({ min: 1 }).withMessage('Must need at least 1 volunteer'),
    body('category').notEmpty().withMessage('Category required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const event = await Event.create({ ...req.body, createdBy: req.user._id });
      res.status(201).json({ message: 'Event created', event });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PATCH /api/events/:id
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event updated', event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
