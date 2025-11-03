const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');

// Schedule a new interview (employer only)
router.post('/schedule', authenticateToken, interviewController.scheduleInterview);

// Get employer's interviews
router.get('/employer', authenticateToken, interviewController.getEmployerInterviews);

// Get student's interviews
router.get('/student', authenticateToken, interviewController.getStudentInterviews);

// Get upcoming interviews for dashboard
router.get('/upcoming', authenticateToken, interviewController.getUpcomingInterviews);

// Update interview status
router.patch('/:interviewId/status', authenticateToken, interviewController.updateInterviewStatus);

// Reschedule interview (employer only)
router.patch('/:interviewId/reschedule', authenticateToken, interviewController.rescheduleInterview);

module.exports = router;
