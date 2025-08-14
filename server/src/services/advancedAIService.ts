// server/src/services/advancedAIService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FinancialInsight {
  type: 'warning' | 'opportunity' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
  confidence: number;
}

export interface AnomalyDetection {
  transactionId?: string;
  category: string;
  type: 'unusual_amount' | 'unusual_frequency' | 'new_merchant' | 'suspicious_timing';
  severity: 'low' | 'medium' | 'high';
  description: string;
  normalRange?: { min: number; max: number };
  actualValue: number;
  suggestion: string;
}

export interface InvestmentRecommendation {
  type: 'emergency_fund' | 'retirement' | 'growth' | 'income';
  allocation: number; // percentage
  rationale: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: string;
  expectedReturn?: number;
  instruments?: string[];
}

export interface BudgetSuggestion {
  category: string;
  suggestedAmount: number;
  currentSpending: number;
  priority: 'high' | 'medium' | 'low';
}

export interface BillPrediction {
  category: string;
  predictedAmount: number;
  dueDate: string;
  confidence: number;
  variance: number;
  paymentHistory: {
    averageAmount: number;
    paymentPattern: 'regular' | 'irregular';
    lastPayment: string;
  };
}

export interface FinancialHealthScore {
  overall: number; // 0-100
  breakdown: {
    budgetAdherence: number;
    savingsRate: number;
    debtManagement: number;
    investmentDiversification: number;
    emergencyFund: number;
  };
  trends: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
  recommendations: string[];
}

class AdvancedAIService {
  
