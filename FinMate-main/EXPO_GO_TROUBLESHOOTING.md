# Expo Go Connection Troubleshooting Guide

## ✅ Fixes Applied

I've made the following changes to fix the "Failed to download remote update" error:

### 1. **Updated app.json**
- Disabled `newArchEnabled` (was causing compatibility issues)
- Added Android package name: `com.finmate.app`
- Added SMS permissions for Android
- Removed problematic edge-to-edge settings

### 2. **Created metro.config.js**
- Increased server timeout to 5 minutes
- Better handling for slow connections
- Automatic cache reset

### 3. **Restarted Development Server**
- Cleared Metro bundler cache
- Server running on: `exp://192.168.1.11:8081`

## 📱 How to Connect from Your Android Device

### Method 1: Scan QR Code (Recommended)
1. Open **Expo Go** app on your Android device
2. Tap **"Scan QR Code"**
3. Scan the QR code shown in the terminal
4. Wait for the app to load (may take 1-2 minutes first time)

### Method 2: Manual Connection
1. Make sure your phone and computer are on the **same WiFi network**
2. Open Expo Go app
3. Tap **"Enter URL manually"**
4. Enter: `exp://192.168.1.11:8081`
5. Tap **"Connect"**

## 🔧 If You Still Get Errors

### Error: "Failed to download remote update"

**Solution 1: Check Network Connection**
```bash
# Make sure both devices are on same network
# Disable VPN if you're using one
# Check firewall settings
```

**Solution 2: Use Tunnel Mode**
```bash
# Stop current server (Ctrl+C)
npx expo start --tunnel
# This creates a public URL that works anywhere
```

**Solution 3: Clear Expo Go Cache**
1. Open Expo Go app
2. Shake your device to open developer menu
3. Tap "Clear cache"
4. Try scanning QR code again

**Solution 4: Restart Everything**
```bash
# In terminal:
pkill -f "expo start"
npx expo start --clear

# On phone:
- Force close Expo Go app
- Reopen and scan QR code
```

### Error: "Network request failed"

**This means:**
- Your phone can't reach your computer
- Check WiFi connection
- Try tunnel mode: `npx expo start --tunnel`

### Error: "Unable to resolve module"

**This means:**
- Missing dependencies
- Run: `npm install`
- Then: `npx expo start --clear`

## 🚀 Best Practices

1. **Always use the same WiFi network** for phone and computer
2. **Disable VPN** while developing
3. **Keep Expo Go updated** to latest version
4. **Use tunnel mode** if on different networks
5. **Clear cache** if you see weird errors

## 📊 Current Server Status

✅ Server Running: `exp://192.168.1.11:8081`
✅ Metro Config: Optimized for slow connections
✅ App Config: Compatible with Expo Go
✅ Dependencies: All installed

## 🎯 Next Steps

1. **Scan the QR code** from your Android device
2. **Wait patiently** for first load (1-2 minutes)
3. **Test the app** - try adding a transaction
4. **Grant SMS permission** when prompted
5. **Test SMS processing** with the button on home screen

## 💡 Pro Tips

- **Shake device** to open developer menu
- **Enable Fast Refresh** for instant updates
- **Use tunnel mode** for remote testing
- **Check logs** in terminal for errors
- **Reload app** with "r" key in terminal

## 🆘 Still Having Issues?

If none of these work:

1. **Update Expo Go** app from Play Store
2. **Update Expo CLI**: `npm install -g expo-cli`
3. **Check firewall**: Allow port 8081
4. **Try USB debugging** with `adb reverse`
5. **Use tunnel mode**: `npx expo start --tunnel`

---

**Server is ready! Scan the QR code and start testing! 🎉**
