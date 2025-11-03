const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    getDashboardStats,
    getAllUsers,
    getAllJobs,
    getAllApplications,
    deleteUser,
    deleteJob,
    getRecentActivities
} = require('../controllers/adminController');
const {
    getAllFeedback,
    getAllErrorReports,
    updateFeedbackStatus,
    updateErrorReportStatus
} = require('../controllers/feedbackController');

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard & Analytics
router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);

// User Management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Job Management
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);

// Application Management
router.get('/applications', getAllApplications);

// Feedback Management
router.get('/feedback', getAllFeedback);
router.put('/feedback/:id', updateFeedbackStatus);

// Error Report Management
router.get('/error-reports', getAllErrorReports);
router.put('/error-reports/:id', updateErrorReportStatus);

module.exports = router;
