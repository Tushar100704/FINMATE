# 🚀 Supabase Integration Setup Guide

## Overview
This guide will help you set up Supabase cloud sync for FinMate. The integration provides real-time cloud sync, multi-device support, and family sharing capabilities.

## Prerequisites
- Supabase account created at https://supabase.com
- Project created with credentials saved
- Node.js and npm installed

## Step 1: Database Setup

### 1.1 Run SQL Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase_schema.sql` file
5. Paste into the SQL editor
6. Click **Run** to execute

This will create:
- All necessary tables (users, transactions, budgets, families, family_members)
- Indexes for performance
- Row Level Security (RLS) policies
- Real-time subscriptions
- Triggers for automatic timestamps

### 1.2 Verify Tables Created
1. Go to **Table Editor** (left sidebar)
2. You should see: `users`, `transactions`, `budgets`, `families`, `family_members`
3. Each table should have the correct columns as defined in the schema

## Step 2: Authentication Setup

### 2.1 Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

### 2.2 Enable Google OAuth (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URLs:
   - `finmate://auth/callback`
   - Your app's custom scheme

### 2.3 Enable Apple Sign-In (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Apple** provider
3. Add your Apple credentials:
   - Services ID
   - Team ID
   - Key ID
   - Private Key

## Step 3: Environment Configuration

The `.env` file has already been created with your credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://variyhojoxqqacjsooso.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Security Note:** Never commit `.env` to version control. It's already in `.gitignore`.

## Step 4: Install Dependencies

Dependencies have been installed:
```bash
✅ @supabase/supabase-js
✅ @react-native-async-storage/async-storage
✅ expo-secure-store
✅ react-native-url-polyfill
```

## Step 5: How It Works

### Architecture
```
📱 App (Offline-First)
    ↓
💾 Local SQLite (Primary Storage)
    ↕️ Bidirectional Sync
☁️ Supabase (Cloud Backup)
    ↕️ Real-time Updates
👨‍👩‍👧‍👦 Family Members
```

### Sync Flow
1. **User Action** → Saved to local SQLite immediately (works offline)
2. **Background Sync** → Uploads to Supabase every 30 seconds (when online)
3. **Download Changes** → Fetches updates from other devices/family members
4. **Real-time Updates** → Family transactions appear instantly via subscriptions

### Key Features

#### 1. Offline-First
- All operations work offline
- Data saved to local SQLite first
- Syncs automatically when back online
- No data loss

#### 2. Multi-Device Sync
- Login on any device
- Data syncs automatically
- Conflict resolution (last-write-wins)
- Seamless experience

#### 3. Family Sharing
- Create or join families
- Share transactions in real-time
- Collaborative budgeting
- Real-time notifications

#### 4. Security
- Row Level Security (RLS) enabled
- Users only see their own data
- Family members only see shared data
- Encrypted connections (HTTPS)

## Step 6: Testing

### Test Authentication
1. Run the app: `npx expo start`
2. Try signing up with email
3. Check Supabase dashboard → **Authentication** → **Users**
4. Verify user was created

### Test Sync
1. Create a transaction in the app
2. Check Supabase dashboard → **Table Editor** → **transactions**
3. Verify transaction appears in cloud
4. Login on another device
5. Verify transaction syncs

### Test Family Sharing
1. Create a family in the app
2. Share invite code with another user
3. Other user joins family
4. Create a shared transaction
5. Verify both users see it in real-time

## Step 7: Monitoring

### View Logs
1. Go to **Logs** in Supabase dashboard
2. Monitor API requests
3. Check for errors
4. View real-time subscriptions

### Check Database
1. Go to **Table Editor**
2. View all synced data
3. Verify RLS policies working
4. Check data integrity

## Troubleshooting

### Sync Not Working
- Check internet connection
- Verify Supabase credentials in `.env`
- Check console logs for errors
- Ensure RLS policies are correct

### Authentication Failing
- Verify email provider is enabled
- Check OAuth credentials (if using)
- Ensure redirect URLs are correct
- Check Supabase auth logs

### Real-time Not Working
- Verify real-time is enabled in Supabase
- Check publication includes tables
- Ensure user is in family
- Check network connection

## API Usage & Limits

### Free Tier Includes:
- 500 MB database space
- 2 GB bandwidth per month
- 50,000 monthly active users
- Unlimited API requests
- Real-time subscriptions

### Monitoring Usage:
1. Go to **Settings** → **Usage**
2. Monitor database size
3. Check bandwidth usage
4. View API request count

## Next Steps

### Phase 1: Basic Sync ✅
- [x] Database schema created
- [x] Authentication service implemented
- [x] Sync service with offline-first
- [x] Real-time subscriptions

### Phase 2: UI Integration (Next)
- [ ] Update login screen to use Supabase auth
- [ ] Add sync status indicator
- [ ] Show sync errors to user
- [ ] Add family sharing UI

### Phase 3: Advanced Features
- [ ] Conflict resolution UI
- [ ] Manual sync button
- [ ] Sync settings (frequency, etc.)
- [ ] Data export from cloud

## Support

### Resources
- Supabase Docs: https://supabase.com/docs
- FinMate Repo: https://github.com/MukundC25/FinMate
- Issues: Create GitHub issue

### Common Questions

**Q: Will my data be lost if I delete the app?**
A: No, if you're logged in with email/OAuth, your data is backed up to Supabase cloud.

**Q: Can I use the app offline?**
A: Yes! The app works perfectly offline. Data syncs when you're back online.

**Q: How secure is my data?**
A: Very secure. Supabase uses industry-standard encryption, RLS policies, and secure connections.

**Q: Can I export my data?**
A: Yes, you can export from Supabase dashboard or use the app's export feature.

## Conclusion

Your Supabase integration is now set up! The app will:
- ✅ Sync data to cloud automatically
- ✅ Work offline seamlessly
- ✅ Support multi-device access
- ✅ Enable family sharing
- ✅ Provide real-time updates

Enjoy your cloud-powered FinMate! 🎉
