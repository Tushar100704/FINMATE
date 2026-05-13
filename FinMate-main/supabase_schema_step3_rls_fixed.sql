-- FinMate Supabase Database Schema - Step 3: Enable RLS and Create Policies
-- Run this after Step 2 completes successfully
-- This version drops existing policies first to avoid conflicts

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid "already exists" errors)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view family shared transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Family admins can update family" ON families;
DROP POLICY IF EXISTS "Family admins can delete family" ON families;
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;
DROP POLICY IF EXISTS "Users can join families" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view family shared transactions"
  ON transactions FOR SELECT
  USING (
    is_shared = true AND 
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid()::text = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid()::text = user_id);

-- Families policies
CREATE POLICY "Users can view families they belong to"
  ON families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create families"
  ON families FOR INSERT
  WITH CHECK (auth.uid()::text = created_by_user_id);

CREATE POLICY "Family admins can update family"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Family admins can delete family"
  ON families FOR DELETE
  USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- Family members policies
CREATE POLICY "Users can view family members of their families"
  ON family_members FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can join families"
  ON family_members FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Family admins can manage members"
  ON family_members FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );
