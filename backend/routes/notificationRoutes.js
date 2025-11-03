const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get unread notification count (must be before /:id routes)
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read (must be before /:id routes)
router.put('/mark-all-read', notificationController.markAllAsRead);

// Get all notifications for the logged-in user
router.get('/', notificationController.getUserNotifications);

// Mark a notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
