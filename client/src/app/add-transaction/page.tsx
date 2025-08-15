// src/app/add-transaction/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TransactionForm from '@/components/transactions/TransactionForm';
import SmartTransactionForm from '@/components/transactions/SmartTransactionForm';
import { createTransaction } from '@/lib/api';

// Define the Transaction type or import it from your types file
interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export default function AddTransactionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [useSmartForm, setUseSmartForm] = useState(true);

    const handleSubmit = async (transactionData: any) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transaction Added!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your transaction has been successfully recorded.</p>
          <div className="text-sm text-gray-500 dark:text-gray-400">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-900 dark:text-white font-medium">Add Transaction</span>
          </div>
        </nav>

        {/* Header with Form Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💳 Add Transaction</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {useSmartForm ? 'Smart suggestions powered by your spending patterns' : 'Traditional transaction entry'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
            <button
              onClick={() => setUseSmartForm(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                useSmartForm
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🧠 Smart Form
            </button>
            <button
              onClick={() => setUseSmartForm(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !useSmartForm
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📝 Classic Form
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                💰 Transaction Details
                {useSmartForm && (
                  <span className="ml-2 text-sm font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    🧠 AI-Powered
                  </span>
                )}
              </h2>
              {useSmartForm ? (
                <SmartTransactionForm 
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <TransactionForm 
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-blue-800 dark:text-blue-300 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Use descriptive notes to track your spending patterns better</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Choose the right category to get accurate spending insights</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Set the correct date if you're recording a past transaction</span>
              </li>
              {useSmartForm && (
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Smart Form analyzes your history to suggest amounts and categories</span>
                </li>
              )}
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Regular tracking helps you understand your financial habits</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}