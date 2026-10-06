// src/routes/interviewRoutes.js
const express = require('express');
const router = express.Router();

const {
  startInterview,
  submitAnswer,
  completeInterview,
  getSession,
} = require('../controllers/interviewController');

const { protect } = require('../middleware/authMiddleware');

// Every interview route requires a logged-in user
router.post('/start', protect, startInterview);
router.post('/:sessionId/answer', protect, submitAnswer);
router.post('/:sessionId/complete', protect, completeInterview);
router.get('/:sessionId', protect, getSession);

module.exports = router;