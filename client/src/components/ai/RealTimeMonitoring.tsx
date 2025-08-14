// client/src/components/ai/RealTimeMonitoring.tsx
'use client';

import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionRequired: boolean;
}

interface HealthStatus {
  overallScore: number;
  breakdown: {
    spending: number;
    savings: number;
    debt: number;
    budgetAdherence: number;
  };
  trends: {
    spending: string;
    savings: string;
    debt: string;
  };
  lastUpdated: Date;
}

export default function RealTimeMonitoring() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [billPredictions, setBillPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch alerts
      const alertsResponse = await fetch('/api/monitoring/alerts', { headers });
      const alertsData = await alertsResponse.json();
      setAlerts(alertsData);

      // Fetch health status
      const healthResponse = await fetch('/api/monitoring/health-status', { headers });
      const healthData = await healthResponse.json();
      setHealthStatus(healthData);

      // Fetch bill predictions
      const billsResponse = await fetch('/api/monitoring/bill-predictions', { headers });
      const billsData = await billsResponse.json();
      setBillPredictions(billsData);

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/monitoring/alerts/${alertId}/dismiss`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      {healthStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Financial Health Monitor
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getHealthColor(healthStatus.overallScore)}`}>
                {healthStatus.overallScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getHealthColor(healthStatus.breakdown.spending)}`}>
                {healthStatus.breakdown.spending}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Spending</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getHealthColor(healthStatus.breakdown.savings)}`}>
                {healthStatus.breakdown.savings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Savings</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getHealthColor(healthStatus.breakdown.budgetAdherence)}`}>
                {healthStatus.breakdown.budgetAdherence}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Budget Adherence</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">Spending Trend:</span>
              <span className={`font-medium ${
                healthStatus.trends.spending === 'increasing' ? 'text-red-600' : 
                healthStatus.trends.spending === 'decreasing' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {healthStatus.trends.spending}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">Savings Trend:</span>
              <span className="font-medium text-blue-600">{healthStatus.trends.savings}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">Debt Trend:</span>
              <span className={`font-medium ${
                healthStatus.trends.debt === 'decreasing' ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthStatus.trends.debt}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Active Alerts ({alerts.length})
        </h2>
        
        {alerts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No active alerts. Your finances look good! 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{alert.title}</h3>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Bills */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Upcoming Bills
        </h2>
        
        {billPredictions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No upcoming bills predicted.
          </p>
        ) : (
          <div className="space-y-3">
            {billPredictions.map((bill, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{bill.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due: {new Date(bill.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ${bill.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(bill.confidence * 100)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
