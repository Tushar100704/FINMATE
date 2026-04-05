#!/bin/bash

# FinMate Development Build Script
# This script builds the app with native SMS support

echo "🚀 FinMate Development Build"
echo "=============================="
echo ""

# Check if Android Studio is installed
if ! command -v adb &> /dev/null; then
    echo "⚠️  Android Studio/SDK not found!"
    echo ""
    echo "Options:"
    echo "1. Install Android Studio: https://developer.android.com/studio"
    echo "2. Or use cloud build: eas build --profile development --platform android"
    echo ""
    exit 1
fi

# Check if device is connected
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)
if [ $DEVICES -eq 0 ]; then
    echo "⚠️  No Android device connected!"
    echo ""
    echo "Please:"
    echo "1. Connect your Android device via USB"
    echo "2. Enable USB debugging in Developer Options"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo "✅ Android device connected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Prebuild
echo ""
echo "🔨 Generating native code..."
npx expo prebuild --clean

# Build and install
echo ""
echo "📱 Building and installing on device..."
echo "This may take 10-15 minutes on first build..."
echo ""
npx expo run:android

echo ""
echo "🎉 Build complete!"
echo ""
echo "Next steps:"
echo "1. Open FinMate on your device"
echo "2. Grant SMS permission"
echo "3. Tap 'Check SMS for Transactions'"
echo "4. See your real transactions!"
echo ""
