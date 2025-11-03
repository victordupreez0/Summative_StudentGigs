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
    
    console.log('Connected to database\n');
    
    // Check messages related to job 22 (which has pending_completion status)
    db.query(`
        SELECT m.id, m.conversation_id, m.sender_id, m.content, m.created_at,
               c.student_id, c.employer_id, c.job_id
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE c.job_id = 22
        ORDER BY m.created_at DESC
        LIMIT 10
    `, (err, messages) => {
        if (err) {
            console.error('Messages query error:', err);
        } else {
            console.log('Messages for job 22 (pending_completion):');
            console.table(messages);
        }
        
        db.end();
    });
});
