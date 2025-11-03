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

                console.log('Fetched profile for user', userId, '- bio from DB:', profile ? profile.bio : 'no profile');

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

    // Check if profile exists
    db.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error checking profile:', err);
            return res.status(500).json({ error: 'db error' });
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
                    return res.status(500).json({ error: 'db error' });
                }

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

            db.query(updateSql, values, (updateErr, result) => {
                if (updateErr) {
                    console.error('Error updating profile:', updateErr);
                    return res.status(500).json({ error: 'db error' });
                }

                console.log('UPDATE result:', result);
                console.log('Rows affected:', result.affectedRows);
                res.json({ message: 'profile updated successfully' });
            });
        }
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

module.exports = {
    getProfile,
    getMyProfile,
    updateProfile,
    incrementProfileViews,
    checkBioInDatabase
};
