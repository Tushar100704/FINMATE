# 🚀 Build Instructions for Real SMS Integration

## 🎯 CRITICAL: You Must Build a Development APK

**Expo Go CANNOT read SMS.** You need a development build.

---

## ✅ Quick Start (Recommended - 15 minutes)

### Option 1: Local Build with Android Studio

**Prerequisites:**
- Android Studio installed
- Android device connected via USB
- USB debugging enabled

**Commands:**
```bash
# 1. Install dependencies
npm install

# 2. Prebuild native code
npx expo prebuild --clean

# 3. Build and install on device
npx expo run:android
```

**What happens:**
1. ✅ Creates native Android project
2. ✅ Adds SMS permissions to AndroidManifest
3. ✅ Builds APK with native modules
4. ✅ Installs on your device
5. ✅ Real SMS reading works!

**Time: 10-15 minutes**

---

## ✅ Option 2: Cloud Build (No Android Studio needed)

**Prerequisites:**
- Expo account (free)
- Internet connection

**Commands:**
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure project
eas build:configure

# 4. Build development APK
eas build --profile development --platform android
```

**What happens:**
1. ✅ Uploads code to Expo servers
2. ✅ Builds APK in cloud (15-20 min)
3. ✅ Provides download link
4. ✅ Install APK on device
5. ✅ Real SMS reading works!

**Time: 25-30 minutes (including build time)**

---

## 📱 After Building

### 1. Install the APK
- Transfer to phone or download directly
- Enable "Install from unknown sources" if needed
- Install the APK

### 2. Grant SMS Permission
- Open FinMate app
- Go to Permissions screen
- Tap SMS toggle
- Grant permission in Android dialog

### 3. Test SMS Reading
- Go to Home Screen
- Tap "📱 Check SMS for Transactions"
- Watch your real SMS transactions appear!

---

## 🔍 What Gets Built

### Native Android Project Structure
```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml (SMS permissions added)
│   │   ├── java/com/finmate/app/
│   │   │   └── MainActivity.java
│   │   └── res/
│   └── build.gradle
├── gradle/
└── build.gradle
```

### Permissions Added Automatically
```xml
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

---

## 🐛 Troubleshooting

### Error: "Android SDK not found"
**Solution:**
```bash
# Install Android Studio first
# Then set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Error: "No devices found"
**Solution:**
- Connect Android device via USB
- Enable USB debugging in Developer Options
- Run: `adb devices` to verify connection

### Error: "Build failed"
**Solution:**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Error: "Permission denied"
**Solution:**
```bash
# On Mac/Linux, make gradlew executable
chmod +x android/gradlew
```

---

## 🎯 Recommended: Use Option 1 (Local Build)

**Why?**
- ✅ Faster (10-15 min vs 25-30 min)
- ✅ No internet upload needed
- ✅ Easier to debug
- ✅ Hot reload works
- ✅ Instant updates during development

**How to set up Android Studio:**
1. Download from: https://developer.android.com/studio
2. Install Android SDK (API 34)
3. Set up environment variables
4. Connect device via USB
5. Run: `npx expo run:android`

---

## 📊 Build Time Comparison

| Method | Time | Requirements | Best For |
|--------|------|--------------|----------|
| Local Build | 10-15 min | Android Studio | Active development |
| Cloud Build | 25-30 min | Internet only | Quick testing |
| Expo Go | 0 min | Nothing | UI testing only (no SMS) |

---

## 🚀 Start Building NOW

### Quick Command (if you have Android Studio):
```bash
npx expo run:android
```

### Alternative (no Android Studio):
```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

---

## ✅ What Works After Build

### In Development Build:
- ✅ Read real SMS messages
- ✅ Automatic transaction detection
- ✅ Background SMS processing
- ✅ All native features
- ✅ Hot reload during development

### Still in Expo Go:
- ✅ UI and navigation
- ✅ Manual transactions
- ✅ Database
- ✅ Charts
- ❌ SMS reading (not supported)

---

## 💡 Pro Tip

After first build, you can use Expo Go for UI changes and only rebuild when you need to test SMS features:

```bash
# For UI changes (fast)
npx expo start

# For SMS testing (requires rebuild)
npx expo run:android
```

---

## 🎉 Ready to Build?

Run this command now:

```bash
npx expo run:android
```

Or if you prefer cloud build:

```bash
eas build --profile development --platform android
```

**Your SMS integration will work after this build! 🚀**
