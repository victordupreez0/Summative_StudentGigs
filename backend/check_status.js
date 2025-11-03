const mysql = require('mysql');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'studentgigs'
});

db.connect((err) => {
    if (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
    
    console.log('Connected to database');
    
    // Check the status column
    db.query('SHOW COLUMNS FROM jobs WHERE Field = "status"', (err, results) => {
        if (err) {
            console.error('Query error:', err);
        } else {
            console.log('\nStatus column definition:');
            console.log(JSON.stringify(results, null, 2));
        }
        
        // Check recent jobs
        db.query('SELECT id, title, status, created_at FROM jobs ORDER BY id DESC LIMIT 5', (err, jobs) => {
            if (err) {
                console.error('Jobs query error:', err);
            } else {
                console.log('\nRecent jobs:');
                console.table(jobs);
            }
            
            db.end();
        });
    });
});
