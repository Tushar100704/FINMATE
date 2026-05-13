import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Supabase Config:');
console.log('  URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('  URL:', supabaseUrl);
  console.error('  Key:', supabaseAnonKey);
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for type safety
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          avatar_url: string | null;
          login_method: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name: string;
          avatar_url?: string | null;
          login_method: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string;
          avatar_url?: string | null;
          login_method?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'sent' | 'received';
          merchant: string;
          upi_id: string | null;
          category: string;
          date: string;
          time: string;
          status: 'completed' | 'pending' | 'failed';
          bank_account: string | null;
          upi_ref: string | null;
          notes: string | null;
          is_auto_detected: boolean;
          sms_id: string | null;
          confidence: number | null;
          is_shared: boolean;
          family_id: string | null;
          created_at: string;
          updated_at: string;
          synced_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          amount: number;
          type: 'sent' | 'received';
          merchant: string;
          upi_id?: string | null;
          category: string;
          date: string;
          time: string;
          status: 'completed' | 'pending' | 'failed';
          bank_account?: string | null;
          upi_ref?: string | null;
          notes?: string | null;
          is_auto_detected?: boolean;
          sms_id?: string | null;
          confidence?: number | null;
          is_shared?: boolean;
          family_id?: string | null;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: 'sent' | 'received';
          merchant?: string;
          upi_id?: string | null;
          category?: string;
          date?: string;
          time?: string;
          status?: 'completed' | 'pending' | 'failed';
          bank_account?: string | null;
          upi_ref?: string | null;
          notes?: string | null;
          is_auto_detected?: boolean;
          sms_id?: string | null;
          confidence?: number | null;
          is_shared?: boolean;
          family_id?: string | null;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          amount: number;
          spent: number;
          period: string;
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
          synced_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          category: string;
          amount: number;
          spent?: number;
          period: string;
          start_date: string;
          end_date: string;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          amount?: number;
          spent?: number;
          period?: string;
          start_date?: string;
          end_date?: string;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
        };
      };
      families: {
        Row: {
          id: string;
          name: string;
          created_by_user_id: string;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          created_by_user_id: string;
          invite_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by_user_id?: string;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_id?: string;
          role?: 'admin' | 'member';
          joined_at?: string;
        };
      };
    };
  };
};
