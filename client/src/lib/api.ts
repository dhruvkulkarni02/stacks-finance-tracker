// src/lib/api.ts
import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

console.log('Using API URL:', API_URL);

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      
      if (user) {
        const parsedUser = JSON.parse(user);
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transactions API
export const getTransactions = async (month?: string) => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in localStorage');
      return [];
    }
    
    const user = JSON.parse(userJson);
    const userId = user._id;
    
    // Add userId to the URL parameters
    const url = `/transactions?user=${userId}${month ? `&month=${month}` : ''}`;
    console.log('Fetching transactions from:', url);
    
    const response = await api.get(url, { 
      timeout: 10000 // Increase timeout to 10 seconds
    });
    
    console.log('Transaction response data:', response.data);
    
    // Handle both old and new response formats
    if (response.data && Array.isArray(response.data)) {
      // Old format: direct array
      return response.data;
    } else if (response.data && response.data.transactions) {
      // New format: { transactions: [...], pagination: {...} }
      return response.data.transactions;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    // Return empty array instead of throwing to handle gracefully
    return [];
  }
};

export const createTransaction = async (transaction: any) => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in localStorage');
      throw new Error('User authentication required');
    }
    
    const user = JSON.parse(userJson);
    
    // Add userId to the transaction data
    const transactionWithUser = {
      ...transaction,
      userId: user._id
    };
    
    console.log('API call to create transaction with userId:', transactionWithUser);
    
    const response = await api.post('/transactions', transactionWithUser);
    console.log('Transaction created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Summary API
export const getSummary = async (month?: string) => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in localStorage');
      return { income: 0, expenses: 0, balance: 0 };
    }
    
    const user = JSON.parse(userJson);
    const userId = user._id;
    
    // Add userId to the URL parameters
    const url = `/summary?user=${userId}${month ? `&month=${month}` : ''}`;
    console.log('Fetching summary from:', url);
    
    const response = await api.get(url, {
      timeout: 10000 // Increase timeout to 10 seconds
    });
    
    console.log('Summary response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    // Return default summary instead of throwing
    return { income: 0, expenses: 0, balance: 0 };
  }
};

// Goals API
export const getGoals = async () => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in localStorage');
      return [];
    }
    
    const user = JSON.parse(userJson);
    const userId = user._id;
    
    const response = await api.get(`/goals?user=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

export const createGoal = async (goal: any) => {
  try {
    // Get user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in localStorage');
      throw new Error('User authentication required');
    }
    
    const user = JSON.parse(userJson);
    
    // Add userId to the goal data
    const goalWithUser = {
      ...goal,
      userId: user._id
    };
    
    console.log('API call to create goal with userId:', goalWithUser);
    
    const response = await api.post('/goals', goalWithUser);
    console.log('Goal created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

// ===== PHASE 1 NEW FEATURES =====

// Budgets API
export const getBudgets = async () => {
  try {
    const response = await api.get('/budgets');
    return response.data;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }
};

export const createBudget = async (budget: any) => {
  try {
    const response = await api.post('/budgets', budget);
    return response.data;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

export const updateBudget = async (id: string, budget: any) => {
  try {
    const response = await api.put(`/budgets/${id}`, budget);
    return response.data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

export const deleteBudget = async (id: string) => {
  try {
    await api.delete(`/budgets/${id}`);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Recurring Transactions API
export const getRecurringTransactions = async () => {
  try {
    const response = await api.get('/recurring-transactions');
    return response.data;
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    return [];
  }
};

export const createRecurringTransaction = async (recurringTransaction: any) => {
  try {
    const response = await api.post('/recurring-transactions', recurringTransaction);
    return response.data;
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    throw error;
  }
};

export const updateRecurringTransaction = async (id: string, recurringTransaction: any) => {
  try {
    const response = await api.put(`/recurring-transactions/${id}`, recurringTransaction);
    return response.data;
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    throw error;
  }
};

export const deleteRecurringTransaction = async (id: string) => {
  try {
    await api.delete(`/recurring-transactions/${id}`);
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    throw error;
  }
};

export const processDueRecurringTransactions = async () => {
  try {
    const response = await api.post('/recurring-transactions/process');
    return response.data;
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    throw error;
  }
};

// Financial Goals API
export const getFinancialGoals = async () => {
  try {
    const response = await api.get('/financial-goals');
    return response.data;
  } catch (error) {
    console.error('Error fetching financial goals:', error);
    return [];
  }
};

export const createFinancialGoal = async (goal: any) => {
  try {
    const response = await api.post('/financial-goals', goal);
    return response.data;
  } catch (error) {
    console.error('Error creating financial goal:', error);
    throw error;
  }
};

export const updateFinancialGoal = async (id: string, goal: any) => {
  try {
    const response = await api.put(`/financial-goals/${id}`, goal);
    return response.data;
  } catch (error) {
    console.error('Error updating financial goal:', error);
    throw error;
  }
};

export const addToFinancialGoal = async (id: string, amount: number) => {
  try {
    const response = await api.post(`/financial-goals/${id}/add`, { amount });
    return response.data;
  } catch (error) {
    console.error('Error adding to financial goal:', error);
    throw error;
  }
};

export const deleteFinancialGoal = async (id: string) => {
  try {
    await api.delete(`/financial-goals/${id}`);
  } catch (error) {
    console.error('Error deleting financial goal:', error);
    throw error;
  }
};

// Enhanced Transaction Search
export const searchTransactions = async (filters: {
  month?: string;
  category?: string;
  type?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in localStorage');
      return { transactions: [], pagination: { current: 1, pages: 0, total: 0 } };
    }
    
    const user = JSON.parse(userJson);
    const userId = user._id;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('user', userId);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const url = `/transactions?${params.toString()}`;
    console.log('Searching transactions with URL:', url);
    
    const response = await api.get(url);
    
    // Handle both old and new response formats
    if (response.data && Array.isArray(response.data)) {
      return { 
        transactions: response.data,
        pagination: { current: 1, pages: 1, total: response.data.length }
      };
    } else if (response.data && response.data.transactions) {
      return response.data;
    } else {
      return { transactions: [], pagination: { current: 1, pages: 0, total: 0 } };
    }
  } catch (error) {
    console.error('Error searching transactions:', error);
    return { transactions: [], pagination: { current: 1, pages: 0, total: 0 } };
  }
};

export default api;