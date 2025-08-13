// src/controllers/financialGoals.ts
import { Request, Response } from 'express';
import FinancialGoal from '../models/FinancialGoal';

interface AuthRequest extends Request {
  userId?: string;
}

// Get all financial goals for a user
export const getFinancialGoals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const goals = await FinancialGoal.find({ userId }).sort({ 
      isCompleted: 1, 
      priority: -1, 
      createdAt: -1 
    });
    
    // Add progress percentage to each goal
    const goalsWithProgress = goals.map(goal => ({
      ...goal.toObject(),
      progressPercentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
      remainingAmount: goal.targetAmount - goal.currentAmount
    }));
    
    res.json(goalsWithProgress);
  } catch (error) {
    console.error('Error fetching financial goals:', error);
    res.status(500).json({ message: 'Failed to fetch financial goals' });
  }
};

// Create a new financial goal
export const createFinancialGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, description, targetAmount, currentAmount, targetDate, category, priority } = req.body;
    
    const goal = new FinancialGoal({
      userId,
      title,
      description,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      category,
      priority
    });
    
    await goal.save();
    
    const goalWithProgress = {
      ...goal.toObject(),
      progressPercentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
      remainingAmount: goal.targetAmount - goal.currentAmount
    };
    
    res.status(201).json(goalWithProgress);
  } catch (error) {
    console.error('Error creating financial goal:', error);
    res.status(500).json({ message: 'Failed to create financial goal' });
  }
};

// Update a financial goal
export const updateFinancialGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { title, description, targetAmount, currentAmount, targetDate, category, priority, isCompleted } = req.body;
    
    const goal = await FinancialGoal.findOneAndUpdate(
      { _id: id, userId },
      { 
        title, 
        description, 
        targetAmount, 
        currentAmount, 
        targetDate: targetDate ? new Date(targetDate) : undefined,
        category, 
        priority,
        isCompleted: isCompleted || (currentAmount >= targetAmount)
      },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ message: 'Financial goal not found' });
    }
    
    const goalWithProgress = {
      ...goal.toObject(),
      progressPercentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
      remainingAmount: goal.targetAmount - goal.currentAmount
    };
    
    res.json(goalWithProgress);
  } catch (error) {
    console.error('Error updating financial goal:', error);
    res.status(500).json({ message: 'Failed to update financial goal' });
  }
};

// Add money to a goal
export const addToGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const goal = await FinancialGoal.findOne({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Financial goal not found' });
    }
    
    goal.currentAmount += amount;
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    
    await goal.save();
    
    const goalWithProgress = {
      ...goal.toObject(),
      progressPercentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
      remainingAmount: goal.targetAmount - goal.currentAmount
    };
    
    res.json(goalWithProgress);
  } catch (error) {
    console.error('Error adding to financial goal:', error);
    res.status(500).json({ message: 'Failed to add to financial goal' });
  }
};

// Delete a financial goal
export const deleteFinancialGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const goal = await FinancialGoal.findOneAndDelete({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Financial goal not found' });
    }
    
    res.json({ message: 'Financial goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial goal:', error);
    res.status(500).json({ message: 'Failed to delete financial goal' });
  }
};
