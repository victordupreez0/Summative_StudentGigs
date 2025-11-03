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
        hourlyRateMax, fixedBudget, paymentSchedule, status
    } = req.body || {};

    if (!title) {
        return res.status(400).json({ error: 'title required' });
    }

    // Default status to 'open' if not provided
    const jobStatus = status || 'open';

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
                hourly_rate_max, fixed_budget, payment_schedule, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            values = [
                userId, title, description, projectType, projectLength, category, tagsJson, eduJson,
                workLocation, studentCount, weeklyHours, startDate, experienceLevel,
                skillsJson, majorsJson, langsJson, budgetType, hourlyRateMin,
                hourlyRateMax, fixedBudget, paymentSchedule, jobStatus
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
            j.status,
            j.created_at,
            u.name AS poster_name,
            u.user_type AS poster_type,
            u.business_name AS poster_business_name,
            u.avatar_color AS poster_avatar_color
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        WHERE j.status != 'draft'
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
            j.status,
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

        const jobData = rows[0];
        
        // Check if job is a draft and user is not the owner
        if (jobData.status === 'draft') {
            const userId = req.user && req.user.id;
            if (!userId || jobData.user_id !== userId) {
                return res.status(404).json({ error: 'job not found' });
            }
        }

        const job = {
            ...jobData,
            tags: jobData.tags ? JSON.parse(jobData.tags) : [],
            educationLevels: jobData.educationLevels ? JSON.parse(jobData.educationLevels) : [],
            requiredSkills: jobData.requiredSkills ? JSON.parse(jobData.requiredSkills) : [],
            preferredMajors: jobData.preferredMajors ? JSON.parse(jobData.preferredMajors) : [],
            languages: jobData.languages ? JSON.parse(jobData.languages) : []
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
            j.status,
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
            hourlyRateMax, fixedBudget, paymentSchedule, status
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
            hourly_rate_max = ?, fixed_budget = ?, payment_schedule = ?, status = ?
            WHERE id = ?`;

        const values = [
            title, description, projectType, projectLength, category, tagsJson, eduJson,
            workLocation, studentCount, weeklyHours, startDate, experienceLevel,
            skillsJson, majorsJson, langsJson, budgetType, hourlyRateMin,
            hourlyRateMax, fixedBudget, paymentSchedule, status || 'open', jobId
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

// Complete a job (only job owner can complete)
function completeJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;

    // Check if job exists, user owns it, and there's an accepted applicant
    const checkJobSql = `
        SELECT j.user_id, j.title, a.user_id as accepted_student_id, a.id as application_id
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id AND a.status = 'accepted'
        WHERE j.id = ?
    `;

    db.query(checkJobSql, [jobId], (err, results) => {
        if (err) {
            console.error('Error checking job:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'job not found' });
        }

        const job = results[0];

        if (job.user_id !== userId) {
            return res.status(403).json({ error: 'unauthorized - you can only complete your own jobs' });
        }

        if (!job.accepted_student_id) {
            return res.status(400).json({ error: 'cannot complete job without an accepted applicant' });
        }

        // Update job status to pending_completion (awaiting student confirmation)
        db.query('UPDATE jobs SET status = ? WHERE id = ?', ['pending_completion', jobId], (err) => {
            if (err) {
                console.error('Error updating job status:', err);
                return res.status(500).json({ error: 'db update error' });
            }

            // Find or create conversation with the accepted student
            const findConvSql = `
                SELECT id FROM conversations 
                WHERE (student_id = ? AND employer_id = ?) OR job_id = ?
            `;

            db.query(findConvSql, [job.accepted_student_id, userId, jobId], (err, convResults) => {
                if (err) {
                    console.error('Error finding conversation:', err);
                    // Still return success for job completion
                    return res.json({ 
                        success: true, 
                        message: 'Completion request sent',
                        studentId: job.accepted_student_id
                    });
                }

                let conversationId;

                if (convResults.length > 0) {
                    conversationId = convResults[0].id;
                    sendCompletionMessage(conversationId);
                } else {
                    // Create conversation
                    const createConvSql = 'INSERT INTO conversations (student_id, employer_id, job_id) VALUES (?, ?, ?)';
                    db.query(createConvSql, [job.accepted_student_id, userId, jobId], function(err, result) {
                        if (err) {
                            console.error('Error creating conversation:', err);
                            return res.json({ 
                                success: true, 
                                message: 'Completion request sent',
                                studentId: job.accepted_student_id
                            });
                        }
                        conversationId = result.insertId;
                        sendCompletionMessage(conversationId);
                    });
                }

                function sendCompletionMessage(convId) {
                    const messageSql = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
                    const messageContent = `🎉 The employer has requested to mark the job "${job.title}" as completed! Please review and confirm if the work has been satisfactorily finished.`;
                    
                    db.query(messageSql, [convId, userId, messageContent], (err) => {
                        if (err) {
                            console.error('Error sending completion message:', err);
                        }
                        
                        res.json({ 
                            success: true, 
                            message: 'Completion request sent to student',
                            studentId: job.accepted_student_id,
                            conversationId: convId
                        });
                    });
                }
            });
        });
    });
}

// Accept completion request (student only)
function acceptCompletion(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;

    // Verify student has accepted application for this job
    const checkSql = `
        SELECT a.id, j.title, j.user_id as employer_id, j.status as job_status
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.job_id = ? AND a.user_id = ? AND a.status = 'accepted'
    `;

    db.query(checkSql, [jobId, userId], (err, results) => {
        if (err) {
            console.error('Error checking application:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(403).json({ error: 'unauthorized - you are not the accepted student for this job' });
        }

        const job = results[0];

        if (job.job_status !== 'pending_completion') {
            return res.status(400).json({ error: 'no pending completion request for this job' });
        }

        // Update job status to completed
        db.query('UPDATE jobs SET status = ? WHERE id = ?', ['completed', jobId], (err) => {
            if (err) {
                console.error('Error updating job status:', err);
                return res.status(500).json({ error: 'db update error' });
            }

            // Send confirmation message to employer
            const findConvSql = `
                SELECT id FROM conversations 
                WHERE student_id = ? AND employer_id = ?
            `;

            db.query(findConvSql, [userId, job.employer_id], (err, convResults) => {
                if (err) {
                    console.error('Error finding conversation:', err);
                }

                if (convResults && convResults.length > 0) {
                    const conversationId = convResults[0].id;
                    const messageSql = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
                    const messageContent = `✅ I have confirmed the completion of "${job.title}". Thank you for working with me!`;
                    
                    db.query(messageSql, [conversationId, userId, messageContent], (err) => {
                        if (err) {
                            console.error('Error sending confirmation message:', err);
                        }
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Job completion confirmed',
                    jobId: jobId
                });
            });
        });
    });
}

// Deny completion request (student only)
function denyCompletion(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;
    const { reason } = req.body || {};

    // Verify student has accepted application for this job
    const checkSql = `
        SELECT a.id, j.title, j.user_id as employer_id, j.status as job_status
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.job_id = ? AND a.user_id = ? AND a.status = 'accepted'
    `;

    db.query(checkSql, [jobId, userId], (err, results) => {
        if (err) {
            console.error('Error checking application:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!results.length) {
            return res.status(403).json({ error: 'unauthorized - you are not the accepted student for this job' });
        }

        const job = results[0];

        if (job.job_status !== 'pending_completion') {
            return res.status(400).json({ error: 'no pending completion request to deny' });
        }

        // Set job back to in_progress status (work continues)
        db.query('UPDATE jobs SET status = ? WHERE id = ?', ['in_progress', jobId], (err) => {
            if (err) {
                console.error('Error updating job status:', err);
                return res.status(500).json({ error: 'db update error' });
            }

            // Send denial message to employer
            const findConvSql = `
                SELECT id FROM conversations 
                WHERE student_id = ? AND employer_id = ?
            `;

            db.query(findConvSql, [userId, job.employer_id], (err, convResults) => {
                if (err) {
                    console.error('Error finding conversation:', err);
                }

                if (convResults && convResults.length > 0) {
                    const conversationId = convResults[0].id;
                    const messageSql = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
                    const messageContent = `❌ I cannot confirm completion of "${job.title}" at this time.${reason ? `\n\nReason: ${reason}` : ''}`;
                    
                    db.query(messageSql, [conversationId, userId, messageContent], (err) => {
                        if (err) {
                            console.error('Error sending denial message:', err);
                        }
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Completion request denied',
                    jobId: jobId
                });
            });
        });
    });
}

// Save a job
function saveJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;

    // Check if job exists
    db.query('SELECT id FROM jobs WHERE id = ?', [jobId], (err, jobResults) => {
        if (err) {
            console.error('Error checking job:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!jobResults || jobResults.length === 0) {
            return res.status(404).json({ error: 'job not found' });
        }

        // Check if already saved
        db.query('SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?', [userId, jobId], (err, existingResults) => {
            if (err) {
                console.error('Error checking saved job:', err);
                return res.status(500).json({ error: 'db error' });
            }

            if (existingResults && existingResults.length > 0) {
                return res.status(200).json({ message: 'job already saved', saved: true });
            }

            // Save the job
            db.query('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [userId, jobId], (err, result) => {
                if (err) {
                    console.error('Error saving job:', err);
                    return res.status(500).json({ error: 'db insert error' });
                }

                res.status(201).json({ message: 'job saved successfully', saved: true });
            });
        });
    });
}

// Unsave a job
function unsaveJob(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const jobId = req.params.jobId;

    db.query('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?', [userId, jobId], (err, result) => {
        if (err) {
            console.error('Error unsaving job:', err);
            return res.status(500).json({ error: 'db delete error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'saved job not found' });
        }

        res.json({ message: 'job unsaved successfully', saved: false });
    });
}

// Get all saved jobs for a user
function getSavedJobs(req, res) {
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
            j.category, j.tags, 
            j.education_levels AS educationLevels,
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
            j.status,
            j.created_at,
            u.name AS poster_name,
            u.business_name AS poster_business_name,
            u.user_type AS poster_type,
            sj.created_at AS saved_at
        FROM saved_jobs sj
        INNER JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN users u ON j.user_id = u.id
        WHERE sj.user_id = ? AND j.status != 'draft'
        ORDER BY sj.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching saved jobs:', err);
            return res.status(500).json({ error: 'db query error' });
        }

        // Parse JSON fields
        const jobs = results.map(job => ({
            ...job,
            tags: job.tags ? JSON.parse(job.tags) : [],
            educationLevels: job.educationLevels ? JSON.parse(job.educationLevels) : [],
            requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
            preferredMajors: job.preferredMajors ? JSON.parse(job.preferredMajors) : [],
            languages: job.languages ? JSON.parse(job.languages) : [],
            saved: true
        }));

        res.json(jobs);
    });
}

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    getMyJobs,
    updateJob,
    deleteJob,
    completeJob,
    acceptCompletion,
    denyCompletion,
    saveJob,
    unsaveJob,
    getSavedJobs
};
