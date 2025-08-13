// src/controllers/budgets.ts
import { Request, Response } from 'express';
import Budget from '../models/Budget';
import Transaction from '../models/Transaction';

interface AuthRequest extends Request {
  userId?: string;
}

// Get all budgets for a user
export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const budgets = await Budget.find({ userId, isActive: true }).sort({ category: 1 });
    
    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              userId: budget.userId,
              type: 'expense',
              category: budget.category,
              date: {
                $gte: budget.startDate,
                $lte: budget.endDate
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);
        
        return {
          ...budget.toObject(),
          spent: spent[0]?.total || 0,
          remaining: budget.amount - (spent[0]?.total || 0),
          percentUsed: budget.amount > 0 ? ((spent[0]?.total || 0) / budget.amount) * 100 : 0
        };
      })
    );
    
    res.json(budgetsWithSpent);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
};

// Create a new budget
export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { category, amount, period, startDate, endDate } = req.body;
    
    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      userId,
      category: category.toLowerCase(),
      period,
      isActive: true
    });
    
    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this category and period' });
    }
    
    const budget = new Budget({
      userId,
      category: category.toLowerCase(),
      amount,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Failed to create budget' });
  }
};

// Update a budget
export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { amount, startDate, endDate, isActive } = req.body;
    
    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId },
      { amount, startDate, endDate, isActive },
      { new: true }
    );
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Failed to update budget' });
  }
};

// Delete a budget
export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const budget = await Budget.findOneAndDelete({ _id: id, userId });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Failed to delete budget' });
  }
};
