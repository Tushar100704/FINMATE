-- TEMPORARY FIX: Disable RLS on users table for testing
-- This allows signup to work while we debug the RLS policy issue
-- WARNING: Only use this for development/testing!

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
