const express = require('express');
const router = express.Router();
const { 
    createJob, 
    getAllJobs, 
    getJobById, 
    getMyJobs, 
    updateJob, 
    deleteJob 
} = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', getAllJobs);

// Protected routes (specific routes must come before parameterized routes)
router.get('/my-jobs', authenticateToken, getMyJobs);
router.post('/', authenticateToken, createJob);

// Parameterized routes (must come after specific routes)
router.get('/:jobId', getJobById);
router.put('/:jobId', authenticateToken, updateJob);
router.patch('/:jobId', authenticateToken, updateJob);
router.delete('/:jobId', authenticateToken, deleteJob);

module.exports = router;
