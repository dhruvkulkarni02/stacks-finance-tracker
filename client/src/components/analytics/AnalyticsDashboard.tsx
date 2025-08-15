// src/components/analytics/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import AdvancedCharts from './AdvancedCharts';
import FinancialInsights from './FinancialInsights';
import GoalsDashboard from './GoalsDashboard';
import PerformanceAnalytics from './PerformanceAnalytics';
import { useCurrency } from '@/context/CurrencyContext';
import api from '@/lib/api';

interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface FinancialGoal {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Budget {
  _id: string;
  userId: string;
  category: string;
  budgetLimit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'goals' | 'performance'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
  
  const { formatAmount } = useCurrency();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, goalsRes, budgetsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/financial-goals'), 
        api.get('/budgets')
      ]);

      setTransactions(transactionsRes.data.transactions || transactionsRes.data);
      setGoals(goalsRes.data.goals || goalsRes.data);
      setBudgets(budgetsRes.data.budgets || budgetsRes.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterTransactionsByTimeframe = (transactions: Transaction[]) => {
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        return transactions;
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const filteredTransactions = filterTransactionsByTimeframe(transactions);

  const calculateMetrics = () => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
    
    return { totalIncome, totalExpenses, netCashFlow, savingsRate };
  };

  const { totalIncome, totalExpenses, netCashFlow, savingsRate } = calculateMetrics();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'insights', label: 'AI Insights', icon: '🧠' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'performance', label: 'Performance', icon: '📈' }
  ];

  const timeframeOptions = [
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your financial health
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <button
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <AdvancedCharts transactions={filteredTransactions} />
        )}
        
        {activeTab === 'insights' && (
          <FinancialInsights transactions={filteredTransactions} />
        )}
        
        {activeTab === 'goals' && (
          <GoalsDashboard goals={goals} onRefresh={fetchData} />
        )}
        
        {activeTab === 'performance' && (
          <PerformanceAnalytics />
        )}
      </div>
    </div>
  );
}
