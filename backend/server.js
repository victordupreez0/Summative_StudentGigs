const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()

// default to 4000 to match frontend dev server expectations
const port = process.env.PORT || 4000

// Configure CORS to allow H// simple ping for smoke tests
app.get('/api/ping', (req, res) => {
    res.json({ ok: true })
})

// db status endpoint
app.get('/api/dbstatus', async (req, res) => {
    const connected = await checkDbConnected()
    res.json({ db_connected: connected })
})

// db table structure endpoint (for debugging)
app.get('/api/debug/table-structure', (req, res) => {
    if (!db) return res.status(503).json({ error: 'database not available' })
    
    db.query('SHOW COLUMNS FROM users', [], (err, columns) => {
        if (err) {
            console.error('Error getting table structure:', err)
            return res.status(500).json({ error: err.message, code: err.code })
        }
        res.json({ 
            table: 'users',
            columns: columns.map(c => ({
                field: c.Field,
                type: c.Type,
                null: c.Null,
                key: c.Key,
                default: c.Default
            }))
        })
    })
})

// Configure CORS to allow Heroku frontend and local development
const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:4000', // Backend port
    process.env.FRONTEND_URL, // Custom frontend URL if set
].filter(Boolean) // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true)
        // For Heroku, allow same origin
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.herokuapp.com')) {
            callback(null, true)
        } else {
            console.log('CORS blocked origin:', origin)
            callback(null, true) // Allow all in production for now
        }
    },
    credentials: true
}))

app.use(express.json())

// Serve static files from frontend build (must be after JSON parser, before routes)
app.use(express.static(path.join(__dirname, '../frontend/dist')))

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

// Parse database configuration from JAWSDB_URL or individual env vars
let DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME

if (process.env.JAWSDB_URL) {
    // Parse JawsDB URL for Heroku
    try {
        const url = new URL(process.env.JAWSDB_URL)
        DB_HOST = url.hostname
        DB_PORT = Number(url.port) || 3306
        DB_USER = url.username
        DB_PASS = url.password
        DB_NAME = url.pathname.slice(1) // remove leading slash
        console.log('Parsed JawsDB URL successfully')
    } catch (err) {
        console.error('Failed to parse JAWSDB_URL:', err)
        // Fallback to prevent crash
        DB_HOST = '127.0.0.1'
        DB_PORT = 3306
        DB_USER = 'root'
        DB_PASS = ''
        DB_NAME = 'studentgigs'
    }
} else {
    // Use individual environment variables (for local development)
    DB_HOST = process.env.DB_HOST || '127.0.0.1'
    DB_PORT = Number(process.env.DB_PORT || 3306)
    DB_USER = process.env.DB_USER || 'root'
    DB_PASS = process.env.DB_PASS || ''
    DB_NAME = process.env.DB_NAME || 'studentgigs'
}

// `db` will be created after we ensure the database exists. Start as null.
let db = null

// admin pool without database selected so we can create the database if needed
const adminPool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000,
})

