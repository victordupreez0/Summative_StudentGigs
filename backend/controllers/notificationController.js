const { getDb } = require('../config/database');

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    const db = getDb();
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const userId = req.user.id;
    const { limit = 50, unread_only = false } = req.query;

    try {
        let query = `
            SELECT n.*, 
                   j.title as job_title,
                   u.name as related_user_name
            FROM notifications n
            LEFT JOIN jobs j ON n.related_type = 'job' AND n.related_id = j.id
            LEFT JOIN users u ON n.related_type = 'user' AND n.related_id = u.id
            WHERE n.user_id = ?
        `;

        if (unread_only === 'true') {
            query += ' AND n.is_read = FALSE';
        }

        query += ' ORDER BY n.created_at DESC LIMIT ?';

        db.query(query, [userId, parseInt(limit)], (err, results) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                return res.status(500).json({ error: 'Failed to fetch notifications' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error in getUserNotifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
    const db = getDb();
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const userId = req.user.id;

    try {
        db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Error fetching unread count:', err);
                    return res.status(500).json({ error: 'Failed to fetch unread count' });
                }
                res.json({ count: results[0].count });
            }
        );
    } catch (error) {
        console.error('Error in getUnreadCount:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    const db = getDb();
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const { id } = req.params;
    const userId = req.user.id;

    try {
        db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [id, userId],
            (err, result) => {
                if (err) {
                    console.error('Error marking notification as read:', err);
                    return res.status(500).json({ error: 'Failed to mark notification as read' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Notification not found' });
                }
                res.json({ message: 'Notification marked as read' });
            }
        );
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    const db = getDb();
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const userId = req.user.id;

    try {
        db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [userId],
            (err, result) => {
                if (err) {
                    console.error('Error marking all notifications as read:', err);
                    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
                }
                res.json({ message: 'All notifications marked as read', count: result.affectedRows });
            }
        );
    } catch (error) {
        console.error('Error in markAllAsRead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    const db = getDb();
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const { id } = req.params;
    const userId = req.user.id;

    try {
        db.query(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId],
            (err, result) => {
                if (err) {
                    console.error('Error deleting notification:', err);
                    return res.status(500).json({ error: 'Failed to delete notification' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Notification not found' });
                }
                res.json({ message: 'Notification deleted' });
            }
        );
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper function to create a notification (used by other controllers)
exports.createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
    const db = getDb();
    if (!db) {
        console.error('Database not available for notification creation');
        return;
    }

    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO notifications (user_id, type, title, message, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, type, title, message, relatedId, relatedType],
            (err, result) => {
                if (err) {
                    console.error('Error creating notification:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};
