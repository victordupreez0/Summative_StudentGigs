const express = require('express');
const router = express.Router();
const { 
    createJob, 
    getAllJobs, 
    getJobById, 
    getMyJobs, 
    updateJob, 
    deleteJob,
    completeJob,
    acceptCompletion,
    denyCompletion,
    saveJob,
    unsaveJob,
    getSavedJobs
} = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', getAllJobs);

// Protected routes (specific routes must come before parameterized routes)
router.get('/my-jobs', authenticateToken, getMyJobs);
router.get('/saved', authenticateToken, getSavedJobs);
router.post('/', authenticateToken, createJob);

// Parameterized routes (must come after specific routes)
router.get('/:jobId', getJobById);
router.put('/:jobId', authenticateToken, updateJob);
router.patch('/:jobId', authenticateToken, updateJob);
router.post('/:jobId/complete', authenticateToken, completeJob);
router.post('/:jobId/accept-completion', authenticateToken, acceptCompletion);
router.post('/:jobId/deny-completion', authenticateToken, denyCompletion);
router.post('/:jobId/save', authenticateToken, saveJob);
router.delete('/:jobId/save', authenticateToken, unsaveJob);
router.delete('/:jobId', authenticateToken, deleteJob);

module.exports = router;
