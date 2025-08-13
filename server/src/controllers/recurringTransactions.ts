// src/controllers/recurringTransactions.ts
import { Request, Response } from 'express';
import RecurringTransaction from '../models/RecurringTransaction';
import Transaction from '../models/Transaction';

interface AuthRequest extends Request {
  userId?: string;
}

// Get all recurring transactions for a user
export const getRecurringTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const recurringTransactions = await RecurringTransaction.find({ 
      userId, 
      isActive: true 
    }).sort({ nextDate: 1 });
    
    res.json(recurringTransactions);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    res.status(500).json({ message: 'Failed to fetch recurring transactions' });
  }
};

// Create a new recurring transaction
export const createRecurringTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { type, amount, category, description, frequency, nextDate } = req.body;
    
    const recurringTransaction = new RecurringTransaction({
      userId,
      type,
      amount,
      category: category.toLowerCase(),
      description,
      frequency,
      nextDate: new Date(nextDate)
    });
    
    await recurringTransaction.save();
    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(500).json({ message: 'Failed to create recurring transaction' });
  }
};

// Update a recurring transaction
export const updateRecurringTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { type, amount, category, description, frequency, nextDate, isActive } = req.body;
    
    const recurringTransaction = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      { 
        type, 
        amount, 
        category: category?.toLowerCase(), 
        description, 
        frequency, 
        nextDate: nextDate ? new Date(nextDate) : undefined,
        isActive 
      },
      { new: true }
    );
    
    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    
    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(500).json({ message: 'Failed to update recurring transaction' });
  }
};

// Delete a recurring transaction
export const deleteRecurringTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const recurringTransaction = await RecurringTransaction.findOneAndDelete({ 
      _id: id, 
      userId 
    });
    
    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    
    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({ message: 'Failed to delete recurring transaction' });
  }
};

// Process due recurring transactions (this would typically be called by a cron job)
export const processDueRecurringTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueTransactions = await RecurringTransaction.find({
      nextDate: { $lte: today },
      isActive: true
    });
    
    const processedTransactions = [];
    
    for (const recurring of dueTransactions) {
      // Create the actual transaction
      const transaction = new Transaction({
        userId: recurring.userId,
        type: recurring.type,
        amount: recurring.amount,
        category: recurring.category,
        note: `${recurring.description} (Auto-generated)`,
        date: new Date()
      });
      
      await transaction.save();
      
      // Calculate next date based on frequency
      const nextDate = new Date(recurring.nextDate);
      switch (recurring.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
      
      // Update the recurring transaction
      recurring.nextDate = nextDate;
      recurring.lastProcessed = new Date();
      await recurring.save();
      
      processedTransactions.push({
        recurringId: recurring._id,
        transactionId: transaction._id,
        nextDate: nextDate
      });
    }
    
    res.json({
      message: `Processed ${processedTransactions.length} recurring transactions`,
      processed: processedTransactions
    });
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    res.status(500).json({ message: 'Failed to process recurring transactions' });
  }
};
