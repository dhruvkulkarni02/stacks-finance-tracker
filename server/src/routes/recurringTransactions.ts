// src/routes/recurringTransactions.ts
import express from 'express';
import { protect } from '../middleware/auth';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processDueRecurringTransactions
} from '../controllers/recurringTransactions';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/recurring-transactions - Get all recurring transactions for user
router.get('/', getRecurringTransactions);

// POST /api/recurring-transactions - Create new recurring transaction
router.post('/', createRecurringTransaction);

// PUT /api/recurring-transactions/:id - Update recurring transaction
router.put('/:id', updateRecurringTransaction);

// DELETE /api/recurring-transactions/:id - Delete recurring transaction
router.delete('/:id', deleteRecurringTransaction);

// POST /api/recurring-transactions/process - Process due recurring transactions
router.post('/process', processDueRecurringTransactions);

export default router;