// Attempt to create the database and users table if the connected DB user has privileges.
async function initDatabase() {
    try {
        // Skip database creation for JawsDB (database already exists and user lacks CREATE DATABASE privilege)
        if (process.env.JAWSDB_URL) {
            console.log('Using JawsDB - skipping database creation')
        } else {
            // create database if missing (local development only)
            await new Promise((resolve, reject) => {
                adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`` , (err) => {
                    if (err) return reject(err)
                    console.log('Database created/verified')
                    resolve()
                })
            })
        }

        // Use a pool connected to the database for table creation
        const tablePool = process.env.JAWSDB_URL ? mysql.createPool({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASS,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 2,
            queueLimit: 0,
        }) : adminPool;

        // Test connection first
        await new Promise((resolve, reject) => {
            tablePool.getConnection((err, connection) => {
                if (err) {
                    console.error('Failed to get connection for table creation:', err)
                    return reject(err)
                }
                console.log('Successfully connected to database for table creation')
                connection.release()
                resolve()
            })
        })

        // ensure users table exists (no fully-qualified name for JawsDB)
        await new Promise((resolve, reject) => {
            const createTableSql = process.env.JAWSDB_URL
                ? `CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    user_type ENUM('student', 'employer') NOT NULL DEFAULT 'student',
                    business_name VARCHAR(255) NULL,
                    profile_picture TEXT NULL,
                    avatar_color VARCHAR(7) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
                : `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    user_type ENUM('student', 'employer') NOT NULL DEFAULT 'student',
                    business_name VARCHAR(255) NULL,
                    profile_picture TEXT NULL,
                    avatar_color VARCHAR(7) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
            
            tablePool.query(createTableSql, (err) => {
                if (err) {
                    console.error('Failed to create users table:', err.message, err.code)
                    return reject(err)
                }
                console.log('Users table created/verified')
                resolve()
            })
        })
        
        // Skip ALTER TABLE for JawsDB (columns should be in CREATE TABLE above)
        if (!process.env.JAWSDB_URL) {
            await new Promise((resolve) => {
                const alterTableSql = `ALTER TABLE \`${DB_NAME}\`.users 
                    ADD COLUMN IF NOT EXISTS user_type ENUM('student', 'employer') NOT NULL DEFAULT 'student' AFTER password,
                    ADD COLUMN IF NOT EXISTS business_name VARCHAR(255) NULL AFTER user_type,
                    ADD COLUMN IF NOT EXISTS profile_picture TEXT NULL AFTER business_name,
                    ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(7) NULL AFTER profile_picture;`
                adminPool.query(alterTableSql, (err) => {
                    if (err) console.log('ALTER TABLE skipped (columns may already exist)')
                    resolve()
                })
            })
        }

        // ensure jobs table exists
        await new Promise((resolve, reject) => {
            const createJobsSql = process.env.JAWSDB_URL
                ? `CREATE TABLE IF NOT EXISTS jobs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    project_type VARCHAR(100),
                    project_length VARCHAR(100),
                    category VARCHAR(255),
                    tags JSON NULL,
                    education_levels JSON NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
                : `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.jobs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    project_type VARCHAR(100),
                    project_length VARCHAR(100),
                    category VARCHAR(255),
                    tags JSON NULL,
                    education_levels JSON NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
            
            tablePool.query(createJobsSql, (err) => {
                if (err) {
                    console.error('Failed to create jobs table:', err.message, err.code)
                    return reject(err)
                }
                console.log('Jobs table created/verified')
                resolve()
            })
        })

        // ensure applications table exists
        await new Promise((resolve, reject) => {
            const createApplicationsSql = process.env.JAWSDB_URL
                ? `CREATE TABLE IF NOT EXISTS applications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    job_id INT NOT NULL,
                    user_id INT NOT NULL,
                    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
                    cover_letter TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_application (job_id, user_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_job_id (job_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
                : `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.applications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    job_id INT NOT NULL,
                    user_id INT NOT NULL,
                    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
                    cover_letter TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES \`${DB_NAME}\`.jobs(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_application (job_id, user_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_job_id (job_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
            
            tablePool.query(createApplicationsSql, (err) => {
                if (err) {
                    console.error('Failed to create applications table:', err.message, err.code)
                    return reject(err)
                }
                console.log('Applications table created/verified')
                resolve()
            })
        })

        console.log('Database initialization complete')
        
        // Close the temporary pool for JawsDB
        if (process.env.JAWSDB_URL && tablePool !== adminPool) {
            tablePool.end()
        }
    } catch (err) {
        console.error('Database initialization error:', err.message || err)
        console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState
        })
    }
}

// Try to initialize DB schema (best-effort) and then create the db pool
async function initAndStart() {
    console.log('Starting database initialization...')
    console.log(`DB Config: host=${DB_HOST} port=${DB_PORT} user=${DB_USER} db=${DB_NAME}`)
    console.log(`Using JawsDB: ${!!process.env.JAWSDB_URL}`)
    
    await initDatabase()

    // create the actual db pool now that database exists
    db = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 15000, // 15 seconds
        acquireTimeout: 15000,
        timeout: 15000
    })

    // Add error handler for the pool
    db.on('error', (err) => {
        console.error('Database pool error:', err)
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was lost')
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections')
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused')
        }
    })

    const ok = await checkDbConnected().catch((err) => {
        console.error('Database connection check failed:', err)
        return false
    })
    console.log(`MySQL connected: ${ok} (host=${DB_HOST} port=${DB_PORT} user=${DB_USER})`)

    // start the server only after DB init attempt
    app.listen(port, ()=>{
        console.log(`Server listening on port ${port}`)
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
}

// helper to check DB connectivity with error details (available to routes)
function checkDbConnected() {
    return new Promise((resolve) => {
        if (!db) return resolve(false)
        db.getConnection((err, connection) => {
            if (err) {
                console.error('DB getConnection error:', err && err.code ? `${err.code} - ${err.address || ''}:${err.port || DB_PORT}` : err)
                return resolve(false)
            }
            connection.ping((pingErr) => {
                if (pingErr) console.error('DB ping error:', pingErr)
                connection.release()
                resolve(!pingErr)
            })
        })
    })
}

// begin init and start
initAndStart().catch((err) => {
    console.error('Failed to initialize database/server', err)
    // still start server so health endpoints are available, but routes using db will fail until manual restart
    app.listen(port, ()=>{
        console.log(`listening on port ${port} (db init failed)`)
    })
})

// simple ping for smoke tests
app.get('/api/ping', (req, res) => {
    res.json({ ok: true })
})

// db status endpoint
app.get('/api/dbstatus', async (req, res) => {
    const ok = await checkDbConnected()
    res.json({ db_connected: ok })
})

// shared register handler (supports frontend fields firstName/lastName)
async function handleRegister(req, res) {
    const body = req.body || {}
    // support either `name` or `firstName`+`lastName` from the frontend
    const name = body.name || [body.firstName, body.lastName].filter(Boolean).join(' ').trim()
    const email = body.email
    const password = body.password
    // Map frontend userType to database user_type: 'work' -> 'student', 'hire' -> 'employer'
    const userType = body.userType === 'hire' ? 'employer' : 'student'
    const businessName = body.businessName || null
    const profilePicture = body.profilePicture || null
    const avatarColor = body.avatarColor || null

    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' })

    try {
        // Check if database connection is available
        if (!db) {
            console.error('Database not initialized')
            return res.status(503).json({ error: 'database not available' })
        }

        db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error checking email:', err.message, err.code)
                return res.status(500).json({ error: 'db error: ' + (err.code || 'unknown') })
            }
            if (results.length) return res.status(409).json({ error: 'email already registered' })

            const hashed = await bcrypt.hash(password, 10)
            
            // First, check what columns exist in the users table
            db.query('SHOW COLUMNS FROM users', [], (errCols, columns) => {
                if (errCols) {
                    console.error('Error checking table structure:', errCols.message)
                }
                
                // Log available columns for debugging
                const availableColumns = columns ? columns.map(c => c.Field) : []
                console.log('Available columns in users table:', availableColumns)
                
                // Build INSERT query based on available columns
                const hasUserType = !columns || columns.some(c => c.Field === 'user_type')
                const hasBusinessName = !columns || columns.some(c => c.Field === 'business_name')
                const hasProfilePicture = !columns || columns.some(c => c.Field === 'profile_picture')
                const hasAvatarColor = !columns || columns.some(c => c.Field === 'avatar_color')
                
                // Build dynamic INSERT query
                let fields = ['name', 'email', 'password']
                let values = [name, email, hashed]
                let placeholders = ['?', '?', '?']
                
                if (hasUserType) {
                    fields.push('user_type')
                    values.push(userType)
                    placeholders.push('?')
                }
                if (hasBusinessName) {
                    fields.push('business_name')
                    values.push(businessName)
                    placeholders.push('?')
                }
                if (hasProfilePicture) {
                    fields.push('profile_picture')
                    values.push(profilePicture)
                    placeholders.push('?')
                }
                if (hasAvatarColor) {
                    fields.push('avatar_color')
                    values.push(avatarColor)
                    placeholders.push('?')
                }
                
                const insertSql = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`
                console.log('INSERT query:', insertSql)
                
                db.query(insertSql, values, (err2, result2) => {
                    if (err2) {
                        console.error('Database insert error:', err2.message, err2.code, err2.sqlMessage)
                        console.error('SQL State:', err2.sqlState)
                        return res.status(500).json({ error: 'db insert error: ' + (err2.code || 'unknown') })
                    }
                    const createdId = result2.insertId
                    const token = jwt.sign({ id: createdId, email, name, userType }, JWT_SECRET, { expiresIn: '1h' })
                    res.status(201).json({ id: createdId, name, email, userType, businessName, profilePicture, avatarColor, token })
                })
            })
        })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ error: 'server error' })
    }
}