  // AI Financial Chat Assistant
  async chatWithFinancialAdvisor(
    message: string, 
    chatHistory: ChatMessage[], 
    userFinancialData: any
  ): Promise<string> {
    try {
      // Check if OpenAI is available
      if (!process.env.OPENAI_API_KEY) {
        return this.fallbackFinancialResponse(message, userFinancialData);
      }

      const context = this.buildFinancialContext(userFinancialData);
      
      const systemPrompt = `You are an expert financial advisor AI assistant. You have access to the user's complete financial data and history. Provide personalized, actionable financial advice.

User's Financial Context:
${context}

Guidelines:
- Be specific and actionable
- Reference their actual data when relevant
- Provide concrete numbers and timeframes
- Ask clarifying questions when needed
- Warn about potential financial risks
- Suggest optimization opportunities
- Keep responses conversational but professional
- If you don't have enough data, ask for clarification`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-5).map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        })),
        { role: 'user', content: message }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using 3.5-turbo for better reliability
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || this.fallbackFinancialResponse(message, userFinancialData);
    } catch (error) {
      console.error('Chat AI error:', error);
      
      // Provide intelligent fallback response
      return this.fallbackFinancialResponse(message, userFinancialData);
    }
  }

  // Intelligent fallback responses when AI is unavailable
  private fallbackFinancialResponse(message: string, userFinancialData: any): string {
    const lowerMessage = message.toLowerCase();
    const { transactions, goals, monthlyIncome, monthlyExpenses } = userFinancialData;
    
    // Budget-related questions
    if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
      const savingsRate = monthlyIncome && monthlyExpenses 
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)
        : 'unknown';
      
      return `Based on your data, here's what I can tell you about your budget:

**Current Financial Status:**
• Monthly Income: $${monthlyIncome?.toFixed(2) || 'Not available'}
• Monthly Expenses: $${monthlyExpenses?.toFixed(2) || 'Not available'}
• Savings Rate: ${savingsRate}%

**Budget Recommendations:**
• Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings
• Track your top spending categories more closely
• Consider using budgeting apps or spreadsheets
• Set up automatic transfers to savings

Would you like me to analyze any specific category of spending?`;
    }

    // Investment-related questions
    if (lowerMessage.includes('invest') || lowerMessage.includes('portfolio') || lowerMessage.includes('stocks')) {
      return `Here are some general investment principles tailored to your situation:

**Investment Strategy:**
• **Emergency Fund First:** Ensure you have 3-6 months of expenses saved
• **Risk Assessment:** Consider your age, income stability, and risk tolerance
• **Diversification:** Don't put all eggs in one basket
• **Low-Cost Options:** Consider index funds and ETFs for broad market exposure

**Common Allocations by Age:**
• 20s-30s: 80% stocks, 20% bonds
• 40s: 70% stocks, 30% bonds  
• 50s+: 60% stocks, 40% bonds

**Getting Started:**
• Open a retirement account (401k, IRA)
• Start with target-date funds
• Increase contributions with salary raises

*Note: This is general advice. Consider consulting with a financial advisor for personalized recommendations.*`;
    }

    // Savings and emergency fund questions
    if (lowerMessage.includes('save') || lowerMessage.includes('emergency') || lowerMessage.includes('goal')) {
      const goalsList = goals?.map((g: any) => `• ${g.name}: $${g.currentAmount}/$${g.targetAmount}`).join('\n') || 'No active goals';
      
      return `Let's talk about your savings and goals:

**Your Current Goals:**
${goalsList}

**Savings Tips:**
• **Pay Yourself First:** Set up automatic transfers to savings
• **Emergency Fund:** Aim for 3-6 months of expenses (${monthlyExpenses ? `~$${(monthlyExpenses * 6).toFixed(0)}` : 'calculate based on your monthly expenses'})
• **Goal-Based Saving:** Create separate accounts for different goals
• **Increase Gradually:** Start with 1% of income, increase by 1% each year

**High-Yield Options:**
• High-yield savings accounts (4-5% APY)
• CDs for longer-term goals
• Money market accounts for emergency funds

What specific savings goal would you like help with?`;
    }

    // Debt-related questions
    if (lowerMessage.includes('debt') || lowerMessage.includes('loan') || lowerMessage.includes('credit')) {
      return `Here's a strategy for managing debt effectively:

**Debt Payoff Strategies:**
• **Avalanche Method:** Pay minimums on all debts, extra on highest interest rate
• **Snowball Method:** Pay minimums on all debts, extra on smallest balance
• **Consolidation:** Consider if you have multiple high-interest debts

**Credit Card Tips:**
• Pay full balance monthly to avoid interest
• Keep utilization below 30% of limit
• Don't close old cards (affects credit history)

**Priority Order:**
1. Pay minimum on all debts
2. Build small emergency fund ($1,000)
3. Pay off high-interest debt
4. Build full emergency fund
5. Focus on other financial goals

Would you like help creating a specific debt payoff plan?`;
    }

    // General financial questions
    return `I'm here to help with your financial questions! While I'm currently using rule-based responses, I can still provide valuable guidance.

**I can help you with:**
• 📊 **Budgeting** - Analyzing your spending patterns and creating budgets
• 💰 **Saving** - Setting up emergency funds and achieving financial goals  
• 📈 **Investing** - Basic investment principles and portfolio allocation
• 💳 **Debt Management** - Strategies for paying off loans and credit cards
• 🎯 **Goal Planning** - Creating and tracking financial milestones

**Your Financial Snapshot:**
• Monthly Income: $${monthlyIncome?.toFixed(2) || 'Not available'}
• Monthly Expenses: $${monthlyExpenses?.toFixed(2) || 'Not available'}
• Active Goals: ${goals?.length || 0}
• Recent Transactions: ${transactions?.length || 0}

What specific area would you like to focus on? Try asking about:
- "How can I improve my budget?"
- "What should I invest in?"
- "How do I build an emergency fund?"
- "What's the best way to pay off debt?"`;
  }

  // Advanced Financial Insights Generator
  async generateAdvancedInsights(transactions: any[], goals: any[]): Promise<FinancialInsight[]> {
    try {
      const insights: FinancialInsight[] = [];
      
      // Generate rule-based insights that work without AI
      const spendingInsights = this.analyzeSpendingPatterns(transactions);
      insights.push(...spendingInsights);

      const goalInsights = this.analyzeGoalProgress(goals, transactions);
      insights.push(...goalInsights);

      const cashFlowInsights = this.analyzeCashFlow(transactions);
      insights.push(...cashFlowInsights);

      const taxInsights = this.analyzeTaxOptimization(transactions);
      insights.push(...taxInsights);

      return insights.sort((a, b) => {
        const impactScore = { high: 3, medium: 2, low: 1 };
        return impactScore[b.impact] - impactScore[a.impact];
      });
    } catch (error) {
      console.error('Advanced insights error:', error);
      return this.generateBasicInsights(transactions, goals);
    }
  }

  // Generate basic insights when advanced AI fails
  private generateBasicInsights(transactions: any[], goals: any[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // Analyze spending by category
    const categoryTotals: Record<string, number> = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    // Find top spending category
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (topCategory && totalExpenses > 0) {
      const [category, amount] = topCategory as [string, number];
      const percentage = ((amount / totalExpenses) * 100).toFixed(1);
      
      insights.push({
        type: 'suggestion',
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} is your largest expense`,
        description: `You spend $${amount.toFixed(2)} (${percentage}%) on ${category}. This represents a significant portion of your budget.`,
        impact: parseFloat(percentage) > 30 ? 'high' : parseFloat(percentage) > 20 ? 'medium' : 'low',
        actionable: true,
        suggestedActions: [
          `Review your ${category} spending for optimization opportunities`,
          `Set a monthly budget limit for ${category}`,
          `Look for ways to reduce ${category} costs without sacrificing quality`
        ],
        confidence: 0.8
      });
    }

    // Analyze goal progress
    goals.forEach((goal: any) => {
      if (goal.targetAmount > 0) {
        const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
        
        if (progressPercentage < 25) {
          insights.push({
            type: 'warning',
            title: `${goal.name} progress is behind`,
            description: `You've only achieved ${progressPercentage.toFixed(1)}% of your ${goal.name} goal. Consider increasing your contributions.`,
            impact: 'medium',
            actionable: true,
            suggestedActions: [
              'Increase monthly contributions to this goal',
              'Review and adjust your timeline',
              'Identify areas to cut expenses and redirect to this goal'
            ],
            confidence: 0.9
          });
        } else if (progressPercentage > 80) {
          insights.push({
            type: 'achievement',
            title: `${goal.name} is almost complete!`,
            description: `Great job! You've achieved ${progressPercentage.toFixed(1)}% of your ${goal.name} goal.`,
            impact: 'low',
            actionable: false,
            confidence: 1.0
          });
        }
      }
    });

    return insights;
  }

  // Anomaly Detection System
  async detectAnomalies(transactions: any[]): Promise<AnomalyDetection[]> {
    try {
      const anomalies: AnomalyDetection[] = [];
      
      // Group by category for analysis
      const categoryGroups = this.groupByCategory(transactions);

      for (const [category, categoryTransactions] of Object.entries(categoryGroups)) {
        const amounts = (categoryTransactions as any[]).map(t => Math.abs(t.amount));
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / amounts.length);

        // Detect unusual amounts (beyond 2 standard deviations)
        for (const transaction of categoryTransactions as any[]) {
          const amount = Math.abs(transaction.amount);
          if (amount > mean + 2 * stdDev) {
            anomalies.push({
              transactionId: transaction._id,
              category,
              type: 'unusual_amount',
              severity: amount > mean + 3 * stdDev ? 'high' : 'medium',
              description: `Unusually high ${category} expense: $${amount.toFixed(2)}`,
              normalRange: { min: Math.max(0, mean - stdDev), max: mean + stdDev },
              actualValue: amount,
              suggestion: `Review this transaction. Your typical ${category} expense is $${mean.toFixed(2)} ± $${stdDev.toFixed(2)}`
            });
          }
        }

        // Detect frequency anomalies
        const frequencyAnalysis = this.analyzeFrequency(categoryTransactions as any[]);
        if (frequencyAnalysis.anomaly) {
          anomalies.push(frequencyAnalysis.anomaly);
        }
      }

      return anomalies;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return [];
    }
  }

  // Investment Portfolio Recommendations
  async generateInvestmentRecommendations(
    userProfile: any, 
    transactions: any[]
  ): Promise<InvestmentRecommendation[]> {
    try {
      const income = this.calculateMonthlyIncome(transactions);
      const expenses = this.calculateMonthlyExpenses(transactions);
      const savingsRate = (income - expenses) / income;
      const age = userProfile.age || 30;
      const riskTolerance = userProfile.riskTolerance || 'moderate';

      const recommendations: InvestmentRecommendation[] = [];

      // Emergency Fund Recommendation
      const monthlyExpenses = expenses;
      const emergencyFundTarget = monthlyExpenses * 6;
      const currentSavings = userProfile.currentSavings || 0;
      
      if (currentSavings < emergencyFundTarget) {
        recommendations.push({
          type: 'emergency_fund',
          allocation: Math.min(50, ((emergencyFundTarget - currentSavings) / income) * 100),
          rationale: `Build emergency fund to $${emergencyFundTarget.toFixed(0)} (6 months of expenses)`,
          riskLevel: 'conservative',
          timeHorizon: '1-2 years',
          expectedReturn: 0.04,
          instruments: ['High-yield savings account', 'Money market funds', 'Short-term CDs']
        });
      }

      // Retirement Recommendation
      const retirementAllocation = Math.max(10, Math.min(20, 100 - age));
      recommendations.push({
        type: 'retirement',
        allocation: retirementAllocation,
        rationale: `Age-based allocation for long-term retirement growth`,
        riskLevel: age < 40 ? 'moderate' : 'conservative',
        timeHorizon: `${65 - age} years`,
        expectedReturn: age < 40 ? 0.08 : 0.06,
        instruments: ['401(k)', 'IRA', 'Target-date funds', 'Index funds']
      });

      // Growth Investment Recommendation
      if (savingsRate > 0.2) {
        recommendations.push({
          type: 'growth',
          allocation: 30,
          rationale: `High savings rate allows for growth investments`,
          riskLevel: riskTolerance as any,
          timeHorizon: '5-10 years',
          expectedReturn: 0.10,
          instruments: ['S&P 500 ETF', 'Growth stocks', 'Technology sector funds']
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Investment recommendations error:', error);
      return [];
    }
  }

  // Bill Prediction System
  async predictUpcomingBills(transactions: any[]): Promise<BillPrediction[]> {
    try {
      const billCategories = ['utilities', 'rent', 'insurance', 'subscription', 'phone', 'internet'];
      const predictions: BillPrediction[] = [];

      for (const category of billCategories) {
        const categoryTransactions = transactions
          .filter(t => t.category === category && t.type === 'expense')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (categoryTransactions.length >= 2) {
          const amounts = categoryTransactions.slice(0, 6).map(t => t.amount);
          const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
          const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
          
          // Predict next payment date based on pattern
          const lastPayment = new Date(categoryTransactions[0].date);
          const intervals = [];
          for (let i = 0; i < Math.min(3, categoryTransactions.length - 1); i++) {
            const current = new Date(categoryTransactions[i].date);
            const previous = new Date(categoryTransactions[i + 1].date);
            intervals.push((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
          }
          
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const nextDueDate = new Date(lastPayment.getTime() + avgInterval * 24 * 60 * 60 * 1000);

          predictions.push({
            category,
            predictedAmount: avgAmount,
            dueDate: nextDueDate.toISOString().split('T')[0],
            confidence: Math.max(0.6, 1 - (variance / (avgAmount * avgAmount))),
            variance: Math.sqrt(variance),
            paymentHistory: {
              averageAmount: avgAmount,
              paymentPattern: variance < avgAmount * 0.1 ? 'regular' : 'irregular',
              lastPayment: categoryTransactions[0].date
            }
          });
        }
      }

      return predictions.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } catch (error) {
      console.error('Bill prediction error:', error);
      return [];
    }
  }

  // Financial Health Score Calculator
  async calculateFinancialHealthScore(
    transactions: any[], 
    goals: any[], 
    userProfile: any
  ): Promise<FinancialHealthScore> {
    try {
      const income = this.calculateMonthlyIncome(transactions);
      const expenses = this.calculateMonthlyExpenses(transactions);
      const savingsRate = (income - expenses) / income;

      // Budget Adherence (0-100)
      const budgetAdherence = Math.min(100, Math.max(0, (1 - Math.abs(expenses - userProfile.budgetTarget || expenses) / expenses) * 100));

      // Savings Rate (0-100)
      const savingsScore = Math.min(100, savingsRate * 500); // 20% savings = 100 points

      // Debt Management (0-100)
      const debtPayments = transactions.filter(t => t.category === 'debt' || t.category === 'loan').reduce((sum, t) => sum + t.amount, 0);
      const debtToIncomeRatio = debtPayments / income;
      const debtScore = Math.max(0, 100 - debtToIncomeRatio * 300);

      // Investment Diversification (0-100)
      const investmentCategories = new Set(transactions.filter(t => t.category === 'investment').map(t => t.note || 'general'));
      const diversificationScore = Math.min(100, investmentCategories.size * 20);

      // Emergency Fund (0-100)
      const monthlyExpenses = expenses;
      const emergencyFundMonths = (userProfile.emergencyFund || 0) / monthlyExpenses;
      const emergencyScore = Math.min(100, emergencyFundMonths * 16.67); // 6 months = 100 points

      const overall = (budgetAdherence + savingsScore + debtScore + diversificationScore + emergencyScore) / 5;

      return {
        overall: Math.round(overall),
        breakdown: {
          budgetAdherence: Math.round(budgetAdherence),
          savingsRate: Math.round(savingsScore),
          debtManagement: Math.round(debtScore),
          investmentDiversification: Math.round(diversificationScore),
          emergencyFund: Math.round(emergencyScore)
        },
        trends: {
          improving: savingsRate > 0.15 ? ['Savings Rate'] : [],
          declining: debtToIncomeRatio > 0.3 ? ['Debt Management'] : [],
          stable: ['Budget Adherence']
        },
        recommendations: this.generateHealthRecommendations(overall, {
          budgetAdherence,
          savingsScore,
          debtScore,
          diversificationScore,
          emergencyScore
        })
      };
    } catch (error) {
      console.error('Health score calculation error:', error);
      return {
        overall: 50,
        breakdown: {
          budgetAdherence: 50,
          savingsRate: 50,
          debtManagement: 50,
          investmentDiversification: 50,
          emergencyFund: 50
        },
        trends: { improving: [], declining: [], stable: [] },
        recommendations: ['Unable to calculate health score. Please ensure you have sufficient transaction data.']
      };
    }
  }

  // Helper Methods
  private buildFinancialContext(userFinancialData: any): string {
    const { transactions, goals, monthlyIncome, monthlyExpenses } = userFinancialData;
    
    return `
Monthly Income: $${monthlyIncome || 'Unknown'}
Monthly Expenses: $${monthlyExpenses || 'Unknown'}
Recent Transactions: ${transactions?.slice(0, 5).map((t: any) => `${t.category}: $${t.amount}`).join(', ') || 'No recent data'}
Active Goals: ${goals?.map((g: any) => `${g.name} ($${g.currentAmount}/$${g.targetAmount})`).join(', ') || 'No active goals'}
Top Spending Categories: ${this.getTopCategories(transactions || []).join(', ')}`;
  }

  private getTopCategories(transactions: any[]): string[] {
    const categoryTotals = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {});

    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category);
  }

  private calculateMonthlyIncome(transactions: any[]): number {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const months = Math.max(1, incomeTransactions.length / 2); // Estimate months
    return totalIncome / months;
  }

  private calculateMonthlyExpenses(transactions: any[]): number {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const months = Math.max(1, expenseTransactions.length / 15); // Estimate months
    return totalExpenses / months;
  }

  private groupByCategory(transactions: any[]): Record<string, any[]> {
    return transactions.reduce((groups, transaction) => {
      const category = transaction.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(transaction);
      return groups;
    }, {});
  }

  private analyzeFrequency(transactions: any[]): { anomaly?: AnomalyDetection } {
    // Simplified frequency analysis
    return {};
  }

  private analyzeSpendingPatterns(transactions: any[]): FinancialInsight[] {
    // Rule-based spending pattern analysis
    const insights: FinancialInsight[] = [];
    
    // Check for weekend vs weekday spending
    const weekendSpending = transactions.filter(t => {
      const date = new Date(t.createdAt);
      const day = date.getDay();
      return t.type === 'expense' && (day === 0 || day === 6);
    }).reduce((sum, t) => sum + t.amount, 0);

    const weekdaySpending = transactions.filter(t => {
      const date = new Date(t.createdAt);
      const day = date.getDay();
      return t.type === 'expense' && day >= 1 && day <= 5;
    }).reduce((sum, t) => sum + t.amount, 0);

    if (weekendSpending > weekdaySpending * 0.4) {
      insights.push({
        type: 'suggestion',
        title: 'High weekend spending detected',
        description: 'Your weekend spending is significantly higher than weekdays. Consider planning weekend activities with a budget.',
        impact: 'medium',
        actionable: true,
        suggestedActions: ['Set a weekend spending budget', 'Plan free or low-cost weekend activities'],
        confidence: 0.7
      });
    }

    return insights;
  }

  private analyzeGoalProgress(goals: any[], transactions: any[]): FinancialInsight[] {
    // This is already implemented in generateBasicInsights
    return [];
  }

  private analyzeCashFlow(transactions: any[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // Check for irregular income
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    if (incomeTransactions.length > 0) {
      const amounts = incomeTransactions.map(t => t.amount);
      const avgIncome = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgIncome, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev > avgIncome * 0.3) {
        insights.push({
          type: 'warning',
          title: 'Irregular income detected',
          description: 'Your income varies significantly month to month. Consider building a larger emergency fund.',
          impact: 'high',
          actionable: true,
          suggestedActions: ['Build 6-9 months emergency fund instead of 3-6', 'Consider income smoothing strategies'],
          confidence: 0.8
        });
      }
    }

    return insights;
  }

  private analyzeTaxOptimization(transactions: any[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // Check for potential tax deductions
    const deductibleCategories = ['health', 'education', 'charity', 'business'];
    const deductibleExpenses = transactions.filter(t => 
      t.type === 'expense' && deductibleCategories.includes(t.category)
    );

    if (deductibleExpenses.length > 0) {
      const totalDeductible = deductibleExpenses.reduce((sum, t) => sum + t.amount, 0);
      
      insights.push({
        type: 'opportunity',
        title: 'Potential tax deductions found',
        description: `You have $${totalDeductible.toFixed(2)} in potentially deductible expenses. Consult a tax professional.`,
        impact: 'medium',
        actionable: true,
        suggestedActions: ['Keep receipts for tax-deductible expenses', 'Consult with a tax professional'],
        confidence: 0.6
      });
    }

    return insights;
  }

  private generateHealthRecommendations(overall: number, breakdown: any): string[] {
    const recommendations = [];
    
    if (breakdown.emergencyScore < 50) {
      recommendations.push('Build emergency fund to cover 3-6 months of expenses');
    }
    if (breakdown.savingsScore < 50) {
      recommendations.push('Increase savings rate to at least 15% of income');
    }
    if (breakdown.debtScore < 70) {
      recommendations.push('Focus on debt reduction to improve debt-to-income ratio');
    }
    if (breakdown.diversificationScore < 50) {
      recommendations.push('Diversify investments across multiple asset classes');
    }

    return recommendations;
  }

  // Budget Suggestions based on spending patterns
  async suggestBudgets(transactions: any[], currentIncome: number): Promise<BudgetSuggestion[]> {
    try {
      const monthlySpending = this.calculateMonthlyAveragesFromTransactions(transactions);
      const totalMonthlyExpenses = Object.values(monthlySpending).reduce((sum: number, amount: any) => sum + amount, 0);

      // Generate rule-based budget suggestions
      const suggestions: BudgetSuggestion[] = [];
      
      // 50/30/20 rule: 50% needs, 30% wants, 20% savings
      const needsCategories = ['rent', 'utilities', 'groceries', 'insurance', 'transport'];
      const wantsCategories = ['entertainment', 'shopping', 'food', 'travel'];
      
      const needsBudget = currentIncome * 0.5;
      const wantsBudget = currentIncome * 0.3;
      
      for (const [category, currentSpending] of Object.entries(monthlySpending)) {
        let suggestedAmount = currentSpending as number;
        let priority: 'high' | 'medium' | 'low' = 'medium';
        
        if (needsCategories.includes(category)) {
          // For needs, suggest based on proportion of total needs spending
          const needsTotal = Object.entries(monthlySpending)
            .filter(([cat]) => needsCategories.includes(cat))
            .reduce((sum, [, amount]) => sum + (amount as number), 0);
          
          if (needsTotal > 0) {
            suggestedAmount = ((currentSpending as number) / needsTotal) * needsBudget;
          }
          priority = 'high';
        } else if (wantsCategories.includes(category)) {
          // For wants, suggest based on proportion of total wants spending
          const wantsTotal = Object.entries(monthlySpending)
            .filter(([cat]) => wantsCategories.includes(cat))
            .reduce((sum, [, amount]) => sum + (amount as number), 0);
          
          if (wantsTotal > 0) {
            suggestedAmount = ((currentSpending as number) / wantsTotal) * wantsBudget;
          }
          priority = 'low';
        }
        
        suggestions.push({
          category,
          suggestedAmount: Math.max(0, suggestedAmount),
          currentSpending: currentSpending as number,
          priority
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Budget suggestion error:', error);
      return [];
    }
  }

  private calculateMonthlyAveragesFromTransactions(transactions: any[]): Record<string, number> {
    const months = Math.max(1, Math.ceil(transactions.length / 20));
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Convert to monthly averages
    for (const category of Object.keys(categoryTotals)) {
      categoryTotals[category] = categoryTotals[category] / months;
    }

    return categoryTotals;
  }
}

export const advancedAIService = new AdvancedAIService();
