const { getDb } = require('../config/database');

// Schedule a new interview (employer only)
exports.scheduleInterview = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const { applicationId, scheduledDate, scheduledTime, meetingLink, notes } = req.body;
        const employerId = req.user.id;

        // Validate required fields
        if (!applicationId || !scheduledDate || !scheduledTime) {
            return res.status(400).json({ 
                error: 'Application ID, date, and time are required' 
            });
        }

        // Get application details to verify employer owns the job and get student info
        const getApplicationSql = `
            SELECT a.id, a.job_id, a.user_id as student_id, j.user_id as job_owner_id
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ?
        `;

        db.query(getApplicationSql, [applicationId], (err, applications) => {
            if (err) {
                console.error('Error fetching application:', err);
                return res.status(500).json({ error: 'Failed to fetch application' });
            }

            if (!applications || applications.length === 0) {
                return res.status(404).json({ error: 'Application not found' });
            }

            const application = applications[0];

            // Verify that the logged-in user is the employer who posted the job
            if (application.job_owner_id !== employerId) {
                return res.status(403).json({ 
                    error: 'Not authorized to schedule interviews for this application' 
                });
            }

            // Check if interview already exists for this application
            const checkExistingSql = `
                SELECT id FROM interviews 
                WHERE application_id = ? AND status IN ('scheduled', 'rescheduled')
            `;

            db.query(checkExistingSql, [applicationId], (checkErr, existingInterviews) => {
                if (checkErr) {
                    console.error('Error checking existing interviews:', checkErr);
                    return res.status(500).json({ error: 'Failed to check existing interviews' });
                }

                if (existingInterviews && existingInterviews.length > 0) {
                    return res.status(400).json({ 
                        error: 'An interview is already scheduled for this application' 
                    });
                }

                // Create the interview
                const insertSql = `
                    INSERT INTO interviews 
                    (application_id, job_id, employer_id, student_id, scheduled_date, scheduled_time, meeting_link, notes, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
                `;

                const values = [
                    applicationId,
                    application.job_id,
                    employerId,
                    application.student_id,
                    scheduledDate,
                    scheduledTime,
                    meetingLink || null,
                    notes || null
                ];

                db.query(insertSql, values, (insertErr, result) => {
                    if (insertErr) {
                        console.error('Error creating interview:', insertErr);
                        return res.status(500).json({ error: 'Failed to schedule interview' });
                    }

                    // Create notification for the student
                    const notificationSql = `
                        INSERT INTO notifications 
                        (user_id, type, title, message, related_id, related_type)
                        VALUES (?, 'general', 'Interview Scheduled', ?, ?, 'interview')
                    `;

                    const notificationMessage = `You have been invited to an interview on ${scheduledDate} at ${scheduledTime}`;
                    const interviewId = result.insertId;
                    
                    db.query(notificationSql, [
                        application.student_id, 
                        notificationMessage, 
                        interviewId
                    ], (notifErr) => {
                        if (notifErr) {
                            console.error('Error creating notification:', notifErr);
                            // Don't fail the request if notification fails
                        }

                        res.status(201).json({
                            message: 'Interview scheduled successfully',
                            interviewId: interviewId
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error in scheduleInterview:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get interviews for employer
exports.getEmployerInterviews = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const employerId = req.user.id;

        const sql = `
            SELECT 
                i.*,
                j.title as job_title,
                u.name as student_name,
                u.email as student_email,
                u.avatar_color as student_avatar_color
            FROM interviews i
            JOIN jobs j ON i.job_id = j.id
            JOIN users u ON i.student_id = u.id
            WHERE i.employer_id = ?
            ORDER BY i.scheduled_date ASC, i.scheduled_time ASC
        `;

        db.query(sql, [employerId], (err, interviews) => {
            if (err) {
                console.error('Error fetching employer interviews:', err);
                return res.status(500).json({ error: 'Failed to fetch interviews' });
            }

            res.json({ interviews: interviews || [] });
        });
    } catch (error) {
        console.error('Error in getEmployerInterviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get interviews for student
exports.getStudentInterviews = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const studentId = req.user.id;

        const sql = `
            SELECT 
                i.*,
                j.title as job_title,
                u.name as employer_name,
                u.business_name as employer_business,
                u.email as employer_email,
                u.avatar_color as employer_avatar_color
            FROM interviews i
            JOIN jobs j ON i.job_id = j.id
            JOIN users u ON i.employer_id = u.id
            WHERE i.student_id = ?
            ORDER BY i.scheduled_date ASC, i.scheduled_time ASC
        `;

        db.query(sql, [studentId], (err, interviews) => {
            if (err) {
                console.error('Error fetching student interviews:', err);
                return res.status(500).json({ error: 'Failed to fetch interviews' });
            }

            res.json({ interviews: interviews || [] });
        });
    } catch (error) {
        console.error('Error in getStudentInterviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update interview status
exports.updateInterviewStatus = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const { interviewId } = req.params;
        const { status, notes } = req.body;
        const userId = req.user.id;

        // Validate status
        const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Verify user is part of the interview (employer or student)
        const checkSql = `
            SELECT employer_id, student_id 
            FROM interviews 
            WHERE id = ?
        `;

        db.query(checkSql, [interviewId], (err, interviews) => {
            if (err) {
                console.error('Error fetching interview:', err);
                return res.status(500).json({ error: 'Failed to fetch interview' });
            }

            if (!interviews || interviews.length === 0) {
                return res.status(404).json({ error: 'Interview not found' });
            }

            const interview = interviews[0];
            
            if (interview.employer_id !== userId && interview.student_id !== userId) {
                return res.status(403).json({ 
                    error: 'Not authorized to update this interview' 
                });
            }

            // Update interview
            const updateSql = `
                UPDATE interviews 
                SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            db.query(updateSql, [status, notes, interviewId], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating interview:', updateErr);
                    return res.status(500).json({ error: 'Failed to update interview' });
                }

                res.json({ message: 'Interview updated successfully' });
            });
        });
    } catch (error) {
        console.error('Error in updateInterviewStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reschedule interview
exports.rescheduleInterview = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const { interviewId } = req.params;
        const { scheduledDate, scheduledTime, meetingLink, notes } = req.body;
        const userId = req.user.id;

        if (!scheduledDate || !scheduledTime) {
            return res.status(400).json({ 
                error: 'Date and time are required for rescheduling' 
            });
        }

        // Verify user is the employer
        const checkSql = `
            SELECT employer_id, student_id 
            FROM interviews 
            WHERE id = ?
        `;

        db.query(checkSql, [interviewId], (err, interviews) => {
            if (err) {
                console.error('Error fetching interview:', err);
                return res.status(500).json({ error: 'Failed to fetch interview' });
            }

            if (!interviews || interviews.length === 0) {
                return res.status(404).json({ error: 'Interview not found' });
            }

            const interview = interviews[0];
            
            if (interview.employer_id !== userId) {
                return res.status(403).json({ 
                    error: 'Only the employer can reschedule the interview' 
                });
            }

            // Update interview with new schedule
            const updateSql = `
                UPDATE interviews 
                SET scheduled_date = ?, 
                    scheduled_time = ?, 
                    meeting_link = COALESCE(?, meeting_link),
                    notes = COALESCE(?, notes),
                    status = 'rescheduled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            db.query(updateSql, [scheduledDate, scheduledTime, meetingLink, notes, interviewId], (updateErr) => {
                if (updateErr) {
                    console.error('Error rescheduling interview:', updateErr);
                    return res.status(500).json({ error: 'Failed to reschedule interview' });
                }

                // Create notification for the student
                const notificationSql = `
                    INSERT INTO notifications 
                    (user_id, type, title, message, related_id, related_type)
                    VALUES (?, 'general', 'Interview Rescheduled', ?, ?, 'application')
                `;

                const notificationMessage = `Your interview has been rescheduled to ${scheduledDate} at ${scheduledTime}`;
                
                db.query(notificationSql, [interview.student_id, notificationMessage, interviewId], (notifErr) => {
                    if (notifErr) {
                        console.error('Error creating notification:', notifErr);
                    }

                    res.json({ message: 'Interview rescheduled successfully' });
                });
            });
        });
    } catch (error) {
        console.error('Error in rescheduleInterview:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get upcoming interviews (next 7 days)
exports.getUpcomingInterviews = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const userId = req.user.id;

        console.log('Fetching upcoming interviews for user:', userId);

        // Fetch interviews where user is EITHER employer OR student
        const sql = `
            SELECT 
                i.*,
                j.title as job_title,
                CASE 
                    WHEN i.employer_id = ? THEN u_student.name
                    ELSE u_employer.name
                END as other_party_name,
                CASE 
                    WHEN i.employer_id = ? THEN u_student.email
                    ELSE u_employer.email
                END as other_party_email,
                CASE 
                    WHEN i.employer_id = ? THEN u_student.avatar_color
                    ELSE u_employer.avatar_color
                END as other_party_avatar_color,
                CASE 
                    WHEN i.employer_id = ? THEN u_employer.business_name
                    ELSE NULL
                END as employer_business
            FROM interviews i
            JOIN jobs j ON i.job_id = j.id
            LEFT JOIN users u_student ON i.student_id = u_student.id
            LEFT JOIN users u_employer ON i.employer_id = u_employer.id
            WHERE (i.employer_id = ? OR i.student_id = ?)
                AND i.status IN ('scheduled', 'rescheduled')
            ORDER BY i.scheduled_date ASC, i.scheduled_time ASC
        `;

        db.query(sql, [userId, userId, userId, userId, userId, userId], (err, interviews) => {
            if (err) {
                console.error('Error fetching upcoming interviews:', err);
                return res.status(500).json({ error: 'Failed to fetch upcoming interviews' });
            }
            
            res.json({ interviews: interviews || [] });
        });
    } catch (error) {
        console.error('Error in getUpcomingInterviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Debug function to get all interviews
exports.getAllInterviewsDebug = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const sql = `
            SELECT 
                i.*,
                j.title as job_title,
                s.name as student_name,
                e.name as employer_name
            FROM interviews i
            LEFT JOIN jobs j ON i.job_id = j.id
            LEFT JOIN users s ON i.student_id = s.id
            LEFT JOIN users e ON i.employer_id = e.id
            ORDER BY i.created_at DESC
        `;

        db.query(sql, (err, interviews) => {
            if (err) {
                console.error('Error fetching all interviews:', err);
                return res.status(500).json({ error: 'Failed to fetch interviews' });
            }

            res.json({ interviews: interviews || [], count: interviews.length });
        });
    } catch (error) {
        console.error('Error in getAllInterviewsDebug:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reschedule an interview (employer only)
exports.rescheduleInterview = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const { interviewId } = req.params;
        const { scheduledDate, scheduledTime, meetingLink, notes } = req.body;
        const employerId = req.user.id;

        // Validate required fields
        if (!scheduledDate || !scheduledTime) {
            return res.status(400).json({ 
                error: 'Date and time are required' 
            });
        }

        // Verify the interview belongs to this employer
        const checkSql = 'SELECT * FROM interviews WHERE id = ? AND employer_id = ?';
        
        db.query(checkSql, [interviewId, employerId], (err, interviews) => {
            if (err) {
                console.error('Error checking interview:', err);
                return res.status(500).json({ error: 'Failed to check interview' });
            }

            if (!interviews || interviews.length === 0) {
                return res.status(404).json({ error: 'Interview not found or unauthorized' });
            }

            // Update the interview
            const updateSql = `
                UPDATE interviews 
                SET scheduled_date = ?, scheduled_time = ?, meeting_link = ?, notes = ?, status = 'rescheduled'
                WHERE id = ?
            `;

            db.query(updateSql, [scheduledDate, scheduledTime, meetingLink || null, notes || null, interviewId], (updateErr) => {
                if (updateErr) {
                    console.error('Error rescheduling interview:', updateErr);
                    return res.status(500).json({ error: 'Failed to reschedule interview' });
                }

                res.json({ message: 'Interview rescheduled successfully' });
            });
        });
    } catch (error) {
        console.error('Error in rescheduleInterview:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark interview as completed (employer only)
exports.completeInterview = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const { interviewId } = req.params;
        const employerId = req.user.id;

        // Verify the interview belongs to this employer
        const checkSql = 'SELECT * FROM interviews WHERE id = ? AND employer_id = ?';
        
        db.query(checkSql, [interviewId, employerId], (err, interviews) => {
            if (err) {
                console.error('Error checking interview:', err);
                return res.status(500).json({ error: 'Failed to check interview' });
            }

            if (!interviews || interviews.length === 0) {
                return res.status(404).json({ error: 'Interview not found or unauthorized' });
            }

            // Update the interview status to completed
            const updateSql = 'UPDATE interviews SET status = ? WHERE id = ?';

            db.query(updateSql, ['completed', interviewId], (updateErr) => {
                if (updateErr) {
                    console.error('Error completing interview:', updateErr);
                    return res.status(500).json({ error: 'Failed to complete interview' });
                }

                res.json({ message: 'Interview marked as completed' });
            });
        });
    } catch (error) {
        console.error('Error in completeInterview:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
