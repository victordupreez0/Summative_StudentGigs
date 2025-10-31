const express = require('express');
const router = express.Router();
const { 
    applyToJob, 
    getJobApplications, 
    getMyJobsApplications, 
    getMyApplications, 
    updateApplicationStatus,
    withdrawApplication
} = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected (require authentication)
// Specific routes must come before parameterized routes
router.get('/my-jobs', authenticateToken, getMyJobsApplications);
router.get('/my-applications', authenticateToken, getMyApplications);
router.post('/jobs/:jobId/apply', authenticateToken, applyToJob);
router.get('/jobs/:jobId/applications', authenticateToken, getJobApplications);
router.patch('/:applicationId/status', authenticateToken, updateApplicationStatus);
router.delete('/:applicationId', authenticateToken, withdrawApplication);

module.exports = router;
