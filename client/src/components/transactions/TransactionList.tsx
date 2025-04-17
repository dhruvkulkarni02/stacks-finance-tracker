// src/components/transactions/TransactionList.tsx
'use client';

import { useState } from 'react';

// Define the Transaction type
interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions = [] }: TransactionListProps) {
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // For now, use mock data if no transactions are provided
  const mockTransactions: Transaction[] = [
    {
      _id: '1',
      userId: 'user123',
      type: 'expense',
      amount: 45.99,
      category: 'groceries',
      date: '2025-04-10',
      note: 'Weekly grocery shopping'
    },
    {
      _id: '2',
      userId: 'user123',
      type: 'expense',
      amount: 9.99,
      category: 'entertainment',
      date: '2025-04-08',
      note: 'Movie subscription'
    },
    {
      _id: '3',
      userId: 'user123',
      type: 'income',
      amount: 2500,
      category: 'salary',
      date: '2025-04-01',
      note: 'Monthly salary'
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Note
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayTransactions.map((transaction) => (
            <tr key={transaction._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                {transaction.category}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {transaction.note || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}