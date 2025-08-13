// src/components/analytics/GoalsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface FinancialGoal {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GoalsDashboardProps {
  goals: FinancialGoal[];
  onRefresh: () => void;
}

export default function GoalsDashboard({ goals, onRefresh }: GoalsDashboardProps) {
  const { formatAmount } = useCurrency();
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  const getProgressPercentage = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalStatus = (goal: FinancialGoal) => {
    const daysLeft = getDaysUntilTarget(goal.targetDate);
    const progress = getProgressPercentage(goal);
    
    if (goal.isCompleted) return { status: 'completed', color: 'text-emerald-600 dark:text-emerald-400' };
    if (progress >= 100) return { status: 'ready', color: 'text-blue-600 dark:text-blue-400' };
    if (daysLeft < 0) return { status: 'overdue', color: 'text-red-600 dark:text-red-400' };
    if (daysLeft <= 30 && progress < 80) return { status: 'urgent', color: 'text-orange-600 dark:text-orange-400' };
    return { status: 'on-track', color: 'text-green-600 dark:text-green-400' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '🎉';
      case 'ready': return '✅';
      case 'overdue': return '⏰';
      case 'urgent': return '🔥';
      default: return '🎯';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'ready': return 'Goal Reached!';
      case 'overdue': return 'Overdue';
      case 'urgent': return 'Needs Attention';
      default: return 'On Track';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Emergency Fund': '🛡️',
      'Vacation': '✈️',
      'Car': '🚗',
      'House': '🏠',
      'Education': '🎓',
      'Investment': '📈',
      'Gadgets': '📱',
      'Wedding': '💍',
      'Retirement': '👴',
      'Debt Payment': '💳',
      'Medical': '🏥',
      'Other': '🎯'
    };
    return icons[category] || '🎯';
  };

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    try {
      const response = await fetch(`/api/financial-goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount: newAmount })
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const markGoalComplete = async (goalId: string) => {
    try {
      const response = await fetch(`/api/financial-goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true })
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to complete goal:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🎯 Financial Goals</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {activeGoals.length} active • {completedGoals.length} completed
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">Total Goals</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{goals.length}</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/30 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{completedGoals.length}</p>
            </div>
            <div className="text-4xl">🎉</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">Total Target</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatAmount(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Active Goals</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGoals.map((goal) => {
              const progress = getProgressPercentage(goal);
              const daysLeft = getDaysUntilTarget(goal.targetDate);
              const { status, color } = getGoalStatus(goal);
              
              return (
                <div
                  key={goal._id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryIcon(goal.category)}</div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{goal.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{goal.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getStatusIcon(status)}</span>
                      <span className={`text-sm font-semibold ${color}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{goal.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
                      </span>
                      <span className={daysLeft < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                      </span>
                    </div>

                    {progress >= 100 && !goal.isCompleted && (
                      <button
                        onClick={() => markGoalComplete(goal._id)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300"
                      >
                        🎉 Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Completed Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <div
                key={goal._id}
                className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{getCategoryIcon(goal.category)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">{goal.name}</h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      {formatAmount(goal.targetAmount)} • Completed ✅
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No Financial Goals Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Set your first financial goal to start tracking your progress
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
