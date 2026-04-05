// Utility Helper Functions
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Format time to readable string
 */
export function formatTime(timeString: string): string {
  return timeString;
}

/**
 * Get current month date range
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

/**
 * Get previous month date range
 */
export function getPreviousMonthRange(): { start: string; end: string } {
  const lastMonth = subMonths(new Date(), 1);
  return {
    start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
    end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Group transactions by date
 */
export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Convert date format from DD-MM-YY to YYYY-MM-DD
 */
export function convertDateFormat(dateStr: string): string {
  // Handle DD-MM-YY format
  if (/^\d{2}-\d{2}-\d{2}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-');
    const fullYear = `20${year}`; // Assuming 20xx
    return `${fullYear}-${month}-${day}`;
  }
  
  // Handle DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }
  
  // Handle DDMmmYY format (e.g., 13Sep25)
  if (/^\d{2}[A-Za-z]{3}\d{2}$/.test(dateStr)) {
    const day = dateStr.slice(0, 2);
    const monthStr = dateStr.slice(2, 5);
    const year = `20${dateStr.slice(5, 7)}`;
    
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04',
      may: '05', jun: '06', jul: '07', aug: '08',
      sep: '09', oct: '10', nov: '11', dec: '12',
    };
    
    const month = months[monthStr.toLowerCase()];
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
}

/**
 * Get current time in HH:MM AM/PM format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Get current month name
 */
export function getCurrentMonthName(): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[new Date().getMonth()];
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Validate amount
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Calculate category-wise spending
 */
export function getCategorySpending(transactions: any[]): { category: string; amount: number; percentage: number }[] {
  const expenses = transactions.filter(t => t.type === 'sent');
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  if (total === 0) return [];
  
  const categoryTotals: { [key: string]: number } = {};
  
  expenses.forEach(t => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
  });
  
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Get weekly spending data for last 7 days
 */
export function getWeeklySpending(transactions: any[]): { day: string; amount: number }[] {
  const today = new Date();
  const weekData: { [key: string]: number } = {};
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    weekData[dayName] = 0;
  }
  
  // Calculate spending for each day
  const expenses = transactions.filter(t => t.type === 'sent');
  expenses.forEach(t => {
    const transactionDate = new Date(t.date);
    const daysDiff = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 0 && daysDiff < 7) {
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][transactionDate.getDay()];
      weekData[dayName] += t.amount;
    }
  });
  
  return Object.entries(weekData).map(([day, amount]) => ({ day, amount }));
}

/**
 * Parse amount from string
 */
export function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/[^0-9.]/g, ''));
}
