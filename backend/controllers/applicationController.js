const { getDb } = require('../config/database');
const { createNotification } = require('./notificationController');

// Apply to a job - students submit applications with cover letters, portfolio links, expected pay, and availability
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
    db.query('SELECT id, user_id, title FROM jobs WHERE id = ?', [jobId], (err, jobs) => {
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
        ], async (err, result) => {
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

            // Create notification for employer
            try {
                const jobOwnerId = jobs[0].user_id;
                await createNotification(
                    jobOwnerId,
                    'new_application',
                    'New Application Received',
                    `Someone applied for your job: ${jobs[0].title || 'your job'}`,
                    result.insertId,
                    'application'
                );
            } catch (notifErr) {
                console.error('Failed to create notification:', notifErr);
                // Don't fail the application if notification fails
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
            j.title AS job_title, j.description, j.category, j.project_type, j.user_id AS employer_id,
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

// Get student's accepted jobs (jobs where their application was accepted)
function getMyAcceptedJobs(req, res) {
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
            a.id AS application_id, 
            a.job_id, 
            a.user_id, 
            a.status AS application_status, 
            a.cover_letter, 
            a.created_at AS applied_at,
            j.id, 
            j.title, 
            j.description, 
            j.category, 
            j.project_type AS projectType,
            j.project_length AS projectLength,
            j.work_location AS workLocation,
            j.weekly_hours AS weeklyHours,
            j.start_date AS startDate,
            j.budget_type AS budgetType,
            j.hourly_rate_min AS hourlyRateMin,
            j.hourly_rate_max AS hourlyRateMax,
            j.fixed_budget AS fixedBudget,
            j.payment_schedule AS paymentSchedule,
            j.status AS job_status,
            j.created_at AS job_created_at,
            j.user_id AS employer_id,
            u.name AS employer_name, 
            u.business_name AS employer_business_name,
            u.email AS employer_email,
            u.avatar_color AS employer_avatar_color,
            (SELECT COUNT(*) FROM messages m 
             JOIN conversations c ON m.conversation_id = c.id 
             WHERE c.job_id = j.id 
             AND c.student_id = a.user_id 
             AND m.sender_id = j.user_id 
             AND m.content LIKE '%marked the job%completed%'
             AND m.is_read = 0) AS has_completion_request
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN users u ON j.user_id = u.id
        WHERE a.user_id = ? AND a.status = 'accepted'
        ORDER BY j.status ASC, j.created_at DESC
    `;

    db.query(sql, [userId], (err, jobs) => {
        if (err) {
            console.error('Error fetching accepted jobs:', err);
            return res.status(500).json({ error: 'db error' });
        }
        res.json(jobs);
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
        SELECT a.user_id as applicant_id, j.user_id as job_owner_id, j.title as job_title, j.id as job_id
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = ?
    `;

    db.query(sql, [applicationId], async (err, results) => {
        if (err) {
            console.error('Error checking application ownership:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'application not found' });
        }

        if (results[0].job_owner_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - not your job' });
        }

        const applicantId = results[0].applicant_id;
        const jobTitle = results[0].job_title;
        const jobId = results[0].job_id;

        // Update status
        db.query('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId], async (err) => {
            if (err) {
                console.error('Error updating application status:', err);
                return res.status(500).json({ error: 'db error' });
            }

            // Create notification for applicant
            try {
                if (status === 'accepted') {
                    await createNotification(
                        applicantId,
                        'application_accepted',
                        'Application Accepted! 🎉',
                        `Congratulations! Your application for "${jobTitle}" has been accepted.`,
                        jobId,
                        'job'
                    );
                } else if (status === 'rejected') {
                    await createNotification(
                        applicantId,
                        'application_rejected',
                        'Application Update',
                        `Your application for "${jobTitle}" was not selected this time.`,
                        jobId,
                        'job'
                    );
                }
            } catch (notifErr) {
                console.error('Failed to create notification:', notifErr);
                // Don't fail the status update if notification fails
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
    getMyAcceptedJobs,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationDetail
};
