const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Public route for submitting feedback
router.post('/submit', submitFeedback);

// Protected route for getting all feedback (admin only)
router.get('/all', protect, getFeedback);

module.exports = router; 