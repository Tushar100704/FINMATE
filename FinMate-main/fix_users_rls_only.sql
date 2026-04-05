-- Quick fix for users table RLS to allow signup
-- Run this in Supabase SQL Editor

-- First, drop the existing policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new policy that allows signup
-- This allows any authenticated user to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- Verify it worked
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Users can insert own profile';
