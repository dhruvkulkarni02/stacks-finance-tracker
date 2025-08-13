// src/components/budgets/BudgetManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '@/lib/api';

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

interface BudgetManagerProps {
  onRefresh?: () => void;
}

export default function BudgetManager({ onRefresh }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const categories = [
    'groceries', 'food', 'entertainment', 'transport', 'utilities', 
    'rent', 'shopping', 'health', 'education', 'travel', 'subscription',
    'gas', 'insurance', 'other'
  ];

  const categoryEmojis: { [key: string]: string } = {
    groceries: '🛒', food: '🍕', entertainment: '🎬', transport: '🚗',
    utilities: '⚡', rent: '🏠', shopping: '🛍️', health: '🏥',
    education: '📚', travel: '✈️', subscription: '📱', gas: '⛽',
    insurance: '🛡️', other: '💫'
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBudget = async (budgetData: any) => {
    try {
      await createBudget(budgetData);
      await fetchBudgets();
      setShowCreateForm(false);
      onRefresh?.();
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleUpdateBudget = async (id: string, budgetData: any) => {
    try {
      await updateBudget(id, budgetData);
      await fetchBudgets();
      setEditingBudget(null);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await deleteBudget(id);
      await fetchBudgets();
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed < 50) return 'from-emerald-400 to-green-500';
    if (percentUsed < 80) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getProgressText = (percentUsed: number) => {
    if (percentUsed < 50) return 'On track 🎯';
    if (percentUsed < 80) return 'Careful 🟡';
    if (percentUsed < 100) return 'Almost over 🟠';
    return 'Over budget! 🚨';
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Budget Manager</h2>
            <p className="text-purple-100">Track your spending limits by category</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
          >
            ➕ New Budget
          </button>
        </div>
      </div>

      {/* Budget List */}
      <div className="p-6">
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No budgets set yet</h3>
            <p className="text-gray-500 mb-4">Create your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300"
            >
              Create Budget
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {budgets.map((budget) => (
              <div key={budget._id} className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">{categoryEmojis[budget.category] || '💫'}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 capitalize">{budget.category}</h3>
                      <p className="text-sm text-gray-600">{budget.period} budget</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingBudget(budget)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all duration-300"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget._id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all duration-300"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {getProgressText(budget.percentUsed)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getProgressColor(budget.percentUsed)} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {budget.percentUsed.toFixed(1)}% used
                    </span>
                    <span className={`text-xs font-bold ${budget.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${Math.abs(budget.remaining).toFixed(2)} {budget.remaining >= 0 ? 'remaining' : 'over'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingBudget) && (
        <BudgetForm
          budget={editingBudget}
          categories={categories}
          onSubmit={editingBudget ? 
            (data) => handleUpdateBudget(editingBudget._id, data) : 
            handleCreateBudget
          }
          onCancel={() => {
            setShowCreateForm(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
}

// Budget Form Component
interface BudgetFormProps {
  budget?: Budget | null;
  categories: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function BudgetForm({ budget, categories, onSubmit, onCancel }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount || '',
    period: budget?.period || 'monthly',
    startDate: budget?.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: budget?.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white rounded-t-3xl">
          <h3 className="text-xl font-bold">
            {budget ? 'Edit Budget' : 'Create New Budget'}
          </h3>
          <p className="text-purple-100">Set spending limits for better financial control</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Budget Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Period</label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({...formData, period: e.target.value as 'weekly' | 'monthly' | 'yearly'})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-xl font-bold transition-all duration-300"
            >
              {budget ? 'Update' : 'Create'} Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
