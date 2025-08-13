// src/routes/budgets.ts
import express from 'express';
import { protect } from '../middleware/auth';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgets';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/budgets - Get all budgets for user
router.get('/', getBudgets);

// POST /api/budgets - Create new budget
router.post('/', createBudget);

// PUT /api/budgets/:id - Update budget
router.put('/:id', updateBudget);

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', deleteBudget);

export default router;
