// SQLite Database Service
import * as SQLite from 'expo-sqlite';
import { Transaction, Budget, Alert } from '../types';

const DB_NAME = 'finmate.db';
const DB_VERSION = 6; // Increment this when schema changes (added syncedAt columns for Supabase sync)

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or initialize database
 */
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  try {
    console.log('📂 Opening database:', DB_NAME);
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    if (!db) {
      throw new Error('Database instance is null after opening');
    }
    
    console.log('✅ Database opened successfully');
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Check if database needs migration
 */
async function needsMigration(database: SQLite.SQLiteDatabase): Promise<boolean> {
  try {
    // Check for new columns added in version 6 (isShared, familyId, syncedAt)
    const result = await database.getFirstAsync(
      "SELECT isShared, syncedAt FROM transactions LIMIT 1"
    );
    return false; // Columns exist, no migration needed
  } catch (error) {
    return true; // Columns don't exist, need migration
  }
}

/**
 * Drop all tables for fresh start
 */
async function dropAllTables(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🗑️ Dropping old tables...');
  await database.execAsync(`
    DROP TABLE IF EXISTS shared_transactions;
    DROP TABLE IF EXISTS family_members;
    DROP TABLE IF EXISTS families;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS alerts;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS bank_accounts;
    DROP TABLE IF EXISTS processed_sms;
  `);
  console.log('✅ Old tables dropped');
}

/**
 * Initialize database and create tables
 */
export async function initDatabase(): Promise<void> {
  let retries = 3;
  let lastError: any = null;
  
  while (retries > 0) {
    try {
      console.log(`🔄 Initializing database (attempts left: ${retries})...`);
      const database = await getDatabase();
      
      if (!database) {
        throw new Error('Failed to get database instance');
      }
      
      // Check if migration is needed
      const shouldMigrate = await needsMigration(database);
      
      if (shouldMigrate) {
        console.log('⚠️ Database schema changed, recreating tables...');
        await dropAllTables(database);
      }
      
      // Create all tables in a single transaction
      await database.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT NOT NULL,
        loginMethod TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        merchant TEXT NOT NULL,
        upiId TEXT,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        bankAccount TEXT,
        upiRef TEXT,
        notes TEXT,
        isAutoDetected INTEGER DEFAULT 0,
        smsId TEXT,
        confidence REAL,
        isShared INTEGER DEFAULT 0,
        familyId TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        syncedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (familyId) REFERENCES families(id)
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        period TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        syncedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(userId, category)
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        actionRequired INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        budget REAL
      );
      
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        bankName TEXT NOT NULL,
        accountNumber TEXT NOT NULL,
        accountHolderName TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS processed_sms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        smsId TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL UNIQUE,
        body TEXT NOT NULL,
        address TEXT NOT NULL,
        date INTEGER NOT NULL,
        transactionId TEXT,
        processedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        userId TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (transactionId) REFERENCES transactions(id)
      );
      
      CREATE TABLE IF NOT EXISTS families (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdByUserId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        inviteCode TEXT NOT NULL UNIQUE,
        FOREIGN KEY (createdByUserId) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        familyId TEXT NOT NULL,
        userId TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'member')),
        joinedAt INTEGER NOT NULL,
        FOREIGN KEY (familyId) REFERENCES families(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(familyId, userId)
      );
      
      CREATE TABLE IF NOT EXISTS shared_transactions (
        id TEXT PRIMARY KEY,
        familyId TEXT NOT NULL,
        transactionId TEXT NOT NULL,
        sharedByUserId TEXT NOT NULL,
        sharedAt INTEGER NOT NULL,
        FOREIGN KEY (familyId) REFERENCES families(id) ON DELETE CASCADE,
        FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (sharedByUserId) REFERENCES users(id),
        UNIQUE(familyId, transactionId)
      );
      
      CREATE INDEX IF NOT EXISTS idx_processed_sms_hash ON processed_sms(hash);
      CREATE INDEX IF NOT EXISTS idx_processed_sms_user ON processed_sms(userId);
      CREATE INDEX IF NOT EXISTS idx_processed_sms_date ON processed_sms(date);
      CREATE INDEX IF NOT EXISTS idx_families_invite ON families(inviteCode);
      CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(familyId);
      CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(userId);
      CREATE INDEX IF NOT EXISTS idx_shared_transactions_family ON shared_transactions(familyId);
      CREATE INDEX IF NOT EXISTS idx_shared_transactions_transaction ON shared_transactions(transactionId);
    `);

      console.log('✅ Database initialized successfully');
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error;
      retries--;
      console.error(`❌ Database initialization error (${retries} retries left):`, error);
      
      if (retries > 0) {
        // Reset db instance to force reconnection
        db = null;
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error('❌ Database initialization failed after all retries');
  throw lastError || new Error('Database initialization failed');
}

/**
 * Transaction CRUD operations
 */
export const TransactionDB = {
  async create(transaction: Transaction & { userId: string; isShared?: boolean; familyId?: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO transactions (id, userId, amount, type, merchant, upiId, category, date, time, status, bankAccount, upiRef, notes, isAutoDetected, smsId, confidence, isShared, familyId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.userId,
        transaction.amount,
        transaction.type,
        transaction.merchant,
        transaction.upiId || '',
        transaction.category,
        transaction.date,
        transaction.time,
        transaction.status,
        transaction.bankAccount || '',
        transaction.upiRef || '',
        transaction.notes || '',
        transaction.isAutoDetected ? 1 : 0,
        transaction.smsId || null,
        transaction.confidence || null,
        transaction.isShared ? 1 : 0,
        transaction.familyId || null,
      ]
    );
  },

  async getAll(userId: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC, time DESC',
      [userId]
    );
    return result;
  },

  async getById(id: string): Promise<Transaction | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<Transaction>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return result || null;
  },

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
      [userId, startDate, endDate]
    );
    return result;
  },

  async getByCategory(userId: string, category: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE userId = ? AND category = ? ORDER BY date DESC',
      [userId, category]
    );
    return result;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE transactions SET ${fields} WHERE id = ?`,
      values
    );
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  },

  async deleteAll(): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM transactions');
  },

  async markAsSynced(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      'UPDATE transactions SET syncedAt = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
  },

  async getTotalSpent(startDate: string, endDate: string, userId: string): Promise<number> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ total: number }>(
      `SELECT SUM(amount) as total FROM transactions 
       WHERE userId = ? AND type = 'sent' AND date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );
    return result?.total || 0;
  },

  async getCategorySpending(category: string, startDate: string, endDate: string): Promise<number> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ total: number }>(
      `SELECT SUM(amount) as total FROM transactions 
       WHERE type = 'sent' AND category = ? AND date BETWEEN ? AND ?`,
      [category, startDate, endDate]
    );
    return result?.total || 0;
  },
};

/**
 * Budget CRUD operations
 */
export const BudgetDB = {
  async create(budget: Budget & { userId: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO budgets (id, userId, category, amount, spent, period, startDate, endDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [budget.id, budget.userId, budget.category, budget.amount, budget.spent, budget.period, budget.startDate, budget.endDate]
    );
  },

  async getAll(userId: string): Promise<Budget[]> {
    const database = await getDatabase();
    
    try {
      const result = await database.getAllAsync<Budget>(
        'SELECT * FROM budgets WHERE userId = ? ORDER BY category',
        [userId]
      );
      return result || [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  },

  async getByCategory(userId: string, category: string): Promise<Budget | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<Budget>(
      'SELECT * FROM budgets WHERE userId = ? AND category = ?',
      [userId, category]
    );
    return result || null;
  },

  async update(id: string, updates: Partial<Budget>): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE budgets SET ${fields} WHERE id = ?`,
      values
    );
  },

  async updateSpent(userId: string, category: string, amount: number): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      'UPDATE budgets SET spent = spent + ? WHERE userId = ? AND category = ?',
      [amount, userId, category]
    );
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
  },

  async deleteAll(): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM budgets');
  },

  async markAsSynced(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      'UPDATE budgets SET syncedAt = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
  },

  async getById(id: string): Promise<Budget | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<Budget>(
      'SELECT * FROM budgets WHERE id = ?',
      [id]
    );
    return result || null;
  },
};

