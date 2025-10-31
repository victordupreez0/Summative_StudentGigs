-- Migration to add extended job fields
-- Run this SQL script to update your existing jobs table

USE studentgigs;

-- Add new columns to jobs table
ALTER TABLE jobs
ADD COLUMN work_location VARCHAR(100) AFTER education_levels,
ADD COLUMN student_count VARCHAR(50) AFTER work_location,
ADD COLUMN weekly_hours VARCHAR(50) AFTER student_count,
ADD COLUMN start_date DATE NULL AFTER weekly_hours,
ADD COLUMN experience_level VARCHAR(50) AFTER start_date,
ADD COLUMN required_skills JSON NULL AFTER experience_level,
ADD COLUMN preferred_majors JSON NULL AFTER required_skills,
ADD COLUMN languages JSON NULL AFTER preferred_majors,
ADD COLUMN budget_type VARCHAR(50) AFTER languages,
ADD COLUMN hourly_rate_min DECIMAL(10,2) AFTER budget_type,
ADD COLUMN hourly_rate_max DECIMAL(10,2) AFTER hourly_rate_min,
ADD COLUMN fixed_budget DECIMAL(10,2) AFTER hourly_rate_max,
ADD COLUMN payment_schedule VARCHAR(100) AFTER fixed_budget;

-- Add indexes for better performance
ALTER TABLE jobs
ADD INDEX idx_category (category),
ADD INDEX idx_work_location (work_location),
ADD INDEX idx_experience_level (experience_level);

-- Verify changes
SHOW COLUMNS FROM jobs;

SELECT 'Migration completed successfully!' AS status;
