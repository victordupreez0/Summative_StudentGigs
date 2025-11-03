const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Public route - get all reviews
router.get('/', reviewController.getAllReviews);

// Protected routes - require authentication
router.post('/', authenticateToken, reviewController.createReview);
router.get('/user/:userId', authenticateToken, reviewController.getUserReviews);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
