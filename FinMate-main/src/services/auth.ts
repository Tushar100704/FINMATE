import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDB } from './database';

const SESSION_KEY = '@finmate_session';
const CURRENT_USER_KEY = '@finmate_current_user';

export interface Session {
  isLoggedIn: boolean;
  userId: string;
  email?: string;
  name?: string;
  loginMethod: 'email' | 'google' | 'guest';
  loginTime: string;
}

export const AuthService = {
  /**
   * Save session data
   */
  async saveSession(session: Session): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session?.isLoggedIn || false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current user ID
   */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const session = await this.getSession();
      return session?.userId || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Login with email
   */
  async loginWithEmail(email: string, password: string): Promise<Session> {
    // Check if user exists
    let user = await UserDB.getByEmail(email);
    
    if (!user) {
      // Create new user
      const userId = 'user_' + Date.now();
      await UserDB.create({
        id: userId,
        email,
        name: email.split('@')[0], // Use email prefix as name
        loginMethod: 'email',
      });
      user = { id: userId, email, name: email.split('@')[0] };
    }

    return {
      isLoggedIn: true,
      userId: user.id,
      email: user.email,
      name: user.name,
      loginMethod: 'email',
      loginTime: new Date().toISOString(),
    };
  },

  /**
   * Login as guest
   */
  async loginAsGuest(): Promise<Session> {
    const userId = 'guest_' + Date.now();
    
    // Create guest user
    await UserDB.create({
      id: userId,
      name: 'Guest User',
      loginMethod: 'guest',
    });

    return {
      isLoggedIn: true,
      userId,
      name: 'Guest User',
      loginMethod: 'guest',
      loginTime: new Date().toISOString(),
    };
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  /**
   * Clear all data (for testing)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