// expose both old and new paths for compatibility with different frontends
app.post('/api/register', handleRegister)
app.post('/api/auth/signup', handleRegister)

// shared login handler
function handleLogin(req, res) {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    // Check if database connection is available
    if (!db) {
        console.error('Database not initialized')
        return res.status(503).json({ error: 'database not available' })
    }

    db.query('SELECT id, name, email, password, user_type, business_name, profile_picture, avatar_color FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database error in login:', err.message, err.code)
            return res.status(500).json({ error: 'db error: ' + (err.code || 'unknown') })
        }
        if (!results.length) return res.status(401).json({ error: 'invalid credentials' })

        const user = results[0]
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ error: 'invalid credentials' })

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, userType: user.user_type }, JWT_SECRET, { expiresIn: '1h' })
        res.json({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            userType: user.user_type, 
            businessName: user.business_name,
            profilePicture: user.profile_picture,
            avatarColor: user.avatar_color,
            token 
        })
    })
}

app.post('/api/login', handleLogin)
app.post('/api/auth/login', handleLogin)

// Middleware: authenticate JWT token from Authorization header
function authenticateToken(req, res, next) {
    const auth = req.headers['authorization'] || ''
    const parts = auth.split(' ')
    const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null
    if (!token) return res.status(401).json({ error: 'no token provided' })

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).json({ error: 'invalid token' })
        req.user = payload
        next()
    })
}

