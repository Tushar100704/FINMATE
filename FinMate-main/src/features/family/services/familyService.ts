import * as SQLite from 'expo-sqlite';
import { supabase } from '../../../config/supabase';
import { 
  Family, 
  FamilyMember, 
  SharedTransaction, 
  FamilyWithMembers,
  CreateFamilyParams,
  JoinFamilyParams,
  ShareTransactionParams,
  FamilyAnalytics
} from '../types/family.types';
import { Transaction } from '../../../types';

const DB_NAME = 'finmate.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  
  try {
    console.log('👨‍👩‍👧‍👦 Opening family database:', DB_NAME);
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    
    if (!dbInstance) {
      throw new Error('Database instance is null after opening');
    }
    
    console.log('✅ Family database opened successfully');
    return dbInstance;
  } catch (error) {
    console.error('❌ Error opening family database:', error);
    throw new Error(`Failed to open database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const FamilyService = {
  async createFamily(params: CreateFamilyParams): Promise<Family> {
    try {
      console.log('👨‍👩‍👧‍👦 Creating family with params:', params);
      
      const database = await getDatabase();
      console.log('✅ Database instance obtained');
      
      const familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const inviteCode = this.generateInviteCode();
      const createdAt = Date.now();
      
      console.log('👨‍👩‍👧‍👦 Inserting family:', { familyId, name: params.name, inviteCode });

      try {
        await database.runAsync(
          `INSERT INTO families (id, name, createdByUserId, createdAt, inviteCode)
           VALUES (?, ?, ?, ?, ?)`,
          [familyId, params.name, params.createdByUserId, createdAt, inviteCode]
        );
        console.log('✅ Family inserted successfully');
      } catch (insertError) {
        console.error('❌ Error inserting family:', insertError);
        throw new Error(`Failed to insert family: ${insertError instanceof Error ? insertError.message : 'Unknown error'}`);
      }

      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('👨‍👩‍👧‍👦 Adding creator as admin member:', memberId);
      
      try {
        await database.runAsync(
          `INSERT INTO family_members (id, familyId, userId, role, joinedAt)
           VALUES (?, ?, ?, ?, ?)`,
          [memberId, familyId, params.createdByUserId, 'admin', createdAt]
        );
        console.log('✅ Family member inserted successfully');
      } catch (memberError) {
        console.error('❌ Error inserting family member:', memberError);
        throw new Error(`Failed to insert family member: ${memberError instanceof Error ? memberError.message : 'Unknown error'}`);
      }

      console.log('✅ Family created successfully:', familyId);
      
      // Sync to Supabase immediately for cross-device access
      console.log('☁️ Syncing family to Supabase...');
      
      // Check if user is authenticated with Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No Supabase session - user not authenticated');
        throw new Error('You must be logged in to create a family. Please sign in with Google and try again.');
      }
      
      console.log('✅ Supabase session found:', session.user.id);
      
      const { error: supabaseError } = await supabase
        .from('families')
        .insert({
          id: familyId,
          name: params.name,
          created_by_user_id: params.createdByUserId,
          invite_code: inviteCode,
          created_at: new Date(createdAt).toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (supabaseError) {
        console.error('❌ Failed to sync family to Supabase:', supabaseError);
        console.error('❌ Supabase error details:', JSON.stringify(supabaseError, null, 2));
        throw new Error(`Failed to sync family to cloud: ${supabaseError.message}. Family not created.`);
      }
      
      console.log('✅ Family synced to Supabase');
      
      // Also sync the family member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          id: memberId,
          family_id: familyId,
          user_id: params.createdByUserId,
          role: 'admin',
          joined_at: new Date(createdAt).toISOString(),
        });
      
      if (memberError) {
        console.error('❌ Failed to sync family member to Supabase:', memberError);
        console.error('❌ Member error details:', JSON.stringify(memberError, null, 2));
        throw new Error(`Failed to add you as family admin: ${memberError.message}`);
      }
      
      console.log('✅ Family member synced to Supabase');
      
      return {
        id: familyId,
        name: params.name,
        createdByUserId: params.createdByUserId,
        createdAt,
        inviteCode,
      };
    } catch (error) {
      console.error('❌ Create family error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  async getFamilyByUserId(userId: string): Promise<FamilyWithMembers | null> {
    const database = await getDatabase();

    console.log('🔍 Searching for family member with userId:', userId);
    
    // Join family_members with families to ensure we only get valid families
    // Order by joinedAt DESC to get the most recent family
    const result = await database.getFirstAsync<{ familyId: string; familyName: string }>(
      `SELECT fm.familyId, f.name as familyName 
       FROM family_members fm
       INNER JOIN families f ON fm.familyId = f.id
       WHERE fm.userId = ?
       ORDER BY fm.joinedAt DESC
       LIMIT 1`,
      [userId]
    );

    console.log('🔍 Family member with valid family found:', result);
    if (!result) {
      console.log('⚠️ No valid family found for user');
      return null;
    }

    const family = await database.getFirstAsync<Family>(
      'SELECT * FROM families WHERE id = ?',
      [result.familyId]
    );

    console.log('🔍 Family loaded:', family);
    if (!family) {
      return null;
    }

    const members = await database.getAllAsync<FamilyMember>(
      `SELECT fm.*, u.name as userName, u.email as userEmail 
       FROM family_members fm
       LEFT JOIN users u ON fm.userId = u.id
       WHERE fm.familyId = ?
       ORDER BY fm.role DESC, fm.joinedAt ASC`,
      [family.id]
    );

    return {
      ...family,
      members,
      memberCount: members.length,
    };
  },

  async getFamilyByInviteCode(inviteCode: string): Promise<Family | null> {
    try {
      console.log('🔍 Looking up family by invite code:', inviteCode);
      const database = await getDatabase();
      
      // First, check all families in local DB for debugging
      const allFamilies = await database.getAllAsync<Family>('SELECT * FROM families');
      console.log('📋 All families in local DB:', allFamilies?.length || 0);
      if (allFamilies && allFamilies.length > 0) {
        console.log('📋 Family invite codes:', allFamilies.map(f => f.inviteCode));
      }
      
      const family = await database.getFirstAsync<Family>(
        'SELECT * FROM families WHERE inviteCode = ?',
        [inviteCode]
      );

      if (family) {
        console.log('✅ Family found:', family.name, family.id);
      } else {
        console.log('❌ No family found with invite code:', inviteCode);
      }

      return family || null;
    } catch (error) {
      console.error('❌ Error looking up family by invite code:', error);
      throw error;
    }
  },

  async joinFamily(params: JoinFamilyParams): Promise<FamilyMember> {
    try {
      console.log('👨‍👩‍👧‍👦 Joining family with params:', params);
      const database = await getDatabase();

      // First try local database
      let family = await this.getFamilyByInviteCode(params.inviteCode);
      
      // If not found locally, check Supabase (for cross-device family sharing)
      if (!family) {
        console.log('🔍 Family not in local DB, checking Supabase...');
        try {
          const { data: supabaseFamily, error } = await supabase
            .from('families')
            .select('*')
            .eq('invite_code', params.inviteCode)
            .single();
          
          if (error) {
            console.error('❌ Supabase lookup error:', error);
          } else if (supabaseFamily) {
            console.log('✅ Family found in Supabase:', supabaseFamily.name);
            
            // Sync family to local database
            console.log('💾 Syncing family to local database...');
            await database.runAsync(
              `INSERT OR REPLACE INTO families (id, name, createdByUserId, createdAt, inviteCode)
               VALUES (?, ?, ?, ?, ?)`,
              [
                supabaseFamily.id,
                supabaseFamily.name,
                supabaseFamily.created_by_user_id,
                new Date(supabaseFamily.created_at).getTime(),
                supabaseFamily.invite_code
              ]
            );
            
            // Use the synced family
            family = {
              id: supabaseFamily.id,
              name: supabaseFamily.name,
              createdByUserId: supabaseFamily.created_by_user_id,
              createdAt: new Date(supabaseFamily.created_at).getTime(),
              inviteCode: supabaseFamily.invite_code,
            };
            console.log('✅ Family synced to local database');
          }
        } catch (supabaseError) {
          console.error('❌ Error checking Supabase:', supabaseError);
        }
      }
      
      if (!family) {
        console.error('❌ Invalid invite code - family not found in local DB or Supabase');
        throw new Error('Invalid invite code. Please check the code and try again.');
      }

      console.log('✅ Family found, checking if user is already a member...');
      const existingMember = await database.getFirstAsync<FamilyMember>(
        'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
        [family.id, params.userId]
      );

      if (existingMember) {
        console.log('⚠️ User is already a member');
        throw new Error('User is already a member of this family');
      }

      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const joinedAt = Date.now();

      console.log('👨‍👩‍👧‍👦 Adding user as family member...');
      await database.runAsync(
        `INSERT INTO family_members (id, familyId, userId, role, joinedAt)
         VALUES (?, ?, ?, ?, ?)`,
        [memberId, family.id, params.userId, 'member', joinedAt]
      );

      console.log('✅ User joined family successfully');
      
      // Sync to Supabase immediately
      try {
        console.log('☁️ Syncing family member to Supabase...');
        const { error: supabaseError } = await supabase
          .from('family_members')
          .insert({
            id: memberId,
            family_id: family.id,
            user_id: params.userId,
            role: 'member',
            joined_at: new Date(joinedAt).toISOString(),
          });
        
        if (supabaseError) {
          console.error('⚠️ Failed to sync family member to Supabase:', supabaseError);
          // Don't throw - member is added locally
        } else {
          console.log('✅ Family member synced to Supabase');
        }
      } catch (syncError) {
        console.error('⚠️ Error syncing to Supabase:', syncError);
      }
      
      return {
        id: memberId,
        familyId: family.id,
        userId: params.userId,
        role: 'member',
        joinedAt,
      };
    } catch (error) {
      console.error('❌ Join family error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  async shareTransaction(params: ShareTransactionParams): Promise<SharedTransaction> {
    const database = await getDatabase();

    const existingShare = await database.getFirstAsync<SharedTransaction>(
      'SELECT * FROM shared_transactions WHERE familyId = ? AND transactionId = ?',
      [params.familyId, params.transactionId]
    );

    if (existingShare) {
      throw new Error('Transaction is already shared with this family');
    }

    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sharedAt = Date.now();

    await database.runAsync(
      `INSERT INTO shared_transactions (id, familyId, transactionId, sharedByUserId, sharedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [shareId, params.familyId, params.transactionId, params.sharedByUserId, sharedAt]
    );

    await database.runAsync(
      `UPDATE transactions SET isShared = 1, familyId = ? WHERE id = ?`,
      [params.familyId, params.transactionId]
    );

    return {
      id: shareId,
      familyId: params.familyId,
      transactionId: params.transactionId,
      sharedByUserId: params.sharedByUserId,
      sharedAt,
    };
  },

  async unshareTransaction(transactionId: string, familyId: string): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      'DELETE FROM shared_transactions WHERE transactionId = ? AND familyId = ?',
      [transactionId, familyId]
    );

    await database.runAsync(
      'UPDATE transactions SET isShared = 0, familyId = NULL WHERE id = ?',
      [transactionId]
    );
  },

  async getSharedTransactions(familyId: string): Promise<Transaction[]> {
    const database = await getDatabase();

    const transactions = await database.getAllAsync<Transaction>(
      `SELECT t.*, st.sharedByUserId, st.sharedAt, u.name as sharedByUserName
       FROM transactions t
       INNER JOIN shared_transactions st ON t.id = st.transactionId
       LEFT JOIN users u ON st.sharedByUserId = u.id
       WHERE st.familyId = ?
       ORDER BY t.date DESC, t.time DESC`,
      [familyId]
    );

    return transactions;
  },

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    const database = await getDatabase();

    const members = await database.getAllAsync<FamilyMember>(
      `SELECT fm.*, u.name as userName, u.email as userEmail 
       FROM family_members fm
       LEFT JOIN users u ON fm.userId = u.id
       WHERE fm.familyId = ?
       ORDER BY fm.role DESC, fm.joinedAt ASC`,
      [familyId]
    );

    return members;
  },

  async removeMember(familyId: string, userId: string, requestingUserId: string): Promise<void> {
    const database = await getDatabase();

    const requestingMember = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, requestingUserId]
    );

    if (!requestingMember || requestingMember.role !== 'admin') {
      throw new Error('Only admins can remove members');
    }

    const targetMember = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );

    if (!targetMember) {
      throw new Error('Member not found');
    }

    if (targetMember.role === 'admin') {
      const adminCount = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM family_members WHERE familyId = ? AND role = ?',
        [familyId, 'admin']
      );

      if (adminCount && adminCount.count <= 1) {
        throw new Error('Cannot remove the last admin');
      }
    }

    await database.runAsync(
      'DELETE FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );
  },

  async leaveFamily(familyId: string, userId: string): Promise<void> {
    const database = await getDatabase();

    const member = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );

    if (!member) {
      throw new Error('Not a member of this family');
    }

    if (member.role === 'admin') {
      const adminCount = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM family_members WHERE familyId = ? AND role = ?',
        [familyId, 'admin']
      );

      if (adminCount && adminCount.count <= 1) {
        throw new Error('Cannot leave as the last admin. Transfer admin role or delete the family.');
      }
    }

    await database.runAsync(
      'DELETE FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );
  },

  async deleteFamily(familyId: string, userId: string): Promise<void> {
    const database = await getDatabase();

    const member = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );

    if (!member || member.role !== 'admin') {
      throw new Error('Only admins can delete the family');
    }

    await database.runAsync(
      'DELETE FROM families WHERE id = ?',
      [familyId]
    );
  },

  async getFamilyAnalytics(familyId: string, startDate?: string, endDate?: string): Promise<FamilyAnalytics> {
    const database = await getDatabase();

    let dateFilter = '';
    const params: any[] = [familyId];

    if (startDate && endDate) {
      dateFilter = 'AND t.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const transactions = await database.getAllAsync<Transaction & { sharedByUserId: string; userName: string }>(
      `SELECT t.*, st.sharedByUserId, u.name as userName
       FROM transactions t
       INNER JOIN shared_transactions st ON t.id = st.transactionId
       LEFT JOIN users u ON st.sharedByUserId = u.id
       WHERE st.familyId = ? ${dateFilter}`,
      params
    );

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, number>();
    transactions.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const memberMap = new Map<string, { userId: string; userName: string; amount: number }>();
    transactions.forEach(t => {
      const existing = memberMap.get(t.sharedByUserId);
      if (existing) {
        existing.amount += t.amount;
      } else {
        memberMap.set(t.sharedByUserId, {
          userId: t.sharedByUserId,
          userName: t.userName || 'Unknown',
          amount: t.amount,
        });
      }
    });

    const memberContributions = Array.from(memberMap.values()).map(m => ({
      ...m,
      percentage: totalSpending > 0 ? (m.amount / totalSpending) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const monthMap = new Map<string, number>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + t.amount);
    });

    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalSpending,
      categoryBreakdown,
      memberContributions,
      monthlyTrend,
    };
  },

  generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  async validateInviteCode(inviteCode: string): Promise<{ isValid: boolean; family?: Family; error?: string }> {
    try {
      const family = await this.getFamilyByInviteCode(inviteCode);
      if (!family) {
        return { isValid: false, error: 'Invalid invite code' };
      }
      return { isValid: true, family };
    } catch (error) {
      return { isValid: false, error: 'Error validating invite code' };
    }
  },
};
