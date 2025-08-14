// server/src/routes/smartBudget.ts
import { Router } from 'express';
import { smartBudgetService } from '../services/smartBudgetService';
import { protect } from '../middleware/auth';

const router = Router();

// Generate smart budget recommendations
router.post('/generate', protect, async (req, res) => {
  try {
    const { targetSavingsRate } = req.body;
    const budget = await smartBudgetService.generateSmartBudget(
      (req as any).userId,
      targetSavingsRate || 0.2
    );
    res.json(budget);
  } catch (error) {
    console.error('Generate budget error:', error);
    res.status(500).json({ error: 'Failed to generate smart budget' });
  }
});

// Analyze budget variance
router.post('/analyze-variance', protect, async (req, res) => {
  try {
    const { budget, actualSpending } = req.body;
    const analysis = await smartBudgetService.analyzeBudgetVariance(budget, actualSpending);
    res.json(analysis);
  } catch (error) {
    console.error('Analyze variance error:', error);
    res.status(500).json({ error: 'Failed to analyze budget variance' });
  }
});

// Auto-adjust budget based on spending patterns
router.post('/auto-adjust', protect, async (req, res) => {
  try {
    const { currentBudget, recentTransactions } = req.body;
    const adjustedBudget = await smartBudgetService.autoAdjustBudget(
      currentBudget,
      recentTransactions
    );
    res.json(adjustedBudget);
  } catch (error) {
    console.error('Auto-adjust budget error:', error);
    res.status(500).json({ error: 'Failed to auto-adjust budget' });
  }
});

// Get budget optimization recommendations
router.post('/optimize', protect, async (req, res) => {
  try {
    const { budget, transactions, goals } = req.body;
    const optimizations = await smartBudgetService.optimizeBudgetAllocation(
      budget,
      transactions,
      goals
    );
    res.json(optimizations);
  } catch (error) {
    console.error('Optimize budget error:', error);
    res.status(500).json({ error: 'Failed to optimize budget' });
  }
});

// Predict future spending based on trends
router.post('/predict-spending', protect, async (req, res) => {
  try {
    const { transactions, timeframe } = req.body;
    const predictions = await smartBudgetService.predictFutureSpending(
      transactions,
      timeframe || 'monthly'
    );
    res.json(predictions);
  } catch (error) {
    console.error('Predict spending error:', error);
    res.status(500).json({ error: 'Failed to predict future spending' });
  }
});

// Get personalized budget insights
router.post('/insights', protect, async (req, res) => {
  try {
    const { budget, transactions, userProfile } = req.body;
    const insights = await smartBudgetService.generateBudgetInsights(
      budget,
      transactions,
      userProfile
    );
    res.json(insights);
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({ error: 'Failed to generate budget insights' });
  }
});

// Track budget goals and milestones
router.post('/track-goals', protect, async (req, res) => {
  try {
    const { budget, actualSpending, goals } = req.body;
    const tracking = await smartBudgetService.trackBudgetGoals(
      budget,
      actualSpending,
      goals
    );
    res.json(tracking);
  } catch (error) {
    console.error('Track goals error:', error);
    res.status(500).json({ error: 'Failed to track budget goals' });
  }
});

export default router;
