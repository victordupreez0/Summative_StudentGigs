const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// Debug endpoint to check if student_profiles table exists and show its structure
router.get('/check-profile-table', (req, res) => {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    // Check if table exists
    db.query('SHOW TABLES LIKE "student_profiles"', (err, tables) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (tables.length === 0) {
            return res.json({
                exists: false,
                message: 'student_profiles table does NOT exist. Run migrations!'
            });
        }

        // Table exists, get its structure
        db.query('DESCRIBE student_profiles', (descErr, columns) => {
            if (descErr) {
                return res.status(500).json({ error: descErr.message });
            }

            // Count records
            db.query('SELECT COUNT(*) as count FROM student_profiles', (countErr, count) => {
                if (countErr) {
                    return res.status(500).json({ error: countErr.message });
                }

                res.json({
                    exists: true,
                    message: 'student_profiles table EXISTS',
                    columns: columns.map(c => ({ field: c.Field, type: c.Type })),
                    recordCount: count[0].count
                });
            });
        });
    });
});

// Debug endpoint to check a specific user's profile
router.get('/check-user-profile/:userId', (req, res) => {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    const userId = req.params.userId;

    db.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId], (err, profiles) => {
        if (err) {
            return res.status(500).json({ 
                error: err.message,
                code: err.code 
            });
        }

        if (profiles.length === 0) {
            return res.json({
                exists: false,
                message: `No profile found for user ${userId}`,
                userId: userId
            });
        }

        res.json({
            exists: true,
            message: `Profile found for user ${userId}`,
            profile: profiles[0]
        });
    });
});

module.exports = router;
