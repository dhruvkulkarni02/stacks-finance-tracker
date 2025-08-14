import { Router } from 'express';
import { protect } from '../middleware/auth';
import { advancedAIService } from '../services/advancedAIService';
import Transaction, { ITransaction } from '../models/Transaction';
import Goal, { IGoal } from '../models/Goal';

const router = Router();

// All AI routes require authentication
router.use(protect);

// AI Financial Chat Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const userId = (req as any).userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's financial data for context
    const [transactions, goals] = await Promise.all([
      Transaction.find({ userId }).sort({ createdAt: -1 }).limit(100),
      Goal.find({ userId })
    ]);

    const monthlyIncome = transactions
      .filter((t: ITransaction) => t.type === 'income')
      .reduce((sum: number, t: ITransaction) => sum + t.amount, 0) / Math.max(1, transactions.length / 30);

    const monthlyExpenses = transactions
      .filter((t: ITransaction) => t.type === 'expense')
      .reduce((sum: number, t: ITransaction) => sum + t.amount, 0) / Math.max(1, transactions.length / 30);

    const userFinancialData = {
      transactions,
      goals,
      monthlyIncome,
      monthlyExpenses
    };

    const response = await advancedAIService.chatWithFinancialAdvisor(
      message,
      chatHistory || [],
      userFinancialData
    );

    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Advanced Financial Insights
router.get('/advanced-insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [transactions, goals] = await Promise.all([
      Transaction.find({ userId }).sort({ createdAt: -1 }),
      Goal.find({ userId })
    ]);

    const insights = await advancedAIService.generateAdvancedInsights(transactions, goals);

    res.json({ insights });
  } catch (error) {
    console.error('Advanced insights error:', error);
    res.status(500).json({ 
      error: 'Failed to generate advanced insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Anomaly Detection
router.get('/anomalies/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 90 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));

    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: cutoffDate }
    }).sort({ createdAt: -1 });

    const anomalies = await advancedAIService.detectAnomalies(transactions);

    res.json({ 
      anomalies,
      analysisDate: new Date().toISOString(),
      transactionsAnalyzed: transactions.length
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ 
      error: 'Failed to detect anomalies',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Investment Recommendations
router.get('/investment-recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { age, riskTolerance, currentSavings } = req.query;

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(200);

    const userProfile = {
      age: age ? parseInt(age as string) : 30,
      riskTolerance: riskTolerance || 'moderate',
      currentSavings: currentSavings ? parseFloat(currentSavings as string) : 0
    };

    const recommendations = await advancedAIService.generateInvestmentRecommendations(
      userProfile,
      transactions
    );

    res.json({ 
      recommendations,
      userProfile,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Investment recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate investment recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Bill Predictions
router.get('/bill-predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { months = 6 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(months as string));

    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: cutoffDate }
    }).sort({ createdAt: -1 });

    const predictions = await advancedAIService.predictUpcomingBills(transactions);

    res.json({ 
      predictions,
      nextMonth: predictions.filter(p => {
        const dueDate = new Date(p.dueDate);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return dueDate <= nextMonth;
      }),
      analysisDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bill predictions error:', error);
    res.status(500).json({ 
      error: 'Failed to predict bills',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Financial Health Score
router.get('/health-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { emergencyFund, budgetTarget } = req.query;

    const [transactions, goals] = await Promise.all([
      Transaction.find({ userId }).sort({ createdAt: -1 }),
      Goal.find({ userId })
    ]);

    const userProfile = {
      emergencyFund: emergencyFund ? parseFloat(emergencyFund as string) : 0,
      budgetTarget: budgetTarget ? parseFloat(budgetTarget as string) : undefined
    };

    const healthScore = await advancedAIService.calculateFinancialHealthScore(
      transactions,
      goals,
      userProfile
    );

    res.json({ 
      healthScore,
      calculatedAt: new Date().toISOString(),
      dataPoints: {
        transactions: transactions.length,
        goals: goals.length
      }
    });
  } catch (error) {
    console.error('Health score calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate financial health score',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Comprehensive AI Dashboard
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all user data
    const [transactions, goals] = await Promise.all([
      Transaction.find({ userId }).sort({ createdAt: -1 }).limit(200),
      Goal.find({ userId })
    ]);

    const userProfile = {
      emergencyFund: 0,
      age: 30,
      riskTolerance: 'moderate'
    };

    // Generate all AI insights in parallel
    const [
      insights,
      anomalies,
      recommendations,
      predictions,
      healthScore
    ] = await Promise.all([
      advancedAIService.generateAdvancedInsights(transactions, goals),
      advancedAIService.detectAnomalies(transactions.slice(0, 100)),
      advancedAIService.generateInvestmentRecommendations(userProfile, transactions),
      advancedAIService.predictUpcomingBills(transactions),
      advancedAIService.calculateFinancialHealthScore(transactions, goals, userProfile)
    ]);

    // Summary statistics
    const monthlyIncome = transactions
      .filter((t: ITransaction) => t.type === 'income')
      .reduce((sum: number, t: ITransaction) => sum + t.amount, 0) / Math.max(1, transactions.length / 30);

    const monthlyExpenses = transactions
      .filter((t: ITransaction) => t.type === 'expense')
      .reduce((sum: number, t: ITransaction) => sum + t.amount, 0) / Math.max(1, transactions.length / 30);

    const dashboard = {
      summary: {
        monthlyIncome: monthlyIncome.toFixed(2),
        monthlyExpenses: monthlyExpenses.toFixed(2),
        savingsRate: ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1),
        totalTransactions: transactions.length,
        activeGoals: goals.length
      },
      healthScore,
      insights: insights.slice(0, 5), // Top 5 insights
      anomalies: anomalies.filter(a => a.severity === 'high').slice(0, 3), // Top 3 high-severity anomalies
      upcomingBills: predictions.slice(0, 5), // Next 5 bills
      investmentRecommendations: recommendations.slice(0, 3), // Top 3 recommendations
      generatedAt: new Date().toISOString()
    };

    res.json(dashboard);
  } catch (error) {
    console.error('AI Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as advancedAIRoutes };
