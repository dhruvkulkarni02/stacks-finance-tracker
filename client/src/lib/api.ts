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
    return response.data;
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

export default api;