const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const seedDatabase = require('./seed');
const authRoutes = require('./routes/authRoutes');
const voucherRoutes = require('./routes/voucherRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploaded digital signatures
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Seed DB on start & start server
seedDatabase();

app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 Expense Voucher API running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`================================================`);
});
