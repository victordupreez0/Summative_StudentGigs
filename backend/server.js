const express = require('express');
const cors = require('cors');
const path = require('path');
const { initAndConnect, getDb, checkDbConnected } = require('./config/database');

const app = express();
const port = process.env.PORT || 4000;

// Configure CORS
const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:4000', // Backend port
    process.env.FRONTEND_URL, // Custom frontend URL if set
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true);
        // For Heroku, allow same origin
        if (allowedOrigins.indexOf(origin) !== -1 || (origin && origin.includes('.herokuapp.com'))) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all in production for now
        }
    },
    credentials: true
}));

app.use(express.json());

// Serve static files from frontend build (must be after JSON parser, before routes)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Health check endpoints
app.get('/api/ping', (req, res) => {
    res.json({ ok: true });
});

app.get('/api/dbstatus', async (req, res) => {
    const connected = await checkDbConnected();
    res.json({ db_connected: connected });
});

// Debug endpoint for table structure
app.get('/api/debug/table-structure', (req, res) => {
    const db = getDb();
    if (!db) return res.status(503).json({ error: 'database not available' });
    
    db.query('SHOW COLUMNS FROM users', [], (err, columns) => {
        if (err) {
            console.error('Error getting table structure:', err);
            return res.status(500).json({ error: err.message, code: err.code });
        }
        
        const columnNames = columns.map(c => c.Field);
        const requiredColumns = ['name', 'email', 'password'];
        const optionalColumns = ['user_type', 'business_name', 'profile_picture', 'avatar_color', 'created_at'];
        
        const missingRequired = requiredColumns.filter(col => !columnNames.includes(col));
        const missingOptional = optionalColumns.filter(col => !columnNames.includes(col));
        
        res.json({ 
            table: 'users',
            columns: columns.map(c => ({
                field: c.Field,
                type: c.Type,
                null: c.Null,
                key: c.Key,
                default: c.Default
            })),
            analysis: {
                total_columns: columns.length,
                column_names: columnNames,
                missing_required: missingRequired,
                missing_optional: missingOptional,
                status: missingRequired.length === 0 ? 'OK - Can register users' : 'ERROR - Missing required columns',
                recommendation: missingOptional.length > 0 
                    ? `Add missing columns: ${missingOptional.join(', ')}`
                    : 'Table structure is complete!'
            }
        });
    });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Mount routes
app.use('/api', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all handler for React Router (must be last)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Initialize database and start server
async function startServer() {
    try {
        await initAndConnect();
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Failed to initialize database:', err);
        console.log('Server will start anyway, but routes using DB will fail');
    }

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServer();
