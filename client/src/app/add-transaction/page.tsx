// src/app/add-transaction/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TransactionForm from '@/components/transactions/TransactionForm';
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

  const handleSubmit = async (transaction: Transaction) => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      const result = await createTransaction(transaction);
      
      setSuccess(true);
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/?refresh=true');
      }, 1500);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Added!</h2>
          <p className="text-gray-600 mb-4">Your transaction has been successfully recorded.</p>
          <div className="text-sm text-gray-500">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Add Transaction</span>
          </div>
        </nav>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <TransactionForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Quick Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
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