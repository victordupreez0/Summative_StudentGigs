const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
    submitFeedback,
    submitErrorReport
} = require('../controllers/feedbackController');

// Public routes (optional auth - can be used by logged in or anonymous users)
router.post('/feedback', optionalAuth, submitFeedback);
router.post('/error-report', optionalAuth, submitErrorReport);

module.exports = router;
