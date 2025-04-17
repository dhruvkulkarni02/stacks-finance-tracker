// src/app/add-transaction/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const handleSubmit = async (transaction: Transaction) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Submitting transaction:', transaction);
      
      // No need to add userId - the token handles it now
      const result = await createTransaction(transaction);
      console.log('Transaction result:', result);
      
      // Redirect to dashboard on success
      router.push('/?refresh=true');
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Transaction</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="max-w-2xl">
        <TransactionForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}