// app/analytics/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <AnalyticsDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
}
