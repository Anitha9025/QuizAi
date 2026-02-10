
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-quiz-platform';

console.log('='.repeat(50));
console.log('Starting Server...');
console.log('='.repeat(50));
console.log(`Port: ${PORT}`);
console.log(`MongoDB URI: ${MONGO_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth/*`);
      console.log('='.repeat(50));
    });
  })
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });
