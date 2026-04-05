// Zustand selectors for derived state
import { useStore } from './useStore';
import { Transaction } from '../types';
import { useMemo } from 'react';

/**
 * Get transactions filtered by timeframe
 */
export function useTransactionsByTimeframe(timeframe: 'week' | 'month' | 'year') {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    const now = new Date();
    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      
      switch (timeframe) {
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txDate >= weekAgo;
        }
        case 'month': {
          return (
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear()
          );
        }
        case 'year': {
          return txDate.getFullYear() === now.getFullYear();
        }
        default:
          return true;
      }
    });
    
    return filtered;
  }, [transactions, timeframe]);
}

/**
 * Get transactions filtered by category
 */
export function useTransactionsByCategory(category?: string) {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    if (!category) return transactions;
    return transactions.filter((tx) => tx.category === category);
  }, [transactions, category]);
}

/**
 * Get transactions filtered by type
 */
export function useTransactionsByType(type?: 'sent' | 'received') {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    if (!type) return transactions;
    return transactions.filter((tx) => tx.type === type);
  }, [transactions, type]);
}

/**
 * Get total spent in timeframe
 */
export function useTotalSpent(timeframe: 'week' | 'month' | 'year') {
  const transactions = useTransactionsByTimeframe(timeframe);
  
  return useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'sent')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);
}

/**
 * Get total received in timeframe
 */
export function useTotalReceived(timeframe: 'week' | 'month' | 'year') {
  const transactions = useTransactionsByTimeframe(timeframe);
  
  return useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'received')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);
}

/**
 * Get category spending breakdown
 */
export function useCategorySpending(timeframe: 'week' | 'month' | 'year') {
  const transactions = useTransactionsByTimeframe(timeframe);
  
  return useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    transactions
      .filter((tx) => tx.type === 'sent')
      .forEach((tx) => {
        const current = categoryMap.get(tx.category) || 0;
        categoryMap.set(tx.category, current + tx.amount);
      });
    
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);
}

/**
 * Get weekly spending data for charts
 */
export function useWeeklySpending() {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    const now = new Date();
    const weekData: { day: string; amount: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayTotal = transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            tx.type === 'sent' &&
            txDate.toDateString() === date.toDateString()
          );
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      weekData.push({ day: dayName, amount: dayTotal });
    }
    
    return weekData;
  }, [transactions]);
}

/**
 * Get monthly spending data for charts
 */
export function useMonthlySpending() {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    const now = new Date();
    const monthData: { week: string; amount: number }[] = [];
    
    // Get last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekLabel = `Week ${4 - i}`;
      
      const weekTotal = transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            tx.type === 'sent' &&
            txDate >= weekStart &&
            txDate <= weekEnd
          );
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      monthData.push({ week: weekLabel, amount: weekTotal });
    }
    
    return monthData;
  }, [transactions]);
}

/**
 * Get yearly spending data for charts
 */
export function useYearlySpending() {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    const now = new Date();
    const yearData: { month: string; amount: number }[] = [];
    
    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short' });
      
      const monthTotal = transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            tx.type === 'sent' &&
            txDate.getMonth() === month.getMonth() &&
            txDate.getFullYear() === month.getFullYear()
          );
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      yearData.push({ month: monthName, amount: monthTotal });
    }
    
    return yearData;
  }, [transactions]);
}

/**
 * Get transaction count by category
 */
export function useTransactionCountByCategory() {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    const countMap = new Map<string, number>();
    
    transactions.forEach((tx) => {
      const current = countMap.get(tx.category) || 0;
      countMap.set(tx.category, current + 1);
    });
    
    return countMap;
  }, [transactions]);
}

/**
 * Get auto-detected transaction count
 */
export function useAutoDetectedCount() {
  const transactions = useStore((state) => state.transactions);
  
  return useMemo(() => {
    return transactions.filter((tx) => tx.isAutoDetected).length;
  }, [transactions]);
}
