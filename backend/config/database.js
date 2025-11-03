const mysql = require('mysql');

// Parse database configuration from JAWSDB_URL or individual env vars
let DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME;

if (process.env.JAWSDB_URL) {
    // Parse JawsDB URL for Heroku
    try {
        const url = new URL(process.env.JAWSDB_URL);
        DB_HOST = url.hostname;
        DB_PORT = Number(url.port) || 3306;
        DB_USER = url.username;
        DB_PASS = url.password;
        DB_NAME = url.pathname.slice(1); // remove leading slash
        console.log('Parsed JawsDB URL successfully');
    } catch (err) {
        console.error('Failed to parse JAWSDB_URL:', err);
        // Fallback to prevent crash
        DB_HOST = '127.0.0.1';
        DB_PORT = 3306;
        DB_USER = 'root';
        DB_PASS = '';
        DB_NAME = 'studentgigs';
    }
} else {
    // Use individual environment variables (for local development)
    DB_HOST = process.env.DB_HOST || '127.0.0.1';
    DB_PORT = Number(process.env.DB_PORT || 3306);
    DB_USER = process.env.DB_USER || 'root';
    DB_PASS = process.env.DB_PASS || '';
    DB_NAME = process.env.DB_NAME || 'studentgigs';
}

// Export db connection (will be set after initialization)
let db = null;

// Admin pool without database selected so we can create the database if needed
const adminPool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
});

// Helper to check DB connectivity
function checkDbConnected() {
    return new Promise((resolve) => {
        if (!db) return resolve(false);
        db.getConnection((err, connection) => {
            if (err) {
                console.error('DB getConnection error:', err && err.code ? `${err.code} - ${err.address || ''}:${err.port || DB_PORT}` : err);
                return resolve(false);
            }
            connection.ping((pingErr) => {
                if (pingErr) console.error('DB ping error:', pingErr);
                connection.release();
                resolve(!pingErr);
            });
        });
    });
}

