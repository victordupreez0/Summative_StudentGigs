const { getDb } = require('../config/database');

// Create a job post
function createJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const { 
        title, description, projectType, projectLength, category, tags, educationLevels,
        workLocation, studentCount, weeklyHours, startDate, experienceLevel,
        requiredSkills, preferredMajors, languages, budgetType, hourlyRateMin,
        hourlyRateMax, fixedBudget, paymentSchedule
    } = req.body || {};

    if (!title) {
        return res.status(400).json({ error: 'title required' });
    }

    // Convert arrays to JSON
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : null;
    const eduJson = Array.isArray(educationLevels) ? JSON.stringify(educationLevels) : null;
    const skillsJson = Array.isArray(requiredSkills) ? JSON.stringify(requiredSkills) : null;
    const majorsJson = Array.isArray(preferredMajors) ? JSON.stringify(preferredMajors) : null;
    const langsJson = Array.isArray(languages) ? JSON.stringify(languages) : null;

    // Check if extended columns exist
    db.query('SHOW COLUMNS FROM jobs WHERE Field = "work_location"', (err, results) => {
        if (err) {
            console.error('Error checking table structure:', err);
            return res.status(500).json({ error: 'db error' });
        }

        const hasExtendedColumns = results.length > 0;

        let sql, values;

        if (hasExtendedColumns) {
            // Use new schema with all columns
            sql = `INSERT INTO jobs (
                user_id, title, description, project_type, project_length, category, tags, education_levels,
                work_location, student_count, weekly_hours, start_date, experience_level,
                required_skills, preferred_majors, languages, budget_type, hourly_rate_min,
                hourly_rate_max, fixed_budget, payment_schedule
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            values = [
                userId, title, description, projectType, projectLength, category, tagsJson, eduJson,
                workLocation, studentCount, weeklyHours, startDate, experienceLevel,
                skillsJson, majorsJson, langsJson, budgetType, hourlyRateMin,
                hourlyRateMax, fixedBudget, paymentSchedule
            ];
        } else {
            // Use legacy schema with basic columns only
            console.log('Using legacy job table schema (missing extended columns)');
            sql = `INSERT INTO jobs (
                user_id, title, description, project_type, project_length, category, tags, education_levels
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            values = [
                userId, title, description, projectType, projectLength, category, tagsJson, eduJson
            ];
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error creating job:', err);
                return res.status(500).json({ 
                    error: 'db insert error', 
                    details: err.message,
                    hint: hasExtendedColumns ? 'Extended columns exist but insert failed' : 'Using legacy columns'
                });
            }
            res.status(201).json({ 
                id: result.insertId, 
                title, 
                description,
                message: hasExtendedColumns ? 'Job created with full details' : 'Job created (extended fields not saved - table needs migration)'
            });
        });
    });
}

// Get all jobs (public)
function getAllJobs(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const sql = `
        SELECT 
            j.id, j.user_id, j.title, j.description, 
            j.project_type AS projectType, 
            j.project_length AS projectLength, 
            j.category, j.tags, j.education_levels AS educationLevels,
            j.work_location AS workLocation,
            j.student_count AS studentCount,
            j.weekly_hours AS weeklyHours,
            j.start_date AS startDate,
            j.experience_level AS experienceLevel,
            j.required_skills AS requiredSkills,
            j.preferred_majors AS preferredMajors,
            j.languages,
            j.budget_type AS budgetType,
            j.hourly_rate_min AS hourlyRateMin,
            j.hourly_rate_max AS hourlyRateMax,
            j.fixed_budget AS fixedBudget,
            j.payment_schedule AS paymentSchedule,
            j.created_at,
            u.name AS poster_name,
            u.user_type AS poster_type,
            u.business_name AS poster_business_name,
            u.avatar_color AS poster_avatar_color
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        ORDER BY j.created_at DESC 
        LIMIT 100
    `;

    db.query(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching jobs:', err);
            return res.status(500).json({ error: 'db error' });
        }

        // Parse JSON fields
        const jobs = rows.map(r => ({
            ...r,
            tags: r.tags ? JSON.parse(r.tags) : [],
            educationLevels: r.educationLevels ? JSON.parse(r.educationLevels) : [],
            requiredSkills: r.requiredSkills ? JSON.parse(r.requiredSkills) : [],
            preferredMajors: r.preferredMajors ? JSON.parse(r.preferredMajors) : [],
            languages: r.languages ? JSON.parse(r.languages) : []
        }));

        res.json(jobs);
    });
}

