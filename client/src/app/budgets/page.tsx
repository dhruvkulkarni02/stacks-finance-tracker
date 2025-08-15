// src/app/budgets/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BudgetManager from '@/components/budgets/BudgetManager';

export default function BudgetsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💰 Budget Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Set spending limits, track your progress, and stay on top of your financial goals
            </p>
          </div>
          
          <BudgetManager />
        </div>
      </div>
    </ProtectedRoute>
  );
}
