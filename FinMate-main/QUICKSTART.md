# 🚀 Quick Start Guide - FinMate Mobile

## Step 1: Start the Development Server

Open terminal in the `mobile/` folder and run:

```bash
npm start
```

You should see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

## Step 2: Open in Android Emulator

### Option A: Automatic (Recommended)
Press `a` in the terminal - the app will automatically open in your running Android emulator.

### Option B: Manual
1. Open Expo Go app in the emulator
2. Scan the QR code from terminal
3. App will load

## Step 3: What You'll See

1. **Splash Screen** (2 seconds)
   - FinMate logo with loading indicator

2. **Home Screen**
   - Spending summary card showing:
     - Total spent this month
     - Budget remaining
     - Progress bar
   - Quick action buttons
   - Recent transactions list (5 mock transactions)
   - Stats cards (Total Spent / Total Received)

## 🎯 Testing Features

### Mock Data
The app comes with 5 pre-loaded transactions:
- Blinkit (₹517) - Groceries
- Swiggy (₹279) - Food
- Mukund Chavan (₹4000) - Income
- Airtel (₹199) - Recharge
- Personal Transfer (₹7000) - P2P

### Navigation
- Bottom tabs: Home, Feed, Budgets, Profile
- Currently only Home screen is fully implemented
- Other tabs show placeholder screens

### Database
- SQLite database initialized automatically
- Transactions stored locally
- Budgets tracked per category

## 🔧 Hot Reload

Edit any file and save - the app will automatically reload!

Try editing:
- `src/screens/main/HomeScreen.tsx` - Change the greeting text
- `src/constants/theme.ts` - Change the primary color
- `src/utils/mockData.ts` - Add more transactions

## 🐛 Troubleshooting

### "Cannot connect to Metro"
```bash
# Clear cache and restart
npm start -- --clear
```

### "Database error"
```bash
# In Expo Go app:
# Shake device → "Clear app data" → Reload
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm start
```

## 📱 Next Steps

1. **Test SMS Parser**:
   - Open `src/services/smsParser.ts`
   - Try parsing your own SMS messages
   - Check categorization accuracy

2. **Customize Design**:
   - Edit colors in `src/constants/theme.ts`
   - Modify spacing, typography
   - Update category colors

3. **Add More Screens**:
   - Transaction Feed (list view)
   - Add Transaction (manual entry)
   - Budget Management
   - Settings

4. **Implement SMS Reading** (Android):
   - Request SMS permissions
   - Listen for new messages
   - Auto-parse and save

## 🎨 Design System

All design tokens from your Figma mocks are in:
- **Colors**: `src/constants/theme.ts`
- **Components**: `src/components/ui/`
- **Screens**: `src/screens/`

## 📊 Database Schema

Check `src/services/database.ts` for:
- Transactions table
- Budgets table
- Alerts table
- Categories table

All CRUD operations are ready to use!

---

**You're all set! 🎉**

The app is running with:
✅ SMS Parser (ported from your Python code)
✅ SQLite Database
✅ Navigation
✅ Design System
✅ Mock Data

Start building features! 🚀
