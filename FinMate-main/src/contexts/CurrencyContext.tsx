import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENCY_STORAGE_KEY = '@finmate_currency';
const RATES_STORAGE_KEY = '@finmate_exchange_rates';
const RATES_UPDATE_KEY = '@finmate_rates_updated';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  selectedCurrency: Currency;
  exchangeRates: ExchangeRates;
  ratesLastUpdated: string | null;
  isLoading: boolean;
  selectCurrency: (currencyCode: string) => Promise<void>;
  refreshRates: () => Promise<void>;
  convertAmount: (amount: number, fromCurrency?: string) => number;
  formatAmount: (amount: number, fromCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]); // Default INR
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ INR: 1 });
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency and rates on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      // Load saved currency
      const savedCurrencyCode = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrencyCode) {
        const currency = CURRENCIES.find(c => c.code === savedCurrencyCode);
        if (currency) {
          setSelectedCurrency(currency);
        }
      }

      // Load cached exchange rates
      const savedRates = await AsyncStorage.getItem(RATES_STORAGE_KEY);
      const savedUpdateTime = await AsyncStorage.getItem(RATES_UPDATE_KEY);
      
      if (savedRates) {
        setExchangeRates(JSON.parse(savedRates));
        setRatesLastUpdated(savedUpdateTime);
      }

      // Fetch fresh rates
      await fetchExchangeRates();
    } catch (error) {
      console.error('Error loading saved currency data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      // Using exchangerate-api.com (free tier, no API key needed)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates = data.rates as ExchangeRates;

      // Save rates to state and AsyncStorage
      setExchangeRates(rates);
      const updateTime = new Date().toISOString();
      setRatesLastUpdated(updateTime);

      await AsyncStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
      await AsyncStorage.setItem(RATES_UPDATE_KEY, updateTime);

      console.log('✅ Exchange rates updated successfully');
    } catch (error) {
      console.error('❌ Error fetching exchange rates:', error);
      // Keep using cached rates if fetch fails
    }
  };

  const selectCurrency = async (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
      console.log(`✅ Currency changed to ${currency.name}`);
    }
  };

  const refreshRates = async () => {
    await fetchExchangeRates();
  };

  // Convert amount from INR (base currency) to selected currency
  const convertAmount = (amount: number, fromCurrency: string = 'INR'): number => {
    if (fromCurrency === selectedCurrency.code) {
      return amount;
    }

    // Convert from source currency to INR first (if not already INR)
    let amountInINR = amount;
    if (fromCurrency !== 'INR') {
      const fromRate = exchangeRates[fromCurrency] || 1;
      amountInINR = amount / fromRate;
    }

    // Then convert from INR to target currency
    const toRate = exchangeRates[selectedCurrency.code] || 1;
    return amountInINR * toRate;
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number, fromCurrency: string = 'INR'): string => {
    const converted = convertAmount(amount, fromCurrency);
    
    // Format based on currency
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(converted));

    const sign = converted < 0 ? '-' : '';
    return `${sign}${selectedCurrency.symbol}${formatted}`;
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    exchangeRates,
    ratesLastUpdated,
    isLoading,
    selectCurrency,
    refreshRates,
    convertAmount,
    formatAmount,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
