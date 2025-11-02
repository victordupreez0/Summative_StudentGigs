const { getDb } = require('../config/database');

// Apply to a job
function applyToJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;
    const { 
        coverLetter, 
        resumeUrl, 
        portfolioUrl, 
        availability, 
        expectedRate
    } = req.body || {};

    // Check if job exists
    db.query('SELECT id, user_id FROM jobs WHERE id = ?', [jobId], (err, jobs) => {
        if (err) {
            console.error('Error checking job:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!jobs.length) {
            return res.status(404).json({ error: 'job not found' });
        }

        // Prevent applying to own job
        if (jobs[0].user_id === userId) {
            return res.status(400).json({ error: 'cannot apply to your own job' });
        }

        // Insert application with additional fields
        const sql = `INSERT INTO applications 
            (job_id, user_id, cover_letter, resume_url, portfolio_url, availability, expected_rate) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        console.log('Attempting to insert application:', {
            jobId,
            userId,
            coverLetter: coverLetter ? 'provided' : 'null',
            resumeUrl: resumeUrl ? 'provided' : 'null',
            portfolioUrl: portfolioUrl ? 'provided' : 'null',
            availability: availability ? 'provided' : 'null',
            expectedRate: expectedRate ? 'provided' : 'null'
        });
        
        db.query(sql, [
            jobId, 
            userId, 
            coverLetter || null, 
            resumeUrl || null, 
            portfolioUrl || null, 
            availability || null, 
            expectedRate || null
        ], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'you have already applied to this job' });
                }
                console.error('Error creating application:', err);
                console.error('Error details:', {
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql
                });
                return res.status(500).json({ error: 'db insert error' });
            }
            res.status(201).json({ 
                id: result.insertId, 
                message: 'Application submitted successfully' 
            });
        });
    });
}

// Get applications for a specific job (job owner only)
function getJobApplications(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;

    // Verify job ownership
    db.query('SELECT user_id FROM jobs WHERE id = ?', [jobId], (err, jobs) => {
        if (err) {
            console.error('Error checking job ownership:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!jobs.length) {
            return res.status(404).json({ error: 'job not found' });
        }

        if (jobs[0].user_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - not your job' });
        }

        // Get applications
        const sql = `
            SELECT 
                a.id, a.job_id, a.user_id, a.status, a.cover_letter, a.created_at,
                u.name, u.email, u.profile_picture, u.avatar_color
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.job_id = ?
            ORDER BY a.created_at DESC
        `;

        db.query(sql, [jobId], (err, applications) => {
            if (err) {
                console.error('Error fetching applications:', err);
                return res.status(500).json({ error: 'db error' });
            }
            res.json(applications);
        });
    });
}

// Get all applications for jobs posted by the employer
function getMyJobsApplications(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const sql = `
        SELECT 
            a.id, a.job_id, a.user_id, a.status, a.cover_letter, a.created_at,
            u.name, u.email, u.profile_picture, u.avatar_color,
            j.title AS job_title
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN jobs j ON a.job_id = j.id
        WHERE j.user_id = ?
        ORDER BY a.created_at DESC
    `;

    db.query(sql, [userId], (err, applications) => {
        if (err) {
            console.error('Error fetching applications:', err);
            return res.status(500).json({ error: 'db error' });
        }
        res.json(applications);
    });
}

// Get user's own applications (student view)
function getMyApplications(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const sql = `
        SELECT 
            a.id, a.job_id, a.user_id, a.status, a.cover_letter, a.created_at,
            j.title AS job_title, j.description, j.category, j.project_type,
            u.name AS employer_name, u.business_name AS employer_business_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN users u ON j.user_id = u.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
    `;

    db.query(sql, [userId], (err, applications) => {
        if (err) {
            console.error('Error fetching my applications:', err);
            return res.status(500).json({ error: 'db error' });
        }
        res.json(applications);
    });
}

// Update application status (employer only)
function updateApplicationStatus(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const applicationId = req.params.applicationId;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'invalid status' });
    }

    // Verify the application's job belongs to this employer
    const sql = `
        SELECT j.user_id 
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = ?
    `;

    db.query(sql, [applicationId], (err, results) => {
        if (err) {
            console.error('Error checking application ownership:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'application not found' });
        }

        if (results[0].user_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - not your job' });
        }

        // Update status
        db.query('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId], (err) => {
            if (err) {
                console.error('Error updating application status:', err);
                return res.status(500).json({ error: 'db error' });
            }
            res.json({ success: true, message: 'Application status updated' });
        });
    });
}

// Withdraw application (student only)
function withdrawApplication(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const applicationId = req.params.applicationId;

    // Verify the application belongs to this user
    db.query('SELECT user_id FROM applications WHERE id = ?', [applicationId], (err, results) => {
        if (err) {
            console.error('Error checking application ownership:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'application not found' });
        }

        if (results[0].user_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - not your application' });
        }

        // Delete application
        db.query('DELETE FROM applications WHERE id = ?', [applicationId], (err) => {
            if (err) {
                console.error('Error withdrawing application:', err);
                return res.status(500).json({ error: 'db error' });
            }
            res.json({ success: true, message: 'Application withdrawn successfully' });
        });
    });
}

// Get detailed application information (employer only)
function getApplicationDetail(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const applicationId = req.params.applicationId;

    // Verify the application's job belongs to this employer and get full details
    const sql = `
        SELECT 
            a.id, a.job_id, a.user_id, a.status, a.cover_letter, 
            a.resume_url, a.portfolio_url, a.availability, a.expected_rate, 
            a.motivation, a.created_at,
            u.name, u.email, u.profile_picture, u.avatar_color,
            j.title AS job_title, j.description AS job_description, 
            j.category, j.project_type, j.user_id AS job_owner_id
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = ?
    `;

    db.query(sql, [applicationId], (err, results) => {
        if (err) {
            console.error('Error fetching application detail:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'application not found' });
        }

        // Verify job ownership
        if (results[0].job_owner_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - not your job' });
        }

        res.json(results[0]);
    });
}

module.exports = {
    applyToJob,
    getJobApplications,
    getMyJobsApplications,
    getMyApplications,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationDetail
};
