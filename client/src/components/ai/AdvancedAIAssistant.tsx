'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FinancialInsight {
  type: 'warning' | 'opportunity' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
  confidence: number;
}

interface AnomalyDetection {
  category: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  actualValue: number;
}

interface FinancialHealthScore {
  overall: number;
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

interface BillPrediction {
  category: string;
  predictedAmount: number;
  dueDate: string;
  confidence: number;
}

interface InvestmentRecommendation {
  type: string;
  allocation: number;
  rationale: string;
  riskLevel: string;
  expectedReturn: number;
  instruments: string[];
}

interface DashboardData {
  summary: {
    monthlyIncome: string;
    monthlyExpenses: string;
    savingsRate: string;
    totalTransactions: number;
    activeGoals: number;
  };
  healthScore: FinancialHealthScore;
  insights: FinancialInsight[];
  anomalies: AnomalyDetection[];
  upcomingBills: BillPrediction[];
  investmentRecommendations: InvestmentRecommendation[];
}

const AdvancedAIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'health' | 'predictions'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboardData();
    initializeChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.get(`/ai-advanced/dashboard/${userData.id}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm your AI Financial Advisor. I have access to your complete financial data and can help you with:

• **Personalized financial advice** based on your spending patterns
• **Investment recommendations** tailored to your risk profile
• **Budget optimization** and expense analysis
• **Goal achievement strategies** with realistic timelines
• **Bill predictions** and payment reminders
• **Anomaly detection** for unusual transactions

What would you like to discuss about your finances today?`,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai-advanced/chat', {
        message: currentMessage,
        chatHistory: chatMessages
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'opportunity': return '💡';
      case 'achievement': return '🎉';
      case 'suggestion': return '💭';
      default: return '📊';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-2">🤖 Advanced AI Financial Advisor</h1>
        <p className="opacity-90">Your personal AI-powered financial intelligence system</p>
        
        {dashboardData && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="opacity-75">Monthly Income</div>
              <div className="font-bold">${dashboardData.summary.monthlyIncome}</div>
            </div>
            <div>
              <div className="opacity-75">Monthly Expenses</div>
              <div className="font-bold">${dashboardData.summary.monthlyExpenses}</div>
            </div>
            <div>
              <div className="opacity-75">Savings Rate</div>
              <div className="font-bold">{dashboardData.summary.savingsRate}%</div>
            </div>
            <div>
              <div className="opacity-75">Health Score</div>
              <div className="font-bold">{dashboardData.healthScore.overall}/100</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'chat', label: 'AI Chat', icon: '💬' },
          { id: 'insights', label: 'Insights', icon: '🔍' },
          { id: 'health', label: 'Health Score', icon: '❤️' },
          { id: 'predictions', label: 'Predictions', icon: '🔮' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-96 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-2">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your finances..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && dashboardData && (
        <div className="space-y-6">
          {/* Financial Insights */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🔍 AI Financial Insights</h3>
            <div className="space-y-4">
              {dashboardData.insights.map((insight, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getInsightIcon(insight.type)}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{insight.description}</p>
                  {insight.suggestedActions && (
                    <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-500 space-y-1">
                      {insight.suggestedActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies */}
          {dashboardData.anomalies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">⚠️ Anomaly Detection</h3>
              <div className="space-y-3">
                {dashboardData.anomalies.map((anomaly, index) => (
                  <div key={index} className={`p-4 border-l-4 rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{anomaly.category}</h4>
                      <span className="text-xs uppercase font-bold">{anomaly.severity}</span>
                    </div>
                    <p className="text-sm mb-2">{anomaly.description}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{anomaly.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'health' && dashboardData && (
        <div className="space-y-6">
          {/* Overall Health Score */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">❤️ Financial Health Score</h3>
            <div className={`text-6xl font-bold mb-2 ${getHealthScoreColor(dashboardData.healthScore.overall)}`}>
              {dashboardData.healthScore.overall}
            </div>
            <div className="text-gray-600 dark:text-gray-400">out of 100</div>
          </div>

          {/* Health Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Score Breakdown</h4>
            <div className="space-y-4">
              {Object.entries(dashboardData.healthScore.breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getHealthScoreColor(value).includes('green') ? 'bg-green-600' : 
                          getHealthScoreColor(value).includes('yellow') ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-semibold ${getHealthScoreColor(value)}`}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommendations</h4>
            <ul className="space-y-2">
              {dashboardData.healthScore.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && dashboardData && (
        <div className="space-y-6">
          {/* Upcoming Bills */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🔮 Upcoming Bill Predictions</h3>
            <div className="space-y-3">
              {dashboardData.upcomingBills.map((bill, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">{bill.category}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Due: {new Date(bill.dueDate).toLocaleDateString()} • 
                      {(bill.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${bill.predictedAmount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Recommendations */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📈 Investment Recommendations</h3>
            <div className="space-y-4">
              {dashboardData.investmentRecommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{rec.type.replace('_', ' ')}</h4>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{rec.allocation}%</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{rec.rationale}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{rec.riskLevel}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                      {(rec.expectedReturn * 100).toFixed(1)}% expected return
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Instruments: {rec.instruments.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAIAssistant;
