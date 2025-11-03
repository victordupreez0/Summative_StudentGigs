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
    
    // Check messages for job 11 (3D Printing)
    db.query(`
        SELECT m.id, m.conversation_id, m.sender_id, m.content, m.created_at,
               c.student_id, c.employer_id, c.job_id,
               j.title as job_title
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        JOIN jobs j ON c.job_id = j.id
        WHERE j.title LIKE '%3D Printing%'
        ORDER BY m.created_at DESC
        LIMIT 10
    `, (err, messages) => {
        if (err) {
            console.error('Messages query error:', err);
        } else {
            console.log('Messages for 3D Printing job:');
            messages.forEach(msg => {
                console.log(`\nID: ${msg.id}, Sender: ${msg.sender_id}`);
                console.log(`Content: ${msg.content}`);
                console.log(`Created: ${msg.created_at}`);
                console.log(`Conversation: student_id=${msg.student_id}, employer_id=${msg.employer_id}, job_id=${msg.job_id}`);
            });
        }
        
        db.end();
    });
});
