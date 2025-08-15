// src/components/dashboard/EnhancedDashboard.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getSummary, getTransactions } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

interface QuickInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, currentMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [transactionsData, summaryData] = await Promise.all([
        getTransactions(currentMonth),
        getSummary(currentMonth)
      ]);
      setTransactions(transactionsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Smart insights based on transaction patterns
  const insights = useMemo(() => {
    const insights: QuickInsight[] = [];
    
    if (transactions.length === 0) return insights;

    // Spending rate analysis
    const dailyAverage = summary.expenses / new Date().getDate();
    const monthlyProjection = dailyAverage * 31;
    
    if (monthlyProjection > summary.income * 1.2) {
      insights.push({
        type: 'warning',
        title: 'High Spending Alert',
        message: `You're on track to overspend by ${formatAmount(monthlyProjection - summary.income)} this month.`,
        icon: '⚠️',
        action: { label: 'Review Budget', href: '/budgets' }
      });
    }

    // Savings rate
    const savingsRate = summary.balance / summary.income;
    if (savingsRate > 0.2) {
      insights.push({
        type: 'success',
        title: 'Great Savings!',
        message: `You're saving ${(savingsRate * 100).toFixed(1)}% of your income this month.`,
        icon: '🎯'
      });
    } else if (savingsRate < 0.1 && summary.income > 0) {
      insights.push({
        type: 'info',
        title: 'Savings Opportunity',
        message: 'Consider setting aside more for savings. Aim for 20% of income.',
        icon: '💡',
        action: { label: 'Set Goals', href: '/goals' }
      });
    }

    // Category analysis
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];

    if (topCategory && topCategory[1] > summary.expenses * 0.4) {
      insights.push({
        type: 'info',
        title: 'Top Spending Category',
        message: `${topCategory[0]} accounts for ${((topCategory[1] / summary.expenses) * 100).toFixed(1)}% of your expenses.`,
        icon: '📊'
      });
    }

    return insights.slice(0, 3); // Show max 3 insights
  }, [transactions, summary, formatAmount]);

  if (loading) {
    return <LoadingSpinner variant="skeleton" text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Quick Insights */}
      {insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                insight.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {insight.message}
                  </p>
                  {insight.action && (
                    <a
                      href={insight.action.href}
                      className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 mt-2"
                    >
                      {insight.action.label} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatAmount(summary.income)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                This month
              </p>
            </div>
            <div className="text-3xl opacity-60">📈</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatAmount(summary.expenses)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                This month
              </p>
            </div>
            <div className="text-3xl opacity-60">📉</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</p>
              <p className={`text-2xl font-bold ${
                summary.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'
              }`}>
                {summary.balance >= 0 ? '+' : ''}{formatAmount(summary.balance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Net result
              </p>
            </div>
            <div className="text-3xl opacity-60">
              {summary.balance >= 0 ? '💰' : '⚠️'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/add-transaction"
            className="flex flex-col items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="text-2xl mb-2">➕</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Transaction</span>
          </a>
          
          <a
            href="/budgets"
            className="flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <span className="text-2xl mb-2">💰</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Budget</span>
          </a>
          
          <a
            href="/analytics"
            className="flex flex-col items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
          </a>
          
          <a
            href="/goals"
            className="flex flex-col items-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <span className="text-2xl mb-2">🎯</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Set Goals</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
