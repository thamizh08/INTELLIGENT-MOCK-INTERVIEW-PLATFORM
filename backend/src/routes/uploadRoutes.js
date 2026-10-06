// src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();

const { uploadResume, uploadJobDescription } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// upload.single('resume') runs multer first, attaching the file to req.file
// under the field name "resume" - the frontend's FormData key must match this.
router.post('/resume', protect, upload.single('resume'), uploadResume);
router.post('/job-description', protect, uploadJobDescription);

module.exports = router;