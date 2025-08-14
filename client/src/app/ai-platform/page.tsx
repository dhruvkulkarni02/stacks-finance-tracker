// client/src/app/ai-platform/page.tsx
'use client';

import React from 'react';
import AdvancedAIAssistant from '@/components/ai/AdvancedAIAssistant';

export default function AIPlatformPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Financial Platform
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Your intelligent financial advisor with real-time insights, health monitoring, and personalized recommendations.
          </p>
        </div>
        
        <AdvancedAIAssistant />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'AI Financial Platform - Stacks Finance Tracker',
  description: 'Advanced AI-powered financial management with real-time monitoring, smart budgeting, and intelligent insights.',
};
