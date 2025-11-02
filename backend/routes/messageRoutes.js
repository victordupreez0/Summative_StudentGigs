const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all conversations for the current user
router.get('/conversations', messageController.getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', messageController.getMessages);

// Send a message
router.post('/messages', messageController.sendMessage);

// Create or get a conversation
router.post('/conversations', messageController.createConversation);

// Get unread message count
router.get('/unread-count', messageController.getUnreadCount);

module.exports = router;
