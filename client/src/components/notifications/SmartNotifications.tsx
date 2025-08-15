// src/components/notifications/SmartNotifications.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getTransactions, getBudgets } from '@/lib/api';

interface Notification {
  id: string;
  type: 'budget_warning' | 'goal_progress' | 'spending_trend' | 'bill_reminder' | 'achievement';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  action?: {
    label: string;
    href: string;
  };
}

const SmartNotifications = () => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateSmartNotifications();
    }
  }, [user]);

  const generateSmartNotifications = async () => {
    try {
      setLoading(true);
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const [transactions, budgets] = await Promise.all([
        getTransactions(currentMonth),
        getBudgets()
      ]);

      const newNotifications: Notification[] = [];

      // Budget warnings
      if (budgets.data) {
        budgets.data.forEach((budget: any) => {
          if (budget.percentUsed >= 90) {
            newNotifications.push({
              id: `budget-${budget._id}`,
              type: 'budget_warning',
              title: 'Budget Alert',
              message: `You've used ${budget.percentUsed.toFixed(1)}% of your ${budget.category} budget (${formatAmount(budget.remaining)} remaining)`,
              severity: budget.percentUsed >= 100 ? 'high' : 'medium',
              icon: budget.percentUsed >= 100 ? '🚨' : '⚠️',
              timestamp: new Date(),
              read: false,
              actionable: true,
              action: { label: 'Review Budget', href: '/budgets' }
            });
          }
        });
      }

      // Spending trend analysis
      if (transactions.length > 0) {
        const dailySpending = transactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + t.amount, 0) / new Date().getDate();
        
        const monthlyProjection = dailySpending * 31;
        const previousMonthSpending = 2500; // This would come from historical data
        
        if (monthlyProjection > previousMonthSpending * 1.2) {
          newNotifications.push({
            id: 'spending-trend',
            type: 'spending_trend',
            title: 'High Spending Detected',
            message: `Your spending is 20% higher than last month. Projected: ${formatAmount(monthlyProjection)}`,
            severity: 'medium',
            icon: '📈',
            timestamp: new Date(),
            read: false,
            actionable: true,
            action: { label: 'View Analytics', href: '/analytics' }
          });
        }

        // Achievement notifications
        const savingsAmount = transactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + t.amount, 0) - 
          transactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        if (savingsAmount > 0) {
          const income = transactions
            .filter((t: any) => t.type === 'income')
            .reduce((sum: number, t: any) => sum + t.amount, 0);
          
          const savingsRate = (savingsAmount / income) * 100;
          
          if (savingsRate >= 20) {
            newNotifications.push({
              id: 'savings-achievement',
              type: 'achievement',
              title: '🎉 Savings Goal Achieved!',
              message: `Congratulations! You're saving ${savingsRate.toFixed(1)}% of your income this month.`,
              severity: 'low',
              icon: '🎯',
              timestamp: new Date(),
              read: false
            });
          }
        }
      }

      // Bill reminders (mock data - in real app this would come from recurring transaction analysis)
      const upcomingBills = [
        { name: 'Electricity', amount: 120, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        { name: 'Internet', amount: 80, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
      ];

      upcomingBills.forEach((bill, index) => {
        const daysUntilDue = Math.ceil((bill.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        if (daysUntilDue <= 7) {
          newNotifications.push({
            id: `bill-${index}`,
            type: 'bill_reminder',
            title: 'Upcoming Bill',
            message: `${bill.name} bill (${formatAmount(bill.amount)}) is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
            severity: daysUntilDue <= 3 ? 'high' : 'medium',
            icon: '📋',
            timestamp: new Date(),
            read: false,
            actionable: true,
            action: { label: 'Add Transaction', href: '/add-transaction' }
          });
        }
      });

      // Sort by severity and timestamp
      const sortedNotifications = newNotifications.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error generating notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <span className="text-4xl mb-2 block">✅</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">No notifications at the moment.</p>
        </div>
      </div>
    );
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          🔔 Smart Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        {notifications.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            {showAll ? 'Show Less' : `Show All (${notifications.length})`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`border-l-4 p-4 rounded-r-lg ${getSeverityStyles(notification.severity)} ${
              notification.read ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-2xl">{notification.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {notification.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500"
                      >
                        Mark as read
                      </button>
                    )}
                    {notification.action && (
                      <a
                        href={notification.action.href}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
                      >
                        {notification.action.label} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartNotifications;
