// src/routes/financialGoals.ts
import express from 'express';
import { protect } from '../middleware/auth';
import {
  getFinancialGoals,
  createFinancialGoal,
  updateFinancialGoal,
  addToGoal,
  deleteFinancialGoal
} from '../controllers/financialGoals';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/financial-goals - Get all financial goals for user
router.get('/', getFinancialGoals);

// POST /api/financial-goals - Create new financial goal
router.post('/', createFinancialGoal);

// PUT /api/financial-goals/:id - Update financial goal
router.put('/:id', updateFinancialGoal);

// POST /api/financial-goals/:id/add - Add money to goal
router.post('/:id/add', addToGoal);

// DELETE /api/financial-goals/:id - Delete financial goal
router.delete('/:id', deleteFinancialGoal);

export default router;
