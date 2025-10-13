const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')))
app.use(cors())
app.use(express.json())

// default to 4000 to match frontend dev server expectations
const port = process.env.PORT || 4000

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

// Use a pool so the server stays up even if DB is down initially.
const DB_HOST = process.env.DB_HOST || '127.0.0.1'
const DB_PORT = Number(process.env.DB_PORT || 3306)
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || ''
const DB_NAME = process.env.DB_NAME || 'studentgigs'

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
})

// Attempt to create the database and users table if the connected DB user has privileges.
async function initDatabase() {
    try {
        // create database if missing
        await new Promise((resolve, reject) => {
            adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`` , (err) => {
                if (err) return reject(err)
                resolve()
            })
        })

                // ensure users table exists in the selected database. Use fully-qualified name via adminPool
                await new Promise((resolve, reject) => {
                        const createTableSql = `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.users (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            email VARCHAR(255) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
                        adminPool.query(createTableSql, (err) => {
                                if (err) return reject(err)
                                resolve()
                        })
                })

                        // ensure jobs table exists
                        await new Promise((resolve, reject) => {
                                const createJobsSql = `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.jobs (
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
                                    FOREIGN KEY (user_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE
                                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
                                adminPool.query(createJobsSql, (err) => {
                                        if (err) return reject(err)
                                        resolve()
                                })
                        })

        console.log('Database and users table ensured')
    } catch (err) {
        console.warn('Could not create database/table automatically:', err && err.code ? err.code : err)
    }
}

// Try to initialize DB schema (best-effort) and then create the db pool
async function initAndStart() {
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
    })

    const ok = await checkDbConnected().catch(() => false)
    console.log(`MySQL connected: ${ok} (host=${DB_HOST} port=${DB_PORT} user=${DB_USER})`)

    // start the server only after DB init attempt
    app.listen(port, ()=>{
        console.log(`listening on port ${port}`)
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

    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' })

    try {
        db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'db error' })
            if (results.length) return res.status(409).json({ error: 'email already registered' })

            const hashed = await bcrypt.hash(password, 10)
            db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed], (err2, result2) => {
                if (err2) return res.status(500).json({ error: 'db insert error' })
                const createdId = result2.insertId
                const token = jwt.sign({ id: createdId, email, name }, JWT_SECRET, { expiresIn: '1h' })
                res.status(201).json({ id: createdId, name, email, token })
            })
        })
    } catch (err) {
        console.error(err)
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

    db.query('SELECT id, name, email, password FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'db error' })
        if (!results.length) return res.status(401).json({ error: 'invalid credentials' })

        const user = results[0]
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ error: 'invalid credentials' })

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' })
        res.json({ id: user.id, name: user.name, email: user.email, token })
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
    db.query('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'db error' })
        if (!results.length) return res.status(404).json({ error: 'user not found' })
        res.json(results[0])
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

// Catch-all handler for React Router (must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

// NOTE: server is started from initAndStart or the catch block above