// Get single job by ID
function getJobById(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const jobId = req.params.jobId;

    const sql = `
        SELECT 
            j.id, j.user_id, j.title, j.description, 
            j.project_type AS projectType, 
            j.project_length AS projectLength, 
            j.category, j.tags, j.education_levels AS educationLevels,
            j.work_location AS workLocation,
            j.student_count AS studentCount,
            j.weekly_hours AS weeklyHours,
            j.start_date AS startDate,
            j.experience_level AS experienceLevel,
            j.required_skills AS requiredSkills,
            j.preferred_majors AS preferredMajors,
            j.languages,
            j.budget_type AS budgetType,
            j.hourly_rate_min AS hourlyRateMin,
            j.hourly_rate_max AS hourlyRateMax,
            j.fixed_budget AS fixedBudget,
            j.payment_schedule AS paymentSchedule,
            j.created_at,
            u.name AS poster_name,
            u.user_type AS poster_type,
            u.business_name AS poster_business_name,
            u.avatar_color AS poster_avatar_color
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        WHERE j.id = ?
    `;

    db.query(sql, [jobId], (err, rows) => {
        if (err) {
            console.error('Error fetching job:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!rows.length) {
            return res.status(404).json({ error: 'job not found' });
        }

        const job = {
            ...rows[0],
            tags: rows[0].tags ? JSON.parse(rows[0].tags) : [],
            educationLevels: rows[0].educationLevels ? JSON.parse(rows[0].educationLevels) : [],
            requiredSkills: rows[0].requiredSkills ? JSON.parse(rows[0].requiredSkills) : [],
            preferredMajors: rows[0].preferredMajors ? JSON.parse(rows[0].preferredMajors) : [],
            languages: rows[0].languages ? JSON.parse(rows[0].languages) : []
        };

        res.json(job);
    });
}

// Get jobs posted by the logged-in user
function getMyJobs(req, res) {
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
            j.id, j.user_id, j.title, j.description, 
            j.project_type AS projectType, 
            j.project_length AS projectLength, 
            j.category, j.tags, j.education_levels AS educationLevels,
            j.work_location AS workLocation,
            j.student_count AS studentCount,
            j.weekly_hours AS weeklyHours,
            j.start_date AS startDate,
            j.experience_level AS experienceLevel,
            j.required_skills AS requiredSkills,
            j.preferred_majors AS preferredMajors,
            j.languages,
            j.budget_type AS budgetType,
            j.hourly_rate_min AS hourlyRateMin,
            j.hourly_rate_max AS hourlyRateMax,
            j.fixed_budget AS fixedBudget,
            j.payment_schedule AS paymentSchedule,
            j.created_at
        FROM jobs j
        WHERE j.user_id = ?
        ORDER BY j.created_at DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching my jobs:', err);
            return res.status(500).json({ error: 'db error' });
        }

        // Parse JSON fields
        const jobs = rows.map(r => ({
            ...r,
            tags: r.tags ? JSON.parse(r.tags) : [],
            educationLevels: r.educationLevels ? JSON.parse(r.educationLevels) : [],
            requiredSkills: r.requiredSkills ? JSON.parse(r.requiredSkills) : [],
            preferredMajors: r.preferredMajors ? JSON.parse(r.preferredMajors) : [],
            languages: r.languages ? JSON.parse(r.languages) : []
        }));

        res.json(jobs);
    });
}

// Update a job (only job owner can update)
function updateJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;

    // First check if job exists and user owns it
    db.query('SELECT user_id FROM jobs WHERE id = ?', [jobId], (err, results) => {
        if (err) {
            console.error('Error checking job ownership:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'job not found' });
        }

        if (results[0].user_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - you can only edit your own jobs' });
        }

        // Update the job
        const { 
            title, description, projectType, projectLength, category, tags, educationLevels,
            workLocation, studentCount, weeklyHours, startDate, experienceLevel,
            requiredSkills, preferredMajors, languages, budgetType, hourlyRateMin,
            hourlyRateMax, fixedBudget, paymentSchedule
        } = req.body || {};

        // Convert arrays to JSON
        const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : null;
        const eduJson = Array.isArray(educationLevels) ? JSON.stringify(educationLevels) : null;
        const skillsJson = Array.isArray(requiredSkills) ? JSON.stringify(requiredSkills) : null;
        const majorsJson = Array.isArray(preferredMajors) ? JSON.stringify(preferredMajors) : null;
        const langsJson = Array.isArray(languages) ? JSON.stringify(languages) : null;

        const sql = `UPDATE jobs SET 
            title = ?, description = ?, project_type = ?, project_length = ?, category = ?, 
            tags = ?, education_levels = ?, work_location = ?, student_count = ?, 
            weekly_hours = ?, start_date = ?, experience_level = ?, required_skills = ?,
            preferred_majors = ?, languages = ?, budget_type = ?, hourly_rate_min = ?,
            hourly_rate_max = ?, fixed_budget = ?, payment_schedule = ?
            WHERE id = ?`;

        const values = [
            title, description, projectType, projectLength, category, tagsJson, eduJson,
            workLocation, studentCount, weeklyHours, startDate, experienceLevel,
            skillsJson, majorsJson, langsJson, budgetType, hourlyRateMin,
            hourlyRateMax, fixedBudget, paymentSchedule, jobId
        ];

        db.query(sql, values, (err) => {
            if (err) {
                console.error('Error updating job:', err);
                return res.status(500).json({ error: 'db update error' });
            }
            res.json({ success: true, message: 'Job updated successfully' });
        });
    });
}

// Delete a job (only job owner can delete)
function deleteJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;

    // Check if job exists and user owns it
    db.query('SELECT user_id FROM jobs WHERE id = ?', [jobId], (err, results) => {
        if (err) {
            console.error('Error checking job ownership:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'job not found' });
        }

        if (results[0].user_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - you can only delete your own jobs' });
        }

        // Delete the job
        db.query('DELETE FROM jobs WHERE id = ?', [jobId], (err) => {
            if (err) {
                console.error('Error deleting job:', err);
                return res.status(500).json({ error: 'db delete error' });
            }
            res.json({ success: true, message: 'Job deleted successfully' });
        });
    });
}

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    getMyJobs,
    updateJob,
    deleteJob
};