/**
 * Alert CRUD operations
 */
export const AlertDB = {
  async create(alert: Alert): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO alerts (id, type, title, message, date, read, actionRequired)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alert.id, alert.type, alert.title, alert.message, alert.date, alert.read ? 1 : 0, alert.actionRequired ? 1 : 0]
    );
  },

  async getAll(): Promise<Alert[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Alert>('SELECT * FROM alerts ORDER BY date DESC');
    return result;
  },

  async markAsRead(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('UPDATE alerts SET read = 1 WHERE id = ?', [id]);
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM alerts WHERE id = ?', [id]);
  },
};

/**
 * User CRUD operations
 */
export const UserDB = {
  async create(user: { id: string; email?: string; name: string; loginMethod: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT OR REPLACE INTO users (id, email, name, loginMethod)
       VALUES (?, ?, ?, ?)`,
      [user.id, user.email || null, user.name, user.loginMethod]
    );
  },

  async getById(id: string): Promise<any | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return result || null;
  },

  async getByEmail(email: string): Promise<any | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return result || null;
  },

  async update(id: string, updates: { name?: string; email?: string }): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );
  },
};

/**
 * Bank Account CRUD operations
 */
export const BankAccountDB = {
  async create(account: { id: string; userId: string; bankName: string; accountNumber: string; accountHolderName: string; status: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO bank_accounts (id, userId, bankName, accountNumber, accountHolderName, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [account.id, account.userId, account.bankName, account.accountNumber, account.accountHolderName, account.status]
    );
  },

  async getAllByUser(userId: string): Promise<any[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<any>(
      'SELECT * FROM bank_accounts WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    return result;
  },

  async update(id: string, updates: { status?: string; bankName?: string }): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE bank_accounts SET ${fields} WHERE id = ?`,
      values
    );
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM bank_accounts WHERE id = ?', [id]);
  },
};

