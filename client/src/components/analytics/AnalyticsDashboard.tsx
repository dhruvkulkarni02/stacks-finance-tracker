// src/components/analytics/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import AdvancedCharts from './AdvancedCharts';
import FinancialInsights from './FinancialInsights';
import GoalsDashboard from './GoalsDashboard';
import { useCurrency } from '@/context/CurrencyContext';

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
        fetch('/api/transactions'),
        fetch('/api/financial-goals'),
        fetch('/api/budgets')
      ]);

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || transactionsData);
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData.goals || goalsData);
      }

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        setBudgets(budgetsData.budgets || budgetsData);
      }
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

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/30 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Total Income</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatAmount(totalIncome)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/30 p-6 rounded-2xl border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 font-semibold">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatAmount(totalExpenses)}
              </p>
            </div>
            <div className="text-3xl">💸</div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${netCashFlow >= 0 ? 'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30' : 'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/30'} p-6 rounded-2xl border ${netCashFlow >= 0 ? 'border-blue-200 dark:border-blue-700' : 'border-orange-200 dark:border-orange-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${netCashFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'} font-semibold`}>
                Net Cash Flow
              </p>
              <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                {formatAmount(netCashFlow)}
              </p>
            </div>
            <div className="text-3xl">{netCashFlow >= 0 ? '📈' : '📉'}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {savingsRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📈 Performance Analytics</h2>
            
            {/* Budget Performance */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">💰 Budget Performance</h3>
              
              {budgets.length > 0 ? (
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const utilizationRate = (budget.spent / budget.budgetLimit) * 100;
                    const isOverBudget = utilizationRate > 100;
                    
                    return (
                      <div key={budget._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{budget.category}</h4>
                          <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isOverBudget 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                            }`}
                            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatAmount(budget.spent)} spent</span>
                          <span>{formatAmount(budget.budgetLimit)} limit</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No budgets set up yet. Create budgets to track your spending performance.
                </p>
              )}
            </div>

            {/* Goals Progress Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">🎯 Goals Progress Summary</h3>
              
              {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {goals.filter(g => !g.isCompleted).length}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Goals</p>
                  </div>
                  
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {goals.filter(g => g.isCompleted).length}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Completed</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {goals.length > 0 ? Math.round(goals.filter(g => g.isCompleted).length / goals.length * 100) : 0}%
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Success Rate</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No financial goals set yet. Create goals to track your progress.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
