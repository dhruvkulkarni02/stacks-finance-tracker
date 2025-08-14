'use client';

import React from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AdvancedAIAssistant from '../../components/ai/AdvancedAIAssistant';

export default function AIAssistantPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdvancedAIAssistant />
        </div>
      </div>
    </ProtectedRoute>
  );
}
