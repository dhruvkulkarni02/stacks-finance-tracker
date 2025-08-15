// src/components/transactions/TransactionForm.tsx
'use client';

import { useState } from 'react';

interface TransactionFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export default function TransactionForm({ 
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Submit with amount as number
      await onSubmit({
        ...formData,
        amount: Number(formData.amount),
      });
      
      // Show success and reset form
      setShowSuccess(true);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  // Categories with emojis
  const categoryOptions = {
    expense: [
      { value: 'groceries', label: '🛒 Groceries', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200' },
      { value: 'food', label: '🍕 Food & Dining', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200' },
      { value: 'rent', label: '🏠 Rent & Housing', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200' },
      { value: 'utilities', label: '⚡ Utilities', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200' },
      { value: 'transport', label: '🚗 Transportation', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200' },
      { value: 'entertainment', label: '🎬 Entertainment', color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700 text-pink-800 dark:text-pink-200' },
      { value: 'shopping', label: '🛍️ Shopping', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200' },
      { value: 'health', label: '🏥 Healthcare', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200' },
      { value: 'education', label: '📚 Education', color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-200' },
      { value: 'travel', label: '✈️ Travel', color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700 text-cyan-800 dark:text-cyan-200' },
      { value: 'subscription', label: '📱 Subscriptions', color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200' },
      { value: 'other', label: '💫 Other', color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200' }
    ],
    income: [
      { value: 'salary', label: '💼 Salary', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200' },
      { value: 'freelance', label: '💻 Freelance', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200' },
      { value: 'investment', label: '📈 Investment', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200' },
      { value: 'gift', label: '🎁 Gift', color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700 text-pink-800 dark:text-pink-200' },
      { value: 'refund', label: '🔄 Refund', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200' },
      { value: 'other', label: '💰 Other Income', color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200' }
    ]
  };

  const categories = categoryOptions[formData.type as keyof typeof categoryOptions];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Transaction Added!</h3>
              <p className="text-sm text-green-600 dark:text-green-300">Your transaction has been saved successfully.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <h2 className="text-3xl font-black mb-2">💰 Add New Transaction</h2>
            <p className="text-blue-100 font-medium">Track your income and expenses with detailed categorization</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Transaction Type</label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.type === 'expense' 
                ? 'bg-red-50 border-red-300 text-red-700 shadow-sm' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">📉</div>
                <div className="font-medium">Expense</div>
                <div className="text-xs opacity-75">Money going out</div>
              </div>
            </label>
            
            <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.type === 'income' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">📈</div>
                <div className="font-medium">Income</div>
                <div className="text-xs opacity-75">Money coming in</div>
              </div>
            </label>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">$</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`block w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors text-lg bg-white text-gray-900 ${
                errors.amount 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <label
                key={category.value}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.category === category.value
                    ? `${category.color} shadow-sm scale-105`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center w-full">
                  <div className="text-sm font-medium">{category.label}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`block w-full px-3 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white text-gray-900 ${
              errors.date 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
            Description / Note
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            placeholder="Add a description for this transaction (optional)"
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-gray-900"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : formData.type === 'income'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : (
              `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                type: 'expense',
                amount: '',
                category: '',
                date: new Date().toISOString().split('T')[0],
                note: '',
              });
              setErrors({});
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
          </div>
        </div>
      </div>
    </div>
  );
}