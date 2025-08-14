import { Router } from 'express';
import { protect } from '../middleware/auth';
import { aiService } from '../services/aiService';
import Transaction, { ITransaction } from '../models/Transaction';
import Goal, { IGoal } from '../models/Goal';

const router = Router();

// All AI routes require authentication
router.use(protect);

// Smart transaction categorization
router.post('/categorize-transaction', async (req, res) => {
  try {
    const { description, amount } = req.body;
    const userId = (req as any).userId;
    
    if (!description || amount === undefined) {
      return res.status(400).json({ 
        error: 'Description and amount are required' 
      });
    }

    // Get recent transactions for context
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(20);

    const result = await aiService.categorizeTransaction(description, amount, recentTransactions);
    res.json(result);
  } catch (error) {
    console.error('AI categorization error:', error);
    res.status(500).json({ 
      error: 'Failed to categorize transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Predict next month spending
router.get('/predict-spending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get last 6 months of transactions for better prediction
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const transactions = await Transaction.find({
      userId: userId,
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ createdAt: -1 });

    const result = await aiService.predictNextMonthSpending(transactions);
    res.json(result);
  } catch (error) {
    console.error('AI spending prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to predict spending',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get personalized budget suggestions
router.get('/budget-suggestions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { income } = req.query; // Expected monthly income
    
    // Get last 3 months of transactions for budget analysis
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const transactions = await Transaction.find({
      userId: userId,
      date: { $gte: threeMonthsAgo.toISOString() }
    }).sort({ createdAt: -1 });

    // Use provided income or estimate from transactions
    const monthlyIncome = income ? parseFloat(income as string) : 
      transactions
        .filter((t: ITransaction) => t.type === 'income')
        .reduce((sum: number, t: ITransaction) => sum + t.amount, 0) / 3;

    const result = await aiService.suggestBudgets(transactions, monthlyIncome);
    res.json(result);
  } catch (error) {
    console.error('AI budget suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to generate budget suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Predict goal achievement
router.get('/predict-goal/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    
    // Get the goal
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Get related transactions for analysis
    const transactions = await Transaction.find({
      userId: goal.userId,
      category: goal.category || undefined
    }).sort({ createdAt: -1 }).limit(50);

    const result = await aiService.predictGoalAchievement(goal, transactions);
    res.json(result);
  } catch (error) {
    console.error('AI goal prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to predict goal achievement',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Comprehensive financial insights
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get comprehensive data for insights
    const [transactions, goals] = await Promise.all([
      Transaction.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(100),
      Goal.find({ userId: userId })
    ]);

    // Calculate estimated monthly income from transactions
    const monthlyIncome = transactions
      .filter((t: ITransaction) => t.type === 'income')
      .reduce((sum: number, t: ITransaction) => sum + t.amount, 0) / Math.max(1, transactions.length / 30);

    // Generate insights using multiple AI services
    const [spendingPrediction, budgetSuggestions] = await Promise.all([
      aiService.predictNextMonthSpending(transactions),
      aiService.suggestBudgets(transactions, monthlyIncome)
    ]);

    // Get goal predictions for all goals (since we don't have status field)
    const goalPredictions = await Promise.all(
      goals.map(async (goal: IGoal) => {
        try {
          const prediction = await aiService.predictGoalAchievement(goal, transactions);
          return { goalId: goal._id.toString(), goalName: goal.name, prediction };
        } catch (error) {
          console.error(`Error predicting goal ${goal._id}:`, error);
          return null;
        }
      })
    );

    const insights = {
      spendingPrediction,
      budgetSuggestions,
      goalPredictions: goalPredictions.filter((p: any) => p !== null),
      summary: {
        totalTransactions: transactions.length,
        totalGoals: goals.length,
        avgMonthlySpending: transactions.length > 0 
          ? transactions
              .filter((t: ITransaction) => t.type === 'expense')
              .reduce((sum: number, t: ITransaction) => sum + Math.abs(t.amount), 0) / Math.max(1, Math.ceil(transactions.length / 30))
          : 0
      }
    };

    res.json(insights);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ 
      error: 'Failed to generate financial insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    // Test OpenAI connection
    let openaiStatus = 'not configured';
    if (process.env.OPENAI_API_KEY) {
      try {
        const testResult = await aiService.categorizeTransaction('test coffee purchase', 5.50, []);
        openaiStatus = testResult.confidence > 0.5 ? 'working' : 'degraded';
      } catch (error) {
        openaiStatus = 'error';
      }
    }

    res.json({ 
      status: 'healthy',
      service: 'AI Financial Assistant',
      timestamp: new Date().toISOString(),
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      openaiStatus,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiRoutes };
