// Mock Data for Testing
import { Transaction } from '../types';
import { generateId, getCurrentTime, convertDateFormat } from './helpers';
import { TransactionDB, BudgetDB, initDatabase } from '../services/database';

export const mockTransactions: Transaction[] = [
  {
    id: generateId(),
    amount: 517,
    type: 'sent',
    merchant: 'Blinkit',
    upiId: 'blinkit.rzp@hdfcbank',
    category: 'Groceries',
    date: '2025-01-10',
    time: '2:30 PM',
    status: 'completed',
    bankAccount: 'Kotak Bank AC X1583',
    upiRef: '503375635902',
  },
  {
    id: generateId(),
    amount: 279,
    type: 'sent',
    merchant: 'Swiggy',
    upiId: 'swiggy.stores@axb',
    category: 'Food',
    date: '2025-01-10',
    time: '1:15 PM',
    status: 'completed',
    bankAccount: 'Kotak Bank AC X1583',
    upiRef: '855213575788',
  },
  {
    id: generateId(),
    amount: 4000,
    type: 'received',
    merchant: 'Mukund Chavan',
    upiId: 'officialmukundchavan@ybl',
    category: 'Income',
    date: '2025-01-09',
    time: '11:45 AM',
    status: 'completed',
    bankAccount: 'Kotak Bank AC X1583',
    upiRef: '594643829151',
  },
  {
    id: generateId(),
    amount: 199,
    type: 'sent',
    merchant: 'Airtel',
    upiId: 'airtel@paytm',
    category: 'Recharge/Bills',
    date: '2025-01-09',
    time: '10:30 AM',
    status: 'completed',
    bankAccount: 'Kotak Bank AC X1583',
    upiRef: '464742056460',
  },
  {
    id: generateId(),
    amount: 7000,
    type: 'sent',
    merchant: 'Personal Transfer',
    upiId: '9545948928@yescred',
    category: 'P2P',
    date: '2025-01-08',
    time: '6:45 PM',
    status: 'completed',
    bankAccount: 'Kotak Bank AC X1583',
    upiRef: '078407598882',
  },
];

export async function seedMockData() {
  try {
    // Initialize database
    await initDatabase();

    // Check if transactions already exist
    const existingTransactions = await TransactionDB.getAll();
    if (existingTransactions.length === 0) {
      console.log('📝 Seeding transactions...');
      // Seed transactions
      for (const transaction of mockTransactions) {
        await TransactionDB.create(transaction);
      }
      console.log('✅ Transactions seeded');
    } else {
      console.log('✅ Transactions already exist');
    }

    // Check if budgets already exist
    const existingBudgets = await BudgetDB.getAll();
    if (existingBudgets.length === 0) {
      console.log('📝 Seeding budgets...');
      // Seed budgets
      const mockBudgets = [
        {
          id: generateId(),
          category: 'Food',
          amount: 2000,
          spent: 0,
          period: 'monthly' as const,
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        },
        {
          id: generateId(),
          category: 'Groceries',
          amount: 3000,
          spent: 0,
          period: 'monthly' as const,
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        },
        {
          id: generateId(),
          category: 'Recharge/Bills',
          amount: 800,
          spent: 0,
          period: 'monthly' as const,
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        },
      ];

      for (const budget of mockBudgets) {
        await BudgetDB.create(budget);
      }
      console.log('✅ Budgets seeded');
    } else {
      console.log('✅ Budgets already exist');
    }

    console.log('✅ Mock data initialization complete');
  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    throw error;
  }
}
