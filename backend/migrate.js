const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// Database configuration
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'studentgigs';

console.log('Starting database migration...');
console.log(`Connecting to: ${DB_HOST}:${DB_PORT} as ${DB_USER}`);

const db = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
    console.log('Connected to database successfully');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_job_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Migration failed:', err.message);
            db.end();
            process.exit(1);
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\nTable structure updated. You can now use all extended job fields.');
        
        // Show final column list
        db.query('SHOW COLUMNS FROM jobs', (err, columns) => {
            if (!err) {
                console.log('\nCurrent jobs table columns:');
                columns.forEach(col => {
                    console.log(`  - ${col.Field} (${col.Type})`);
                });
            }
            db.end();
            process.exit(0);
        });
    });
});
