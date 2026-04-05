import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { initDatabase } from '../../services/database';
import { AuthService } from '../../services/auth';
import { useStore } from '../../store/useStore';

interface SplashScreenProps {
  navigation: any;
}

export function SplashScreen({ navigation }: SplashScreenProps) {
  const { setCurrentUserId } = useStore();
  
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing FinMate...');
      
      // Initialize database
      await initDatabase();
      console.log('✅ Database initialized');
      
      // Check if user is logged in
      const session = await AuthService.getSession();
      const isLoggedIn = session?.isLoggedIn || false;
      console.log('🔐 Login status:', isLoggedIn);
      
      if (isLoggedIn && session?.userId) {
        // Set current user ID in store
        setCurrentUserId(session.userId);
        console.log('👤 User ID set:', session.userId);
      }
      
      // Wait a bit for splash screen
      setTimeout(() => {
        console.log('✅ App ready!');
        if (isLoggedIn) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Landing');
        }
      }, 1500);
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      // Still proceed even if there's an error
      setTimeout(() => navigation.replace('Landing'), 1500);
    }
  };

  console.log('🎨 SplashScreen rendering...');
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>FinMate</Text>
        <Text style={styles.subtitle}>Smart UPI Expense Tracker</Text>
        <Text style={styles.debugText}>Loading...</Text>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  debugText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
  loader: {
    marginTop: Spacing.xl,
  },
});
