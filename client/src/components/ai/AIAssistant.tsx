import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface BudgetSuggestion {
  category: string;
  suggestedAmount: number;
  currentSpending: number;
  priority: 'high' | 'medium' | 'low';
}

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

interface AIInsights {
  spendingPrediction: SpendingPrediction[];
  budgetSuggestions: BudgetSuggestion[];
  goalPredictions: any[];
  summary: {
    totalTransactions: number;
    totalGoals: number;
    avgMonthlySpending: number;
  };
}

const AIAssistant: React.FC = () => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorizeText, setCategorizeText] = useState('');
  const [categorizeAmount, setCategorizeAmount] = useState('');
  const [categorySuggestion, setCategorySuggestion] = useState<CategorySuggestion | null>(null);
  const [categorizingLoading, setCategorizingLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetchInsights();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await api.get('/ai/health');
      setHealthStatus(response.data);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.get(`/ai/insights/${userData.id}`);
      setInsights(response.data);
    } catch (err) {
      setError('Failed to fetch AI insights');
      console.error('AI insights error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categorizeTransaction = async () => {
    if (!categorizeText.trim() || !categorizeAmount) return;
    
    try {
      setCategorizingLoading(true);
      const response = await api.post('/ai/categorize-transaction', {
        description: categorizeText,
        amount: parseFloat(categorizeAmount)
      });
      setCategorySuggestion(response.data);
    } catch (err) {
      console.error('Categorization error:', err);
    } finally {
      setCategorizingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-red-600 dark:text-red-400">
          <h3 className="text-lg font-semibold mb-2">AI Assistant Unavailable</h3>
          <p>{error}</p>
          <button
            onClick={fetchInsights}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">🤖 AI Financial Assistant</h2>
        <p className="opacity-90">Get intelligent insights and predictions for your finances</p>
        {healthStatus && (
          <div className="mt-3 text-sm opacity-90">
            Status: <span className={healthStatus.openaiStatus === 'working' ? 'text-green-200' : 
                                   healthStatus.openaiStatus === 'degraded' ? 'text-yellow-200' : 'text-orange-200'}>
              {healthStatus.openaiStatus === 'working' ? '✓ AI Powered' : 
               healthStatus.openaiStatus === 'degraded' ? '⚠ Partial AI' : 
               healthStatus.openaiStatus === 'not configured' ? '⚡ Rule-based' : '❌ Offline'}
            </span>
          </div>
        )}
      </div>

      {/* Smart Transaction Categorizer */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Smart Transaction Categorizer
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Transaction description (e.g., 'Starbucks coffee')"
              value={categorizeText}
              onChange={(e) => setCategorizeText(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="number"
              placeholder="Amount"
              value={categorizeAmount}
              onChange={(e) => setCategorizeAmount(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={categorizeTransaction}
            disabled={categorizingLoading || !categorizeText.trim() || !categorizeAmount}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {categorizingLoading ? 'Analyzing...' : 'Categorize with AI'}
          </button>
          
          {categorySuggestion && (
            <div className={`mt-4 p-4 border rounded-lg ${
              categorySuggestion.confidence > 0.6 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : categorySuggestion.confidence > 0.3
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <h4 className={`font-semibold ${
                categorySuggestion.confidence > 0.6 
                  ? 'text-green-800 dark:text-green-300'
                  : categorySuggestion.confidence > 0.3
                  ? 'text-yellow-800 dark:text-yellow-300'
                  : 'text-red-800 dark:text-red-300'
              }`}>
                AI Suggestion:
              </h4>
              <p className={`${
                categorySuggestion.confidence > 0.6 
                  ? 'text-green-700 dark:text-green-400'
                  : categorySuggestion.confidence > 0.3
                  ? 'text-yellow-700 dark:text-yellow-400'
                  : 'text-red-700 dark:text-red-400'
              }`}>
                Category: <span className="font-medium">{categorySuggestion.category}</span> 
                ({(categorySuggestion.confidence * 100).toFixed(1)}% confidence)
              </p>
              <p className={`text-sm mt-1 ${
                categorySuggestion.confidence > 0.6 
                  ? 'text-green-600 dark:text-green-500'
                  : categorySuggestion.confidence > 0.3
                  ? 'text-yellow-600 dark:text-yellow-500'
                  : 'text-red-600 dark:text-red-500'
              }`}>
                {categorySuggestion.reasoning}
              </p>
              {categorySuggestion.confidence <= 0.3 && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  💡 Tip: Try using more descriptive transaction details for better AI suggestions
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      {insights && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Financial Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {insights.summary.totalTransactions}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Transactions</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {insights.summary.totalGoals}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Active Goals</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${insights.summary.avgMonthlySpending.toFixed(0)}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Avg Monthly Spending</div>
            </div>
          </div>
        </div>
      )}

      {/* Spending Predictions */}
      {insights?.spendingPrediction && insights.spendingPrediction.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Next Month Spending Predictions
          </h3>
          <div className="space-y-3">
            {insights.spendingPrediction.map((prediction, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {prediction.category.charAt(0).toUpperCase() + prediction.category.slice(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {prediction.confidence > 0.8 ? 'High' : prediction.confidence > 0.6 ? 'Medium' : 'Low'} confidence • 
                    <span className={`ml-1 ${
                      prediction.trend === 'increasing' ? 'text-red-600 dark:text-red-400' :
                      prediction.trend === 'decreasing' ? 'text-green-600 dark:text-green-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {prediction.trend === 'increasing' ? '↑' : 
                       prediction.trend === 'decreasing' ? '↓' : '→'} {prediction.trend}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${prediction.predictedAmount.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Suggestions */}
      {insights?.budgetSuggestions && insights.budgetSuggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            AI Budget Recommendations
          </h3>
          <div className="space-y-3">
            {insights.budgetSuggestions.map((suggestion, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current: ${suggestion.currentSpending.toFixed(0)} • 
                    <span className={`ml-1 ${
                      suggestion.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      suggestion.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {suggestion.priority} priority
                    </span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  ${suggestion.suggestedAmount.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Predictions */}
      {insights?.goalPredictions && insights.goalPredictions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Goal Achievement Predictions
          </h3>
          <div className="space-y-3">
            {insights.goalPredictions.map((goalPred, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  {goalPred.goalName}
                </div>
                {goalPred.prediction && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Success Probability: {(goalPred.prediction.probabilityOfSuccess * 100).toFixed(1)}%</div>
                    <div>Estimated Completion: {goalPred.prediction.estimatedCompletionDate}</div>
                    <div>Recommended Monthly: ${goalPred.prediction.recommendedMonthlyContribution}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
