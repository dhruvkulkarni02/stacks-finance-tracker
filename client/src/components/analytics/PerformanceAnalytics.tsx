// src/components/analytics/PerformanceAnalytics.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import api from '@/lib/api';

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface Budget {
  _id: string;
  category: string;
  budgetLimit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

interface PerformanceMetrics {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  savingsRate: number;
  monthOverMonthGrowth: number;
  budgetAdherence: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  topSpendingCategory: string;
  expenseGrowthRate: number;
}

export default function PerformanceAnalytics() {
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'3M' | '6M' | '1Y' | 'ALL'>('6M');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, budgetsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budgets')
      ]);

      setTransactions(transactionsRes.data.transactions || transactionsRes.data || []);
      setBudgets(budgetsRes.data.budgets || budgetsRes.data || []);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions by timeframe
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
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
  }, [transactions, timeframe]);

  // Helper functions for calculations
  const calculateMoMGrowth = (transactions: Transaction[]) => {
    // Group by month and calculate growth
    const monthlyData = transactions.reduce((acc, t) => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
      
      if (t.type === 'income') acc[month].income += t.amount;
      else acc[month].expenses += t.amount;
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return 0;

    const lastMonth = monthlyData[months[months.length - 1]];
    const previousMonth = monthlyData[months[months.length - 2]];
    
    const lastNetWorth = lastMonth.income - lastMonth.expenses;
    const previousNetWorth = previousMonth.income - previousMonth.expenses;
    
    return previousNetWorth !== 0 
      ? ((lastNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100 
      : 0;
  };

  const calculateExpenseGrowth = (expenses: Transaction[]) => {
    const monthlyExpenses = expenses.reduce((acc, t) => {
      const month = t.date.substring(0, 7);
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const months = Object.keys(monthlyExpenses).sort();
    if (months.length < 2) return 0;

    const recent = monthlyExpenses[months[months.length - 1]];
    const previous = monthlyExpenses[months[months.length - 2]];
    
    return previous !== 0 ? ((recent - previous) / previous) * 100 : 0;
  };

  // Calculate performance metrics
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    const income = filteredTransactions.filter(t => t.type === 'income');
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netWorth = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netWorth / totalIncome) * 100 : 0;

    // Monthly averages
    const monthsInPeriod = timeframe === '3M' ? 3 : timeframe === '6M' ? 6 : timeframe === '1Y' ? 12 : 12;
    const avgMonthlyIncome = totalIncome / monthsInPeriod;
    const avgMonthlyExpenses = totalExpenses / monthsInPeriod;

    // Top spending category
    const categorySpending = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topSpendingCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Budget adherence
    const budgetAdherence = budgets.length > 0 
      ? budgets.reduce((sum, budget) => {
          const actualSpent = expenses
            .filter(t => t.category === budget.category)
            .reduce((s, t) => s + t.amount, 0);
          return sum + Math.min((actualSpent / budget.budgetLimit) * 100, 100);
        }, 0) / budgets.length
      : 0;

    // Month over month growth (simplified calculation)
    const monthOverMonthGrowth = calculateMoMGrowth(filteredTransactions);
    const expenseGrowthRate = calculateExpenseGrowth(expenses);

    return {
      totalIncome,
      totalExpenses,
      netWorth,
      savingsRate,
      monthOverMonthGrowth,
      budgetAdherence,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      topSpendingCategory,
      expenseGrowthRate
    };
  }, [filteredTransactions, budgets, timeframe]);

  // Spending trends by category
  const categoryTrends = useMemo(() => {
    const categoryData = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Financial health score
  const financialHealthScore = useMemo(() => {
    let score = 0;
    
    // Savings rate contribution (40%)
    if (performanceMetrics.savingsRate > 20) score += 40;
    else if (performanceMetrics.savingsRate > 10) score += 30;
    else if (performanceMetrics.savingsRate > 0) score += 20;
    
    // Budget adherence contribution (30%)
    if (performanceMetrics.budgetAdherence < 80) score += 30;
    else if (performanceMetrics.budgetAdherence < 95) score += 20;
    else if (performanceMetrics.budgetAdherence < 105) score += 10;
    
    // Income stability (20%)
    if (performanceMetrics.avgMonthlyIncome > 0) score += 20;
    
    // Expense control (10%)
    if (performanceMetrics.expenseGrowthRate < 5) score += 10;
    else if (performanceMetrics.expenseGrowthRate < 15) score += 5;
    
    return Math.min(score, 100);
  }, [performanceMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📈 Performance Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Detailed insights into your financial performance</p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
        >
          <option value="3M">Last 3 Months</option>
          <option value="6M">Last 6 Months</option>
          <option value="1Y">Last Year</option>
          <option value="ALL">All Time</option>
        </select>
      </div>

      {/* Financial Health Score */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Financial Health Score</h3>
            <p className="text-blue-100">Overall assessment of your financial well-being</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{financialHealthScore}</div>
            <div className="text-sm opacity-80">/ 100</div>
          </div>
        </div>
        
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${financialHealthScore}%` }}
          />
        </div>
        
        <div className="mt-2 text-sm text-blue-100">
          {financialHealthScore >= 80 ? '🎉 Excellent' : 
           financialHealthScore >= 60 ? '👍 Good' : 
           financialHealthScore >= 40 ? '⚠️ Fair' : '🚨 Needs Improvement'}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(performanceMetrics.netWorth)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Net Worth</div>
          <div className={`text-xs mt-1 ${performanceMetrics.monthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {performanceMetrics.monthOverMonthGrowth >= 0 ? '↗' : '↘'} {Math.abs(performanceMetrics.monthOverMonthGrowth).toFixed(1)}% MoM
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {performanceMetrics.savingsRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</div>
          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            Target: 20%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {performanceMetrics.budgetAdherence.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Budget Adherence</div>
          <div className={`text-xs mt-1 ${performanceMetrics.budgetAdherence <= 100 ? 'text-green-600' : 'text-red-600'}`}>
            {performanceMetrics.budgetAdherence <= 100 ? '✅ On track' : '⚠️ Over budget'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(performanceMetrics.avgMonthlyIncome)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Income</div>
          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            vs {formatAmount(performanceMetrics.avgMonthlyExpenses)} expenses
          </div>
        </div>
      </div>

      {/* Spending Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h3>
          <div className="space-y-4">
            {categoryTrends.map(([category, amount], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{category}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">{formatAmount(amount)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {((amount / performanceMetrics.totalExpenses) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Expense Growth Rate</span>
              <span className={`text-sm font-bold ${performanceMetrics.expenseGrowthRate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {performanceMetrics.expenseGrowthRate > 0 ? '+' : ''}{performanceMetrics.expenseGrowthRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Top Category</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {performanceMetrics.topSpendingCategory}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Financial Health</span>
              <span className={`text-sm font-bold ${financialHealthScore >= 70 ? 'text-green-600' : financialHealthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {financialHealthScore >= 80 ? 'Excellent' : 
                 financialHealthScore >= 60 ? 'Good' : 
                 financialHealthScore >= 40 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
