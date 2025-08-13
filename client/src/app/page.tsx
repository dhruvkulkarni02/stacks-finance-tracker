// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TransactionList from '@/components/transactions/TransactionList';
import SpendingInsights from '@/components/insights/SpendingInsights';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-6 md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-3">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Here's your financial overview for {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/20">
              <label htmlFor="month-select" className="text-sm font-semibold text-gray-700">📅 Month:</label>
              <input
                type="month"
                id="month-select"
                value={currentMonth}
                onChange={handleMonthChange}
                className="border-0 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white/90 text-gray-900 font-medium shadow-sm"
              />
            </div>
            
            <button 
              onClick={refreshData}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="text-lg">🔄</span>
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Balance Card */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Current Balance</h2>
                  <p className={`text-3xl font-black ${summary.balance >= 0 ? 'text-emerald-600' : 'text-red-500'} mb-2`}>
                    ${Math.abs(summary.balance).toFixed(2)}
                  </p>
                  {summary.balance < 0 && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-red-600 bg-red-100">⚠️ Deficit</span>}
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  summary.balance >= 0 ? 'bg-gradient-to-br from-emerald-400 to-green-500' : 'bg-gradient-to-br from-red-400 to-red-500'
                }`}>
                  <span className="text-2xl">{summary.balance >= 0 ? '💰' : '⚠️'}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {summary.balance >= 0 ? '🎉 You\'re doing fantastic!' : '💡 Consider reviewing your expenses'}
              </div>
            </div>
          </div>

          {/* Income Card */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Income</h2>
                  <p className="text-3xl font-black text-emerald-600 mb-2">
                    +${summary.income.toFixed(2)}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                💸 Money flowing in this month
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Expenses</h2>
                  <p className="text-3xl font-black text-red-500 mb-2">
                    -${summary.expenses.toFixed(2)}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📉</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                💳 Money spent this month
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {summary.income > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">💾</span>
                </div>
                <div className="text-sm text-blue-600 font-bold uppercase tracking-wider">Savings Rate</div>
              </div>
              <div className="text-2xl font-black text-blue-700">
                {((summary.balance / summary.income) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="text-sm text-purple-600 font-bold uppercase tracking-wider">Expense Ratio</div>
              </div>
              <div className="text-2xl font-black text-purple-700">
                {((summary.expenses / summary.income) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📝</span>
                </div>
                <div className="text-sm text-yellow-600 font-bold uppercase tracking-wider">Transactions</div>
              </div>
              <div className="text-2xl font-black text-yellow-700">
                {transactions.length}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">💳</span>
                </div>
                <div className="text-sm text-green-600 font-bold uppercase tracking-wider">Avg Transaction</div>
              </div>
              <div className="text-2xl font-black text-green-700">
                ${transactions.length > 0 ? (summary.expenses / transactions.filter(t => t.type === 'expense').length || 0).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        )}
        
        {/* Spending Insights */}
        <div className="mb-12">
          <SpendingInsights transactions={transactions} currentMonth={currentMonth} />
        </div>
        
        {/* Transactions Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-8 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Recent Transactions</h2>
                <p className="text-gray-600 font-medium">{transactions.length} transaction(s) this month</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-100/80">
                  📊 Activity
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {transactions.length > 0 ? (
              <TransactionList transactions={transactions} />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-500 mb-6">Add your first transaction to start tracking your finances!</p>
                <Link href="/add-transaction">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Add Your First Transaction
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}