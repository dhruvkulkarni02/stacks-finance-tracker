// client/src/lib/api.ts
// Add token handling to axios instance
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
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
    const user = localStorage.getItem('user');
    
    if (user) {
      const parsedUser = JSON.parse(user);
      config.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transactions API
export const getTransactions = async (userId: string, month?: string) => {
  try {
    const url = `/transactions?user=${userId}${month ? `&month=${month}` : ''}`;
    console.log('Fetching transactions from:', url);
    
    const response = await api.get(url);
    console.log('Transaction response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const createTransaction = async (transaction: any) => {
  try {
    console.log('API call to create transaction:', transaction);
    console.log('Endpoint:', `${API_URL}/transactions`);
    
    const response = await api.post('/transactions', transaction);
    console.log('Transaction created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Summary API
export const getSummary = async (userId: string, month?: string) => {
  try {
    const url = `/summary?user=${userId}${month ? `&month=${month}` : ''}`;
    console.log('Fetching summary from:', url);
    
    const response = await api.get(url);
    console.log('Summary response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};

// Goals API
export const getGoals = async (userId: string) => {
  try {
    const response = await api.get(`/goals?user=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
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