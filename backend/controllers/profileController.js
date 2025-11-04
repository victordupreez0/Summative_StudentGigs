const { getDb } = require('../config/database');

// Get public profile for a user (can be viewed by anyone)
function getProfile(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.params.userId;

    // Get basic user info
    const userSql = 'SELECT id, name, email, user_type, profile_picture, avatar_color, created_at FROM users WHERE id = ?';
    
    db.query(userSql, [userId], (err, users) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (!users.length) {
            return res.status(404).json({ error: 'user not found' });
        }

        const user = users[0];

        // Get student profile if exists
        const profileSql = `
            SELECT 
                bio, phone, location, education, work_experience, skills, 
                languages, portfolio, certifications, social_links, 
                availability, profile_views, created_at, updated_at
            FROM student_profiles 
            WHERE user_id = ?
        `;

        db.query(profileSql, [userId], (profileErr, profiles) => {
            if (profileErr) {
                console.error('Error fetching profile:', profileErr);
                return res.status(500).json({ error: 'db error' });
            }

            // Get completed jobs stats (just count accepted applications for now)
            const statsSql = `
                SELECT 
                    COUNT(*) as totalCompletedJobs
                FROM applications 
                WHERE user_id = ? AND status = 'accepted'
            `;

            db.query(statsSql, [userId], (statsErr, stats) => {
                if (statsErr) {
                    console.error('Error fetching stats:', statsErr);
                    return res.status(500).json({ error: 'db error' });
                }

                const profile = profiles.length ? profiles[0] : null;
                const userStats = stats[0] || { totalCompletedJobs: 0 };

                // Parse JSON fields
                if (profile) {
                    try {
                        profile.education = profile.education ? JSON.parse(profile.education) : [];
                        profile.work_experience = profile.work_experience ? JSON.parse(profile.work_experience) : [];
                        profile.skills = profile.skills ? JSON.parse(profile.skills) : [];
                        profile.languages = profile.languages ? JSON.parse(profile.languages) : [];
                        profile.portfolio = profile.portfolio ? JSON.parse(profile.portfolio) : [];
                        profile.certifications = profile.certifications ? JSON.parse(profile.certifications) : [];
                        profile.social_links = profile.social_links ? JSON.parse(profile.social_links) : {};
                        profile.availability = profile.availability ? JSON.parse(profile.availability) : {};
                    } catch (parseErr) {
                        console.error('Error parsing JSON fields:', parseErr);
                    }
                }

                res.json({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        userType: user.user_type,
                        profilePicture: user.profile_picture,
                        avatarColor: user.avatar_color,
                        memberSince: user.created_at
                    },
                    profile: profile || {
                        bio: null,
                        phone: null,
                        location: null,
                        education: [],
                        work_experience: [],
                        skills: [],
                        languages: [],
                        portfolio: [],
                        certifications: [],
                        social_links: {},
                        availability: {},
                        profile_views: 0
                    },
                    stats: {
                        totalCompletedJobs: userStats.totalCompletedJobs || 0,
                        averageRating: 0,
                        totalEarnings: 0
                    }
                });
            });
        });
    });
}

// Get own profile (requires authentication)
function getMyProfile(req, res) {
    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    // Reuse getProfile logic but with authenticated user's ID
    req.params.userId = userId;
    getProfile(req, res);
}

