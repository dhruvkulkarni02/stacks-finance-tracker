// src/components/analytics/FinancialInsights.tsx
'use client';

import { useMemo } from 'react';
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

interface FinancialInsightsProps {
  transactions: Transaction[];
}

interface Insight {
  type: 'positive' | 'warning' | 'neutral' | 'tip';
  title: string;
  description: string;
  icon: string;
  action?: string;
}

export default function FinancialInsights({ transactions }: FinancialInsightsProps) {
  const { formatAmount } = useCurrency();

  const insights = useMemo((): Insight[] => {
    const insights: Insight[] = [];
    
    if (transactions.length === 0) {
      return [{
        type: 'neutral',
        title: 'Start Your Financial Journey',
        description: 'Add some transactions to get personalized insights about your spending patterns.',
        icon: '🚀'
      }];
    }

    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    // Balance insights
    if (balance > totalIncome * 0.2) {
      insights.push({
        type: 'positive',
        title: 'Excellent Savings Rate! 🎉',
        description: `You're saving ${((balance / totalIncome) * 100).toFixed(1)}% of your income. Keep up the great work!`,
        icon: '💰',
        action: 'Consider setting up investment goals'
      });
    } else if (balance < 0) {
      insights.push({
        type: 'warning',
        title: 'Spending Alert',
        description: `You're spending ${formatAmount(Math.abs(balance))} more than you earn. Time to review your budget.`,
        icon: '⚠️',
        action: 'Create a budget plan'
      });
    }

    // Category analysis
    const categorySpending = new Map<string, number>();
    expenses.forEach(t => {
      categorySpending.set(t.category, (categorySpending.get(t.category) || 0) + t.amount);
    });

    const topCategory = Array.from(categorySpending.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topCategory && topCategory[1] > totalExpenses * 0.4) {
      insights.push({
        type: 'warning',
        title: 'Category Concentration',
        description: `${((topCategory[1] / totalExpenses) * 100).toFixed(1)}% of your spending is on ${topCategory[0]}. Consider diversifying.`,
        icon: '📊',
        action: 'Review spending patterns'
      });
    }

    // Frequency insights
    const recentTransactions = transactions
      .filter(t => new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .filter(t => t.type === 'expense');

    if (recentTransactions.length > 20) {
      insights.push({
        type: 'tip',
        title: 'High Transaction Frequency',
        description: `You made ${recentTransactions.length} transactions this week. Consider batching purchases to reduce impulse spending.`,
        icon: '🛒',
        action: 'Plan weekly shopping'
      });
    }

    // Small purchase analysis
    const smallPurchases = expenses.filter(t => t.amount < 20);
    const smallPurchaseTotal = smallPurchases.reduce((sum, t) => sum + t.amount, 0);

    if (smallPurchases.length > 15 && smallPurchaseTotal > 200) {
      insights.push({
        type: 'tip',
        title: 'Small Purchases Add Up',
        description: `${smallPurchases.length} small purchases totaling ${formatAmount(smallPurchaseTotal)}. These can impact your budget significantly.`,
        icon: '☕',
        action: 'Track daily expenses'
      });
    }

    // Income consistency
    if (income.length > 1) {
      const incomeAmounts = income.map(t => t.amount);
      const avgIncome = incomeAmounts.reduce((sum, amt) => sum + amt, 0) / incomeAmounts.length;
      const incomeVariability = Math.sqrt(incomeAmounts.reduce((sum, amt) => sum + Math.pow(amt - avgIncome, 2), 0) / incomeAmounts.length);
      
      if (incomeVariability < avgIncome * 0.1) {
        insights.push({
          type: 'positive',
          title: 'Stable Income Stream',
          description: 'Your income is very consistent, which makes budgeting easier and more predictable.',
          icon: '📈',
          action: 'Set up automatic savings'
        });
      }
    }

    // Weekend spending pattern
    const weekendExpenses = expenses.filter(t => {
      const day = new Date(t.date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    
    const weekendTotal = weekendExpenses.reduce((sum, t) => sum + t.amount, 0);
    const weekendPercentage = (weekendTotal / totalExpenses) * 100;

    if (weekendPercentage > 40) {
      insights.push({
        type: 'tip',
        title: 'Weekend Spending Pattern',
        description: `${weekendPercentage.toFixed(1)}% of your spending happens on weekends. Plan weekend activities to control costs.`,
        icon: '🌅',
        action: 'Plan weekend budget'
      });
    }

    // Emergency fund recommendation
    const monthlyExpenses = totalExpenses / Math.max(1, new Set(transactions.map(t => t.date.substring(0, 7))).size);
    const emergencyFundTarget = monthlyExpenses * 6;

    if (balance < emergencyFundTarget) {
      insights.push({
        type: 'tip',
        title: 'Emergency Fund Goal',
        description: `Consider building an emergency fund of ${formatAmount(emergencyFundTarget)} (6 months of expenses).`,
        icon: '🛡️',
        action: 'Start emergency savings'
      });
    }

    // Positive reinforcement for good habits
    if (insights.filter(i => i.type === 'positive').length === 0 && balance >= 0) {
      insights.push({
        type: 'positive',
        title: 'Financial Stability',
        description: 'You\'re maintaining a positive balance. Keep tracking your expenses to stay on track!',
        icon: '✅',
        action: 'Continue good habits'
      });
    }

    return insights.slice(0, 6); // Limit to 6 insights
  }, [transactions, formatAmount]);

  const insightStyles = {
    positive: 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700',
    warning: 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700',
    neutral: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700',
    tip: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700'
  };

  const textStyles = {
    positive: 'text-emerald-700 dark:text-emerald-300',
    warning: 'text-red-700 dark:text-red-300',
    neutral: 'text-blue-700 dark:text-blue-300',
    tip: 'text-yellow-700 dark:text-yellow-300'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🧠 AI Financial Insights</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          Based on {transactions.length} transactions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${insightStyles[insight.type]}`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{insight.icon}</div>
              <div className="flex-1 space-y-2">
                <h3 className={`font-bold text-lg ${textStyles[insight.type]}`}>
                  {insight.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {insight.description}
                </p>
                {insight.action && (
                  <div className={`text-sm font-bold ${textStyles[insight.type]} opacity-80`}>
                    💡 {insight.action}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            AI Analysis Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add more transactions to unlock personalized financial insights
          </p>
        </div>
      )}
    </div>
  );
}
