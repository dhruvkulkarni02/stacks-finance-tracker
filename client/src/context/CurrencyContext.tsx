// src/context/CurrencyContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

interface CurrencyContextType {
  currency: Currency;
  currencies: Currency[];
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number) => number;
  formatAmount: (amount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const POPULAR_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.73 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 110 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.25 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.35 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rate: 0.92 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 6.45 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 74.5 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.2 }
];

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(POPULAR_CURRENCIES[0]);
  const [currencies, setCurrencies] = useState<Currency[]>(POPULAR_CURRENCIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      const parsed = JSON.parse(savedCurrency);
      setCurrencyState(parsed);
    }
  }, []);

  // Fetch live exchange rates (simplified - in production, use a real API)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setLoading(true);
      try {
        // In a real app, you'd use an API like exchangerate-api.com
        // For demo purposes, we'll use static rates with small random variations
        const updatedCurrencies = POPULAR_CURRENCIES.map(curr => ({
          ...curr,
          rate: curr.rate * (0.98 + Math.random() * 0.04) // ±2% variation
        }));
        setCurrencies(updatedCurrencies);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    // Update rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', JSON.stringify(newCurrency));
  };

  const convertAmount = (amount: number): number => {
    return amount * currency.rate;
  };

  const formatAmount = (amount: number): string => {
    const converted = convertAmount(amount);
    return `${currency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencies,
      setCurrency,
      convertAmount,
      formatAmount,
      loading
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // Return default values during SSR or when provider is not available
    const defaultCurrency = {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      rate: 1
    };
    
    return {
      currency: defaultCurrency,
      currencies: [defaultCurrency],
      setCurrency: () => {},
      formatAmount: (amount: number) => `$${amount.toFixed(2)}`,
      convertAmount: (amount: number, fromCurrency?: any, toCurrency?: any) => amount,
      loading: false
    };
  }
  return context;
}
