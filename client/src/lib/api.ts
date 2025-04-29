// src/lib/api.ts
import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    const url = `/transactions${month ? `?month=${month}` : ''}`;
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
    console.log('API call to create transaction:', transaction);
    
    const response = await api.post('/transactions', transaction);
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
    const url = `/summary${month ? `?month=${month}` : ''}`;
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
    const response = await api.get(`/goals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

export const createGoal = async (goal: any) => {
  try {
    const response = await api.post('/goals', goal);
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export default api;