# FinMate - Smart UPI Expense Tracker

A cross-platform mobile app for automatically tracking and analyzing UPI transactions with AI-powered categorization.

## App Preview

<p align="center">
  <img src="https://github.com/user-attachments/assets/9df91da4-e76e-492b-bbc0-66d07f3852f3" width="180"/>
  <img src="https://github.com/user-attachments/assets/f1392ef7-9a26-4989-8077-51ec7fb9b243" width="180"/>
  <img src="https://github.com/user-attachments/assets/fb85ef48-56b4-4501-bee3-4684b5e9fa72" width="180"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/5f6fb942-f60e-4477-9d0b-4fa17d1d4ace" width="180"/>
  <img src="https://github.com/user-attachments/assets/a367c835-aa5f-4fc3-afbd-9c230124d937" width="180"/>
  <img src="https://github.com/user-attachments/assets/cf5ee96c-04b3-4aff-9df5-f55b5db0b0ed" width="180"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/61fc9370-49be-4081-91dc-e917448654e9" width="180"/>
  <img src="https://github.com/user-attachments/assets/fd639fb4-e171-47ff-8777-616948855a18" width="180"/>
  <img src="https://github.com/user-attachments/assets/55023d1a-df09-4e3a-a7f5-22bd2e856b88" width="180"/>
</p>


## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app installed on your Android device/emulator

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Run on Android Emulator:**
- Make sure your Android emulator is running
- Press `a` in the terminal to open on Android
- Or scan the QR code with Expo Go app on your physical device

## 📱 Running on Expo Go

### Android Emulator
1. Open Android Studio and start your emulator
2. Run `npm start` in the project directory
3. Press `a` to automatically open in the emulator
4. The app will load with hot reload enabled

### Physical Device
1. Install **Expo Go** from Google Play Store
2. Run `npm start`
3. Scan the QR code displayed in terminal with Expo Go
4. App will load on your device

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI elements (Button, Card, etc.)
│   │   └── common/         # App-specific components (TransactionRow, etc.)
│   ├── screens/            # App screens
│   │   ├── auth/           # Authentication screens
│   │   └── main/           # Main app screens
│   ├── services/           # Business logic
│   │   ├── smsParser.ts    # SMS parsing with regex (ported from Python)
│   │   └── database.ts     # SQLite database operations
│   ├── navigation/         # Navigation configuration
│   ├── store/              # Global state management (Zustand)
│   ├── utils/              # Helper functions
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Theme, colors, config
├── App.tsx                 # Main app entry point
└── package.json
```

## 🎨 Features Implemented

### ✅ Core Features
- **SMS Parser**: Regex-based UPI transaction parsing (ported from your Jupyter notebook)
- **SQLite Database**: Local storage for transactions, budgets, and alerts
- **State Management**: Zustand for global state
- **Navigation**: React Navigation with stack and tab navigators
- **Design System**: Complete theme with colors, typography, spacing

### ✅ Screens
- **Splash Screen**: App launch animation
- **Home Screen**: Dashboard with spending summary and recent transactions
- **Transaction Feed**: (Placeholder - ready to implement)
- **Budgets**: (Placeholder - ready to implement)
- **Profile**: (Placeholder - ready to implement)

### ✅ Components
- **Button**: Primary, secondary, outline, ghost variants
- **Card**: Default, elevated, outlined variants
- **TransactionRow**: Displays transaction with category icon and amount

### ✅ Services
- **SMS Parser**: 
  - Supports multiple bank formats (Kotak, SBI, HDFC, IPPB)
  - Auto-categorization (Food, Groceries, Recharge, P2P, etc.)
  - Extracts: amount, merchant, UPI ID, date, reference number
- **Database**:
  - Transactions CRUD
  - Budgets CRUD
  - Alerts CRUD
  - Category spending analytics

## 🔧 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Zustand
- **Database**: Expo SQLite
- **Charts**: Victory Native (to be added)
- **Icons**: Lucide React Native

## 📊 Mock Data

The app comes pre-loaded with mock transaction data for testing:
- 5 sample transactions (Blinkit, Swiggy, Airtel, etc.)
- 3 budget categories
- Realistic UPI transaction formats

Mock data is automatically seeded on first launch.

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web

# Clear cache and restart
npm start -- --clear
```

## 📝 Next Steps

### Immediate Tasks
1. **Implement remaining screens**:
   - Transaction Feed (list all transactions)
   - Transaction Detail (edit/delete)
   - Add Transaction (manual entry)
   - Budget Management
   - Insights/Analytics
   - Alerts/Notifications
   - Settings

2. **Add SMS Reading** (Android only):
   ```bash
   npm install react-native-sms-android
   ```
   - Request SMS permissions
   - Listen for new SMS
   - Auto-parse and save transactions

3. **Add Charts**:
   ```bash
   npm install victory-native react-native-svg
   ```
   - Pie chart for category breakdown
   - Line chart for spending trends
   - Bar chart for budget comparison

4. **Add ML Classification**:
   - Integrate TensorFlow Lite for on-device ML
   - Train model on transaction data
   - Improve categorization accuracy

### Future Enhancements
- Cloud sync with Firebase/Supabase
- Export to CSV/PDF
- Recurring transaction detection
- Budget alerts and notifications
- Multi-currency support
- Dark mode
- Biometric authentication

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache
npm start -- --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Database errors
The database is automatically initialized on first launch. If you encounter errors:
- Clear app data in Expo Go
- Restart the app

### TypeScript errors
The project uses strict TypeScript. If you see errors:
- Check that all imports are correct
- Ensure types are properly defined
- Run `npx tsc --noEmit` to check for type errors

## 📖 SMS Parser Integration

Your SMS parser from the Jupyter notebook has been fully ported to TypeScript:

**Location**: `src/services/smsParser.ts`

**Usage**:
```typescript
import { parseSMS, categorizeTransaction } from './services/smsParser';

const sms = "Sent Rs.517.00 from Kotak Bank AC X1583 to blinkit.rzp@hdfcbank on 01-10-25.UPI Ref 503375635902";
const parsed = parseSMS(sms);

// Result:
// {
//   type: 'sent',
//   amount: 517,
//   bankAccount: 'Kotak Bank AC X1583',
//   party: 'blinkit.rzp@hdfcbank',
//   date: '01-10-25',
//   ref: '503375635902',
//   category: 'Groceries'
// }
```

## 🎯 Design System

The app uses a comprehensive design system based on your Figma mocks:

**Colors**: `src/constants/theme.ts`
- Primary: #0B6E6F (Teal)
- Success: #16A34A (Green)
- Error: #DC2626 (Red)
- Category colors for Food, Groceries, Recharge, etc.

**Typography**: System fonts with defined sizes (xs to 4xl)

**Spacing**: Consistent spacing scale (xs: 4px to 3xl: 64px)

## 📱 Testing on Expo Go

1. **First time setup**:
   - Install Expo Go from Play Store
   - Connect to same WiFi as your computer
   - Scan QR code from terminal

2. **Hot reload**:
   - Edit any file and save
   - App automatically reloads
   - Shake device to open developer menu

3. **Debugging**:
   - Shake device → "Debug Remote JS"
   - Open Chrome DevTools
   - View console logs and errors

## 🚀 Building for Production

When ready to build a standalone APK:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS (macOS only)
eas build --platform ios
```

## 📄 License

Private project for personal use.

---

**Happy Coding! 🎉**

For questions or issues, check the Expo documentation: https://docs.expo.dev
