// server/src/services/smartBudgetService.ts
import { advancedAIService } from './advancedAIService';

interface SmartBudget {
  userId: string;
  month: string;
  categories: Record<string, {
    allocated: number;
    spent: number;
    predicted: number;
    recommendation: string;
    status: 'under' | 'on_track' | 'over' | 'warning';
  }>;
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  savingsGoal: number;
  actualSavings: number;
  optimizations: BudgetOptimization[];
  createdAt: Date;
  updatedAt: Date;
}

interface BudgetOptimization {
  type: 'reduce' | 'reallocate' | 'increase' | 'automate';
  category: string;
  currentAmount: number;
  suggestedAmount: number;
  reasoning: string;
  expectedSavings: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  impact: 'low' | 'medium' | 'high';
}

interface AutoBudgetRule {
  userId: string;
  enabled: boolean;
  rules: {
    autoIncreaseSavings: boolean;
    autoReduceOverspending: boolean;
    autoReallocateUnused: boolean;
    maxAdjustmentPercentage: number;
  };
}

class SmartBudgetService {
  
  // Generate AI-powered budget for a user
  async generateSmartBudget(userId: string, targetSavingsRate: number = 0.2): Promise<SmartBudget> {
    try {
      const Transaction = require('../models/Transaction').default;
      
      // Get last 3 months of data
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const transactions = await Transaction.find({
        userId,
        createdAt: { $gte: threeMonthsAgo }
      });

      // Calculate historical averages
      const monthlyAverages = this.calculateMonthlyAverages(transactions);
      const totalIncome = monthlyAverages.income || 0;
      const totalSpent = Object.values(monthlyAverages.expenses).reduce((sum: number, amount: any) => sum + amount, 0);

      // Generate category allocations using AI
      const budgetSuggestions = await advancedAIService.suggestBudgets(transactions, totalIncome);
      
      // Create smart budget structure
      const categories: Record<string, any> = {};
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Process each category
      for (const [category, historicalSpending] of Object.entries(monthlyAverages.expenses)) {
        const suggestion = budgetSuggestions.find(s => s.category === category);
        const allocated = suggestion ? suggestion.suggestedAmount : (historicalSpending as number);
        
        categories[category] = {
          allocated,
          spent: 0, // Will be updated with current month data
          predicted: historicalSpending,
          recommendation: suggestion ? 
            `Based on your spending patterns, $${allocated.toFixed(2)} is optimal for ${category}` :
            `Continue with your current ${category} spending of $${(historicalSpending as number).toFixed(2)}`,
          status: 'on_track'
        };
      }

      // Calculate optimizations
      const optimizations = await this.generateOptimizations(categories, totalIncome, targetSavingsRate);

      const smartBudget: SmartBudget = {
        userId,
        month: currentMonth,
        categories,
        totalIncome,
        totalAllocated: Object.values(categories).reduce((sum, cat) => sum + cat.allocated, 0),
        totalSpent: 0,
        savingsGoal: totalIncome * targetSavingsRate,
        actualSavings: 0,
        optimizations,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return smartBudget;
    } catch (error) {
      console.error('Error generating smart budget:', error);
      throw error;
    }
  }

  // Update budget with current month spending
  async updateBudgetProgress(userId: string, month: string): Promise<SmartBudget | null> {
    try {
      const Transaction = require('../models/Transaction').default;
      
      // Get current month transactions
      const [year, monthNum] = month.split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 1);

      const monthTransactions = await Transaction.find({
        userId,
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
      });

      // Get existing budget or create new one
      let budget = await this.getBudget(userId, month);
      if (!budget) {
        budget = await this.generateSmartBudget(userId);
      }

      // Update spending amounts
      const currentSpending = this.calculateCurrentSpending(monthTransactions);
      
      for (const category of Object.keys(budget.categories)) {
        const spent = currentSpending[category] || 0;
        budget.categories[category].spent = spent;
        
        // Update status
        const allocated = budget.categories[category].allocated;
        if (spent > allocated * 1.1) {
          budget.categories[category].status = 'over';
        } else if (spent > allocated * 0.9) {
          budget.categories[category].status = 'warning';
        } else if (spent < allocated * 0.5) {
          budget.categories[category].status = 'under';
        } else {
          budget.categories[category].status = 'on_track';
        }
      }

      // Update totals
      budget.totalSpent = Object.values(budget.categories).reduce((sum, cat) => sum + cat.spent, 0);
      budget.actualSavings = budget.totalIncome - budget.totalSpent;
      budget.updatedAt = new Date();

      // Generate new optimizations based on current progress
      budget.optimizations = await this.generateOptimizations(
        budget.categories, 
        budget.totalIncome, 
        budget.savingsGoal / budget.totalIncome
      );

      return budget;
    } catch (error) {
      console.error('Error updating budget progress:', error);
      return null;
    }
  }

