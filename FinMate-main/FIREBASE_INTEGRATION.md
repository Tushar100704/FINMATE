# 🔥 Firebase Integration Guide for FinMate

## 📋 Overview

Firebase is **OPTIONAL** for SMS reading but **HIGHLY RECOMMENDED** for:
- ☁️ Cloud backup and sync
- 🔔 Push notifications
- 📊 Analytics
- 🔐 User authentication
- ⚙️ Remote configuration

---

## 🎯 What Firebase Does for FinMate

### 1. **Cloud Firestore** (Backup & Sync)
**Use Case:** Backup all transactions to cloud
```typescript
// User changes phone → All data restored
// Multiple devices → Data synced
// Accidental deletion → Data recoverable
```

### 2. **Cloud Messaging** (Push Notifications)
**Use Case:** Notify users about transactions
```typescript
// New transaction detected → Push notification
// Budget exceeded → Alert notification
// Monthly summary → Reminder notification
```

### 3. **Analytics** (Usage Insights)
**Use Case:** Understand user behavior
```typescript
// Track which features are used
// Identify bugs and crashes
// Improve user experience
```

### 4. **Authentication** (User Accounts)
**Use Case:** Secure user data
```typescript
// Google Sign-In
// Email/Password login
// Phone authentication
// Anonymous auth
```

### 5. **Remote Config** (Dynamic Updates)
**Use Case:** Update app without releasing new version
```typescript
// Add new bank SMS patterns
// Enable/disable features
// A/B testing
// Emergency fixes
```

---

## 🚀 Quick Setup (30 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name: "FinMate"
4. Enable Google Analytics: Yes
5. Create Project

### Step 2: Add Android App

1. Click "Add App" → Android
2. Package name: `com.finmate.app`
3. App nickname: "FinMate Android"
4. Download `google-services.json`
5. Place in: `/Users/apple/Downloads/FinMate-New/google-services.json`

### Step 3: Install Firebase Packages

```bash
npm install @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/messaging @react-native-firebase/analytics @react-native-firebase/auth @react-native-firebase/remote-config
```

### Step 4: Update app.json

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging"
    ]
  }
}
```

### Step 5: Rebuild App

```bash
npx expo prebuild --clean
npx expo run:android
```

---

## 💾 Feature 1: Cloud Backup (Priority: HIGH)

### Implementation

Create `src/services/firebaseService.ts`:

```typescript
import firestore from '@react-native-firebase/firestore';
import { Transaction } from '../types';

export class FirebaseService {
  /**
   * Sync transaction to cloud
   */
  static async syncTransaction(userId: string, transaction: Transaction) {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('transactions')
        .doc(transaction.id)
        .set({
          ...transaction,
          syncedAt: firestore.FieldValue.serverTimestamp()
        });
      
      console.log('✅ Transaction synced to cloud:', transaction.id);
    } catch (error) {
      console.error('❌ Failed to sync transaction:', error);
    }
  }

  /**
   * Restore transactions from cloud
   */
  static async restoreTransactions(userId: string): Promise<Transaction[]> {
    try {
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('transactions')
        .orderBy('date', 'desc')
        .get();

      const transactions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Transaction[];

      console.log(`✅ Restored ${transactions.length} transactions from cloud`);
      return transactions;
    } catch (error) {
      console.error('❌ Failed to restore transactions:', error);
      return [];
    }
  }

  /**
   * Enable real-time sync
   */
  static subscribeToTransactions(
    userId: string,
    onUpdate: (transactions: Transaction[]) => void
  ) {
    return firestore()
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .orderBy('date', 'desc')
      .onSnapshot(snapshot => {
        const transactions = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Transaction[];
        onUpdate(transactions);
      });
  }
}
```

### Usage in App

Update `src/services/database.ts`:

```typescript
import { FirebaseService } from './firebaseService';

export const TransactionDB = {
  async create(transaction: Transaction & { userId: string }): Promise<void> {
    // Save to local SQLite
    await database.runAsync(/* ... */);
    
    // Sync to cloud
    await FirebaseService.syncTransaction(transaction.userId, transaction);
  }
}
```

---

## 🔔 Feature 2: Push Notifications (Priority: HIGH)

### Setup Cloud Messaging

1. **Enable in Firebase Console**
   - Go to Project Settings → Cloud Messaging
   - Note the Server Key

2. **Request Permission**

Create `src/services/notificationService.ts`:

```typescript
import messaging from '@react-native-firebase/messaging';

