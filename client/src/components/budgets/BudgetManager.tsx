// src/components/budgets/BudgetManager.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

interface Budget {
  _id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  spent: number;
  remaining: number;
  percentUsed: number;
  isActive: boolean;
}

const BudgetManager: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    startDate: '',
    endDate: ''
  });

  const categories = [
    'Housing', 'Transportation', 'Food', 'Healthcare', 'Entertainment',
    'Shopping', 'Education', 'Travel', 'Utilities', 'Insurance', 'Other'
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await getBudgets();
      setBudgets(response.data || []);
    } catch (error) {
      setError('Failed to fetch budgets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality for better UX
  const autoSaveBudget = async (budgetData: any) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget._id, budgetData);
      } else {
        await createBudget(budgetData);
      }
      await fetchBudgets();
      return true;
    } catch (error) {
      console.error('Auto-save error:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      const budgetData = {
        category: formData.category,
        amount: Number(formData.amount),
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      if (editingBudget) {
        await updateBudget(editingBudget._id, budgetData);
      } else {
        await createBudget(budgetData);
      }

      await fetchBudgets();
      resetForm();
    } catch (error) {
      setError('Failed to save budget');
      console.error(error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate.split('T')[0],
      endDate: budget.endDate.split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(budgetId);
        await fetchBudgets();
      } catch (error) {
        setError('Failed to delete budget');
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
      startDate: '',
      endDate: ''
    });
    setEditingBudget(null);
    setShowForm(false);
  };

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'bg-red-500';
    if (percentUsed >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'text-red-600 dark:text-red-400';
    if (percentUsed >= 90) return 'text-yellow-600 dark:text-yellow-400';
    if (percentUsed >= 75) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBudgetStatusMessage = (budget: Budget) => {
    if (budget.percentUsed >= 100) {
      return `Over budget by ${formatAmount(budget.spent - budget.amount)}`;
    } else if (budget.percentUsed >= 90) {
      return `Close to limit - ${formatAmount(budget.remaining)} remaining`;
    } else if (budget.percentUsed >= 75) {
      return `On track - ${formatAmount(budget.remaining)} remaining`;
    } else {
      return `Well within budget - ${formatAmount(budget.remaining)} remaining`;
    }
  };

  // Calculate total budget overview
  const budgetOverview = useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
    const overBudgetCount = budgets.filter(b => b.percentUsed >= 100).length;
    
    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      averageUsage: budgets.length ? (totalSpent / totalBudgeted) * 100 : 0
    };
  }, [budgets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatAmount(budgetOverview.totalBudgeted)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Budgeted</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatAmount(budgetOverview.totalSpent)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className={`text-2xl font-bold ${budgetOverview.totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatAmount(budgetOverview.totalRemaining)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Remaining</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className={`text-2xl font-bold ${budgetOverview.averageUsage >= 100 ? 'text-red-600 dark:text-red-400' : budgetOverview.averageUsage >= 75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
              {budgetOverview.averageUsage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Usage</div>
          </div>
        </div>
      )}

      {/* Inline Budget Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'weekly' | 'monthly' | 'yearly' })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingBudget ? 'Update Budget' : 'Create Budget'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No budgets created yet. Click "Add Budget" to get started.
          </div>
        ) : (
          budgets.map((budget) => (
            <div
              key={budget._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {budget.category}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {budget.period} budget
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${budget.amount.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Spent:</span>
                  <span className={`font-medium ${getStatusColor(budget.percentUsed)}`}>
                    ${budget.spent.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                  <span className={`font-medium ${budget.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${budget.remaining.toFixed(2)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className={`font-medium ${getStatusColor(budget.percentUsed)}`}>
                      {budget.percentUsed.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(budget.percentUsed)}`}
                      style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Start: {new Date(budget.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(budget.endDate).toLocaleDateString()}</span>
                </div>

                {/* Status Message */}
                <div className={`mt-3 p-2 rounded text-xs font-medium ${
                  budget.percentUsed >= 100 ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                  budget.percentUsed >= 90 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                  'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                }`}>
                  {getBudgetStatusMessage(budget)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
