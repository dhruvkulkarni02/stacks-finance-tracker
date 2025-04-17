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

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Submit with amount as number
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  // Categories based on transaction type
  const expenseCategories = [
    'groceries', 'rent', 'utilities', 'transportation', 
    'entertainment', 'shopping', 'health', 'education',
    'travel', 'food', 'other'
  ];
  
  const incomeCategories = [
    'salary', 'freelance', 'investment', 'gift', 
    'refund', 'other'
  ];
  
  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex items-center justify-center p-3 rounded-lg border ${
            formData.type === 'expense' 
              ? 'bg-red-50 border-red-500 text-red-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          } cursor-pointer transition-colors`}>
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={handleChange}
              className="sr-only"
            />
            <span>Expense</span>
          </label>
          
          <label className={`flex items-center justify-center p-3 rounded-lg border ${
            formData.type === 'income' 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          } cursor-pointer transition-colors`}>
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={handleChange}
              className="sr-only"
            />
            <span>Income</span>
          </label>
        </div>
      </div>
      
      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            step="0.01"
            min="0.01"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={`block w-full pl-7 pr-12 py-2 rounded-md border text-gray-800 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            } focus:ring-blue-500 focus:border-blue-500`}
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>
      
      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`block w-full py-2 px-3 border text-gray-800 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
      
      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`block w-full py-2 px-3 border text-gray-800 ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>
      
      {/* Note */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
        <textarea
          id="note"
          name="note"
          rows={3}
          value={formData.note}
          onChange={handleChange}
          className="block w-full py-2 px-3 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a note for this transaction"
        ></textarea>
      </div>
      
      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
}