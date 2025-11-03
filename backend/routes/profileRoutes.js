const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    getMyProfile, 
    updateProfile,
    incrementProfileViews,
    checkBioInDatabase,
    getEmployerStats
} = require('../controllers/profileController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Debug route - check bio in database
router.get('/debug/check-bio', authenticateToken, checkBioInDatabase);

// Protected route - get employer dashboard stats
router.get('/employer/stats', authenticateToken, getEmployerStats);

// Public route - get any user's profile (with optional auth for view tracking)
router.get('/:userId', optionalAuth, getProfile);

// Protected route - get own profile
router.get('/me/profile', authenticateToken, getMyProfile);

// Protected route - update own profile
router.put('/me', authenticateToken, updateProfile);

// Track profile view (with optional auth to avoid counting own views)
router.post('/:userId/view', optionalAuth, incrementProfileViews);

module.exports = router;
