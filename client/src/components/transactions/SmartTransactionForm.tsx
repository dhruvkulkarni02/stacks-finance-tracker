// src/components/transactions/SmartTransactionForm.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTransactions } from '@/lib/api';

interface TransactionFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

interface SmartSuggestion {
  category: string;
  amount: number;
  frequency: number;
  lastUsed: string;
}

export default function SmartTransactionForm({ 
  onSubmit, 
  isSubmitting = false 
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
      
      const [currentData, lastData] = await Promise.all([
        getTransactions(currentMonth),
        getTransactions(lastMonth)
      ]);
      
      setRecentTransactions([...currentData, ...lastData]);
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
    }
  };

  // Smart suggestions based on recent transactions
  const smartSuggestions = useMemo(() => {
    const filteredTransactions = recentTransactions.filter(t => t.type === formData.type);
    
    const categoryStats = filteredTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { amounts: [], dates: [] };
      }
      acc[t.category].amounts.push(t.amount);
      acc[t.category].dates.push(new Date(t.date));
      return acc;
    }, {} as Record<string, { amounts: number[], dates: Date[] }>);

    return Object.entries(categoryStats).map(([category, statsData]) => {
      const stats = statsData as { amounts: number[], dates: Date[] };
      const avgAmount = stats.amounts.reduce((a: number, b: number) => a + b, 0) / stats.amounts.length;
      const lastUsed = stats.dates.sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];
      
      return {
        category,
        amount: Math.round(avgAmount * 100) / 100,
        frequency: stats.amounts.length,
        lastUsed: lastUsed.toISOString().split('T')[0]
      };
    }).sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }, [recentTransactions, formData.type]);

  // Quick fill suggestions
  const quickFillSuggestions = [
    { category: 'Food', amounts: [15, 25, 50], icon: '🍕' },
    { category: 'Transportation', amounts: [5, 20, 100], icon: '🚗' },
    { category: 'Entertainment', amounts: [10, 30, 75], icon: '🎬' },
    { category: 'Shopping', amounts: [25, 100, 200], icon: '🛍️' },
    { category: 'Health', amounts: [20, 50, 150], icon: '🏥' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Show suggestions when amount is being typed
    if (name === 'amount' && value && !formData.category) {
      setShowSuggestions(true);
    }
  };

  const applySuggestion = (suggestion: SmartSuggestion) => {
    setFormData(prev => ({
      ...prev,
      category: suggestion.category,
      amount: suggestion.amount.toString()
    }));
    setShowSuggestions(false);
  };

  const applyQuickFill = (category: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      category,
      amount: amount.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select or enter a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        amount: Number(formData.amount),
      });
      
      // Reset form on success
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh suggestions
      fetchRecentTransactions();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'
  ];

  const expenseCategories = [
    'Food', 'Transportation', 'Housing', 'Utilities', 'Healthcare',
    'Entertainment', 'Shopping', 'Education', 'Travel', 'Insurance', 'Other'
  ];

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
          ✅ Transaction added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600'
              }`}
            >
              <span className="block text-2xl mb-1">💸</span>
              <span className="text-sm font-medium">Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
              }`}
            >
              <span className="block text-2xl mb-1">💰</span>
              <span className="text-sm font-medium">Income</span>
            </button>
          </div>
        </div>

        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && showSuggestions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              💡 Based on your recent transactions:
            </h4>
            <div className="grid gap-2">
              {smartSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded border hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {suggestion.category}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      ${suggestion.amount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Used {suggestion.frequency}x
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Fill for Expenses */}
        {formData.type === 'expense' && !formData.category && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              🚀 Quick Fill:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickFillSuggestions.map((suggestion) => (
                <div key={suggestion.category} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{suggestion.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.category}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {suggestion.amounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => applyQuickFill(suggestion.category, amount)}
                        className="px-3 py-1 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ($) *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Note (Optional)
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Add a note about this transaction..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Transaction...
            </span>
          ) : (
            `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`
          )}
        </button>
      </form>
    </div>
  );
}
