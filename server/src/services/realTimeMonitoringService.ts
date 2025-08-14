// server/src/services/realTimeMonitoringService.ts
import { EventEmitter } from 'events';
import { advancedAIService } from './advancedAIService';

interface AlertRule {
  id: string;
  userId: string;
  type: 'spending_threshold' | 'unusual_activity' | 'bill_due' | 'goal_progress' | 'budget_exceeded';
  condition: any;
  isActive: boolean;
  createdAt: Date;
}

interface FinancialAlert {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  timestamp: Date;
  data?: any;
}

interface AlertConfig {
  spendingThresholds: Record<string, number>;
  alertTypes: {
    spendingThreshold: boolean;
    unusualTransaction: boolean;
    goalDeadline: boolean;
    billReminder: boolean;
  };
  notificationMethods: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

class RealTimeMonitoringService extends EventEmitter {
  private alerts: FinancialAlert[] = [];
  private alertRules: AlertRule[] = [];
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Start monitoring for a user
  startMonitoring(userId: string) {
    if (this.monitoringIntervals.has(userId)) {
      return; // Already monitoring
    }

    // Monitor every 30 minutes
    const interval = setInterval(async () => {
      await this.checkUserAlerts(userId);
    }, 30 * 60 * 1000);

    this.monitoringIntervals.set(userId, interval);
    console.log(`Started real-time monitoring for user ${userId}`);
  }

  // Stop monitoring for a user
  stopMonitoring(userId: string) {
    const interval = this.monitoringIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(userId);
      console.log(`Stopped monitoring for user ${userId}`);
    }
  }

