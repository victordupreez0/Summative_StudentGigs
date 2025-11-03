const { getDb } = require('../config/database');

// Get dashboard statistics
async function getDashboardStats(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    try {
        // Get total users count
        const totalUsersPromise = new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count);
            });
        });

        // Get users by type
        const usersByTypePromise = new Promise((resolve, reject) => {
            db.query('SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Get new users (last 30 days)
        const newUsersPromise = new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)', (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count);
            });
        });

        // Get total jobs
        const totalJobsPromise = new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM jobs', (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count);
            });
        });

        // Get jobs by status
        const jobsByStatusPromise = new Promise((resolve, reject) => {
            db.query('SELECT status, COUNT(*) as count FROM jobs GROUP BY status', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Get total applications
        const totalApplicationsPromise = new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM applications', (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count);
            });
        });

        // Get applications by status
        const applicationsByStatusPromise = new Promise((resolve, reject) => {
            db.query('SELECT status, COUNT(*) as count FROM applications GROUP BY status', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Get feedback count
        const totalFeedbackPromise = new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM feedback', (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count);
            });
        });

        // Get feedback by status
        const feedbackByStatusPromise = new Promise((resolve, reject) => {
            db.query('SELECT status, COUNT(*) as count FROM feedback GROUP BY status', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Get error reports count
        const totalErrorReportsPromise = new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM error_reports', (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count);
            });
        });

        // Get error reports by severity
        const errorReportsBySeverityPromise = new Promise((resolve, reject) => {
            db.query('SELECT severity, COUNT(*) as count FROM error_reports GROUP BY severity', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Get error reports by status
        const errorReportsByStatusPromise = new Promise((resolve, reject) => {
            db.query('SELECT status, COUNT(*) as count FROM error_reports GROUP BY status', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const [
            totalUsers,
            usersByType,
            newUsers,
            totalJobs,
            jobsByStatus,
            totalApplications,
            applicationsByStatus,
            totalFeedback,
            feedbackByStatus,
            totalErrorReports,
            errorReportsBySeverity,
            errorReportsByStatus
        ] = await Promise.all([
            totalUsersPromise,
            usersByTypePromise,
            newUsersPromise,
            totalJobsPromise,
            jobsByStatusPromise,
            totalApplicationsPromise,
            applicationsByStatusPromise,
            totalFeedbackPromise,
            feedbackByStatusPromise,
            totalErrorReportsPromise,
            errorReportsBySeverityPromise,
            errorReportsByStatusPromise
        ]);

        res.json({
            users: {
                total: totalUsers,
                newLast30Days: newUsers,
                byType: usersByType
            },
            jobs: {
                total: totalJobs,
                byStatus: jobsByStatus
            },
            applications: {
                total: totalApplications,
                byStatus: applicationsByStatus
            },
            feedback: {
                total: totalFeedback,
                byStatus: feedbackByStatus
            },
            errorReports: {
                total: totalErrorReports,
                bySeverity: errorReportsBySeverity,
                byStatus: errorReportsByStatus
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Get all users with pagination and filters
async function getAllUsers(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { userType, search, limit = 50, offset = 0 } = req.query;

    try {
        let sql = `SELECT id, name, email, user_type, business_name, profile_picture, avatar_color, is_admin, created_at 
                   FROM users WHERE 1=1`;
        const params = [];

        if (userType) {
            sql += ` AND user_type = ?`;
            params.push(userType);
        }

        if (search) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR business_name LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Database error fetching users:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            // Get total count for pagination
            let countSql = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
            const countParams = [];

            if (userType) {
                countSql += ` AND user_type = ?`;
                countParams.push(userType);
            }

            if (search) {
                countSql += ` AND (name LIKE ? OR email LIKE ? OR business_name LIKE ?)`;
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm);
            }

            db.query(countSql, countParams, (countErr, countResults) => {
                if (countErr) {
                    console.error('Database error counting users:', countErr.message);
                    return res.status(500).json({ error: 'database error' });
                }

                res.json({ 
                    users: results,
                    total: countResults[0].total
                });
            });
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Get all jobs with pagination and filters
async function getAllJobs(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { status, category, search, limit = 50, offset = 0 } = req.query;

    try {
        let sql = `SELECT j.*, u.name as employer_name, u.email as employer_email, u.business_name,
                   (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
                   FROM jobs j
                   LEFT JOIN users u ON j.user_id = u.id
                   WHERE 1=1`;
        const params = [];

        if (status) {
            sql += ` AND j.status = ?`;
            params.push(status);
        }

        if (category) {
            sql += ` AND j.category = ?`;
            params.push(category);
        }

        if (search) {
            sql += ` AND (j.title LIKE ? OR j.description LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        sql += ` ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Database error fetching jobs:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            // Get total count for pagination
            let countSql = `SELECT COUNT(*) as total FROM jobs j WHERE 1=1`;
            const countParams = [];

            if (status) {
                countSql += ` AND j.status = ?`;
                countParams.push(status);
            }

            if (category) {
                countSql += ` AND j.category = ?`;
                countParams.push(category);
            }

            if (search) {
                countSql += ` AND (j.title LIKE ? OR j.description LIKE ?)`;
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm);
            }

            db.query(countSql, countParams, (countErr, countResults) => {
                if (countErr) {
                    console.error('Database error counting jobs:', countErr.message);
                    return res.status(500).json({ error: 'database error' });
                }

                res.json({ 
                    jobs: results,
                    total: countResults[0].total
                });
            });
        });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Get all applications with pagination and filters
async function getAllApplications(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { status, limit = 50, offset = 0 } = req.query;

    try {
        let sql = `SELECT a.*, 
                   j.title as job_title, j.category as job_category,
                   u.name as student_name, u.email as student_email,
                   emp.name as employer_name, emp.email as employer_email, emp.business_name
                   FROM applications a
                   LEFT JOIN jobs j ON a.job_id = j.id
                   LEFT JOIN users u ON a.user_id = u.id
                   LEFT JOIN users emp ON j.user_id = emp.id
                   WHERE 1=1`;
        const params = [];

        if (status) {
            sql += ` AND a.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Database error fetching applications:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            // Get total count for pagination
            let countSql = `SELECT COUNT(*) as total FROM applications a WHERE 1=1`;
            const countParams = [];

            if (status) {
                countSql += ` AND a.status = ?`;
                countParams.push(status);
            }

            db.query(countSql, countParams, (countErr, countResults) => {
                if (countErr) {
                    console.error('Database error counting applications:', countErr.message);
                    return res.status(500).json({ error: 'database error' });
                }

                res.json({ 
                    applications: results,
                    total: countResults[0].total
                });
            });
        });
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Delete user (admin only)
async function deleteUser(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { id } = req.params;

    try {
        db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Database error deleting user:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'user not found' });
            }

            res.json({ message: 'User deleted successfully' });
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Delete job (admin only)
async function deleteJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { id } = req.params;

    try {
        db.query('DELETE FROM jobs WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Database error deleting job:', err.message);
                return res.status(500).json({ error: 'database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'job not found' });
            }

            res.json({ message: 'Job deleted successfully' });
        });
    } catch (err) {
        console.error('Error deleting job:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Get activity log / recent activities
async function getRecentActivities(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { limit = 20 } = req.query;

    try {
        // Get recent users
        const recentUsersPromise = new Promise((resolve, reject) => {
            db.query(
                `SELECT id, name, email, user_type, created_at, 'user_registered' as activity_type 
                 FROM users ORDER BY created_at DESC LIMIT ?`,
                [parseInt(limit) / 4],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });

        // Get recent jobs
        const recentJobsPromise = new Promise((resolve, reject) => {
            db.query(
                `SELECT j.id, j.title, j.created_at, u.name as user_name, 'job_posted' as activity_type 
                 FROM jobs j 
                 LEFT JOIN users u ON j.user_id = u.id 
                 ORDER BY j.created_at DESC LIMIT ?`,
                [parseInt(limit) / 4],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });

        // Get recent applications
        const recentApplicationsPromise = new Promise((resolve, reject) => {
            db.query(
                `SELECT a.id, a.created_at, j.title as job_title, u.name as student_name, 'application_submitted' as activity_type 
                 FROM applications a 
                 LEFT JOIN jobs j ON a.job_id = j.id 
                 LEFT JOIN users u ON a.user_id = u.id 
                 ORDER BY a.created_at DESC LIMIT ?`,
                [parseInt(limit) / 4],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });

        // Get recent feedback
        const recentFeedbackPromise = new Promise((resolve, reject) => {
            db.query(
                `SELECT f.id, f.subject, f.created_at, f.category, u.name as user_name, 'feedback_submitted' as activity_type 
                 FROM feedback f 
                 LEFT JOIN users u ON f.user_id = u.id 
                 ORDER BY f.created_at DESC LIMIT ?`,
                [parseInt(limit) / 4],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });

        const [recentUsers, recentJobs, recentApplications, recentFeedback] = await Promise.all([
            recentUsersPromise,
            recentJobsPromise,
            recentApplicationsPromise,
            recentFeedbackPromise
        ]);

        // Combine and sort all activities
        const allActivities = [
            ...recentUsers,
            ...recentJobs,
            ...recentApplications,
            ...recentFeedback
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, parseInt(limit));

        res.json({ activities: allActivities });
    } catch (err) {
        console.error('Error fetching recent activities:', err);
        res.status(500).json({ error: 'server error' });
    }
}

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllJobs,
    getAllApplications,
    deleteUser,
    deleteJob,
    getRecentActivities
};
