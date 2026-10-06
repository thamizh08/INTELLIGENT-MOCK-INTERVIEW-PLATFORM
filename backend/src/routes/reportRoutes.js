// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();

const {
  generateReport,
  getReportBySession,
  getUserReports,
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

// IMPORTANT: /history must be declared before /:sessionId, otherwise Express
// would treat "history" as a sessionId value and never reach this route.
router.get('/history', protect, getUserReports);

router.post('/:sessionId/generate', protect, generateReport);
router.get('/:sessionId', protect, getReportBySession);

module.exports = router;