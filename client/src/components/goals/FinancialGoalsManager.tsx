// src/components/goals/FinancialGoalsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { getFinancialGoals, createFinancialGoal, updateFinancialGoal, addToFinancialGoal, deleteFinancialGoal } from '@/lib/api';

interface FinancialGoal {
  _id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category: 'emergency_fund' | 'vacation' | 'purchase' | 'investment' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  progressPercentage: number;
  remainingAmount: number;
  createdAt: string;
}

export default function FinancialGoalsManager() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [addingToGoal, setAddingToGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  const categoryEmojis = {
    emergency_fund: '🚨',
    vacation: '🏖️',
    purchase: '🛍️',
    investment: '📈',
    other: '🎯'
  };

  const priorityColors = {
    low: 'from-gray-400 to-gray-500',
    medium: 'from-yellow-400 to-orange-500',
    high: 'from-red-400 to-red-500'
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const data = await getFinancialGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      await createFinancialGoal(goalData);
      await fetchGoals();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateGoal = async (id: string, goalData: any) => {
    try {
      await updateFinancialGoal(id, goalData);
      await fetchGoals();
      setEditingGoal(null);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleAddToGoal = async (goalId: string) => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;
    
    try {
      await addToFinancialGoal(goalId, parseFloat(addAmount));
      await fetchGoals();
      setAddingToGoal(null);
      setAddAmount('');
    } catch (error) {
      console.error('Error adding to goal:', error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await deleteFinancialGoal(id);
      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Financial Goals</h2>
              <p className="text-emerald-100">Track your savings targets and achieve your dreams</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
            >
              🎯 New Goal
            </button>
          </div>
        </div>

        {/* Goals Stats */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-600">{activeGoals.length}</div>
            <div className="text-sm text-gray-600 font-medium">Active Goals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-green-600">{completedGoals.length}</div>
            <div className="text-sm text-gray-600 font-medium">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600">
              ${activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Saved</div>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Active Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                categoryEmojis={categoryEmojis}
                priorityColors={priorityColors}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => handleDeleteGoal(goal._id)}
                onAddMoney={() => setAddingToGoal(goal._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span>🏆 Completed Goals</span>
            <span className="ml-3 bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
              {completedGoals.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                categoryEmojis={categoryEmojis}
                priorityColors={priorityColors}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => handleDeleteGoal(goal._id)}
                isCompleted={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎯</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">No financial goals yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Set your first savings goal and start working towards your dreams!
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateForm || editingGoal) && (
        <GoalForm
          goal={editingGoal}
          onSubmit={editingGoal ? 
            (data) => handleUpdateGoal(editingGoal._id, data) : 
            handleCreateGoal
          }
          onCancel={() => {
            setShowCreateForm(false);
            setEditingGoal(null);
          }}
        />
      )}

      {/* Add Money Modal */}
      {addingToGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white rounded-t-3xl">
              <h3 className="text-xl font-bold">Add Money to Goal</h3>
              <p className="text-emerald-100">How much would you like to add?</p>
            </div>
            
            <div className="p-6">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-2xl font-bold"
                placeholder="0.00"
                autoFocus
              />
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    setAddingToGoal(null);
                    setAddAmount('');
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddToGoal(addingToGoal)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-xl font-bold transition-all duration-300"
                >
                  Add Money
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Goal Card Component
interface GoalCardProps {
  goal: FinancialGoal;
  categoryEmojis: any;
  priorityColors: any;
  onEdit: () => void;
  onDelete: () => void;
  onAddMoney?: () => void;
  isCompleted?: boolean;
}

function GoalCard({ goal, categoryEmojis, priorityColors, onEdit, onDelete, onAddMoney, isCompleted }: GoalCardProps) {
  const progressWidth = Math.min(goal.progressPercentage, 100);

  return (
    <div className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 ${isCompleted ? 'ring-2 ring-green-200' : ''}`}>
      {/* Priority Badge */}
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r ${priorityColors[goal.priority]}`}></div>
      
      {/* Category Icon */}
      <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-2xl">{categoryEmojis[goal.category]}</span>
      </div>

      {/* Goal Info */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{goal.title}</h3>
      {goal.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            ${goal.currentAmount.toFixed(2)}
          </span>
          <span className="text-sm font-bold text-gray-900">
            ${goal.targetAmount.toFixed(2)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {goal.progressPercentage.toFixed(1)}% complete
          </span>
          {!isCompleted && (
            <span className="text-xs font-bold text-emerald-600">
              ${goal.remainingAmount.toFixed(2)} to go
            </span>
          )}
        </div>
      </div>

      {/* Target Date */}
      {goal.targetDate && (
        <div className="text-xs text-gray-500 mb-4">
          Target: {new Date(goal.targetDate).toLocaleDateString()}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            🗑️
          </button>
        </div>
        
        {!isCompleted && onAddMoney && (
          <button
            onClick={onAddMoney}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
          >
            + Add
          </button>
        )}
        
        {isCompleted && (
          <span className="text-green-600 font-bold text-sm">🏆 Complete!</span>
        )}
      </div>
    </div>
  );
}

// Goal Form Component
interface GoalFormProps {
  goal?: FinancialGoal | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    targetAmount: goal?.targetAmount || '',
    currentAmount: goal?.currentAmount || '',
    targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
    category: goal?.category || 'other',
    priority: goal?.priority || 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white rounded-t-3xl">
          <h3 className="text-xl font-bold">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h3>
          <p className="text-emerald-100">Set a target and start saving!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Goal Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Emergency Fund, Vacation to Japan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
              placeholder="Describe your goal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Target Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Target Date (Optional)</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="emergency_fund">Emergency Fund</option>
                <option value="vacation">Vacation</option>
                <option value="purchase">Purchase</option>
                <option value="investment">Investment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-xl font-bold transition-all duration-300"
            >
              {goal ? 'Update' : 'Create'} Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
