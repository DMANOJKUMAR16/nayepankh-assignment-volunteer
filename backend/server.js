require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes       = require('./routes/auth');
const volunteerRoutes  = require('./routes/volunteers');
const eventRoutes      = require('./routes/events');

const app = express();

// ── CORS — allow file://, localhost, and production domains ───────────────
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (file://, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any localhost port
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    // Allow production domains (set FRONTEND_URL in .env)
    const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim());
    if (allowed.includes(origin)) return callback(null, true);
    // Allow all in development
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events',     eventRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ── Connect to MongoDB & start server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
