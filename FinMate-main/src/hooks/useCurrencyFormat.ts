import { useCurrency } from '../contexts/CurrencyContext';

/**
 * Hook to format currency amounts with conversion
 * Uses the selected currency from CurrencyContext
 */
export function useCurrencyFormat() {
  const { formatAmount, convertAmount, selectedCurrency } = useCurrency();

  /**
   * Format amount from INR to selected currency
   * @param amount - Amount in INR (base currency)
   * @returns Formatted string with currency symbol
   */
  const formatCurrency = (amount: number): string => {
    return formatAmount(amount, 'INR');
  };

  /**
   * Convert amount from INR to selected currency (number only)
   * @param amount - Amount in INR
   * @returns Converted amount as number
   */
  const convertFromINR = (amount: number): number => {
    return convertAmount(amount, 'INR');
  };

  return {
    formatCurrency,
    convertFromINR,
    selectedCurrency,
  };
}
