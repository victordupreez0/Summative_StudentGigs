const { getDb } = require('../config/database');

// Get all reviews
exports.getAllReviews = (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  const sql = 'SELECT * FROM reviews ORDER BY created_at DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    res.json(results);
  });
};

// Create a new review
exports.createReview = (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  const { name, title, content, rating } = req.body;
  const userId = req.user.id;

  // Validation
  if (!name || !title || !content || !rating) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const sql = 'INSERT INTO reviews (user_id, name, title, content, rating) VALUES (?, ?, ?, ?, ?)';
  const values = [userId, name, title, content, rating];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error creating review:', err);
      return res.status(500).json({ error: 'Failed to create review' });
    }

    // Fetch the newly created review
    const selectSql = 'SELECT * FROM reviews WHERE id = ?';
    db.query(selectSql, [result.insertId], (err, rows) => {
      if (err) {
        console.error('Error fetching new review:', err);
        return res.status(500).json({ error: 'Review created but failed to fetch' });
      }
      res.status(201).json(rows[0]);
    });
  });
};

// Get reviews by user
exports.getUserReviews = (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  const userId = req.params.userId || req.user.id;
  
  const sql = 'SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC';
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch user reviews' });
    }
    res.json(results);
  });
};

// Delete a review (user can only delete their own)
exports.deleteReview = (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  const reviewId = req.params.id;
  const userId = req.user.id;

  // First check if the review belongs to the user
  const checkSql = 'SELECT * FROM reviews WHERE id = ? AND user_id = ?';
  db.query(checkSql, [reviewId, userId], (err, results) => {
    if (err) {
      console.error('Error checking review ownership:', err);
      return res.status(500).json({ error: 'Failed to verify review ownership' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Delete the review
    const deleteSql = 'DELETE FROM reviews WHERE id = ?';
    db.query(deleteSql, [reviewId], (err) => {
      if (err) {
        console.error('Error deleting review:', err);
        return res.status(500).json({ error: 'Failed to delete review' });
      }
      res.json({ message: 'Review deleted successfully' });
    });
  });
};
