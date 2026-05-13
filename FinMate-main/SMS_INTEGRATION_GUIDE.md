# SMS Integration Setup Guide

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install expo-background-fetch expo-task-manager
```

### 2. Android Permissions

Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.READ_SMS",
        "android.permission.RECEIVE_SMS"
      ]
    }
  }
}
```

### 3. Background Tasks Configuration

Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "useNextNotificationsApi": true
    },
    "plugins": [
      [
        "expo-background-fetch",
        {
          "backgroundModes": ["background-fetch"]
        }
      ]
    ]
  }
}
```

## 📱 How It Works

### Architecture Flow

```
SMS Received → Permission Check → SMS Reader → Parser → Validator → DB → Store → UI Update
     ↓              ↓              ↓          ↓         ↓        ↓      ↓        ↓
Background    PermissionService  SMSService  SMS Parser Validator TransactionDB Zustand React
  Task                                       (existing)  (new)   (updated)  (updated) Components
```

### Key Components

1. **PermissionService** - Handles SMS permission requests
2. **SMSService** - Reads and filters SMS messages
3. **TransactionProcessor** - Processes SMS into transactions
4. **BackgroundTaskService** - Manages background processing
5. **useSMSListener** - React hook for SMS integration

## 🔧 Features Implemented

### ✅ Core Features
- SMS permission handling (Android/iOS)
- SMS reading and filtering
- UPI transaction parsing with confidence scoring
- Duplicate detection
- Background processing
- Manual SMS processing trigger
- Auto-detected transaction indicators in UI

### ✅ UI Updates
- Permission screen with actual SMS requests
- Auto-detection badges on transactions
- Manual SMS processing button
- Confidence indicators
- Loading states

### ✅ Database Updates
- Added `isAutoDetected`, `smsId`, `confidence` fields
- Updated transaction creation logic
- SMS processing tracking

## 🎯 Usage

### For Users

1. **Grant Permission**: On first launch, grant SMS permission
2. **Automatic Processing**: Transactions are detected automatically in background
3. **Manual Trigger**: Use "Check SMS for Transactions" button on home screen
4. **View Results**: Auto-detected transactions show "AUTO" badge

### For Developers

```typescript
// Use the SMS listener hook
const { 
  requestSMSPermission, 
  processSMSManually, 
  isPermissionGranted 
} = useSMSListener();

// Request permission
const granted = await requestSMSPermission();

// Manual processing
const result = await processSMSManually();
if (result.success && result.created > 0) {
  console.log(`Created ${result.created} transactions`);
}
```

## 🐛 Debugging

### Check SMS Processing Status

```typescript
import { BackgroundTaskService } from './src/services/backgroundTaskService';

const stats = await BackgroundTaskService.getProcessingStats();
console.log('Background task status:', stats.backgroundTaskStatus);
console.log('SMS stats:', stats.smsStats);
```

### View Processed SMS Records

```typescript
import { SMSService } from './src/services/smsService';

const records = await SMSService.getProcessedSMSRecords();
console.log('Processed SMS:', records);
```

### Clear Processing Data (for testing)

```typescript
await SMSService.clearProcessedRecords();
await PermissionService.resetPermissions();
```

## ⚠️ Important Notes

### iOS Limitations
- iOS doesn't allow SMS reading by third-party apps
- On iOS, the system shows an explanation dialog
- Users need to manually add transactions or use import features

### Android Requirements
- Requires `READ_SMS` permission
- Background processing available
- Works with all major Indian banks and UPI apps

### Privacy & Security
- SMS data never leaves the device
- No network requests with SMS content
- All processing happens locally
- Users can revoke permissions anytime

## 🔄 Background Processing

### How It Works
- Runs every 5 minutes when app is backgrounded
- Checks for new SMS messages
- Processes only UPI-related messages
- Updates transactions automatically
- Handles app state changes

### Limitations
- Android only (iOS doesn't support background SMS reading)
- Battery optimization may affect frequency
- User can disable in system settings

## 📊 Confidence Scoring

Transactions are scored based on:
- Pattern match completeness (0.2 points)
- Known bank sender (0.2 points)  
- UPI reference number (0.1 points)
- Proper amount format (0.1 points)
- Base confidence: 0.5

Only transactions with >60% confidence are auto-created.

## 🚨 Error Handling

The system handles:
- Permission denied scenarios
- SMS parsing failures
- Duplicate transactions
- Background task failures
- Network connectivity issues
- Database errors

All errors are logged and don't crash the app.

## 🎉 Next Steps

After SMS integration is working:

1. **Test with real SMS** - Send yourself UPI transactions
2. **Verify parsing** - Check confidence scores and accuracy
3. **Add more banks** - Extend SMS patterns for other banks
4. **Implement notifications** - Alert users about new transactions
5. **Add settings** - Let users configure SMS processing preferences

## 📝 Testing Checklist

- [ ] SMS permission request works
- [ ] Manual SMS processing works
- [ ] Auto-detected transactions show badges
- [ ] Background processing registers
- [ ] Duplicate detection works
- [ ] Confidence scoring is reasonable
- [ ] UI updates after SMS processing
- [ ] Database stores SMS fields correctly
- [ ] Error handling works gracefully
- [ ] iOS shows appropriate messaging

## 🔗 Related Files

- `src/services/permissionService.ts` - Permission handling
- `src/services/smsService.ts` - SMS reading
- `src/services/transactionProcessor.ts` - SMS to transaction conversion
- `src/services/backgroundTaskService.ts` - Background processing
- `src/hooks/useSMSListener.ts` - React integration
- `src/screens/auth/PermissionsScreen.tsx` - Permission UI
- `src/components/common/TransactionRow.tsx` - Auto-detection UI
