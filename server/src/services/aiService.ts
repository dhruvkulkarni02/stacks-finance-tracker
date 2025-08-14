// server/src/services/aiService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface BudgetSuggestion {
  category: string;
  suggestedAmount: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GoalPrediction {
  goalId: string;
  estimatedCompletionDate: string;
  probabilityOfSuccess: number;
  recommendedMonthlyContribution: number;
  suggestions: string[];
}

class AIService {
  
  // Smart Transaction Categorization
  async categorizeTransaction(description: string, amount: number, existingTransactions: any[]): Promise<CategorySuggestion> {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not found, using rule-based categorization');
        return this.fallbackCategorization(description, amount);
      }

      const categories = [
        'groceries', 'food', 'entertainment', 'transport', 'utilities', 
        'rent', 'shopping', 'health', 'education', 'travel', 'subscription',
        'gas', 'insurance', 'salary', 'freelance', 'investment', 'gift', 'other'
      ];

      // Create context from existing transactions
      const recentTransactions = existingTransactions
        .slice(-20)
        .map(t => `${t.note || 'N/A'} - ${t.category} ($${t.amount})`)
        .join('\n');

      const prompt = `
        Analyze this transaction and suggest the most appropriate category:
        
        Transaction: "${description}"
        Amount: $${amount}
        
        Available categories: ${categories.join(', ')}
        
        Recent transaction patterns:
        ${recentTransactions}
        
        Please respond with a JSON object containing:
        {
          "category": "most_likely_category",
          "confidence": 0.85,
          "reasoning": "brief explanation of why this category was chosen"
        }
        
        Consider the description, amount, and user's spending patterns.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const result = JSON.parse(content);
      
      return {
        category: result.category || 'other',
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || 'AI categorization based on description and patterns'
      };
    } catch (error) {
      console.error('AI categorization error:', error);
      // Fallback to rule-based categorization
      return this.fallbackCategorization(description, amount);
    }
  }

  // Fallback rule-based categorization when AI is unavailable
  private fallbackCategorization(description: string, amount: number): CategorySuggestion {
    const desc = description.toLowerCase();
    
    // Define keyword mappings
    const categoryKeywords = {
      groceries: ['grocery', 'supermarket', 'walmart', 'target', 'costco', 'whole foods', 'trader joe'],
      food: ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'dining', 'lunch', 'dinner', 'breakfast'],
      transport: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus', 'train'],
      entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater'],
      utilities: ['electric', 'water', 'internet', 'phone', 'utility', 'bill'],
      rent: ['rent', 'mortgage', 'housing'],
      shopping: ['amazon', 'store', 'mall', 'shop', 'clothing', 'shoes'],
      health: ['doctor', 'hospital', 'pharmacy', 'medical', 'health', 'dental'],
      subscription: ['subscription', 'monthly', 'annual', 'plan'],
      salary: ['salary', 'payroll', 'income', 'wage'],
      investment: ['investment', 'stock', 'bond', 'crypto', 'portfolio']
    };

    // Find best matching category
    let bestCategory = 'other';
    let confidence = 0.3;
    let reasoning = 'Rule-based categorization using keywords';

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (desc.includes(keyword)) {
          bestCategory = category;
          confidence = 0.7;
          reasoning = `Matched keyword "${keyword}" for ${category} category`;
          break;
        }
      }
      if (confidence > 0.3) break;
    }

    // Amount-based hints
    if (amount > 1000 && bestCategory === 'other') {
      bestCategory = 'rent';
      confidence = 0.5;
      reasoning = 'Large amount suggests rent or major expense';
    } else if (amount < 10 && bestCategory === 'other') {
      bestCategory = 'food';
      confidence = 0.4;
      reasoning = 'Small amount suggests food or small purchase';
    }

    return {
      category: bestCategory,
      confidence,
      reasoning
    };
  }

  // Predictive Spending Analytics
  async predictNextMonthSpending(transactions: any[]): Promise<SpendingPrediction[]> {
    try {
      // Group transactions by category and month
      const monthlyData = this.groupTransactionsByMonth(transactions);
      const categories = [...new Set(transactions.map(t => t.category))];

      const predictions: SpendingPrediction[] = [];

      for (const category of categories) {
        const categoryData = monthlyData.map(month => ({
          month: month.date,
          amount: month.transactions
            .filter(t => t.category === category && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        })).filter(data => data.amount > 0);

        if (categoryData.length >= 2) {
          const prediction = this.calculateTrendPrediction(categoryData);
          predictions.push({
            category,
            predictedAmount: prediction.amount,
            confidence: prediction.confidence,
            trend: prediction.trend
          });
        }
      }

      return predictions;
    } catch (error) {
      console.error('Spending prediction error:', error);
      return [];
    }
  }

  // Budget Suggestions based on spending patterns
  async suggestBudgets(transactions: any[], currentIncome: number): Promise<BudgetSuggestion[]> {
    try {
      const monthlySpending = this.calculateMonthlyAverages(transactions);
      const totalMonthlyExpenses = Object.values(monthlySpending).reduce((sum: number, amount: any) => sum + amount, 0);

      const prompt = `
        Based on this user's financial data, suggest optimal budget allocations:
        
        Monthly Income: $${currentIncome}
        Current Monthly Spending by Category:
        ${Object.entries(monthlySpending).map(([cat, amount]) => `${cat}: $${amount}`).join('\n')}
        
