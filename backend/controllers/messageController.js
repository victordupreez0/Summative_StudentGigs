const { getDb } = require('../config/database');

// Get all conversations for the current user
exports.getConversations = (req, res) => {
    const db = getDb();
    const userId = req.user.id;

    let query = `
        SELECT 
            c.id,
            c.student_id,
            c.employer_id,
            c.job_id,
            c.created_at,
            c.updated_at,
            CASE 
                WHEN c.student_id = ? THEN employer.name
                ELSE student.name
            END as other_user_name,
            CASE 
                WHEN c.student_id = ? THEN employer.email
                ELSE student.email
            END as other_user_email,
            CASE 
                WHEN c.student_id = ? THEN c.employer_id
                ELSE c.student_id
            END as other_user_id,
            jobs.title as job_title,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count
        FROM conversations c
        LEFT JOIN users student ON c.student_id = student.id
        LEFT JOIN users employer ON c.employer_id = employer.id
        LEFT JOIN jobs ON c.job_id = jobs.id
        WHERE (c.student_id = ? OR c.employer_id = ?)
        ORDER BY last_message_time DESC, c.updated_at DESC
    `;

    db.query(query, [userId, userId, userId, userId, userId, userId], (err, rows) => {
        if (err) {
            console.error('Error fetching conversations:', err);
            return res.status(500).json({ error: 'Failed to fetch conversations' });
        }
        res.json(rows);
    });
};

// Get messages for a specific conversation
exports.getMessages = (req, res) => {
    const db = getDb();
    const userId = req.user.id;
    const { conversationId } = req.params;

    // First verify user is part of this conversation
    db.query(
        'SELECT * FROM conversations WHERE id = ? AND (student_id = ? OR employer_id = ?)',
        [conversationId, userId, userId],
        (err, conversations) => {
            if (err) {
                console.error('Error fetching conversation:', err);
                return res.status(500).json({ error: 'Failed to fetch conversation' });
            }
            if (!conversations || conversations.length === 0) {
                return res.status(403).json({ error: 'Access denied to this conversation' });
            }

            // Get all messages for this conversation
            const query = `
                SELECT 
                    m.id,
                    m.conversation_id,
                    m.sender_id,
                    m.content,
                    m.is_read,
                    m.created_at,
                    u.name as sender_name,
                    u.email as sender_email
                FROM messages m
                LEFT JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at ASC
            `;

            db.query(query, [conversationId], (err, messages) => {
                if (err) {
                    console.error('Error fetching messages:', err);
                    return res.status(500).json({ error: 'Failed to fetch messages' });
                }

                // Mark messages as read
                db.query(
                    'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ? AND is_read = 0',
                    [conversationId, userId],
                    (err) => {
                        if (err) console.error('Error marking messages as read:', err);
                    }
                );

                res.json(messages);
            });
        }
    );
};

// Send a message
exports.sendMessage = (req, res) => {
    const db = getDb();
    const userId = req.user.id;
    const { conversationId, content } = req.body;

    if (!conversationId || !content || content.trim() === '') {
        return res.status(400).json({ error: 'Conversation ID and message content are required' });
    }

    // Verify user is part of this conversation
    db.query(
        'SELECT * FROM conversations WHERE id = ? AND (student_id = ? OR employer_id = ?)',
        [conversationId, userId, userId],
        (err, conversations) => {
            if (err) {
                console.error('Error fetching conversation:', err);
                return res.status(500).json({ error: 'Failed to verify conversation' });
            }
            if (!conversations || conversations.length === 0) {
                return res.status(403).json({ error: 'Access denied to this conversation' });
            }

            // Insert the message
            db.query(
                'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
                [conversationId, userId, content.trim()],
                function(err, result) {
                    if (err) {
                        console.error('Error sending message:', err);
                        return res.status(500).json({ error: 'Failed to send message' });
                    }

                    // Update conversation updated_at timestamp
                    db.query(
                        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [conversationId],
                        (err) => {
                            if (err) console.error('Error updating conversation:', err);
                        }
                    );

                    // Get the created message with sender info
                    db.query(
                        `SELECT 
                            m.id,
                            m.conversation_id,
                            m.sender_id,
                            m.content,
                            m.is_read,
                            m.created_at,
                            u.name as sender_name,
                            u.email as sender_email
                        FROM messages m
                        LEFT JOIN users u ON m.sender_id = u.id
                        WHERE m.id = ?`,
                        [result.insertId],
                        (err, messages) => {
                            if (err) {
                                console.error('Error fetching created message:', err);
                                return res.status(500).json({ error: 'Message sent but failed to retrieve' });
                            }
                            res.status(201).json(messages[0]);
                        }
                    );
                }
            );
        }
    );
};

