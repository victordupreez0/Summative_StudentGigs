-- Run this in your MySQL client (phpMyAdmin / CLI) to create the database and users table
CREATE DATABASE IF NOT EXISTS student_gigs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_gigs;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
