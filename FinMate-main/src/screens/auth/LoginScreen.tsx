import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, Layout, BorderRadius } from '../../constants/theme';
import { AuthService } from '../../services/authService';
import { SyncService } from '../../services/syncService';
import { UserDB } from '../../services/database';
import { useStore } from '../../store/useStore';
import { useFamilyStore } from '../../features/family/store/familyStore';

export function LoginScreen({ navigation }: any) {
  const { setCurrentUserId, setUser, resetStore } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Clear store state for new user (but keep data in DB)
      console.log('🔄 Preparing for new user sign up...');
      resetStore();
      useFamilyStore.getState().clearFamily();
      
      // Sign up with Supabase
      console.log('📝 Signing up with Supabase:', email);
      const session = await AuthService.signUpWithEmail(email, password, name);
      
      // Create local user record
      await UserDB.create({
        id: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name,
        loginMethod: session.user.loginMethod,
      });
      
      // Set current user ID in store
      setCurrentUserId(session.user.id);
      
      // Set user object in store
      setUser({
        id: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name,
        monthlyBudget: 0,
        currency: 'INR',
      });
      
      console.log('👤 Signed up with Supabase:', session.user.id, session.user.email);
      
      // Initialize sync service for cloud sync
      await SyncService.initialize(session.user.id);
      console.log('🔄 Sync service initialized');
      
      // Navigate to main app
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // Clear store state for new user (but keep data in DB)
      console.log('🔄 Preparing for new user login...');
      resetStore();
      useFamilyStore.getState().clearFamily();
      
      // Sign in with Supabase
      const session = await AuthService.signInWithEmail(email, password);
      
      // Create/update local user record
      const existingUser = await UserDB.getById(session.user.id);
      if (!existingUser) {
        await UserDB.create({
          id: session.user.id,
          email: session.user.email || undefined,
          name: session.user.name,
          loginMethod: session.user.loginMethod,
        });
      }
      
      // Set current user ID in store
      setCurrentUserId(session.user.id);
      
      // Set user object in store
      setUser({
        id: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name,
        monthlyBudget: 0,
        currency: 'INR',
      });
      
      console.log('👤 Logged in with Supabase:', session.user.id, session.user.email);
      
      // Initialize sync service for cloud sync
      await SyncService.initialize(session.user.id);
      console.log('🔄 Sync service initialized');
      
      // Navigate to main app
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      // Continue as guest (offline-only mode)
      const session = await AuthService.continueAsGuest();
      
      // Create local guest user record
      await UserDB.create({
        id: session.user.id,
        name: session.user.name,
        loginMethod: 'guest',
      });
      
      // Set current user ID in store
      setCurrentUserId(session.user.id);
      console.log('👤 Logged in as guest:', session.user.id);
      
      // Navigate to main app (no sync for guests)
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('❌ Guest login error:', error);
      Alert.alert('Error', 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Clear store state for new user (but keep data in DB)
      console.log('🔄 Preparing for Google login...');
      resetStore();
      useFamilyStore.getState().clearFamily();
      
      console.log('🔐 Initiating Google Sign-In...');
      const session = await AuthService.signInWithGoogle();

      console.log('✅ Google Sign-In completed');
      console.log('🆔 Session user ID:', session.user.id);
      console.log('📧 Session user email:', session.user.email);
      console.log('👤 Session user name:', session.user.name);

      // Create/update local user record
      console.log('💾 Creating/updating local user record...');
      const existingUser = await UserDB.getById(session.user.id);
      if (!existingUser) {
        await UserDB.create({
          id: session.user.id,
          email: session.user.email || undefined,
          name: session.user.name,
          loginMethod: 'google',
        });
        console.log('✅ Local user record created');
      } else {
        console.log('✅ Local user record already exists');
      }

      // Set current user ID in store
      console.log('📝 Setting current user ID in store:', session.user.id);
      setCurrentUserId(session.user.id);
      
      // Set user object in store for profile display
      setUser({
        id: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name,
        monthlyBudget: 0,
        currency: 'INR',
      });
      
      console.log('👤 Logged in with Google:', session.user.id, session.user.email);

      // Initialize sync service for cloud sync
      console.log('🔄 Initializing sync service for user:', session.user.id);
      await SyncService.initialize(session.user.id);
      console.log('✅ Sync service initialized');

      // Navigate to main app
      console.log('🚀 Navigating to MainTabs...');
      navigation.replace('MainTabs');
      console.log('✅ Navigation complete');
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      console.error('❌ Error stack:', error.stack);
      Alert.alert(
        'Google Sign-In Failed',
        error.message || 'Failed to sign in with Google. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll keyboardAvoiding horizontalPadding={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</Text>
      </View>

      {/* Login/Signup Form */}
      <View style={styles.content}>
        <Card style={styles.formCard}>
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          {!isSignUp && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Login/Signup Button */}
        <Button
          title={loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          onPress={isSignUp ? handleSignUp : handleLogin}
          disabled={loading}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Guest Login */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuestLogin}
          disabled={loading}
        >
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

        {/* Toggle Sign Up/Login Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.signupLink}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  googleButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  guestButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: '700',
  },
});
