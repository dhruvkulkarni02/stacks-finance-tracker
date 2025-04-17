import { Request, Response } from 'express';
import Transaction from '../models/Transaction';

// @desc    Get all transactions for a user, with optional filtering
// @route   GET /api/transactions
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { user, month } = req.query;

    if (!user) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Build query
    const query: any = { userId: user };

    // Add month filter if provided
    if (month) {
      const monthStr = month as string;
      query.date = { $regex: `^${monthStr}` };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = new Transaction(req.body);
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get a transaction by ID
// @route   GET /api/transactions/:id
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};