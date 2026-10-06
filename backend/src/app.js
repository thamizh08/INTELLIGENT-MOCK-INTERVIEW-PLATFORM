// src/app.js
// Configures the Express application: global middleware, route mounting,
// and a final error handler. Does NOT start the server (that's server.js's job)
// so this file can also be imported directly in tests.

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
// Temporarily disabled - see note below where it would be mounted
// const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// --- Global middleware ---
app.use(cors());              // Allows the frontend (different origin/port) to call this API
app.use(express.json());      // Parses incoming JSON request bodies into req.body

// --- Health check route (useful for confirming the server is alive) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Feature routes ---
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/roadmap', roadmapRoutes);
// Temporarily disabled - upload.single/multer resolving as undefined on this machine, under investigation
// app.use('/api/upload', uploadRoutes);

// --- 404 handler: runs if no route above matched ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- Global error handler: catches errors passed via next(err) from anywhere ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;