// protected: GET /api/profile
app.get('/api/profile', authenticateToken, (req, res) => {
    const userId = req.user && req.user.id
    if (!userId) return res.status(400).json({ error: 'invalid token payload' })
    db.query('SELECT id, name, email, user_type, business_name, profile_picture, avatar_color FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'db error' })
        if (!results.length) return res.status(404).json({ error: 'user not found' })
        const user = results[0]
        res.json({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            userType: user.user_type,
            businessName: user.business_name,
            profilePicture: user.profile_picture,
            avatarColor: user.avatar_color
        })
    })
})

// Create a job post (protected)
app.post('/api/jobs', authenticateToken, (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'invalid token payload' })

    const { title, description, projectType, projectLength, category, tags, educationLevels } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title required' })

    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : null
    const eduJson = Array.isArray(educationLevels) ? JSON.stringify(educationLevels) : null

    db.query('INSERT INTO jobs (user_id, title, description, project_type, project_length, category, tags, education_levels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, title, description, projectType, projectLength, category, tagsJson, eduJson], (err, result) => {
            if (err) return res.status(500).json({ error: 'db insert error' })
            res.status(201).json({ id: result.insertId, title, description })
        })
})

// List jobs (public) - simple listing
app.get('/api/jobs', (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    db.query('SELECT id, user_id, title, description, project_type AS projectType, project_length AS projectLength, category, tags, education_levels AS educationLevels, created_at FROM jobs ORDER BY created_at DESC LIMIT 100', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'db error' })
        // parse JSON fields
        const out = rows.map(r => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [], educationLevels: r.educationLevels ? JSON.parse(r.educationLevels) : [] }))
        res.json(out)
    })
})

// Get jobs posted by the logged-in user (protected)
app.get('/api/jobs/my-jobs', authenticateToken, (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'invalid token payload' })
    
    db.query('SELECT id, user_id, title, description, project_type AS projectType, project_length AS projectLength, category, tags, education_levels AS educationLevels, created_at FROM jobs WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'db error' })
        // parse JSON fields
        const out = rows.map(r => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [], educationLevels: r.educationLevels ? JSON.parse(r.educationLevels) : [] }))
        res.json(out)
    })
})

