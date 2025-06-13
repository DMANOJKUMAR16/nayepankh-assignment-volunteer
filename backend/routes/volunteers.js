const express = require('express');
const { body, validationResult } = require('express-validator');
const Volunteer = require('../models/Volunteer');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/volunteers ── List all (admin) or self (volunteer) ───────────
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const { status, search, page = 1, limit = 50 } = req.query;

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fname: { $regex: search, $options: 'i' } },
        { lname:  { $regex: search, $options: 'i' } },
        { email:  { $regex: search, $options: 'i' } },
      ];
    }

    const volunteers = await Volunteer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Volunteer.countDocuments(filter);

    res.json({ volunteers, total, page: Number(page) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/volunteers/stats ────────────────────────────────────────────
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [total, active, pending, inactive] = await Promise.all([
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: 'Active' }),
      Volunteer.countDocuments({ status: 'Pending' }),
      Volunteer.countDocuments({ status: 'Inactive' }),
    ]);

    // Monthly registrations for last 7 months
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('default', { month: 'short' }),
      });
    }

    const monthlyData = await Promise.all(
      months.map(async ({ year, month, label }) => {
        const start = new Date(year, month - 1, 1);
        const end   = new Date(year, month, 1);
        const count = await Volunteer.countDocuments({
          createdAt: { $gte: start, $lt: end },
        });
        return { label, count };
      })
    );

    // Top skills
    const skillsAgg = await Volunteer.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({ total, active, pending, inactive, monthlyData, skills: skillsAgg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/volunteers ─────────────────────────────────────────────────
router.post(
  '/',
  protect,
  [
    body('fname').notEmpty().withMessage('First name required'),
    body('lname').notEmpty().withMessage('Last name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').notEmpty().withMessage('Phone required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const existing = await Volunteer.findOne({ email: req.body.email.toLowerCase() });
      if (existing)
        return res.status(400).json({ message: 'A volunteer with this email already exists' });

      const volunteer = await Volunteer.create({
        ...req.body,
        createdBy: req.user._id,
        status: 'Pending',
      });

      res.status(201).json({ message: 'Registration submitted', volunteer });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── GET /api/volunteers/:id ──────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ volunteer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PATCH /api/volunteers/:id ────────────────────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ message: 'Volunteer updated', volunteer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PATCH /api/volunteers/:id/status ── Admin approve/reject ─────────────
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive', 'Pending'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });

    res.json({ message: `Volunteer ${status.toLowerCase()}`, volunteer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /api/volunteers/:id ───────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ message: 'Volunteer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