// Create or get conversation
exports.createConversation = (req, res) => {
    const db = getDb();
    const userId = req.user.id;
    const userType = req.user.userType; // Changed from user_type to userType
    const { otherUserId, jobId } = req.body;

    if (!otherUserId) {
        return res.status(400).json({ error: 'Other user ID is required' });
    }

    // Verify the other user exists
    db.query('SELECT id, user_type FROM users WHERE id = ?', [otherUserId], (err, users) => {
        if (err) {
            console.error('Error fetching other user:', err);
            return res.status(500).json({ error: 'Failed to verify user' });
        }
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const otherUser = users[0];

        // Determine student and employer IDs based on user types
        let studentId, employerId;
        
        // Handle student-to-student conversations (when students post jobs)
        if (userType === 'student' && otherUser.user_type === 'student') {
            // For student-to-student, use arbitrary assignment
            // The one with lower ID becomes "student", higher ID becomes "employer" in the conversation table
            if (userId < otherUserId) {
                studentId = userId;
                employerId = otherUserId;
            } else {
                studentId = otherUserId;
                employerId = userId;
            }
        } else if (userType === 'student') {
            // Student messaging an employer
            studentId = userId;
            employerId = otherUserId;
        } else if (userType === 'employer') {
            // Employer messaging a student
            studentId = otherUserId;
            employerId = userId;
        } else {
            // Employer-to-employer (not typically needed but handle it)
            if (userId < otherUserId) {
                studentId = userId;
                employerId = otherUserId;
            } else {
                studentId = otherUserId;
                employerId = userId;
            }
        }

        // Check if conversation already exists (check both directions for student-to-student)
        const checkQuery = `
            SELECT * FROM conversations 
            WHERE (student_id = ? AND employer_id = ?) 
               OR (student_id = ? AND employer_id = ?)
        `;
        
        db.query(
            checkQuery,
            [studentId, employerId, employerId, studentId],
            (err, conversations) => {
                if (err) {
                    console.error('Error checking for existing conversation:', err);
                    return res.status(500).json({ error: 'Failed to check for conversation' });
                }

                if (conversations && conversations.length > 0) {
                    return res.json(conversations[0]);
                }

                // Create new conversation
                db.query(
                    'INSERT INTO conversations (student_id, employer_id, job_id) VALUES (?, ?, ?)',
                    [studentId, employerId, jobId || null],
                    function(err, result) {
                        if (err) {
                            console.error('Error creating conversation:', err);
                            return res.status(500).json({ error: 'Failed to create conversation' });
                        }

                        db.query(
                            'SELECT * FROM conversations WHERE id = ?',
                            [result.insertId],
                            (err, conversations) => {
                                if (err) {
                                    console.error('Error fetching created conversation:', err);
                                    return res.status(500).json({ error: 'Conversation created but failed to retrieve' });
                                }
                                res.status(201).json(conversations[0]);
                            }
                        );
                    }
                );
            }
        );
    });
};

// Get unread message count
exports.getUnreadCount = (req, res) => {
    const db = getDb();
    const userId = req.user.id;

    const query = `
        SELECT COUNT(*) as unread_count
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE (c.student_id = ? OR c.employer_id = ?)
        AND m.sender_id != ?
        AND m.is_read = 0
    `;

    db.query(query, [userId, userId, userId], (err, rows) => {
        if (err) {
            console.error('Error fetching unread count:', err);
            return res.status(500).json({ error: 'Failed to fetch unread count' });
        }
        res.json({ unread_count: rows[0].unread_count || 0 });
    });
};
