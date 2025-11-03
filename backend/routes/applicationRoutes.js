const express = require('express');
const router = express.Router();
const { 
    applyToJob, 
    getJobApplications, 
    getMyJobsApplications, 
    getMyApplications,
    getMyAcceptedJobs,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationDetail
} = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected (require authentication)
// Specific routes must come before parameterized routes
router.get('/my-jobs', authenticateToken, getMyJobsApplications);
router.get('/my-applications', authenticateToken, getMyApplications);
router.get('/my-accepted-jobs', authenticateToken, getMyAcceptedJobs);
router.get('/:applicationId', authenticateToken, getApplicationDetail);
router.post('/jobs/:jobId/apply', authenticateToken, applyToJob);
router.get('/jobs/:jobId/applications', authenticateToken, getJobApplications);
router.patch('/:applicationId/status', authenticateToken, updateApplicationStatus);
router.delete('/:applicationId', authenticateToken, withdrawApplication);

module.exports = router;
