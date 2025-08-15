'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CreateSampleDataPage() {
  const [creating, setCreating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const logResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const sampleTransactions = [
    {
      type: 'income',
      amount: 3500,
      category: 'Salary',
      date: '2025-08-01',
      note: 'Monthly salary'
    },
    {
      type: 'expense',
      amount: 800,
      category: 'Rent',
      date: '2025-08-03',
      note: 'Monthly rent payment'
    },
    {
      type: 'expense',
      amount: 150.50,
      category: 'Groceries',
      date: '2025-08-05',
      note: 'Weekly grocery shopping'
    },
    {
      type: 'expense',
      amount: 60,
      category: 'Utilities',
      date: '2025-08-06',
      note: 'Electricity bill'
    },
    {
      type: 'expense',
      amount: 25.99,
      category: 'Entertainment',
      date: '2025-08-08',
      note: 'Netflix subscription'
    },
    {
      type: 'expense',
      amount: 45.00,
      category: 'Transportation',
      date: '2025-08-10',
      note: 'Gas for car'
    },
    {
      type: 'income',
      amount: 200,
      category: 'Freelance',
      date: '2025-08-12',
      note: 'Web design project'
    }
  ];

  const sampleGoals = [
    {
      name: 'Emergency Fund',
      description: 'Build 6 months of expenses',
      targetAmount: 15000,
      currentAmount: 2500,
      targetDate: '2025-12-31',
      category: 'Savings'
    },
    {
      name: 'Vacation to Europe',
      description: 'Two week trip to Europe',
      targetAmount: 5000,
      currentAmount: 800,
      targetDate: '2025-09-01',
      category: 'Travel'
    }
  ];

  const sampleBudgets = [
    {
      category: 'Groceries',
      budgetLimit: 400,
      period: 'monthly'
    },
    {
      category: 'Entertainment',
      budgetLimit: 100,
      period: 'monthly'
    },
    {
      category: 'Transportation',
      budgetLimit: 200,
      period: 'monthly'
    }
  ];

  const createSampleData = async () => {
    setCreating(true);
    setResults([]);

    const user = localStorage.getItem('user');
    if (!user) {
      logResult('❌ Please log in first');
      setCreating(false);
      return;
    }

    try {
      // Create sample transactions
      logResult('Creating sample transactions...');
      for (const transaction of sampleTransactions) {
        try {
          await api.post('/transactions', transaction);
          logResult(`✅ Created transaction: ${transaction.note}`);
        } catch (error: any) {
          logResult(`❌ Failed to create transaction: ${error.response?.data?.message || error.message}`);
        }
      }

      // Create sample goals
      logResult('Creating sample financial goals...');
      for (const goal of sampleGoals) {
        try {
          await api.post('/financial-goals', goal);
          logResult(`✅ Created goal: ${goal.name}`);
        } catch (error: any) {
          logResult(`❌ Failed to create goal: ${error.response?.data?.message || error.message}`);
        }
      }

      // Create sample budgets
      logResult('Creating sample budgets...');
      for (const budget of sampleBudgets) {
        try {
          await api.post('/budgets', budget);
          logResult(`✅ Created budget: ${budget.category}`);
        } catch (error: any) {
          logResult(`❌ Failed to create budget: ${error.response?.data?.message || error.message}`);
        }
      }

      logResult('🎉 Sample data creation complete!');
    } catch (error) {
      logResult(`❌ Error: ${error}`);
    } finally {
      setCreating(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL your data? This cannot be undone!')) {
      return;
    }

    setCreating(true);
    logResult('Clearing all data...');

    try {
      // Get all transactions and delete them
      const transactionsRes = await api.get('/transactions');
      const transactions = transactionsRes.data.transactions || transactionsRes.data;
      
      for (const transaction of transactions) {
        try {
          await api.delete(`/transactions/${transaction._id}`);
        } catch (error) {
          // Continue even if some fail
        }
      }

      // Get all goals and delete them
      const goalsRes = await api.get('/financial-goals');
      const goals = goalsRes.data.goals || goalsRes.data;
      
      for (const goal of goals) {
        try {
          await api.delete(`/financial-goals/${goal._id}`);
        } catch (error) {
          // Continue even if some fail
        }
      }

      // Get all budgets and delete them
      const budgetsRes = await api.get('/budgets');
      const budgets = budgetsRes.data.budgets || budgetsRes.data;
      
      for (const budget of budgets) {
        try {
          await api.delete(`/budgets/${budget._id}`);
        } catch (error) {
          // Continue even if some fail
        }
      }

      logResult('✅ All data cleared!');
    } catch (error: any) {
      logResult(`❌ Error clearing data: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sample Data Creator</h1>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-blue-800 dark:text-blue-200 mb-2">What this will create:</h2>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• 7 sample transactions (income & expenses)</li>
            <li>• 2 financial goals (Emergency Fund & Vacation)</li>
            <li>• 3 budget categories</li>
          </ul>
        </div>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={createSampleData}
            disabled={creating}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {creating ? 'Creating Sample Data...' : '🎯 Create Sample Data'}
          </button>
          
          <button
            onClick={clearAllData}
            disabled={creating}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 ml-4"
          >
            🗑️ Clear All Data
          </button>
          
          <button
            onClick={() => setResults([])}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium ml-4"
          >
            Clear Log
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Creation Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">No actions taken yet. Click the buttons above to start.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