  // Add custom alert rule
  addAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>) {
    const alertRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    this.alertRules.push(alertRule);
    return alertRule;
  }

  // Check all alerts for a user
  private async checkUserAlerts(userId: string) {
    try {
      // Get recent transactions (last 24 hours)
      const Transaction = require('../models/Transaction').default;
      const Goal = require('../models/Goal').default;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentTransactions = await Transaction.find({
        userId,
        createdAt: { $gte: yesterday }
      });

      const goals = await Goal.find({ userId });

      // Check for various alert conditions
      await this.checkSpendingThresholds(userId, recentTransactions);
      await this.checkUnusualActivity(userId, recentTransactions);
      await this.checkUpcomingBills(userId);
      await this.checkGoalProgress(userId, goals);
      await this.checkBudgetExceeded(userId, recentTransactions);

    } catch (error) {
      console.error(`Error checking alerts for user ${userId}:`, error);
    }
  }

  // Check daily spending thresholds
  private async checkSpendingThresholds(userId: string, transactions: any[]) {
    const today = new Date();
    const todayTransactions = transactions.filter(t => {
      const transDate = new Date(t.createdAt);
      return transDate.toDateString() === today.toDateString() && t.type === 'expense';
    });

    const todaySpending = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Alert if daily spending exceeds $200
    if (todaySpending > 200) {
      this.createAlert({
        userId,
        type: 'spending_threshold',
        title: 'High Daily Spending Alert',
        message: `You've spent $${todaySpending.toFixed(2)} today, which is above your typical daily spending.`,
        severity: todaySpending > 500 ? 'high' : 'medium',
        actionRequired: true,
        data: { amount: todaySpending, transactions: todayTransactions.length }
      });
    }
  }

  // Check for unusual spending patterns
  private async checkUnusualActivity(userId: string, recentTransactions: any[]) {
    try {
      const anomalies = await advancedAIService.detectAnomalies(recentTransactions);
      
      for (const anomaly of anomalies) {
        if (anomaly.severity === 'high') {
          this.createAlert({
            userId,
            type: 'unusual_activity',
            title: 'Unusual Activity Detected',
            message: `${anomaly.description} - ${anomaly.suggestion}`,
            severity: 'high',
            actionRequired: true,
            data: anomaly
          });
        }
      }
    } catch (error) {
      console.error('Error checking unusual activity:', error);
    }
  }

  // Check for upcoming bills
  private async checkUpcomingBills(userId: string) {
    try {
      const Transaction = require('../models/Transaction').default;
      const transactions = await Transaction.find({ userId }).limit(200);
      
      const predictions = await advancedAIService.predictUpcomingBills(transactions);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      for (const prediction of predictions) {
        const dueDate = new Date(prediction.dueDate);
        if (dueDate <= nextWeek && prediction.confidence > 0.7) {
          this.createAlert({
            userId,
            type: 'bill_due',
            title: 'Upcoming Bill Reminder',
            message: `Your ${prediction.category} bill (~$${prediction.predictedAmount.toFixed(2)}) is due on ${dueDate.toLocaleDateString()}.`,
            severity: 'medium',
            actionRequired: false,
            data: prediction
          });
        }
      }
    } catch (error) {
      console.error('Error checking upcoming bills:', error);
    }
  }

  // Check goal progress
  private async checkGoalProgress(userId: string, goals: any[]) {
    const today = new Date();
    
    for (const goal of goals) {
      const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
      
      // Alert if goal is falling behind
      if (goal.targetDate) {
        const targetDate = new Date(goal.targetDate);
        const timeRemaining = targetDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        
        if (daysRemaining > 0 && daysRemaining <= 30 && progressPercentage < 80) {
          this.createAlert({
            userId,
            type: 'goal_progress',
            title: 'Goal Deadline Approaching',
            message: `Your goal "${goal.name}" is ${progressPercentage.toFixed(1)}% complete with only ${daysRemaining} days remaining.`,
            severity: progressPercentage < 50 ? 'high' : 'medium',
            actionRequired: true,
            data: { goalId: goal._id, progress: progressPercentage, daysRemaining }
          });
        }
      }
    }
  }

  // Check if monthly budgets are exceeded
  private async checkBudgetExceeded(userId: string, recentTransactions: any[]) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const Transaction = require('../models/Transaction').default;
    const monthlyTransactions = await Transaction.find({
      userId,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      },
      type: 'expense'
    });

    // Group by category
    const categorySpending = monthlyTransactions.reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    // Simple budget thresholds (this could be user-configurable)
    const budgetLimits = {
      food: 800,
      groceries: 600,
      entertainment: 400,
      shopping: 500,
      transport: 300
    };

    for (const [category, spent] of Object.entries(categorySpending)) {
      const limit = (budgetLimits as any)[category];
      if (limit && (spent as number) > limit) {
        this.createAlert({
          userId,
          type: 'budget_exceeded',
          title: 'Budget Exceeded',
          message: `You've spent $${(spent as number).toFixed(2)} on ${category} this month, exceeding your $${limit} budget.`,
          severity: (spent as number) > limit * 1.2 ? 'high' : 'medium',
          actionRequired: true,
          data: { category, spent, limit, overage: (spent as number) - limit }
        });
      }
    }
  }

  // Create and store alert
  private createAlert(alertData: Omit<FinancialAlert, 'id' | 'timestamp'>): FinancialAlert | null {
    // Check if similar alert already exists in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const existingAlert = this.alerts.find(alert => 
      alert.userId === alertData.userId &&
      alert.type === alertData.type &&
      alert.timestamp > yesterday
    );

    if (existingAlert) {
      return null; // Don't create duplicate alerts
    }

    const alert: FinancialAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.alerts.push(alert);
    
    // Emit event for real-time updates
    this.emit('newAlert', alert);
    
    console.log(`Created ${alert.severity} alert for user ${alert.userId}: ${alert.title}`);
    
    return alert;
  }

  // Get alerts for a user
  getAlertsForUser(userId: string, limit: number = 20): FinancialAlert[] {
    return this.alerts
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Mark alert as read
  markAlertAsRead(alertId: string) {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      this.alerts.splice(alertIndex, 1);
    }
  }

  // Get alert statistics
  getAlertStats(userId: string) {
    const userAlerts = this.alerts.filter(alert => alert.userId === userId);
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentAlerts = userAlerts.filter(alert => alert.timestamp > last7Days);
    
    return {
      total: userAlerts.length,
      last7Days: recentAlerts.length,
      bySeverity: {
        high: userAlerts.filter(a => a.severity === 'high').length,
        medium: userAlerts.filter(a => a.severity === 'medium').length,
        low: userAlerts.filter(a => a.severity === 'low').length
      },
      byType: recentAlerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Process new transaction and check for alerts
  async processTransaction(userId: string, transaction: any): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = [];
    
    try {
      // Check spending thresholds
      await this.checkSpendingThresholds(userId, transaction);
      
      // Check for anomalies (simplified version)
      const isAnomaly = this.detectSimpleAnomaly(transaction);
      if (isAnomaly) {
        const alert = this.createAlert({
          userId,
          type: 'unusual_activity',
          title: 'Unusual Transaction Detected',
          message: `Transaction of $${transaction.amount} in ${transaction.category} seems unusual`,
          severity: 'medium',
          actionRequired: false,
          data: transaction
        });
        if (alert) {
          alerts.push(alert);
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('Process transaction error:', error);
      return [];
    }
  }

  // Get active alerts for user
  async getActiveAlerts(userId: string): Promise<FinancialAlert[]> {
    try {
      return this.alerts
        .filter(alert => alert.userId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50);
    } catch (error) {
      console.error('Get active alerts error:', error);
      return [];
    }
  }

  // Simple anomaly detection
  private detectSimpleAnomaly(transaction: any): boolean {
    // Simple rule: transaction over $500 in entertainment/shopping
    if (['entertainment', 'shopping'].includes(transaction.category) && transaction.amount > 500) {
      return true;
    }
    
    // Transaction over $1000 in any category except rent/mortgage
    if (!['rent', 'mortgage', 'housing'].includes(transaction.category) && transaction.amount > 1000) {
      return true;
    }
    
    return false;
  }

  // Get alert configuration for user
  async getAlertConfig(userId: string): Promise<AlertConfig> {
    try {
      // In a real implementation, this would query the database
      // Return default configuration
      return {
        spendingThresholds: {
          food: 500,
          entertainment: 300,
          shopping: 400,
          transport: 200
        },
        alertTypes: {
          spendingThreshold: true,
          unusualTransaction: true,
          goalDeadline: true,
          billReminder: true
        },
        notificationMethods: {
          email: true,
          push: false,
          sms: false
        }
      };
    } catch (error) {
      console.error('Get alert config error:', error);
      return {
        spendingThresholds: {},
        alertTypes: {
          spendingThreshold: true,
          unusualTransaction: true,
          goalDeadline: true,
          billReminder: true
        },
        notificationMethods: {
          email: true,
          push: false,
          sms: false
        }
      };
    }
  }

  // Update alert configuration
  async updateAlertConfig(userId: string, config: Partial<AlertConfig>): Promise<AlertConfig> {
    try {
      // In a real implementation, this would update the database
      const currentConfig = await this.getAlertConfig(userId);
      const updatedConfig = { ...currentConfig, ...config };
      
      // Store updated configuration (mock)
      console.log(`Updated alert config for user ${userId}:`, updatedConfig);
      
      return updatedConfig;
    } catch (error) {
      console.error('Update alert config error:', error);
      throw error;
    }
  }

  // Dismiss an alert
  async dismissAlert(alertId: string): Promise<void> {
    try {
      this.markAlertAsRead(alertId);
    } catch (error) {
      console.error('Dismiss alert error:', error);
      throw error;
    }
  }

  // Get financial health monitoring status
  async getFinancialHealthStatus(userId: string): Promise<any> {
    try {
      // Return mock health status based on recent alerts
      const stats = this.getAlertStats(userId);
      const healthScore = Math.max(0, 100 - (stats.bySeverity.high * 10) - (stats.bySeverity.medium * 5));
      
      return {
        overallScore: healthScore,
        breakdown: {
          spending: Math.max(0, 100 - (stats.byType.spending_threshold || 0) * 15),
          savings: 80,
          debt: 75,
          budgetAdherence: Math.max(0, 100 - (stats.byType.budget_exceeded || 0) * 20)
        },
        trends: {
          spending: stats.last7Days > 3 ? 'increasing' : 'stable',
          savings: 'stable',
          debt: 'decreasing'
        },
        alerts: stats,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Get financial health status error:', error);
      return null;
    }
  }

  // Predict upcoming bills
  async predictUpcomingBills(userId: string): Promise<any[]> {
    try {
      // Return mock bill predictions
      return [
        {
          name: 'Rent',
          amount: 1200,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          confidence: 0.95,
          recurring: true,
          category: 'housing'
        },
        {
          name: 'Electricity',
          amount: 85,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          confidence: 0.80,
          recurring: true,
          category: 'utilities'
        },
        {
          name: 'Internet',
          amount: 60,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          confidence: 0.90,
          recurring: true,
          category: 'utilities'
        }
      ];
    } catch (error) {
      console.error('Predict upcoming bills error:', error);
      return [];
    }
  }
}

export const realTimeMonitoringService = new RealTimeMonitoringService();
