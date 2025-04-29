// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import TransactionList from '@/components/transactions/TransactionList';
import { getSummary, getTransactions } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ income: 0, expenses: 0, balance: 0 });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Function to manually refresh data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Check for refresh parameter in URL
  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh');
    if (shouldRefresh === 'true') {
      refreshData();
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if not authenticated
      if (!user) return;
      
      try {
        setFetchLoading(true);
        
        console.log('Fetching data for month:', currentMonth);
        
        // Fetch data in parallel
        const [transactionsResponse, summaryResponse] = await Promise.all([
          getTransactions(currentMonth),
          getSummary(currentMonth)
        ]);
        
        console.log('Transactions loaded:', transactionsResponse.length);
        setTransactions(transactionsResponse);
        setSummary(summaryResponse);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, refreshKey, user]);

  // Change month handler
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMonth(e.target.value);
  };

  // If not authenticated or loading auth state, show loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated after loading, show nothing (redirect happens in useEffect)
  if (!user) {
    return null;
  }

  // Loading transactions data
  if (fetchLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error fetching data
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => refreshData()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Stacks Finance Tracker</h1>
          <p className="text-gray-600">Your personal finance tracking dashboard</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="month-select" className="mr-2 text-gray-700">Month:</label>
            <input
              type="month"
              id="month-select"
              value={currentMonth}
              onChange={handleMonthChange}
              className="border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button 
            onClick={refreshData}
            className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200"
          >
            ↻ Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Balance</h2>
          <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${summary.balance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Income</h2>
          <p className="text-3xl font-bold text-green-600">${summary.income.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Expenses</h2>
          <p className="text-3xl font-bold text-red-600">${summary.expenses.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
        {transactions.length > 0 ? (
          <TransactionList transactions={transactions} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions found for this month. Add your first transaction to get started!
          </div>
        )}
      </div>
    </div>
  );
}