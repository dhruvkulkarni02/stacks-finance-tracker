'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function TestAPIPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const logResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEndpoints = async () => {
    setLoading(true);
    setTestResults([]);
    
    // Test authentication
    const user = localStorage.getItem('user');
    logResult(`User in localStorage: ${user ? 'Found' : 'Not found'}`);
    
    if (user) {
      const parsedUser = JSON.parse(user);
      logResult(`User ID: ${parsedUser.id}, Token: ${parsedUser.token ? 'Present' : 'Missing'}`);
    }

    // Test API endpoints
    const endpoints = [
      { name: 'Transactions', url: '/transactions' },
      { name: 'Financial Goals', url: '/financial-goals' },
      { name: 'Budgets', url: '/budgets' },
      { name: 'Summary', url: '/summary' }
    ];

    for (const endpoint of endpoints) {
      try {
        logResult(`Testing ${endpoint.name}...`);
        const response = await api.get(endpoint.url);
        logResult(`✅ ${endpoint.name}: Success - ${JSON.stringify(response.data).substring(0, 100)}...`);
      } catch (error: any) {
        logResult(`❌ ${endpoint.name}: Error - ${error.response?.status} ${error.response?.data?.message || error.message}`);
      }
    }

    setLoading(false);
  };

  const testAIEndpoints = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      logResult('❌ No user found for AI tests');
      return;
    }

    const parsedUser = JSON.parse(user);
    
    try {
      logResult('Testing AI Dashboard...');
      const response = await api.get(`/ai-advanced/dashboard/${parsedUser.id}`);
      logResult(`✅ AI Dashboard: Success`);
    } catch (error: any) {
      logResult(`❌ AI Dashboard: Error - ${error.response?.status} ${error.response?.data?.message || error.message}`);
    }

    try {
      logResult('Testing AI Chat...');
      const response = await api.post('/ai-advanced/chat', {
        message: 'Hello',
        chatHistory: []
      });
      logResult(`✅ AI Chat: Success`);
    } catch (error: any) {
      logResult(`❌ AI Chat: Error - ${error.response?.status} ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Testing Dashboard</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testEndpoints}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Basic Endpoints'}
          </button>
          
          <button
            onClick={testAIEndpoints}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 ml-4"
          >
            Test AI Endpoints
          </button>
          
          <button
            onClick={() => setTestResults([])}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium ml-4"
          >
            Clear Results
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click the buttons above to start testing.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Server Side'}
          </p>
        </div>
      </div>
    </div>
  );
}
