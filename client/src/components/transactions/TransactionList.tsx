// src/components/transactions/TransactionList.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';

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

const categoryEmojis: { [key: string]: string } = {
  // Income categories
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  gift: '🎁',
  other: '💰',
  
  // Expense categories
  groceries: '🛒',
  food: '🍕',
  entertainment: '🎬',
  transport: '🚗',
  utilities: '⚡',
  rent: '🏠',
  shopping: '🛍️',
  health: '🏥',
  education: '📚',
  travel: '✈️',
  subscription: '📱',
  gas: '⛽',
  insurance: '🛡️'
};

export default function TransactionList({ transactions = [] }: TransactionListProps) {
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'date') {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredTransactions = sortedTransactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

  const getCategoryEmoji = (category: string) => {
    return categoryEmojis[category.toLowerCase()] || '💫';
  };

  const SortIcon = ({ field }: { field: keyof Transaction }) => {
    if (sortField !== field) return <span className="text-gray-400">↕️</span>;
    return <span>{sortDirection === 'asc' ? '⬆️' : '⬇️'}</span>;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No transactions yet</h3>
        <p className="text-gray-500 font-medium">Start by adding your first transaction!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 p-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              filterType === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform -translate-y-0.5' 
                : 'bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
            }`}
          >
            📊 All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              filterType === 'income' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform -translate-y-0.5' 
                : 'bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200'
            }`}
          >
            💰 Income ({transactions.filter(t => t.type === 'income').length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              filterType === 'expense' 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform -translate-y-0.5' 
                : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200'
            }`}
          >
            💸 Expenses ({transactions.filter(t => t.type === 'expense').length})
          </button>
        </div>
        
        <div className="text-sm font-semibold text-gray-600 bg-white/80 px-4 py-2 rounded-xl border border-gray-200">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transaction Cards */}
      <div className="space-y-4 p-6">
        {filteredTransactions.map((transaction) => (
          <div key={transaction._id} className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                    : 'bg-gradient-to-br from-red-400 to-red-500'
                }`}>
                  <span className="text-2xl">{getCategoryEmoji(transaction.category)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize">{transaction.category}</h3>
                  <p className="text-sm text-gray-600 font-medium">{transaction.note || 'No description'}</p>
                  <p className="text-xs text-gray-500 font-medium">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-black ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </div>
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {transaction.type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}