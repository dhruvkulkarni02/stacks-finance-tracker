// src/components/analytics/SmartAnalytics.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTransactions } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
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

interface CategoryAnalysis {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  transactions: number;
  avgAmount: number;
}

interface TimeSeriesData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

const SmartAnalytics = () => {
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6'); // months
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Fetch last N months of data
      const months = parseInt(timeRange);
      const allTransactions: Transaction[] = [];
      
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        
        try {
          const monthTransactions = await getTransactions(monthKey);
          allTransactions.push(...monthTransactions);
        } catch (error) {
          console.warn(`Failed to fetch data for ${monthKey}:`, error);
        }
      }
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Analytics data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Category analysis with trends
  const categoryAnalysis = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryGroups = expenseTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = [];
      }
      acc[t.category].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    return Object.entries(categoryGroups).map(([category, txns]) => {
      const amount = txns.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate trend (comparing first half vs second half of period)
      const sortedTxns = txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const midpoint = Math.floor(sortedTxns.length / 2);
      const firstHalfAvg = sortedTxns.slice(0, midpoint).reduce((sum, t) => sum + t.amount, 0) / Math.max(midpoint, 1);
      const secondHalfAvg = sortedTxns.slice(midpoint).reduce((sum, t) => sum + t.amount, 0) / Math.max(sortedTxns.length - midpoint, 1);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'up';
      else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'down';

      return {
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
        trend,
        transactions: txns.length,
        avgAmount: amount / txns.length
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Time series data for trends
  const timeSeriesData = useMemo(() => {
    const monthlyData: Record<string, TimeSeriesData> = {};
    
    transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0, balance: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
    });

    return Object.values(monthlyData).map(data => ({
      ...data,
      balance: data.income - data.expenses
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Financial health score
  const healthScore = useMemo(() => {
    if (timeSeriesData.length === 0) return 0;
    
    const avgIncome = timeSeriesData.reduce((sum, d) => sum + d.income, 0) / timeSeriesData.length;
    const avgExpenses = timeSeriesData.reduce((sum, d) => sum + d.expenses, 0) / timeSeriesData.length;
    const avgBalance = timeSeriesData.reduce((sum, d) => sum + d.balance, 0) / timeSeriesData.length;
    
    // Simple scoring algorithm
    let score = 50; // Base score
    
    // Savings rate factor
    const savingsRate = avgIncome > 0 ? avgBalance / avgIncome : 0;
    score += Math.min(savingsRate * 100, 30); // Max 30 points for savings
    
    // Consistency factor (lower variance is better)
    const balanceVariance = timeSeriesData.reduce((sum, d) => 
      sum + Math.pow(d.balance - avgBalance, 2), 0) / timeSeriesData.length;
    const consistencyScore = Math.max(0, 20 - (Math.sqrt(balanceVariance) / avgIncome) * 100);
    score += consistencyScore;
    
    return Math.min(Math.max(score, 0), 100);
  }, [timeSeriesData]);

  if (loading) {
    return <LoadingSpinner variant="skeleton" text="Analyzing your financial data..." />;
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
        </select>
      </div>

      {/* Financial Health Score */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Health Score</h3>
          <span className="text-2xl">🏥</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  healthScore >= 80 ? 'bg-green-500' : 
                  healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>
          <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
            {healthScore.toFixed(0)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {healthScore >= 80 ? 'Excellent financial health!' :
           healthScore >= 60 ? 'Good financial habits, room for improvement.' :
           'Consider reviewing your spending patterns and budget.'}
        </p>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Trends</h3>
        <div className="space-y-4">
          {timeSeriesData.slice(-6).map((data, index) => {
            const maxAmount = Math.max(...timeSeriesData.map(d => Math.max(d.income, d.expenses)));
            return (
              <div key={data.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`font-bold ${data.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {data.balance >= 0 ? '+' : ''}{formatAmount(data.balance)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-green-500 h-full"
                        style={{ width: `${(data.income / maxAmount) * 100}%` }}
                        title={`Income: ${formatAmount(data.income)}`}
                      ></div>
                      <div 
                        className="bg-red-500 h-full"
                        style={{ width: `${(data.expenses / maxAmount) * 100}%` }}
                        title={`Expenses: ${formatAmount(data.expenses)}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Analysis</h3>
        <div className="space-y-3">
          {categoryAnalysis.slice(0, 8).map((cat) => (
            <div 
              key={cat.category}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedCategory === cat.category 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getTrendIcon(cat.trend)}</span>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {cat.category}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {cat.transactions} transactions • Avg: {formatAmount(cat.avgAmount)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatAmount(cat.amount)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {cat.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {selectedCategory === cat.category && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Trend: </span>
                      <span className="font-medium">
                        {cat.trend === 'up' ? 'Increasing' : 
                         cat.trend === 'down' ? 'Decreasing' : 'Stable'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Frequency: </span>
                      <span className="font-medium">
                        {(cat.transactions / parseInt(timeRange)).toFixed(1)}/month
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Insights</h3>
        <div className="space-y-3">
          {categoryAnalysis.filter(cat => cat.trend === 'up').slice(0, 2).map(cat => (
            <div key={cat.category} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Rising {cat.category} expenses
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your {cat.category} spending is trending upward. Consider reviewing this category.
                </p>
              </div>
            </div>
          ))}
          
          {categoryAnalysis.filter(cat => cat.trend === 'down').slice(0, 1).map(cat => (
            <div key={cat.category} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-600 dark:text-green-400">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Reduced {cat.category} spending
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Great job reducing your {cat.category} expenses this period!
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartAnalytics;
