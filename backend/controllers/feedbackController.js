const { getDb } = require('../config/database');

// Submit feedback
async function submitFeedback(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const userId = req.user ? req.user.id : null;
    const { email, name, category, subject, message, rating } = req.body || {};

    if (!subject || !message) {
        return res.status(400).json({ error: 'subject and message are required' });
    }

    try {
        const sql = `INSERT INTO feedback (user_id, email, name, category, subject, message, rating) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [userId, email, name, category || 'other', subject, message, rating || null];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database error submitting feedback:', err.message, err.code);
                return res.status(500).json({ error: 'database error' });
            }

            res.status(201).json({ 
                message: 'Feedback submitted successfully',
                id: result.insertId 
            });
        });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Submit error report
async function submitErrorReport(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const userId = req.user ? req.user.id : null;
    const { 
        email, 
        name, 
        errorType, 
        pageUrl, 
        browserInfo, 
        subject, 
        description, 
        stepsToReproduce, 
        expectedBehavior, 
        actualBehavior, 
        screenshotUrl, 
        severity 
    } = req.body || {};

    if (!subject || !description) {
        return res.status(400).json({ error: 'subject and description are required' });
    }

    try {
        const sql = `INSERT INTO error_reports (user_id, email, name, error_type, page_url, browser_info, 
                     subject, description, steps_to_reproduce, expected_behavior, actual_behavior, 
                     screenshot_url, severity) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            userId, 
            email, 
            name, 
            errorType || 'bug', 
            pageUrl, 
            browserInfo, 
            subject, 
            description, 
            stepsToReproduce, 
            expectedBehavior, 
            actualBehavior, 
            screenshotUrl, 
            severity || 'medium'
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database error submitting error report:', err.message, err.code);
                return res.status(500).json({ error: 'database error' });
            }

            res.status(201).json({ 
                message: 'Error report submitted successfully',
                id: result.insertId 
            });
        });
    } catch (err) {
        console.error('Error submitting error report:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Get all feedback (admin only)
async function getAllFeedback(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { status, category, limit = 100, offset = 0 } = req.query;

    try {
        let sql = `SELECT f.*, u.name as user_name, u.email as user_email, u.user_type 
                   FROM feedback f 
                   LEFT JOIN users u ON f.user_id = u.id 
                   WHERE 1=1`;
        const params = [];

        if (status) {
            sql += ` AND f.status = ?`;
            params.push(status);
        }

        if (category) {
            sql += ` AND f.category = ?`;
            params.push(category);
        }

        sql += ` ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Database error fetching feedback:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            res.json({ feedback: results });
        });
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Get all error reports (admin only)
async function getAllErrorReports(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { status, errorType, severity, limit = 100, offset = 0 } = req.query;

    try {
        let sql = `SELECT e.*, u.name as user_name, u.email as user_email, u.user_type 
                   FROM error_reports e 
                   LEFT JOIN users u ON e.user_id = u.id 
                   WHERE 1=1`;
        const params = [];

        if (status) {
            sql += ` AND e.status = ?`;
            params.push(status);
        }

        if (errorType) {
            sql += ` AND e.error_type = ?`;
            params.push(errorType);
        }

        if (severity) {
            sql += ` AND e.severity = ?`;
            params.push(severity);
        }

        sql += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Database error fetching error reports:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            res.json({ errorReports: results });
        });
    } catch (err) {
        console.error('Error fetching error reports:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Update feedback status (admin only)
async function updateFeedbackStatus(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'status is required' });
    }

    try {
        const sql = `UPDATE feedback SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        db.query(sql, [status, adminNotes || null, id], (err, result) => {
            if (err) {
                console.error('Database error updating feedback:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'feedback not found' });
            }

            res.json({ message: 'Feedback updated successfully' });
        });
    } catch (err) {
        console.error('Error updating feedback:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Update error report status (admin only)
async function updateErrorReportStatus(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { id } = req.params;
    const { status, severity, adminNotes } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'status is required' });
    }

    try {
        const sql = `UPDATE error_reports 
                     SET status = ?, severity = COALESCE(?, severity), admin_notes = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`;
        db.query(sql, [status, severity || null, adminNotes || null, id], (err, result) => {
            if (err) {
                console.error('Database error updating error report:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'error report not found' });
            }

            res.json({ message: 'Error report updated successfully' });
        });
    } catch (err) {
        console.error('Error updating error report:', err);
        res.status(500).json({ error: 'server error' });
    }
}

module.exports = {
    submitFeedback,
    submitErrorReport,
    getAllFeedback,
    getAllErrorReports,
    updateFeedbackStatus,
    updateErrorReportStatus
};
