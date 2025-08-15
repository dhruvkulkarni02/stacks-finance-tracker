// app/analytics/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SmartAnalytics from '@/components/analytics/SmartAnalytics';
import PerformanceAnalytics from '@/components/analytics/PerformanceAnalytics';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Advanced Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Deep insights into your financial patterns and trends
            </p>
          </div>

          {/* View Toggle */}
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📈 Charts Dashboard
              </button>
              <button
                onClick={() => setActiveView('smart')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'smart'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                🧠 Smart Analytics
              </button>
              <button
                onClick={() => setActiveView('performance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'performance'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                🎯 Performance Analytics
              </button>
            </div>
          </div>

          {/* Analytics Content */}
          {activeView === 'dashboard' && <AnalyticsDashboard />}
          {activeView === 'smart' && <SmartAnalytics />}
          {activeView === 'performance' && <PerformanceAnalytics />}
        </div>
      </div>
    </ProtectedRoute>
  );
}