/**
 * Processed SMS CRUD operations for deduplication
 */
export const ProcessedSMSDB = {
  async create(record: {
    smsId: string;
    hash: string;
    body: string;
    address: string;
    date: number;
    transactionId?: string;
    userId: string;
  }): Promise<void> {
    const database = await getDatabase();
    
    try {
      await database.runAsync(
        `INSERT OR IGNORE INTO processed_sms (smsId, hash, body, address, date, transactionId, userId)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [record.smsId, record.hash, record.body, record.address, record.date, record.transactionId || null, record.userId]
      );
    } catch (error: any) {
      // Ignore duplicate errors
      if (!error?.toString().includes('UNIQUE constraint')) {
        throw error;
      }
    }
  },

  async exists(hash: string): Promise<boolean> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM processed_sms WHERE hash = ?',
      [hash]
    );
    
    return (result?.count || 0) > 0;
  },

  async existsBySmsId(smsId: string): Promise<boolean> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM processed_sms WHERE smsId = ?',
      [smsId]
    );
    
    return (result?.count || 0) > 0;
  },

  async getByHash(hash: string): Promise<any | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM processed_sms WHERE hash = ?',
      [hash]
    );
    
    return result || null;
  },

  async getAllByUser(userId: string, limit: number = 1000): Promise<any[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<any>(
      'SELECT * FROM processed_sms WHERE userId = ? ORDER BY processedAt DESC LIMIT ?',
      [userId, limit]
    );
    
    return result;
  },

  async getStats(userId: string): Promise<{
    totalProcessed: number;
    lastProcessedAt: string | null;
    withTransactions: number;
    withoutTransactions: number;
  }> {
    const database = await getDatabase();
    
    const total = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM processed_sms WHERE userId = ?',
      [userId]
    );
    
    const withTx = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM processed_sms WHERE userId = ? AND transactionId IS NOT NULL',
      [userId]
    );
    
    const latest = await database.getFirstAsync<{ processedAt: string }>(
      'SELECT processedAt FROM processed_sms WHERE userId = ? ORDER BY processedAt DESC LIMIT 1',
      [userId]
    );
    
    return {
      totalProcessed: total?.count || 0,
      lastProcessedAt: latest?.processedAt || null,
      withTransactions: withTx?.count || 0,
      withoutTransactions: (total?.count || 0) - (withTx?.count || 0),
    };
  },

  async deleteOldRecords(userId: string, keepCount: number = 1000): Promise<void> {
    const database = await getDatabase();
    
    // Keep only the most recent records
    await database.runAsync(
      `DELETE FROM processed_sms 
       WHERE userId = ? AND id NOT IN (
         SELECT id FROM processed_sms 
         WHERE userId = ? 
         ORDER BY processedAt DESC 
         LIMIT ?
       )`,
      [userId, userId, keepCount]
    );
  },

  async clear(userId: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM processed_sms WHERE userId = ?', [userId]);
  },
};

/**
 * Clear all user-specific data from local database
 * Call this when switching users to prevent data leakage
 */
export async function clearUserData(userId?: string): Promise<void> {
  try {
    const database = await getDatabase();
    console.log('🧹 Clearing local database data...');
    
    if (userId) {
      // Clear specific user's data
      await database.runAsync('DELETE FROM transactions WHERE userId = ?', [userId]);
      await database.runAsync('DELETE FROM budgets WHERE userId = ?', [userId]);
      await database.runAsync('DELETE FROM alerts WHERE userId = ?', [userId]);
      await database.runAsync('DELETE FROM processed_sms WHERE userId = ?', [userId]);
      console.log('✅ Cleared data for user:', userId);
    } else {
      // Clear all user data (when logging out completely)
      await database.runAsync('DELETE FROM transactions');
      await database.runAsync('DELETE FROM budgets');
      await database.runAsync('DELETE FROM alerts');
      await database.runAsync('DELETE FROM processed_sms');
      await database.runAsync('DELETE FROM shared_transactions');
      await database.runAsync('DELETE FROM family_members');
      await database.runAsync('DELETE FROM families');
      console.log('✅ Cleared all local data');
    }
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM alerts;
    DELETE FROM categories;
  `);
}