// Initialize database and tables
async function initDatabase() {
    try {
        // Skip database creation for JawsDB (database already exists and user lacks CREATE DATABASE privilege)
        if (process.env.JAWSDB_URL) {
            console.log('Using JawsDB - skipping database creation');
        } else {
            // Create database if missing (local development only)
            await new Promise((resolve, reject) => {
                adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``, (err) => {
                    if (err) return reject(err);
                    console.log('Database created/verified');
                    resolve();
                });
            });
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
                    console.error('Failed to get connection for table creation:', err);
                    return reject(err);
                }
                console.log('Successfully connected to database for table creation');
                connection.release();
                resolve();
            });
        });

        // Create users table
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
            
            tablePool.query(createTableSql, (err) => {
                if (err) {
                    console.error('Failed to create users table:', err.message, err.code);
                    return reject(err);
                }
                console.log('Users table created/verified');
                resolve();
            });
        });

        // Create jobs table with additional fields
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
                    work_location VARCHAR(100),
                    student_count VARCHAR(50),
                    weekly_hours VARCHAR(50),
                    start_date DATE NULL,
                    experience_level VARCHAR(50),
                    required_skills JSON NULL,
                    preferred_majors JSON NULL,
                    languages JSON NULL,
                    budget_type VARCHAR(50),
                    hourly_rate_min DECIMAL(10,2),
                    hourly_rate_max DECIMAL(10,2),
                    fixed_budget DECIMAL(10,2),
                    payment_schedule VARCHAR(100),
                    status ENUM('open', 'in_progress', 'pending_completion', 'completed') NOT NULL DEFAULT 'open',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at),
                    INDEX idx_category (category)
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
                    work_location VARCHAR(100),
                    student_count VARCHAR(50),
                    weekly_hours VARCHAR(50),
                    start_date DATE NULL,
                    experience_level VARCHAR(50),
                    required_skills JSON NULL,
                    preferred_majors JSON NULL,
                    languages JSON NULL,
                    budget_type VARCHAR(50),
                    hourly_rate_min DECIMAL(10,2),
                    hourly_rate_max DECIMAL(10,2),
                    fixed_budget DECIMAL(10,2),
                    payment_schedule VARCHAR(100),
                    status ENUM('open', 'in_progress', 'pending_completion', 'completed') NOT NULL DEFAULT 'open',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at),
                    INDEX idx_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
            
            tablePool.query(createJobsSql, (err) => {
                if (err) {
                    console.error('Failed to create jobs table:', err.message, err.code);
                    return reject(err);
                }
                console.log('Jobs table created/verified');
                resolve();
            });
        });

        // Create applications table
        await new Promise((resolve, reject) => {
            const createApplicationsSql = process.env.JAWSDB_URL
                ? `CREATE TABLE IF NOT EXISTS applications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    job_id INT NOT NULL,
                    user_id INT NOT NULL,
                    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
                    cover_letter TEXT NULL,
                    resume_url VARCHAR(500) NULL,
                    portfolio_url VARCHAR(500) NULL,
                    availability VARCHAR(255) NULL,
                    expected_rate VARCHAR(100) NULL,
                    motivation TEXT NULL,
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
                    resume_url VARCHAR(500) NULL,
                    portfolio_url VARCHAR(500) NULL,
                    availability VARCHAR(255) NULL,
                    expected_rate VARCHAR(100) NULL,
                    motivation TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES \`${DB_NAME}\`.jobs(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_application (job_id, user_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_job_id (job_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
            
            tablePool.query(createApplicationsSql, (err) => {
                if (err) {
                    console.error('Failed to create applications table:', err.message, err.code);
                    return reject(err);
                }
                console.log('Applications table created/verified');
                resolve();
            });
        });

        // Add missing columns to applications table if they don't exist
        await new Promise((resolve, reject) => {
            const columnsToAdd = [
                { name: 'resume_url', definition: 'VARCHAR(500) NULL', after: 'cover_letter' },
                { name: 'portfolio_url', definition: 'VARCHAR(500) NULL', after: 'resume_url' },
                { name: 'availability', definition: 'VARCHAR(255) NULL', after: 'portfolio_url' },
                { name: 'expected_rate', definition: 'VARCHAR(100) NULL', after: 'availability' },
                { name: 'motivation', definition: 'TEXT NULL', after: 'expected_rate' }
            ];

            const tableName = process.env.JAWSDB_URL ? 'applications' : `\`${DB_NAME}\`.applications`;
            
            // Check which columns exist
            const checkColumns = `SHOW COLUMNS FROM ${tableName}`;
            tablePool.query(checkColumns, (err, columns) => {
                if (err) {
                    console.error('Error checking columns:', err);
                    return reject(err);
                }

                const existingColumns = columns.map(col => col.Field);
                const alterPromises = [];

                columnsToAdd.forEach(col => {
                    if (!existingColumns.includes(col.name)) {
                        const alterQuery = `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.definition} AFTER ${col.after}`;
                        alterPromises.push(
                            new Promise((resolveAlter, rejectAlter) => {
                                tablePool.query(alterQuery, (alterErr) => {
                                    if (alterErr) {
                                        console.error(`Warning: Could not add column ${col.name}:`, alterErr.message);
                                        resolveAlter(); // Continue even if one fails
                                    } else {
                                        console.log(`Added column ${col.name} to applications table`);
                                        resolveAlter();
                                    }
                                });
                            })
                        );
                    }
                });

                if (alterPromises.length === 0) {
                    console.log('All application columns exist');
                    resolve();
                } else {
                    Promise.all(alterPromises).then(() => {
                        console.log('Applications table columns verified/updated');
                        resolve();
                    });
                }
            });
        });

        // Add status column to jobs table if it doesn't exist
        await new Promise((resolve, reject) => {
            const tableName = process.env.JAWSDB_URL ? 'jobs' : `\`${DB_NAME}\`.jobs`;
            
            // Check if status column exists
            const checkColumns = `SHOW COLUMNS FROM ${tableName}`;
            tablePool.query(checkColumns, (err, columns) => {
                if (err) {
                    console.error('Error checking jobs columns:', err);
                    return reject(err);
                }

                const existingColumns = columns.map(col => col.Field);
                
                if (!existingColumns.includes('status')) {
                    const alterQuery = `ALTER TABLE ${tableName} ADD COLUMN status ENUM('open', 'in_progress', 'pending_completion', 'completed') NOT NULL DEFAULT 'open' AFTER payment_schedule`;
                    tablePool.query(alterQuery, (alterErr) => {
                        if (alterErr) {
                            console.error('Warning: Could not add status column to jobs:', alterErr.message);
                            resolve(); // Continue even if fails
                        } else {
                            console.log('Added status column to jobs table');
                            resolve();
                        }
                    });
                } else {
                    // Check if status column needs to be updated to include 'pending_completion'
                    const checkEnumSql = `SHOW COLUMNS FROM ${tableName} WHERE Field = 'status'`;
                    tablePool.query(checkEnumSql, (enumErr, enumResults) => {
                        if (enumErr || !enumResults.length) {
                            console.log('Jobs status column already exists');
                            return resolve();
                        }
                        
                        const enumType = enumResults[0].Type;
                        // Check if 'pending_completion' is already in the ENUM
                        if (!enumType.includes('pending_completion')) {
                            const modifyEnumSql = `ALTER TABLE ${tableName} MODIFY COLUMN status ENUM('open', 'in_progress', 'pending_completion', 'completed') NOT NULL DEFAULT 'open'`;
                            tablePool.query(modifyEnumSql, (modifyErr) => {
                                if (modifyErr) {
                                    console.error('Warning: Could not update status ENUM:', modifyErr.message);
                                } else {
                                    console.log('Updated status column ENUM to include pending_completion');
                                }
                                resolve();
                            });
                        } else {
                            console.log('Jobs status column already includes pending_completion');
                            resolve();
                        }
                    });
                }
            });
        });

        // Create conversations table
        await new Promise((resolve, reject) => {
            const createConversationsSql = process.env.JAWSDB_URL
                ? `CREATE TABLE IF NOT EXISTS conversations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    employer_id INT NOT NULL,
                    job_id INT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
                    UNIQUE KEY unique_conversation (student_id, employer_id),
                    INDEX idx_student_id (student_id),
                    INDEX idx_employer_id (employer_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
                : `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.conversations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    employer_id INT NOT NULL,
                    job_id INT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE,
                    FOREIGN KEY (employer_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE,
                    FOREIGN KEY (job_id) REFERENCES \`${DB_NAME}\`.jobs(id) ON DELETE SET NULL,
                    UNIQUE KEY unique_conversation (student_id, employer_id),
                    INDEX idx_student_id (student_id),
                    INDEX idx_employer_id (employer_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
            
            tablePool.query(createConversationsSql, (err) => {
                if (err) {
                    console.error('Failed to create conversations table:', err.message, err.code);
                    return reject(err);
                }
                console.log('Conversations table created/verified');
                resolve();
            });
        });

        // Create messages table
        await new Promise((resolve, reject) => {
            const createMessagesSql = process.env.JAWSDB_URL
                ? `CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    conversation_id INT NOT NULL,
                    sender_id INT NOT NULL,
                    content TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_conversation_id (conversation_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
                : `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    conversation_id INT NOT NULL,
                    sender_id INT NOT NULL,
                    content TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES \`${DB_NAME}\`.conversations(id) ON DELETE CASCADE,
                    FOREIGN KEY (sender_id) REFERENCES \`${DB_NAME}\`.users(id) ON DELETE CASCADE,
                    INDEX idx_conversation_id (conversation_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
            
            tablePool.query(createMessagesSql, (err) => {
                if (err) {
                    console.error('Failed to create messages table:', err.message, err.code);
                    return reject(err);
                }
                console.log('Messages table created/verified');
                resolve();
            });
        });

        console.log('Database initialization complete');
        
        // Close the temporary pool for JawsDB
        if (process.env.JAWSDB_URL && tablePool !== adminPool) {
            tablePool.end();
        }
    } catch (err) {
        console.error('Database initialization error:', err.message || err);
        console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState
        });
    }
}

// Initialize database and create connection pool
async function initAndConnect() {
    console.log('Starting database initialization...');
    console.log(`DB Config: host=${DB_HOST} port=${DB_PORT} user=${DB_USER} db=${DB_NAME}`);
    console.log(`Using JawsDB: ${!!process.env.JAWSDB_URL}`);
    
    await initDatabase();

    // Create the actual db pool now that database exists
    db = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 15000,
        acquireTimeout: 15000,
        timeout: 15000
    });

    // Add error handler for the pool
    db.on('error', (err) => {
        console.error('Database pool error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was lost');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused');
        }
    });

    const ok = await checkDbConnected().catch((err) => {
        console.error('Database connection check failed:', err);
        return false;
    });
    console.log(`MySQL connected: ${ok} (host=${DB_HOST} port=${DB_PORT} user=${DB_USER})`);
    
    return db;
}

// Getter for database connection
function getDb() {
    return db;
}

module.exports = {
    initAndConnect,
    getDb,
    checkDbConnected,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_NAME
};
