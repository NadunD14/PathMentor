-- Initialize PathMentor Database
-- This script sets up the basic database structure

-- Create database (this is usually done outside the script)
-- CREATE DATABASE pathmentor;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    difficulty VARCHAR(20) DEFAULT 'medium',
    explanation TEXT,
    correct_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    question_id INTEGER REFERENCES questions(id),
    content TEXT NOT NULL,
    is_correct BOOLEAN,
    response_time INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES categories(id),
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    time_spent INTEGER DEFAULT 0, -- in minutes
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    progress DECIMAL(5,2) DEFAULT 0.00,
    estimated_duration INTEGER, -- in hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    preferred_difficulty VARCHAR(20) DEFAULT 'medium',
    learning_goals TEXT[],
    daily_goal_minutes INTEGER DEFAULT 30,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name, description, icon) VALUES
('Python Fundamentals', 'Basic Python programming concepts', 'python'),
('Data Structures', 'Arrays, lists, trees, and graphs', 'structure'),
('Algorithms', 'Sorting, searching, and optimization', 'algorithm'),
('Web Development', 'Frontend and backend web technologies', 'web'),
('Machine Learning', 'ML algorithms and data science', 'ml'),
('Database Design', 'SQL and database optimization', 'database')
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO questions (text, category_id, difficulty, explanation, correct_answer) VALUES
('What is a Python list?', 1, 'easy', 'Lists are ordered collections of items in Python', 'An ordered collection of items'),
('How do you reverse a string in Python?', 1, 'medium', 'Use slicing with [::-1] or the reversed() function', 'string[::-1]'),
('What is the time complexity of binary search?', 3, 'hard', 'Binary search has logarithmic time complexity', 'O(log n)')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_question ON user_answers(user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_category ON user_progress(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON learning_paths(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
