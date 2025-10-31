const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/signup', register);  // Alias
router.post('/login', login);
router.post('/auth/signup', register);  // Alternative path
router.post('/auth/login', login);  // Alternative path

// Protected routes
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
