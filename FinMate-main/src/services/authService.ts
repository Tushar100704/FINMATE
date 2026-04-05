import { supabase } from '../config/supabase';
import { generateId } from '../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

// Google OAuth configuration - provided by user
const GOOGLE_CLIENT_ID = '509995710331-o0gmkutt0ji9lktd6u302ng4bcsfgnk1.apps.googleusercontent.com';
// Use static redirect URI for OAuth callback
const REDIRECT_URI = 'finmate://auth/callback';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  loginMethod: 'email' | 'google' | 'apple' | 'guest';
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */
export const AuthService = {
  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, name: string): Promise<AuthSession> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name,
          login_method: 'email',
        });

      if (profileError) throw profileError;

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || null,
          name,
          avatarUrl: null,
          loginMethod: 'email',
        },
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
      };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  },

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthSession> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signin');

      // Try to get existing profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      // If profile doesn't exist, create it (handles OAuth or missing profile cases)
      if (profileError || !profile) {
        console.log('📝 Profile not found, attempting to create one...');
        const userName = authData.user.user_metadata?.name || 
                        authData.user.email?.split('@')[0] || 
                        'User';
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: userName,
            login_method: 'email',
          })
          .select()
          .single();

        // If insert fails with duplicate key, profile exists but RLS blocked the SELECT
        // In this case, just use the auth data we have
        if (createError) {
          if (createError.code === '23505') {
            console.log('✅ Profile exists (RLS blocked SELECT), using auth data');
            return {
              user: {
                id: authData.user.id,
                email: authData.user.email || null,
                name: userName,
                avatarUrl: null,
                loginMethod: 'email',
              },
              accessToken: authData.session?.access_token || '',
              refreshToken: authData.session?.refresh_token || '',
            };
          }
          console.error('❌ Failed to create profile:', createError);
          throw createError;
        }

        return {
          user: {
            id: authData.user.id,
            email: authData.user.email || null,
            name: userName,
            avatarUrl: null,
            loginMethod: 'email',
          },
          accessToken: authData.session?.access_token || '',
          refreshToken: authData.session?.refresh_token || '',
        };
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || null,
          name: profile.name,
          avatarUrl: profile.avatar_url,
          loginMethod: profile.login_method as any,
        },
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
      };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  },

  /**
   * Continue as guest (creates anonymous user)
   */
  async continueAsGuest(name: string = 'Guest User'): Promise<AuthSession> {
    try {
      const guestId = `guest_${generateId()}`;
      
      await AsyncStorage.setItem('guest_user', JSON.stringify({
        id: guestId,
        name,
        loginMethod: 'guest',
      }));

      return {
        user: {
          id: guestId,
          email: null,
          name,
          avatarUrl: null,
          loginMethod: 'guest',
        },
        accessToken: '',
        refreshToken: '',
      };
    } catch (error) {
      console.error('❌ Guest login error:', error);
      throw error;
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await AsyncStorage.removeItem('guest_user');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  },

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          return {
            user: {
              id: session.user.id,
              email: session.user.email || null,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              loginMethod: profile.login_method as any,
            },
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          };
        }
      }

      const guestData = await AsyncStorage.getItem('guest_user');
      if (guestData) {
        return {
          user: JSON.parse(guestData),
          accessToken: '',
          refreshToken: '',
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<AuthSession> {
    try {
      console.log('🔐 Starting Google Sign-In...');

      // Use Supabase's OAuth sign-in
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URI.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      console.log('🔐 Opening Google OAuth URL...');
      console.log('🔗 Redirect URI:', REDIRECT_URI.toString());

      // Open the OAuth URL in a web browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI.toString());
      console.log('📱 Browser result type:', result.type);

      if (result.type !== 'success') {
        throw new Error('Google sign-in was cancelled or failed');
      }

      // For WebBrowserAuthSessionResult, get the URL from the result
      const resultUrl = (result as any).url;
      console.log('📱 Callback URL received:', resultUrl ? 'Yes' : 'No');
      
      // Supabase handles the OAuth callback automatically via deep link
      // Just need to get the current session which should now be set
      console.log('🔄 Getting session from Supabase after OAuth...');
      
      // Add a small delay to allow Supabase to process the session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Failed to get session after OAuth: ' + sessionError.message);
      }
      
      if (!sessionData.session) {
        console.error('❌ No session found after OAuth');
        throw new Error('No session found after OAuth');
      }
      
      console.log('✅ Session obtained, user:', sessionData.session.user.email);

      // Process the session
      return await this.processGoogleSession(sessionData.session);
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  },

  /**
   * Process Google OAuth session and create/update profile
   */
  async processGoogleSession(session: any): Promise<AuthSession> {
    const user = session.user;
    if (!user) throw new Error('No user in session');

    console.log('👤 Processing Google user:', user.email);
    console.log('🆔 User ID from session:', user.id);

    const userName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0] || 
                    'Google User';

    const avatarUrl = user.user_metadata?.avatar_url || null;

    // Check if profile exists
    console.log('🔍 Checking if profile exists in Supabase users table...');
    const { data: existingProfile, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', selectError);
    }

    if (!existingProfile) {
      console.log('📝 Creating profile for Google user in Supabase...');
      console.log('📝 Profile data:', { id: user.id, email: user.email, name: userName });
      console.log('🔐 Current auth.uid() should be:', user.id);
      
      // First check if we have a valid session
      const { data: { session: currentSession }, error: sessionCheckError } = await supabase.auth.getSession();
      if (sessionCheckError) {
        console.error('❌ No active session when trying to create profile:', sessionCheckError);
      } else if (!currentSession) {
        console.error('❌ Session is null when trying to create profile');
      } else {
        console.log('✅ Active session found, user ID:', currentSession.user.id);
      }
      
      const { data: insertedProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: userName,
          login_method: 'google',
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error details:', JSON.stringify(insertError, null, 2));
        if (insertError.code === '23505') {
          console.log('⚠️ Profile already exists (race condition), continuing...');
        } else if (insertError.code === '42501') {
          console.error('❌ RLS policy violation - cannot insert profile');
          console.error('   This usually means the auth.uid() does not match the id being inserted');
          console.error('   Session user ID:', user.id);
          console.error('   Trying to insert ID:', user.id);
        } else {
          console.error('❌ Failed to create Google user profile:', insertError);
          // Don't throw - continue with local session even if Supabase insert fails
          console.log('⚠️ Continuing without Supabase profile - app will still work locally');
        }
      } else {
        console.log('✅ Profile created successfully:', insertedProfile);
      }
    } else {
      console.log('✅ Profile exists for Google user:', existingProfile.id);
    }

    const authSession: AuthSession = {
      user: {
        id: user.id,
        email: user.email || null,
        name: userName,
        avatarUrl: avatarUrl,
        loginMethod: 'google' as const,
      },
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };

    console.log('✅ Returning auth session for user:', authSession.user.id, authSession.user.email);
    return authSession;
  },
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'finmate://auth/reset-password',
      });
      if (error) throw error;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (error) {
      console.error('❌ Update password error:', error);
      throw error;
    }
  },
};
