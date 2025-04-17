// server/src/controllers/goals.ts
import { Request, Response } from 'express';
import Goal from '../models/Goal';

// @desc    Get all goals for a user
// @route   GET /api/goals
export const getGoals = async (req: Request, res: Response) => {
  try {
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const goals = await Goal.find({ userId: user }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching goals',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
export const createGoal = async (req: Request, res: Response) => {
  try {
    const goal = new Goal(req.body);
    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get a goal by ID
// @route   GET /api/goals/:id
export const getGoalById = async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
export const updateGoal = async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting goal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};