// src/components/analytics/AdvancedCharts.tsx
'use client';

import { useState, useMemo } from 'react';
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

interface AdvancedChartsProps {
  transactions: Transaction[];
}

export default function AdvancedCharts({ transactions }: AdvancedChartsProps) {
  const { formatAmount } = useCurrency();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'trend'>('pie');

  // Calculate category spending
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(transaction => {
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + transaction.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>();
    
    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      const current = monthMap.get(month) || { income: 0, expenses: 0 };
      
      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }
      
      monthMap.set(month, current);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

  const categoryColors = [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-emerald-500 to-emerald-600',
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-orange-500 to-orange-600',
    'bg-gradient-to-r from-red-500 to-red-600',
    'bg-gradient-to-r from-pink-500 to-pink-600',
    'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'bg-gradient-to-r from-yellow-500 to-yellow-600',
  ];

  return (
    <div className="space-y-8">
      {/* Chart Type Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Advanced Analytics</h2>
        <div className="flex space-x-2">
          {[
            { type: 'pie' as const, label: '🍰 Categories', icon: '📊' },
            { type: 'bar' as const, label: '📊 Comparison', icon: '📈' },
            { type: 'trend' as const, label: '📈 Trends', icon: '📉' }
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                chartType === type
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform -translate-y-0.5'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
        {chartType === 'pie' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Spending by Category</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart (Simple CSS-based) */}
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {categoryData.slice(0, 6).map((cat, index) => {
                    const percentage = (cat.amount / totalExpenses) * 100;
                    const rotation = categoryData.slice(0, index).reduce((sum, c) => sum + (c.amount / totalExpenses) * 360, 0);
                    
                    return (
                      <div
                        key={cat.category}
                        className={`absolute w-full h-full rounded-full ${categoryColors[index]} opacity-80`}
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((percentage / 100) * 2 * Math.PI)}% ${50 - 50 * Math.cos((percentage / 100) * 2 * Math.PI)}%, 50% 50%)`,
                          transform: `rotate(${rotation}deg)`
                        }}
                      />
                    );
                  })}
                  <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        {formatAmount(totalExpenses)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Spent</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {categoryData.slice(0, 8).map((cat, index) => {
                  const percentage = ((cat.amount / totalExpenses) * 100).toFixed(1);
                  return (
                    <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${categoryColors[index]}`} />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">{formatAmount(cat.amount)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {chartType === 'bar' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Category Comparison</h3>
            <div className="space-y-4">
              {categoryData.slice(0, 8).map((cat, index) => {
                const percentage = (cat.amount / totalExpenses) * 100;
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{cat.category}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{formatAmount(cat.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${categoryColors[index]} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {chartType === 'trend' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Trends</h3>
            <div className="space-y-6">
              {monthlyTrends.slice(-6).map((month, index) => (
                <div key={month.month} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Date(month.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </span>
                    <span className={`font-bold ${month.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      Net: {formatAmount(Math.abs(month.net))} {month.net >= 0 ? '📈' : '📉'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Income: {formatAmount(month.income)}</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                          style={{ width: `${Math.min((month.income / Math.max(...monthlyTrends.map(m => m.income))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-red-500 dark:text-red-400 font-medium">Expenses: {formatAmount(month.expenses)}</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                          style={{ width: `${Math.min((month.expenses / Math.max(...monthlyTrends.map(m => m.expenses))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
