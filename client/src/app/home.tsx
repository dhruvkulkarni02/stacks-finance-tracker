// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TransactionList from '@/components/transactions/TransactionList';
import SpendingInsights from '@/components/insights/SpendingInsights';
import BudgetManager from '@/components/budgets/BudgetManager';
import FinancialGoalsManager from '@/components/goals/FinancialGoalsManager';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';
import SmartNotifications from '@/components/notifications/SmartNotifications';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getSummary, getTransactions } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';

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
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ income: 0, expenses: 0, balance: 0 });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

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
        
        // Fetch data in parallel
        const [transactionsResponse, summaryResponse] = await Promise.all([
          getTransactions(currentMonth),
          getSummary(currentMonth)
        ]);
        
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <LoadingSpinner variant="skeleton" text="Loading your financial dashboard..." />
        </div>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <LoadingSpinner variant="skeleton" text="Loading your financial data..." />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your financial overview for {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
              <label htmlFor="month-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">📅</label>
              <input
                type="month"
                id="month-select"
                value={currentMonth}
                onChange={handleMonthChange}
                className="border-0 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-white font-medium"
              />
            </div>
            
            <button 
              onClick={refreshData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-sm"
            >
              <span>🔄</span>
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Main Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Balance - Main Focus */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-3">Current Balance</h2>
                <p className={`text-5xl font-bold mb-4 ${summary.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
                  {summary.balance >= 0 ? '+' : '-'}{formatAmount(Math.abs(summary.balance))}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ↗ {formatAmount(summary.income)} income
                  </span>
                  <span className="text-red-500 dark:text-red-400 font-medium">
                    ↘ {formatAmount(summary.expenses)} expenses
                  </span>
                </div>
              </div>
              <div className="text-6xl opacity-20">
                {summary.balance >= 0 ? '💰' : '⚠️'}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800">
              <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Savings Rate</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {summary.income > 0 ? ((summary.balance / summary.income) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Transactions</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {transactions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Call-to-Action */}
        {transactions.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-bold mb-2">📊 Advanced Analytics</h3>
                  <p className="text-indigo-100 opacity-90">
                    Get AI insights, track goals, and analyze spending patterns
                  </p>
                </div>
                <Link href="/analytics">
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105">
                    View Analytics →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Spending Insights */}
        <div className="mb-12">
          <SpendingInsights transactions={transactions} currentMonth={currentMonth} />
        </div>
        
        {/* Feature Tabs */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap space-x-1 p-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  🏠 Smart Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'transactions'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  � Transactions
                </button>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'budgets'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  💰 Budgets
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    activeTab === 'goals'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  🎯 Goals
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <EnhancedDashboard />
                    </div>
                    <div>
                      <SmartNotifications />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'transactions' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Recent Transactions</h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">{transactions.length} transaction(s) this month</p>
                  </div>
                  {transactions.length > 0 ? (
                    <TransactionList transactions={transactions} />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💳</div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first transaction to start tracking your finances!</p>
                      <Link href="/add-transaction">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                          Add Your First Transaction
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'budgets' && (
                <BudgetManager />
              )}
              
              {activeTab === 'goals' && (
                <FinancialGoalsManager />
              )}
              
              {activeTab === 'search' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Search & Filter Transactions</h2>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200/50">
                    <p className="text-gray-600 mb-4">Advanced search and filtering features coming soon!</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200/50">
                        <h3 className="font-semibold text-gray-800 mb-2">📅 Date Range</h3>
                        <p className="text-sm text-gray-600">Filter by custom date ranges</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200/50">
                        <h3 className="font-semibold text-gray-800 mb-2">🏷️ Categories</h3>
                        <p className="text-sm text-gray-600">Filter by transaction categories</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200/50">
                        <h3 className="font-semibold text-gray-800 mb-2">💵 Amount Range</h3>
                        <p className="text-sm text-gray-600">Filter by amount ranges</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Legacy Transactions Section (Hidden - now using tabs) */}
        {false && (
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
        )}
      </div>
    </div>
  );
}