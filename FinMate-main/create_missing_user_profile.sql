-- Create missing user profile in Supabase
-- This user exists in Supabase Auth but not in the users table
-- Run this in Supabase SQL Editor

-- Insert the missing user profile
INSERT INTO users (id, email, name, login_method, created_at, updated_at)
VALUES (
  'cba852fa-65e9-4e1d-ad10-48c5ac85eba4',
  'officialmukundchavan@gmail.com',
  'Mukund',
  'email',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, email, name, login_method, created_at 
FROM users 
WHERE id = 'cba852fa-65e9-4e1d-ad10-48c5ac85eba4';