export class NotificationService {
  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted');
      await this.getFCMToken();
    }

    return enabled;
  }

  /**
   * Get FCM token
   */
  static async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Send notification when transaction detected
   */
  static async notifyTransaction(transaction: Transaction) {
    // This would be called from your backend/cloud function
    const message = {
      notification: {
        title: transaction.type === 'debit' ? '💸 Money Spent' : '💰 Money Received',
        body: `₹${transaction.amount} ${transaction.type === 'debit' ? 'to' : 'from'} ${transaction.merchant}`,
      },
      data: {
        transactionId: transaction.id,
        type: 'transaction',
      },
    };
    
    console.log('🔔 Would send notification:', message);
  }

  /**
   * Handle foreground notifications
   */
  static setupForegroundHandler() {
    messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground notification:', remoteMessage);
      // Show in-app notification
    });
  }

  /**
   * Handle background notifications
   */
  static setupBackgroundHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('🔔 Background notification:', remoteMessage);
    });
  }
}
```

### Usage

In `App.tsx`:

```typescript
useEffect(() => {
  NotificationService.requestPermission();
  NotificationService.setupForegroundHandler();
}, []);
```

---

## 📊 Feature 3: Analytics (Priority: MEDIUM)

### Track User Events

Create `src/services/analyticsService.ts`:

```typescript
import analytics from '@react-native-firebase/analytics';

export class AnalyticsService {
  /**
   * Track transaction creation
   */
  static async logTransactionCreated(transaction: Transaction) {
    await analytics().logEvent('transaction_created', {
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      isAutoDetected: transaction.isAutoDetected,
      confidence: transaction.confidence
    });
  }

  /**
   * Track SMS processing
   */
  static async logSMSProcessed(count: number, created: number) {
    await analytics().logEvent('sms_processed', {
      total_sms: count,
      transactions_created: created,
      success_rate: (created / count) * 100
    });
  }

  /**
   * Track screen views
   */
  static async logScreenView(screenName: string) {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName
    });
  }

  /**
   * Set user properties
   */
  static async setUserProperties(userId: string, properties: any) {
    await analytics().setUserId(userId);
    await analytics().setUserProperties(properties);
  }
}
```

---

## 🔐 Feature 4: Authentication (Priority: MEDIUM)

### Google Sign-In

```typescript
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class AuthService {
  static async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('✅ Signed in:', userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      return null;
    }
  }

  static async signOut() {
    await auth().signOut();
    await GoogleSignin.signOut();
  }

  static getCurrentUser() {
    return auth().currentUser;
  }
}
```

---

## ⚙️ Feature 5: Remote Config (Priority: LOW)

### Dynamic SMS Patterns

```typescript
import remoteConfig from '@react-native-firebase/remote-config';

export class RemoteConfigService {
  static async initialize() {
    await remoteConfig().setDefaults({
      sms_patterns: JSON.stringify([
        /* default patterns */
      ]),
      min_confidence: 0.6,
      enable_background_sync: true
    });

    await remoteConfig().fetchAndActivate();
  }

  static async getSMSPatterns() {
    const patterns = remoteConfig().getValue('sms_patterns');
    return JSON.parse(patterns.asString());
  }

  static async getMinConfidence() {
    return remoteConfig().getValue('min_confidence').asNumber();
  }
}
```

---

## 🎯 Implementation Priority

### Phase 1: Essential (Week 1)
1. ✅ Cloud Firestore backup
2. ✅ Push notifications
3. ✅ Basic analytics

### Phase 2: Enhanced (Week 2)
4. ✅ Google authentication
5. ✅ Real-time sync
6. ✅ Crash reporting

### Phase 3: Advanced (Week 3)
7. ✅ Remote config
8. ✅ A/B testing
9. ✅ Advanced analytics

---

## 💰 Firebase Pricing

### Spark Plan (FREE)
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 1GB storage
- ✅ Unlimited push notifications
- ✅ Perfect for starting

### Blaze Plan (Pay as you go)
- 💵 $0.06 per 100,000 reads
- 💵 $0.18 per 100,000 writes
- 💵 $0.18/GB storage
- 💵 Still very cheap for small apps

**Recommendation:** Start with FREE plan

---

## 🚀 Quick Start Commands

### Install Firebase
```bash
npm install @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/messaging
```

### Add to app.json
```json
{
  "plugins": ["@react-native-firebase/app"]
}
```

### Rebuild
```bash
npx expo prebuild --clean
npx expo run:android
```

---

## ✅ Summary

### Firebase is NOT Required for:
- ❌ SMS reading (works without Firebase)
- ❌ Local transactions (SQLite)
- ❌ Basic app functionality

### Firebase is HIGHLY Recommended for:
- ✅ Cloud backup (never lose data)
- ✅ Push notifications (better UX)
- ✅ Analytics (improve app)
- ✅ Multi-device sync
- ✅ User authentication

### When to Add Firebase:
- **Now**: If you want cloud backup immediately
- **Later**: After SMS integration works
- **Never**: If you want 100% offline app

**Recommendation:** Get SMS working first, add Firebase next week.

---

## 🎉 Next Steps

1. **Today**: Build development APK for SMS
2. **Tomorrow**: Test SMS integration
3. **This Week**: Add Firebase for backup
4. **Next Week**: Add push notifications

**Firebase setup takes 30 minutes. SMS integration is the priority! 🚀**
