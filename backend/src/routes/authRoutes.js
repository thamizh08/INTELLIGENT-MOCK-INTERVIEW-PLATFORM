// src/routes/authRoutes.js
// Defines WHICH url + HTTP method triggers WHICH controller function.
// This file contains no logic itself - it just wires paths to handlers.

const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  getProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected route: only works if a valid JWT is provided (checked by `protect`)
router.get('/profile', protect, getProfile);

module.exports = router;
