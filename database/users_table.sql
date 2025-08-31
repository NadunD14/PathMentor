-- Create users table for storing additional user information
-- This table is linked to Supabase auth.users via user_id (UUID)

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create an index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at when a row is modified
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own data (for registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional: Allow service role to read all users (for admin functions)
-- CREATE POLICY "Service role can read all users" ON users
--     FOR SELECT USING (auth.role() = 'service_role');
