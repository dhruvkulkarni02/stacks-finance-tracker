// client/src/components/ai/SmartBudget.tsx
'use client';

import { useState, useEffect } from 'react';

interface BudgetData {
  categories: Record<string, number>;
  totalBudget: number;
  savingsTarget: number;
}

interface BudgetVariance {
  categoryBreakdown: Array<{
    category: string;
    budgeted: number;
    spent: number;
    variance: number;
    percentageVariance: number;
    status: 'over' | 'under' | 'exact';
  }>;
  totalBudget: number;
  totalSpent: number;
  variance: number;
}

interface BudgetInsight {
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export default function SmartBudget() {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [variance, setVariance] = useState<BudgetVariance | null>(null);
  const [insights, setInsights] = useState<BudgetInsight[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetSavingsRate, setTargetSavingsRate] = useState(0.2);

  const generateSmartBudget = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/smart-budget/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetSavingsRate })
      });

      if (response.ok) {
        const budgetData = await response.json();
        setBudget(budgetData);
      }
    } catch (error) {
      console.error('Error generating smart budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeVariance = async () => {
    if (!budget) return;

    try {
      const token = localStorage.getItem('token');
      
      // Mock actual spending data - in real app, this would come from transactions
      const mockActualSpending = {
        food: 450,
        transportation: 180,
        entertainment: 120,
        shopping: 200,
        utilities: 150
      };

      const response = await fetch('/api/smart-budget/analyze-variance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          budget,
          actualSpending: mockActualSpending
        })
      });

      if (response.ok) {
        const varianceData = await response.json();
        setVariance(varianceData);
      }
    } catch (error) {
      console.error('Error analyzing variance:', error);
    }
  };

  const generateInsights = async () => {
    if (!budget) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/smart-budget/insights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          budget,
          transactions: [], // Would be real transactions in production
          userProfile: { age: 30, income: 5000 }
        })
      });

      if (response.ok) {
        const insightsData = await response.json();
        setInsights(insightsData.insights || []);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const predictSpending = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/smart-budget/predict-spending', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactions: [], // Would be real transactions in production
          timeframe: 'monthly'
        })
      });

      if (response.ok) {
        const predictionData = await response.json();
        setPredictions(predictionData.predictions || []);
      }
    } catch (error) {
      console.error('Error predicting spending:', error);
    }
  };

  useEffect(() => {
    if (budget) {
      analyzeVariance();
      generateInsights();
      predictSpending();
    }
  }, [budget]);

  const getVarianceColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-red-600 dark:text-red-400';
      case 'under': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Generation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          AI-Powered Smart Budget
        </h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Target Savings Rate:
          </label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={targetSavingsRate}
            onChange={(e) => setTargetSavingsRate(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(targetSavingsRate * 100)}%
          </span>
        </div>

        <button
          onClick={generateSmartBudget}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Smart Budget'}
        </button>
      </div>

      {/* Budget Breakdown */}
      {budget && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Budget Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(budget.categories).map(([category, amount]) => (
              <div key={category} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {category}
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  ${amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Budget:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${budget.totalBudget.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Savings Target:</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${budget.savingsTarget.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Budget Variance Analysis */}
      {variance && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Budget vs. Actual Spending
          </h3>
          
          <div className="space-y-3">
            {variance.categoryBreakdown.map((item) => (
              <div key={item.category} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {item.category}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Budgeted: ${item.budgeted.toFixed(2)} | Spent: ${item.spent.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getVarianceColor(item.status)}`}>
                    {item.variance > 0 ? '+' : ''}${item.variance.toFixed(2)}
                  </div>
                  <div className={`text-xs ${getVarianceColor(item.status)}`}>
                    {item.percentageVariance.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Variance:</span>
              <span className={`text-lg font-bold ${variance.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {variance.variance > 0 ? '+' : ''}${variance.variance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Budget Insights */}
      {insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            AI Insights
          </h3>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getInsightColor(insight.type)}`}>
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-sm mt-1">{insight.description}</p>
                <span className="text-xs mt-2 opacity-75">
                  Impact: {insight.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Predictions */}
      {predictions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Spending Predictions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {prediction.category}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${prediction.predicted.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Confidence: {Math.round(prediction.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Trend: {prediction.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
