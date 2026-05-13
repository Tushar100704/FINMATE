import { supabase } from '../config/supabase';
import { TransactionDB, BudgetDB } from './database';
import { Transaction, Budget } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncStatus {
  lastSyncTime: string | null;
  pendingUploads: number;
  isSyncing: boolean;
}

/**
 * Sync Service
 * Handles bidirectional sync between local SQLite and Supabase
 * Implements offline-first architecture with conflict resolution
 */
export const SyncService = {
  syncStatus: {
    lastSyncTime: null,
    pendingUploads: 0,
    isSyncing: false,
  } as SyncStatus,

  currentUserId: null as string | null,
  syncInterval: null as NodeJS.Timeout | null,

  /**
   * Initialize sync service and start periodic sync
   */
  async initialize(userId: string): Promise<void> {
    console.log('🔄 Initializing sync service for user:', userId);
    
    // Clear any existing sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Update current user ID
    this.currentUserId = userId;
    
    // Load last sync time
    const lastSync = await AsyncStorage.getItem(`last_sync_${userId}`);
    this.syncStatus.lastSyncTime = lastSync;

    // Start periodic sync (every 30 seconds when online)
    this.startPeriodicSync(userId);
  },

  /**
   * Start periodic sync timer
   */
  startPeriodicSync(userId: string): void {
    // Clear existing interval if any
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      // Only sync if this is still the current user
      if (this.currentUserId === userId && !this.syncStatus.isSyncing) {
        await this.performSync(userId);
      }
    }, 30000); // 30 seconds
  },

  /**
   * Perform full bidirectional sync
   */
  async performSync(userId: string): Promise<void> {
    if (this.syncStatus.isSyncing) {
      console.log('⏭️ Sync already in progress, skipping...');
      return;
    }

    try {
      this.syncStatus.isSyncing = true;
      console.log('🔄 Starting sync for user:', userId);

      // Check if user is guest (skip cloud sync for guests)
      if (userId.startsWith('guest_')) {
        console.log('👤 Guest user, skipping cloud sync');
        return;
      }

      // 1. Upload local changes to Supabase
      await this.uploadLocalChanges(userId);

      // 2. Download remote changes from Supabase
      await this.downloadRemoteChanges(userId);

      // 3. Update last sync time
      const now = new Date().toISOString();
      await AsyncStorage.setItem(`last_sync_${userId}`, now);
      this.syncStatus.lastSyncTime = now;

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync error:', error);
      // Don't throw - we'll retry on next sync
    } finally {
      this.syncStatus.isSyncing = false;
    }
  },

  /**
   * Upload local changes to Supabase
   */
  async uploadLocalChanges(userId: string): Promise<void> {
    try {
      // Get all local transactions that haven't been synced
      const localTransactions = await TransactionDB.getAll(userId);
      const unsyncedTransactions = localTransactions.filter((t: any) => 
        !t.syncedAt || new Date(t.syncedAt) < new Date(t.createdAt)
      );

      if (unsyncedTransactions.length > 0) {
        console.log(`⬆️ Uploading ${unsyncedTransactions.length} transactions...`);

        for (const transaction of unsyncedTransactions) {
          // Skip transactions that don't belong to the current user
          // This prevents foreign key constraint errors from old guest/local user data
          const txUserId = (transaction as any).userId;
          if (txUserId && txUserId !== userId) {
            console.log(`⚠️ Skipping transaction ${transaction.id} - belongs to different user (${txUserId})`);
            continue;
          }

          // Check if transaction exists in Supabase
          const { data: existing } = await supabase
            .from('transactions')
            .select('id, updated_at')
            .eq('id', transaction.id)
            .single();

          const transactionData = {
            id: transaction.id,
            user_id: userId,
            amount: transaction.amount,
            type: transaction.type,
            merchant: transaction.merchant,
            upi_id: transaction.upiId || null,
            category: transaction.category,
            date: transaction.date,
            time: transaction.time,
            status: transaction.status,
            bank_account: transaction.bankAccount || null,
            upi_ref: transaction.upiRef || null,
            notes: transaction.notes || null,
            is_auto_detected: transaction.isAutoDetected || false,
            sms_id: transaction.smsId || null,
            confidence: transaction.confidence || null,
            is_shared: transaction.isShared || false,
            family_id: transaction.familyId || null,
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            // Update existing
            const { error } = await supabase
              .from('transactions')
              .update(transactionData)
              .eq('id', transaction.id);

            if (error) throw error;
          } else {
            // Insert new
            const { error } = await supabase
              .from('transactions')
              .insert(transactionData);

            if (error) throw error;
          }

          // Mark as synced in local DB
          await TransactionDB.markAsSynced(transaction.id);
        }
      }

      // Upload budgets
      const localBudgets = await BudgetDB.getAll(userId);
      const unsyncedBudgets = localBudgets.filter((b: any) => 
        !b.syncedAt || new Date(b.syncedAt) < new Date(b.createdAt)
      );

      if (unsyncedBudgets.length > 0) {
        console.log(`⬆️ Uploading ${unsyncedBudgets.length} budgets...`);

        for (const budget of unsyncedBudgets) {
          const { data: existing } = await supabase
            .from('budgets')
            .select('id')
            .eq('id', budget.id)
            .single();

          const budgetData = {
            id: budget.id,
            user_id: userId,
            category: budget.category,
            amount: budget.amount,
            spent: budget.spent,
            period: budget.period,
            start_date: budget.startDate,
            end_date: budget.endDate,
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            const { error } = await supabase
              .from('budgets')
              .update(budgetData)
              .eq('id', budget.id);

            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('budgets')
              .insert(budgetData);

            if (error) throw error;
          }

          await BudgetDB.markAsSynced(budget.id);
        }
      }

      // Upload families
      const database = await TransactionDB.getAll(userId).then(() => 
        require('expo-sqlite').openDatabaseAsync('finmate.db')
      );
      
      const families = await database.getAllAsync(
        'SELECT * FROM families WHERE createdByUserId = ?',
        [userId]
      );

      if (families && families.length > 0) {
        console.log(`⬆️ Uploading ${families.length} families...`);
        
        for (const family of families as any[]) {
          const { data: existing } = await supabase
            .from('families')
            .select('id')
            .eq('id', family.id)
            .single();

          const familyData = {
            id: family.id,
            name: family.name,
            created_by_user_id: family.createdByUserId,
            invite_code: family.inviteCode,
            created_at: new Date(family.createdAt).toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            await supabase.from('families').update(familyData).eq('id', family.id);
          } else {
            await supabase.from('families').insert(familyData);
          }
        }
      }

      // Upload family members
      const members = await database.getAllAsync(
        `SELECT fm.* FROM family_members fm
         JOIN families f ON fm.familyId = f.id
         WHERE f.createdByUserId = ? OR fm.userId = ?`,
        [userId, userId]
      );

      if (members && members.length > 0) {
        console.log(`⬆️ Uploading ${members.length} family members...`);
        
        for (const member of members as any[]) {
          const { data: existing } = await supabase
            .from('family_members')
            .select('id')
            .eq('id', member.id)
            .single();

          const memberData = {
            id: member.id,
            family_id: member.familyId,
            user_id: member.userId,
            role: member.role,
            joined_at: new Date(member.joinedAt).toISOString(),
          };

          if (existing) {
            await supabase.from('family_members').update(memberData).eq('id', member.id);
          } else {
            await supabase.from('family_members').insert(memberData);
          }
        }
      }

      // Upload shared transactions
      const sharedTransactions = await database.getAllAsync(
        `SELECT st.* FROM shared_transactions st
         WHERE st.sharedByUserId = ?`,
        [userId]
      );

      if (sharedTransactions && sharedTransactions.length > 0) {
        console.log(`⬆️ Uploading ${sharedTransactions.length} shared transactions...`);
        
        for (const shared of sharedTransactions as any[]) {
          const { data: existing } = await supabase
            .from('shared_transactions')
            .select('id')
            .eq('id', shared.id)
            .single();

          const sharedData = {
            id: shared.id,
            family_id: shared.familyId,
            transaction_id: shared.transactionId,
            shared_by_user_id: shared.sharedByUserId,
            shared_at: new Date(shared.sharedAt).toISOString(),
          };

          if (existing) {
            await supabase.from('shared_transactions').update(sharedData).eq('id', shared.id);
          } else {
            await supabase.from('shared_transactions').insert(sharedData);
          }
        }
      }

      this.syncStatus.pendingUploads = 0;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  },

  /**
   * Download remote changes from Supabase
   */
  async downloadRemoteChanges(userId: string): Promise<void> {
    try {
      const lastSync = this.syncStatus.lastSyncTime || '1970-01-01T00:00:00Z';

      // Download transactions updated since last sync
      const { data: remoteTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSync);

      if (txError) throw txError;

      if (remoteTransactions && remoteTransactions.length > 0) {
        console.log(`⬇️ Downloading ${remoteTransactions.length} transactions...`);

        for (const remote of remoteTransactions) {
          const transaction: Transaction & { userId: string; syncedAt?: string } = {
            id: remote.id,
            userId: remote.user_id,
            amount: remote.amount,
            type: remote.type,
            merchant: remote.merchant,
            upiId: remote.upi_id || '',
            category: remote.category,
            date: remote.date,
            time: remote.time,
            status: remote.status,
            bankAccount: remote.bank_account || '',
            upiRef: remote.upi_ref || '',
            notes: remote.notes || '',
            isAutoDetected: remote.is_auto_detected || false,
            smsId: remote.sms_id || '',
            confidence: remote.confidence || 0,
            isShared: remote.is_shared || false,
            familyId: remote.family_id || '',
            syncedAt: remote.synced_at || new Date().toISOString(),
          };

          // Check if exists locally
          const localExists = await TransactionDB.getById(transaction.id);

          if (localExists) {
            // Update local
            await TransactionDB.update(transaction.id, transaction);
          } else {
            // Insert new
            await TransactionDB.create(transaction);
          }
        }
      }

      // Download budgets
      const { data: remoteBudgets, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSync);

      if (budgetError) throw budgetError;

      if (remoteBudgets && remoteBudgets.length > 0) {
        console.log(`⬇️ Downloading ${remoteBudgets.length} budgets...`);

        for (const remote of remoteBudgets) {
          const budget: Budget & { userId: string; syncedAt?: string } = {
            id: remote.id,
            userId: remote.user_id,
            category: remote.category,
            amount: remote.amount,
            spent: remote.spent,
            period: remote.period,
            startDate: remote.start_date,
            endDate: remote.end_date,
            syncedAt: remote.synced_at || new Date().toISOString(),
          };

          const localExists = await BudgetDB.getById(budget.id);

          if (localExists) {
            await BudgetDB.update(budget.id, budget);
          } else {
            await BudgetDB.create(budget);
          }
        }
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      throw error;
    }
  },

  /**
   * Force immediate sync
   */
  async forceSyncNow(userId: string): Promise<void> {
    console.log('⚡ Force sync requested');
    await this.performSync(userId);
  },

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  },

  /**
   * Subscribe to real-time changes for family sharing
   */
  subscribeToFamilyChanges(userId: string, familyId: string, onUpdate: () => void): () => void {
    console.log('👨‍👩‍👧‍👦 Subscribing to family changes:', familyId);

    const channel = supabase
      .channel(`family_${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload);
          // Trigger sync to get latest data
          this.performSync(userId).then(() => {
            onUpdate();
          });
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      console.log('🔌 Unsubscribing from family changes');
      supabase.removeChannel(channel);
    };
  },
};
