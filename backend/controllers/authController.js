const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

// Register a new user
async function register(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const body = req.body || {};
    // Support either `name` or `firstName`+`lastName` from the frontend
    const name = body.name || [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
    const email = body.email;
    const password = body.password;
    // Map frontend userType to database user_type: 'work' -> 'student', 'hire' -> 'employer'
    const userType = body.userType === 'hire' ? 'employer' : 'student';
    const businessName = body.businessName || null;
    const profilePicture = body.profilePicture || null;
    const avatarColor = body.avatarColor || null;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email and password required' });
    }

    try {
        // Check if email already exists
        db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error checking email:', err.message, err.code, err.sqlMessage);
                return res.status(500).json({ 
                    error: 'db error: ' + (err.code || 'unknown'),
                    details: err.sqlMessage
                });
            }
            
            if (results.length) {
                return res.status(409).json({ error: 'email already registered' });
            }

            const hashed = await bcrypt.hash(password, 10);
            
            // Insert user with all fields
            const sql = 'INSERT INTO users (name, email, password, user_type, business_name, profile_picture, avatar_color) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [name, email, hashed, userType, businessName, profilePicture, avatarColor];
            
            db.query(sql, values, (err2, result) => {
                if (err2) {
                    console.error('Database insert error:', err2.message, err2.code, err2.sqlMessage);
                    return res.status(500).json({ error: 'db insert error: ' + (err2.code || 'unknown') });
                }
                
                const createdId = result.insertId;
                const token = jwt.sign({ id: createdId, email, name, userType }, JWT_SECRET, { expiresIn: '24h' });
                
                console.log('User created successfully (id:', createdId, ', type:', userType, ')');
                res.status(201).json({ 
                    id: createdId, 
                    name, 
                    email, 
                    userType, 
                    businessName, 
                    profilePicture, 
                    avatarColor, 
                    token 
                });
            });
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'server error' });
    }
}

// Login user
function login(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
    }

    db.query('SELECT id, name, email, password, user_type, business_name, profile_picture, avatar_color FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database error in login:', err.message, err.code, err.sqlMessage);
            return res.status(500).json({ 
                error: 'db error: ' + (err.code || 'unknown'),
                details: err.sqlMessage
            });
        }
        
        if (!results.length) {
            return res.status(401).json({ error: 'invalid credentials' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ error: 'invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, userType: user.user_type }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            userType: user.user_type, 
            businessName: user.business_name,
            profilePicture: user.profile_picture,
            avatarColor: user.avatar_color,
            token 
        });
    });
}

// Get user profile
function getProfile(req, res) {
    const db = getDb();
    if (!db) {
        return res.status(503).json({ error: 'database not available' });
    }

    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(400).json({ error: 'invalid token payload' });
    }
    
    db.query('SELECT id, name, email, user_type, business_name, profile_picture, avatar_color FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Database error in profile:', err.message, err.code, err.sqlMessage);
            return res.status(500).json({ error: 'db error: ' + (err.code || 'unknown') });
        }
        
        if (!results.length) {
            return res.status(404).json({ error: 'user not found' });
        }
        
        const user = results[0];
        res.json({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            userType: user.user_type,
            businessName: user.business_name,
            profilePicture: user.profile_picture,
            avatarColor: user.avatar_color
        });
    });
}

module.exports = {
    register,
    login,
    getProfile
};
