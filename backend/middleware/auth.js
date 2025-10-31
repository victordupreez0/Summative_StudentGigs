const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Middleware: authenticate JWT token from Authorization header
function authenticateToken(req, res, next) {
    const auth = req.headers['authorization'] || '';
    const parts = auth.split(' ');
    const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
    
    if (!token) {
        return res.status(401).json({ error: 'no token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: 'invalid token' });
        }
        req.user = payload;
        next();
    });
}

// Middleware: check if user is an employer
function requireEmployer(req, res, next) {
    if (!req.user || req.user.userType !== 'employer') {
        return res.status(403).json({ error: 'employer access required' });
    }
    next();
}

// Middleware: check if user is a student
function requireStudent(req, res, next) {
    if (!req.user || req.user.userType !== 'student') {
        return res.status(403).json({ error: 'student access required' });
    }
    next();
}

module.exports = {
    authenticateToken,
    requireEmployer,
    requireStudent,
    JWT_SECRET
};
