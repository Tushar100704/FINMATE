# 🗄️ Supabase Database Setup - Step by Step

## The Problem You Encountered

When you tried to run the full `supabase_schema.sql` file, Supabase showed:
```
Error: EXPLAIN only works on a single SQL statement. Please select just one query to analyze.
```

This happens because Supabase SQL Editor doesn't like running many CREATE statements at once.

## ✅ Solution: Run in 4 Steps

I've split the schema into 4 smaller files that you'll run one by one.

---

## 📋 Step-by-Step Instructions

### **Step 1: Create Tables** (2 minutes)

1. Go to your Supabase dashboard: https://variyhojoxqqacjsooso.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query** button
4. Open the file: `supabase_schema_step1_tables.sql`
5. Copy ALL the contents
6. Paste into the SQL Editor
7. Click **RUN** button (bottom right)
8. Wait for "Success. No rows returned" message ✅

**What this creates:**
- `users` table
- `transactions` table
- `budgets` table
- `families` table
- `family_members` table

**Verify:** Go to **Table Editor** (left sidebar) and you should see all 5 tables listed.

---

### **Step 2: Create Indexes** (1 minute)

1. In SQL Editor, click **New Query** again
2. Open the file: `supabase_schema_step2_indexes.sql`
3. Copy ALL the contents
4. Paste into the SQL Editor
5. Click **RUN**
6. Wait for "Success. No rows returned" ✅

**What this creates:**
- Performance indexes on frequently queried columns
- Speeds up sync operations

---

### **Step 3: Enable Security (RLS Policies)** (2 minutes)

1. In SQL Editor, click **New Query** again
2. Open the file: `supabase_schema_step3_rls.sql`
3. Copy ALL the contents
4. Paste into the SQL Editor
5. Click **RUN**
6. Wait for "Success. No rows returned" ✅

**What this creates:**
- Row Level Security (RLS) enabled on all tables
- Security policies so users only see their own data
- Family sharing policies

**Verify:** Go to **Authentication** → **Policies** and you should see policies for each table.

---

### **Step 4: Create Triggers & Enable Realtime** (1 minute)

1. In SQL Editor, click **New Query** again
2. Open the file: `supabase_schema_step4_triggers.sql`
3. Copy ALL the contents
4. Paste into the SQL Editor
5. Click **RUN**
6. Wait for "Success. No rows returned" ✅

**What this creates:**
- Automatic timestamp updates (updated_at)
- Real-time subscriptions for family sharing

---

## ✅ Verification Checklist

After completing all 4 steps, verify everything is set up:

### Check Tables
1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ users
   - ✅ transactions
   - ✅ budgets
   - ✅ families
   - ✅ family_members

### Check RLS Policies
1. Go to **Authentication** → **Policies**
2. Each table should have multiple policies listed
3. RLS should be "Enabled" (green badge)

### Check Realtime
1. Go to **Database** → **Replication**
2. You should see `transactions`, `budgets`, `family_members` in the publication

---

## 🎉 You're Done!

Once all 4 steps are complete, your Supabase database is fully configured and ready to sync with the FinMate app!

**What happens next:**
- The app will automatically sync data to these tables
- Users will only see their own data (RLS enforced)
- Family members will see shared transactions in real-time
- All data is backed up to the cloud

---

## 🐛 Troubleshooting

### "relation already exists" error
- This means the table was already created
- It's safe to ignore
- Continue to the next step

### "permission denied" error
- Make sure you're logged into the correct Supabase project
- Verify you have admin access

### "syntax error" error
- Make sure you copied the ENTIRE file contents
- Don't modify the SQL
- Try copying again

### Still having issues?
- Delete all tables in Table Editor
- Start from Step 1 again
- Make sure to run steps in order (1 → 2 → 3 → 4)

---

## 📁 File Reference

- `supabase_schema_step1_tables.sql` - Creates all tables
- `supabase_schema_step2_indexes.sql` - Creates performance indexes
- `supabase_schema_step3_rls.sql` - Enables security policies
- `supabase_schema_step4_triggers.sql` - Creates triggers and realtime

**Original file:** `supabase_schema.sql` (contains everything, but doesn't work in Supabase SQL Editor)