        Total Monthly Expenses: $${totalMonthlyExpenses}
        
        Please provide budget suggestions following the 50/30/20 rule and best practices.
        Respond with a JSON array of budget suggestions:
        [
          {
            "category": "category_name",
            "suggestedAmount": 000,
            "reasoning": "explanation",
            "priority": "high|medium|low"
          }
        ]
        
        Consider emergency funds, savings goals, and realistic spending patterns.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const suggestions = JSON.parse(response.choices[0].message.content || '[]');
      return suggestions;
    } catch (error) {
      console.error('Budget suggestion error:', error);
      return [];
    }
  }

  // Goal Achievement Predictions
  async predictGoalAchievement(goal: any, transactions: any[]): Promise<GoalPrediction> {
    try {
      const monthlyContributions = this.calculateGoalContributions(goal, transactions);
      const averageMonthlyContribution = monthlyContributions.length > 0 
        ? monthlyContributions.reduce((sum, amount) => sum + amount, 0) / monthlyContributions.length 
        : 0;

      const remainingAmount = goal.targetAmount - goal.currentAmount;
      const targetDate = new Date(goal.targetDate);
      const today = new Date();
      const monthsRemaining = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));

      const requiredMonthlyContribution = remainingAmount / monthsRemaining;
      const probabilityOfSuccess = Math.min(95, Math.max(5, 
        averageMonthlyContribution > 0 ? (averageMonthlyContribution / requiredMonthlyContribution) * 100 : 20
      ));

      let estimatedCompletionDate: Date;
      if (averageMonthlyContribution > 0) {
        const monthsToComplete = remainingAmount / averageMonthlyContribution;
        estimatedCompletionDate = new Date();
        estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + monthsToComplete);
      } else {
        estimatedCompletionDate = new Date(goal.targetDate);
      }

      const suggestions = this.generateGoalSuggestions(goal, averageMonthlyContribution, requiredMonthlyContribution);

      return {
        goalId: goal._id,
        estimatedCompletionDate: estimatedCompletionDate.toISOString(),
        probabilityOfSuccess,
        recommendedMonthlyContribution: Math.max(requiredMonthlyContribution, averageMonthlyContribution * 1.1),
        suggestions
      };
    } catch (error) {
      console.error('Goal prediction error:', error);
      return {
        goalId: goal._id,
        estimatedCompletionDate: goal.targetDate,
        probabilityOfSuccess: 50,
        recommendedMonthlyContribution: 0,
        suggestions: ['Unable to analyze goal progress']
      };
    }
  }

  // Helper methods
  private groupTransactionsByMonth(transactions: any[]) {
    const groups: { [key: string]: any[] } = {};
    
    transactions.forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
    });

    return Object.entries(groups).map(([date, transactions]) => ({
      date,
      transactions
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateTrendPrediction(data: { month: string; amount: number }[]) {
    if (data.length < 2) return { amount: 0, confidence: 0.1, trend: 'stable' as const };

    const amounts = data.map(d => d.amount);
    const lastThreeMonths = amounts.slice(-3);
    const average = lastThreeMonths.reduce((sum, amount) => sum + amount, 0) / lastThreeMonths.length;

    // Simple linear trend calculation
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (lastThreeMonths.length >= 2) {
      const firstHalf = lastThreeMonths.slice(0, Math.floor(lastThreeMonths.length / 2));
      const secondHalf = lastThreeMonths.slice(Math.floor(lastThreeMonths.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, amount) => sum + amount, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, amount) => sum + amount, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';
    }

    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length;
    const confidence = Math.max(0.3, Math.min(0.9, 1 - (Math.sqrt(variance) / average)));

    return {
      amount: Math.round(average),
      confidence,
      trend
    };
  }

  private calculateMonthlyAverages(transactions: any[]) {
    const monthlyData = this.groupTransactionsByMonth(transactions);
    const categories: { [key: string]: number[] } = {};

    monthlyData.forEach(month => {
      month.transactions
        .filter((t: any) => t.type === 'expense')
        .forEach((t: any) => {
          if (!categories[t.category]) categories[t.category] = [];
          categories[t.category].push(t.amount);
        });
    });

    const averages: { [key: string]: number } = {};
    Object.entries(categories).forEach(([category, amounts]) => {
      averages[category] = amounts.reduce((sum, amount) => sum + amount, 0) / Math.max(1, monthlyData.length);
    });

    return averages;
  }

  private calculateGoalContributions(goal: any, transactions: any[]) {
    // This would need to be enhanced based on how goal contributions are tracked
    // For now, assuming we track contributions in transaction notes or a separate field
    const goalContributions = transactions
      .filter(t => t.note && t.note.toLowerCase().includes(goal.name.toLowerCase()))
      .map(t => t.amount);

    return goalContributions;
  }

  private generateGoalSuggestions(goal: any, currentContribution: number, requiredContribution: number): string[] {
    const suggestions: string[] = [];

    if (currentContribution < requiredContribution) {
      suggestions.push(`Increase monthly contributions by $${(requiredContribution - currentContribution).toFixed(2)} to stay on track`);
    }

    if (currentContribution === 0) {
      suggestions.push('Set up automatic transfers to build consistent saving habits');
    }

    suggestions.push('Review and cut unnecessary expenses to free up funds for this goal');
    suggestions.push('Consider setting up a separate savings account for this goal');

    return suggestions;
  }
}

export const aiService = new AIService();
