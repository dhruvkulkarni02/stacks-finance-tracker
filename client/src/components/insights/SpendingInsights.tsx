// src/components/insights/SpendingInsights.tsx
'use client';

import { useMemo } from 'react';

interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface SpendingInsightsProps {
  transactions: Transaction[];
  currentMonth: string;
}

interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  emoji: string;
}

const categoryEmojis: { [key: string]: string } = {
  groceries: '🛒',
  food: '🍕',
  rent: '🏠',
  utilities: '⚡',
  transport: '🚗',
  entertainment: '🎬',
  shopping: '🛍️',
  health: '🏥',
  education: '📚',
  travel: '✈️',
  subscription: '📱',
  other: '💫',
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  gift: '🎁'
};

export default function SpendingInsights({ transactions, currentMonth }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    // Category breakdown
    const categoryData: { [key: string]: { amount: number; count: number } } = {};
    
    expenses.forEach(transaction => {
      if (!categoryData[transaction.category]) {
        categoryData[transaction.category] = { amount: 0, count: 0 };
      }
      categoryData[transaction.category].amount += transaction.amount;
      categoryData[transaction.category].count += 1;
    });
    
    const categoryInsights: CategoryData[] = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        emoji: categoryEmojis[category] || '💫'
      }))
      .sort((a, b) => b.amount - a.amount);
    
    // Get top spending day
    const dailySpending: { [key: string]: number } = {};
    expenses.forEach(transaction => {
      const date = transaction.date.split('T')[0];
      dailySpending[date] = (dailySpending[date] || 0) + transaction.amount;
    });
    
    const topSpendingDay = Object.entries(dailySpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Average transaction size
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    
    return {
      totalExpenses,
      totalIncome,
      categoryInsights,
      topSpendingDay,
      avgExpense,
      avgIncome,
      transactionCount: transactions.length
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Spending Insights</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>Add some transactions to see your spending insights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Spending Insights</h3>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{insights.transactionCount}</div>
          <div className="text-sm text-blue-600">Transactions</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">${insights.avgIncome.toFixed(0)}</div>
          <div className="text-sm text-green-600">Avg Income</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">${insights.avgExpense.toFixed(0)}</div>
          <div className="text-sm text-red-600">Avg Expense</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {insights.topSpendingDay ? insights.topSpendingDay[1].toFixed(0) : '0'}
          </div>
          <div className="text-sm text-purple-600">Highest Day</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {insights.categoryInsights.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Top Spending Categories</h4>
          <div className="space-y-3">
            {insights.categoryInsights.slice(0, 5).map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{category.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{category.category}</div>
                    <div className="text-sm text-gray-500">{category.count} transaction(s)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${category.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Habits */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">💡 Smart Insights</h4>
        <div className="space-y-2 text-sm">
          {insights.totalExpenses > insights.totalIncome && (
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg text-yellow-800">
              <span className="mr-2">⚠️</span>
              <span>Your expenses exceed your income this month. Consider reviewing your spending.</span>
            </div>
          )}
          
          {insights.categoryInsights[0] && insights.categoryInsights[0].percentage > 40 && (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg text-blue-800">
              <span className="mr-2">📊</span>
              <span>
                {insights.categoryInsights[0].percentage.toFixed(0)}% of your spending is on {insights.categoryInsights[0].category}. 
                This might be worth tracking closely.
              </span>
            </div>
          )}
          
          {insights.totalExpenses > 0 && (insights.totalIncome - insights.totalExpenses) / insights.totalIncome > 0.2 && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg text-green-800">
              <span className="mr-2">🎉</span>
              <span>Great job! You're saving over 20% of your income this month.</span>
            </div>
          )}
          
          {insights.topSpendingDay && (
            <div className="flex items-center p-3 bg-purple-50 rounded-lg text-purple-800">
              <span className="mr-2">📅</span>
              <span>
                Your highest spending day was {new Date(insights.topSpendingDay[0]).toLocaleDateString()} 
                with ${insights.topSpendingDay[1].toFixed(2)} spent.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
