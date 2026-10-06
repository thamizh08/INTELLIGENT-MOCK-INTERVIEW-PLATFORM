// src/routes/roadmapRoutes.js
const express = require('express');
const router = express.Router();

const {
  generateRoadmap,
  getActiveRoadmap,
  updateRoadmapProgress,
  completeRoadmap,
} = require('../controllers/roadmapController');

const { protect } = require('../middleware/authMiddleware');

// Same ordering rule as reportRoutes: /active before /:reportId
router.get('/active', protect, getActiveRoadmap);

router.post('/:reportId/generate', protect, generateRoadmap);
router.patch('/:roadmapId/progress', protect, updateRoadmapProgress);
router.patch('/:roadmapId/complete', protect, completeRoadmap);

module.exports = router;