  // Generate budget optimizations
  private async generateOptimizations(
    categories: Record<string, any>, 
    totalIncome: number, 
    targetSavingsRate: number
  ): Promise<BudgetOptimization[]> {
    const optimizations: BudgetOptimization[] = [];
    const totalAllocated = Object.values(categories).reduce((sum: number, cat: any) => sum + cat.allocated, 0);
    const currentSavingsRate = (totalIncome - totalAllocated) / totalIncome;
    
    // If savings rate is below target, suggest optimizations
    if (currentSavingsRate < targetSavingsRate) {
      const neededSavings = (targetSavingsRate - currentSavingsRate) * totalIncome;
      
      // Find overspending categories
      const overspendingCategories = Object.entries(categories)
        .filter(([, cat]: [string, any]) => cat.spent > cat.allocated)
        .sort(([, a]: [string, any], [, b]: [string, any]) => (b.spent - b.allocated) - (a.spent - a.allocated));

      for (const [category, cat] of overspendingCategories) {
        const overage = cat.spent - cat.allocated;
        optimizations.push({
          type: 'reduce',
          category,
          currentAmount: cat.allocated,
          suggestedAmount: cat.allocated - Math.min(overage, neededSavings / 2),
          reasoning: `Reduce ${category} spending to get back on budget and increase savings`,
          expectedSavings: Math.min(overage, neededSavings / 2),
          difficulty: this.getDifficultyLevel(category),
          impact: overage > neededSavings * 0.3 ? 'high' : 'medium'
        });
      }

      // Find underspending categories for reallocation
      const underspendingCategories = Object.entries(categories)
        .filter(([, cat]: [string, any]) => cat.spent < cat.allocated * 0.8)
        .sort(([, a]: [string, any], [, b]: [string, any]) => (a.allocated - a.spent) - (b.allocated - b.spent));

      for (const [category, cat] of underspendingCategories) {
        const underSpend = cat.allocated - cat.spent;
        if (underSpend > 50) { // Only suggest if significant amount
          optimizations.push({
            type: 'reallocate',
            category,
            currentAmount: cat.allocated,
            suggestedAmount: cat.spent + (underSpend * 0.2), // Keep 20% buffer
            reasoning: `Reallocate unused ${category} budget to savings or other priorities`,
            expectedSavings: underSpend * 0.8,
            difficulty: 'easy',
            impact: underSpend > neededSavings * 0.2 ? 'high' : 'medium'
          });
        }
      }
    }

    // Suggest automation opportunities
    const regularCategories = ['rent', 'utilities', 'insurance', 'subscriptions'];
    for (const category of regularCategories) {
      if (categories[category] && categories[category].status === 'on_track') {
        optimizations.push({
          type: 'automate',
          category,
          currentAmount: categories[category].allocated,
          suggestedAmount: categories[category].allocated,
          reasoning: `Automate ${category} payments to ensure consistent budgeting`,
          expectedSavings: 0,
          difficulty: 'easy',
          impact: 'medium'
        });
      }
    }

    return optimizations.slice(0, 5); // Return top 5 optimizations
  }