// Apply to a job (protected - students only)
app.post('/api/jobs/:jobId/apply', authenticateToken, (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'invalid token payload' })
    
    const jobId = req.params.jobId
    const { coverLetter } = req.body
    
    if (!jobId) return res.status(400).json({ error: 'job id required' })
    
    // Insert application (UNIQUE constraint prevents duplicate applications)
    db.query(
        'INSERT INTO applications (job_id, user_id, cover_letter, status) VALUES (?, ?, ?, ?)',
        [jobId, userId, coverLetter || null, 'pending'],
        (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'You have already applied to this job' })
                }
                console.error('Application error:', err)
                return res.status(500).json({ error: 'db error' })
            }
            res.json({ success: true, message: 'Application submitted successfully' })
        }
    )
})

// Get applications for a specific job (protected - employer only)
app.get('/api/jobs/:jobId/applications', authenticateToken, (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'invalid token payload' })
    
    const jobId = req.params.jobId
    
    // First verify the job belongs to this user
    db.query('SELECT user_id FROM jobs WHERE id = ?', [jobId], (err, jobs) => {
        if (err) return res.status(500).json({ error: 'db error' })
        if (!jobs.length) return res.status(404).json({ error: 'job not found' })
        if (jobs[0].user_id !== userId) return res.status(403).json({ error: 'unauthorized' })
        
        // Get applications with user details
        db.query(
            `SELECT a.id, a.job_id, a.user_id, a.status, a.cover_letter, a.created_at,
                    u.name, u.email, u.profile_picture, u.avatar_color
             FROM applications a
             JOIN users u ON a.user_id = u.id
             WHERE a.job_id = ?
             ORDER BY a.created_at DESC`,
            [jobId],
            (err, applications) => {
                if (err) return res.status(500).json({ error: 'db error' })
                res.json(applications)
            }
        )
    })
})

// Get all applications for all jobs by the employer (protected)
app.get('/api/applications/my-jobs', authenticateToken, (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'invalid token payload' })
    
    // Get all applications for jobs posted by this employer
    db.query(
        `SELECT a.id, a.job_id, a.user_id, a.status, a.cover_letter, a.created_at,
                u.name, u.email, u.profile_picture, u.avatar_color,
                j.title AS job_title
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN jobs j ON a.job_id = j.id
         WHERE j.user_id = ?
         ORDER BY a.created_at DESC`,
        [userId],
        (err, applications) => {
            if (err) return res.status(500).json({ error: 'db error' })
            res.json(applications)
        }
    )
})

// Get user's own applications (protected - students)
app.get('/api/applications/my-applications', authenticateToken, (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'invalid token payload' })
    
    // Get all applications by this user
    db.query(
        `SELECT a.id, a.job_id, a.user_id, a.status, a.cover_letter, a.created_at,
                j.title AS job_title, j.description, j.category
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.user_id = ?
         ORDER BY a.created_at DESC`,
        [userId],
        (err, applications) => {
            if (err) return res.status(500).json({ error: 'db error' })
            res.json(applications)
        }
    )
})

// Update application status (protected - employer only)
app.patch('/api/applications/:applicationId/status', authenticateToken, (req, res) => {
    if (!db) return res.status(500).json({ error: 'db not initialized' })
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'invalid token payload' })
    
    const applicationId = req.params.applicationId
    const { status } = req.body
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'invalid status' })
    }
    
    // Verify the application's job belongs to this employer
    db.query(
        `SELECT j.user_id FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.id = ?`,
        [applicationId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'db error' })
            if (!results.length) return res.status(404).json({ error: 'application not found' })
            if (results[0].user_id !== userId) return res.status(403).json({ error: 'unauthorized' })
            
            // Update status
            db.query(
                'UPDATE applications SET status = ? WHERE id = ?',
                [status, applicationId],
                (err) => {
                    if (err) return res.status(500).json({ error: 'db error' })
                    res.json({ success: true, message: 'Application status updated' })
                }
            )
        }
    )
})

// Catch-all handler for React Router (must be last)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