// Update profile (requires authentication)
function updateProfile(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const {
        bio,
        phone,
        location,
        education,
        work_experience,
        skills,
        languages,
        portfolio,
        certifications,
        social_links,
        availability
    } = req.body;

    console.log('Received profile update for user', userId);
    console.log('Bio value:', bio);
    console.log('Phone value:', phone);
    console.log('Work experience:', work_experience);

    // Check if profile exists
    db.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error checking profile:', err);
            console.error('SQL Error code:', err.code);
            console.error('SQL Error message:', err.sqlMessage);
            
            // Check if table doesn't exist
            if (err.code === 'ER_NO_SUCH_TABLE') {
                return res.status(500).json({ 
                    error: 'student_profiles table does not exist. Please run database migrations.' 
                });
            }
            
            return res.status(500).json({ error: 'db error', details: err.message });
        }

        const profileData = {
            bio: bio || null,
            phone: phone || null,
            location: location || null,
            education: education ? JSON.stringify(education) : null,
            work_experience: work_experience ? JSON.stringify(work_experience) : null,
            skills: skills ? JSON.stringify(skills) : null,
            languages: languages ? JSON.stringify(languages) : null,
            portfolio: portfolio ? JSON.stringify(portfolio) : null,
            certifications: certifications ? JSON.stringify(certifications) : null,
            social_links: social_links ? JSON.stringify(social_links) : null,
            availability: availability ? JSON.stringify(availability) : null
        };

        if (results.length === 0) {
            // Insert new profile
            const insertSql = `
                INSERT INTO student_profiles 
                (user_id, bio, phone, location, education, work_experience, skills, languages, 
                 portfolio, certifications, social_links, availability)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                userId,
                profileData.bio,
                profileData.phone,
                profileData.location,
                profileData.education,
                profileData.work_experience,
                profileData.skills,
                profileData.languages,
                profileData.portfolio,
                profileData.certifications,
                profileData.social_links,
                profileData.availability
            ];

            db.query(insertSql, values, (insertErr) => {
                if (insertErr) {
                    console.error('Error creating profile:', insertErr);
                    console.error('Insert error code:', insertErr.code);
                    console.error('Insert error message:', insertErr.sqlMessage);
                    return res.status(500).json({ 
                        error: 'Failed to create profile', 
                        details: insertErr.message 
                    });
                }

                console.log('Profile created successfully for user', userId);
                res.json({ message: 'profile created successfully' });
            });
        } else {
            // Update existing profile
            const updateSql = `
                UPDATE student_profiles 
                SET bio = ?, phone = ?, location = ?, education = ?, work_experience = ?, 
                    skills = ?, languages = ?, portfolio = ?, certifications = ?, 
                    social_links = ?, availability = ?
                WHERE user_id = ?
            `;

            const values = [
                profileData.bio,
                profileData.phone,
                profileData.location,
                profileData.education,
                profileData.work_experience,
                profileData.skills,
                profileData.languages,
                profileData.portfolio,
                profileData.certifications,
                profileData.social_links,
                profileData.availability,
                userId
            ];

            console.log('Executing UPDATE with bio:', profileData.bio);
            console.log('UPDATE SQL values:', values.map((v, i) => 
                typeof v === 'string' && v.length > 50 ? v.substring(0, 50) + '...' : v
            ));

            db.query(updateSql, values, (updateErr, result) => {
                if (updateErr) {
                    console.error('Error updating profile:', updateErr);
                    console.error('Update error code:', updateErr.code);
                    console.error('Update error message:', updateErr.sqlMessage);
                    return res.status(500).json({ 
                        error: 'Failed to update profile', 
                        details: updateErr.message 
                    });
                }

                console.log('UPDATE result:', result);
                console.log('Rows affected:', result.affectedRows);
                console.log('Profile updated successfully for user', userId);
                res.json({ message: 'profile updated successfully', rowsAffected: result.affectedRows });
            });
        }
    });
}

// Update profile picture
function updateProfilePicture(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    const { profilePicture } = req.body;

    if (!profilePicture) {
        return res.status(400).json({ error: 'profilePicture is required' });
    }

    // Update the profile_picture in users table
    const sql = 'UPDATE users SET profile_picture = ? WHERE id = ?';
    
    db.query(sql, [profilePicture, userId], (err, result) => {
        if (err) {
            console.error('Error updating profile picture:', err);
            return res.status(500).json({ error: 'db error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'user not found' });
        }

        res.json({ 
            message: 'profile picture updated successfully',
            profilePicture 
        });
    });
}

// Increment profile views
function incrementProfileViews(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.params.userId;

    // Don't increment if viewing own profile
    const viewerId = req.user ? req.user.id : null;
    if (viewerId && parseInt(viewerId) === parseInt(userId)) {
        return res.json({ message: 'own profile, not incrementing' });
    }

    const sql = 'UPDATE student_profiles SET profile_views = profile_views + 1 WHERE user_id = ?';
    db.query(sql, [userId], (err) => {
        if (err) {
            console.error('Error incrementing views:', err);
            return res.status(500).json({ error: 'db error' });
        }
        res.json({ message: 'view incremented' });
    });
}

// Debug endpoint to check raw database values
function checkBioInDatabase(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'not authenticated' });
    }

    const sql = 'SELECT bio, phone FROM student_profiles WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error checking bio:', err);
            return res.status(500).json({ error: 'db error' });
        }
        
        console.log('Raw DB query result:', results);
        res.json({ 
            userId,
            result: results.length ? results[0] : null 
        });
    });
}

// Get employer dashboard stats
function getEmployerStats(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(500).json({ error: 'db not initialized' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'invalid token payload' });
    }

    // Get date for monthly stats (first day of current month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayString = firstDayOfMonth.toISOString().split('T')[0];

    // Query for all stats
    const statsSql = `
        SELECT 
            (SELECT COUNT(*) FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = ?) as totalApplications,
            (SELECT COUNT(*) FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = ? AND a.created_at >= ?) as monthlyApplications,
            (SELECT COUNT(*) FROM jobs WHERE employer_id = ? AND status = 'open') as activeJobs,
            (SELECT COUNT(*) FROM jobs WHERE employer_id = ? AND status = 'open' AND created_at >= ?) as monthlyActiveJobs,
            (SELECT COUNT(*) FROM interviews i
             JOIN jobs j ON i.job_id = j.id
             WHERE j.employer_id = ?) as totalInterviews,
            (SELECT COUNT(*) FROM interviews i
             JOIN jobs j ON i.job_id = j.id
             WHERE j.employer_id = ? AND i.created_at >= ?) as monthlyInterviews,
            (SELECT COUNT(*) FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = ? AND a.status = 'accepted') as totalHires,
            (SELECT COUNT(*) FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE j.employer_id = ? AND a.status = 'accepted' AND a.updated_at >= ?) as monthlyHires
    `;

    db.query(statsSql, [
        userId, // totalApplications
        userId, firstDayString, // monthlyApplications
        userId, // activeJobs
        userId, firstDayString, // monthlyActiveJobs
        userId, // totalInterviews
        userId, firstDayString, // monthlyInterviews
        userId, // totalHires
        userId, firstDayString // monthlyHires
    ], (err, results) => {
        if (err) {
            console.error('Error fetching employer stats:', err);
            return res.status(500).json({ error: 'db error' });
        }

        const stats = results[0] || {};
        
        res.json({
            overall: {
                applications: stats.totalApplications || 0,
                activeJobs: stats.activeJobs || 0,
                interviews: stats.totalInterviews || 0,
                hires: stats.totalHires || 0
            },
            monthly: {
                applications: stats.monthlyApplications || 0,
                activeJobs: stats.monthlyActiveJobs || 0,
                interviews: stats.monthlyInterviews || 0,
                hires: stats.monthlyHires || 0
            }
        });
    });
}

module.exports = {
    getProfile,
    getMyProfile,
    updateProfile,
    updateProfilePicture,
    incrementProfileViews,
    checkBioInDatabase,
    getEmployerStats
};