  // Auto-adjust budget based on rules
  async autoAdjustBudget(userId: string, rules: AutoBudgetRule): Promise<SmartBudget | null> {
    if (!rules.enabled) return null;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const budget = await this.updateBudgetProgress(userId, currentMonth);
      
      if (!budget) return null;

      let adjusted = false;

      // Auto-reduce overspending categories
      if (rules.rules.autoReduceOverspending) {
        for (const [category, cat] of Object.entries(budget.categories)) {
          if (cat.status === 'over') {
            const reduction = Math.min(
              cat.spent - cat.allocated,
              cat.allocated * (rules.rules.maxAdjustmentPercentage / 100)
            );
            cat.allocated = cat.allocated + reduction;
            adjusted = true;
          }
        }
      }

      // Auto-reallocate unused budget to savings
      if (rules.rules.autoReallocateUnused) {
        for (const [category, cat] of Object.entries(budget.categories)) {
          if (cat.status === 'under' && cat.allocated - cat.spent > 100) {
            const reallocation = Math.min(
              (cat.allocated - cat.spent) * 0.5,
              cat.allocated * (rules.rules.maxAdjustmentPercentage / 100)
            );
            cat.allocated = cat.allocated - reallocation;
            budget.savingsGoal += reallocation;
            adjusted = true;
          }
        }
      }

      // Auto-increase savings if under-spending overall
      if (rules.rules.autoIncreaseSavings && budget.actualSavings > budget.savingsGoal * 1.2) {
        const extraSavings = budget.actualSavings - budget.savingsGoal;
        budget.savingsGoal += extraSavings * 0.5; // Increase savings goal by 50% of excess
        adjusted = true;
      }

      if (adjusted) {
        budget.updatedAt = new Date();
        // Here you would save to database
      }

      return budget;
    } catch (error) {
      console.error('Error auto-adjusting budget:', error);
      return null;
    }
  }

  // Get budget variance analysis
  getBudgetVarianceAnalysis(budget: SmartBudget) {
    const analysis = {
      overallVariance: budget.totalSpent - budget.totalAllocated,
      savingsVariance: budget.actualSavings - budget.savingsGoal,
      categoryVariances: {} as Record<string, {
        variance: number;
        percentage: number;
        status: string;
        recommendation: string;
      }>
    };

    for (const [category, cat] of Object.entries(budget.categories)) {
      const variance = cat.spent - cat.allocated;
      const percentage = cat.allocated > 0 ? (variance / cat.allocated) * 100 : 0;
      
      analysis.categoryVariances[category] = {
        variance,
        percentage,
        status: cat.status,
        recommendation: this.getVarianceRecommendation(category, variance, percentage)
      };
    }

    return analysis;
  }

  // Helper methods
  private calculateMonthlyAverages(transactions: any[]) {
    const monthlyData: Record<string, any> = {
      income: 0,
      expenses: {}
    };

    const months = Math.max(1, Math.ceil(transactions.length / 20)); // Estimate months

    // Calculate income
    const incomeTotal = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    monthlyData.income = incomeTotal / months;

    // Calculate expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    for (const [category, total] of Object.entries(expensesByCategory)) {
      monthlyData.expenses[category] = (total as number) / months;
    }

    return monthlyData;
  }

  private calculateCurrentSpending(transactions: any[]) {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }

  private getDifficultyLevel(category: string): 'easy' | 'moderate' | 'hard' {
    const easyCategories = ['entertainment', 'shopping', 'subscriptions'];
    const hardCategories = ['rent', 'utilities', 'insurance', 'groceries'];
    
    if (easyCategories.includes(category)) return 'easy';
    if (hardCategories.includes(category)) return 'hard';
    return 'moderate';
  }

  private getVarianceRecommendation(category: string, variance: number, percentage: number): string {
    if (variance > 0) {
      if (percentage > 20) {
        return `Significantly over budget in ${category}. Consider finding ways to reduce spending or adjusting your budget.`;
      } else if (percentage > 10) {
        return `Slightly over budget in ${category}. Monitor spending more closely next month.`;
      }
    } else if (variance < 0) {
      if (Math.abs(percentage) > 30) {
        return `Well under budget in ${category}. Consider reallocating some funds to savings or other categories.`;
      }
    }
    return `${category} spending is on track with your budget.`;
  }

  // Placeholder for database operations
  private async getBudget(userId: string, month: string): Promise<SmartBudget | null> {
    // In a real implementation, this would query the database
    return null;
  }

  // Analyze budget variance
  async analyzeBudgetVariance(budget: any, actualSpending: any): Promise<any> {
    try {
      const analysis = {
        totalBudget: 0,
        totalSpent: 0,
        variance: 0,
        categoryBreakdown: [] as any[]
      };

      for (const [category, budgetAmount] of Object.entries(budget.categories || {})) {
        const spent = actualSpending[category] || 0;
        const variance = (spent as number) - (budgetAmount as number);
        const percentageVariance = budgetAmount ? ((variance / (budgetAmount as number)) * 100) : 0;

        analysis.categoryBreakdown.push({
          category,
          budgeted: budgetAmount,
          spent,
          variance,
          percentageVariance,
          status: variance > 0 ? 'over' : variance < 0 ? 'under' : 'exact'
        });

        analysis.totalBudget += budgetAmount as number;
        analysis.totalSpent += spent;
      }

      analysis.variance = analysis.totalSpent - analysis.totalBudget;

      return analysis;
    } catch (error) {
      console.error('Budget variance analysis error:', error);
      return null;
    }
  }

  // Optimize budget allocation
  async optimizeBudgetAllocation(budget: any, transactions: any[], goals: any[]): Promise<any> {
    try {
      const recommendations = [];

      // Analyze spending patterns
      const categorySpending = transactions.reduce((acc, t) => {
        if (t.type === 'expense') {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
        return acc;
      }, {});

      // Suggest optimizations
      for (const [category, amount] of Object.entries(categorySpending)) {
        const budgetedAmount = budget.categories?.[category] || 0;
        const overSpent = (amount as number) - budgetedAmount;

        if (overSpent > 50) {
          recommendations.push({
            type: 'increase_budget',
            category,
            currentBudget: budgetedAmount,
            suggestedBudget: Math.ceil((amount as number) * 1.1),
            reason: `Consistently overspending by $${overSpent.toFixed(2)}`
          });
        }
      }

      return { recommendations };
    } catch (error) {
      console.error('Budget optimization error:', error);
      return { recommendations: [] };
    }
  }

  // Predict future spending
  async predictFutureSpending(transactions: any[], timeframe: string = 'monthly'): Promise<any> {
    try {
      const categoryTotals: Record<string, number[]> = {};
      
      // Group transactions by category and month
      transactions.forEach(t => {
        if (t.type === 'expense') {
          if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = [];
          }
          categoryTotals[t.category].push(t.amount);
        }
      });

      const predictions = Object.entries(categoryTotals).map(([category, amounts]) => {
        const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        const trend = this.calculateTrend(amounts);
        
        return {
          category,
          predicted: average * (1 + trend),
          confidence: amounts.length >= 3 ? 0.8 : 0.5,
          trend: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable'
        };
      });

      return { timeframe, predictions };
    } catch (error) {
      console.error('Spending prediction error:', error);
      return { timeframe, predictions: [] };
    }
  }

  // Generate budget insights
  async generateBudgetInsights(budget: any, transactions: any[], userProfile: any): Promise<any> {
    try {
      const insights = [];

      // Calculate spending efficiency
      const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalBudget = Object.values(budget.categories || {})
        .reduce((sum: number, amount: any) => sum + amount, 0);

      if (totalSpent < totalBudget * 0.8) {
        insights.push({
          type: 'positive',
          title: 'Great spending discipline!',
          description: 'You\'re staying well within your budget across most categories.',
          impact: 'medium'
        });
      }

      // Check for high-spending categories
      const categorySpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      const topCategory = Object.entries(categorySpending)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];

      if (topCategory) {
        insights.push({
          type: 'info',
          title: `${topCategory[0]} is your top spending category`,
          description: `You've spent $${(topCategory[1] as number).toFixed(2)} in this category.`,
          impact: 'low'
        });
      }

      return { insights };
    } catch (error) {
      console.error('Budget insights error:', error);
      return { insights: [] };
    }
  }

  // Track budget goals
  async trackBudgetGoals(budget: any, actualSpending: any, goals: any[]): Promise<any> {
    try {
      const goalTracking = goals.map(goal => {
        const category = goal.category || 'general';
        const budgetAmount = budget.categories?.[category] || 0;
        const spentAmount = actualSpending[category] || 0;
        const remaining = budgetAmount - spentAmount;
        
        return {
          goalId: goal.id,
          name: goal.name,
          category,
          budgetAmount,
          spentAmount,
          remaining,
          progress: budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0,
          status: remaining >= 0 ? 'on_track' : 'over_budget'
        };
      });

      return { goals: goalTracking };
    } catch (error) {
      console.error('Goal tracking error:', error);
      return { goals: [] };
    }
  }

  private calculateTrend(amounts: number[]): number {
    if (amounts.length < 2) return 0;
    
    const first = amounts.slice(0, Math.floor(amounts.length / 2));
    const second = amounts.slice(Math.floor(amounts.length / 2));
    
    const firstAvg = first.reduce((sum, amount) => sum + amount, 0) / first.length;
    const secondAvg = second.reduce((sum, amount) => sum + amount, 0) / second.length;
    
    return firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
  }
}

export const smartBudgetService = new SmartBudgetService();
