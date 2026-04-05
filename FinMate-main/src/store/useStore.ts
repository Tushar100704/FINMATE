// Global State Management with Zustand
import { create } from 'zustand';
import { Transaction, Budget, Alert, User, SMSPermissionStatus } from '../types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (id: string) => void;
  deleteAlert: (id: string) => void;

  // SMS State
  smsPermissionStatus: SMSPermissionStatus | null;
  setSMSPermissionStatus: (status: SMSPermissionStatus | null) => void;
  smsProcessingEnabled: boolean;
  setSMSProcessingEnabled: (enabled: boolean) => void;
  lastSMSProcessingTime: string | null;
  setLastSMSProcessingTime: (time: string | null) => void;
  autoDetectedTransactionCount: number;
  setAutoDetectedTransactionCount: (count: number) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  
  selectedTimeframe: 'week' | 'month' | 'year';
  setSelectedTimeframe: (timeframe: 'week' | 'month' | 'year') => void;

  // Reset all store data
  resetStore: () => void;
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),
  currentUserId: null,
  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  // Transactions
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  // Budgets
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  addBudget: (budget) =>
    set((state) => ({
      budgets: [...state.budgets, budget],
    })),
  updateBudget: (id, updates) =>
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),
  deleteBudget: (id) =>
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    })),

  // Alerts
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),
  markAlertAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ),
    })),
  deleteAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  // SMS State
  smsPermissionStatus: null,
  setSMSPermissionStatus: (status) => set({ smsPermissionStatus: status }),
  smsProcessingEnabled: false,
  setSMSProcessingEnabled: (enabled) => set({ smsProcessingEnabled: enabled }),
  lastSMSProcessingTime: null,
  setLastSMSProcessingTime: (time) => set({ lastSMSProcessingTime: time }),
  autoDetectedTransactionCount: 0,
  setAutoDetectedTransactionCount: (count) => set({ autoDetectedTransactionCount: count }),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  
  selectedTimeframe: 'month',
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),

  // Reset all store data (call when switching users)
  resetStore: () => set({
    user: null,
    currentUserId: null,
    transactions: [],
    budgets: [],
    alerts: [],
    smsPermissionStatus: null,
    smsProcessingEnabled: false,
    lastSMSProcessingTime: null,
    autoDetectedTransactionCount: 0,
    isLoading: false,
    selectedMonth: new Date().toISOString().slice(0, 7),
    selectedTimeframe: 'month',
  }),
}));
