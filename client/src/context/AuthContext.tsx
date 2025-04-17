// src/context/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

// Types definitions
interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
  error: null,
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log("Initializing auth state");
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          console.log("Found stored user");
          setUser(JSON.parse(storedUser));
        } else {
          console.log("No stored user found");
        }
      } catch (err) {
        console.error("Error loading user from localStorage", err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Logging in with:", email);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
        email,
        password,
      });
      
      const userData = response.data;
      console.log("Login successful:", userData.name);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user in state
      setUser(userData);
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        name,
        email,
        password,
      });
      
      const userData = response.data;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user in state
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out");
    // Remove user from localStorage
    localStorage.removeItem('user');
    
    // Remove user from state
    setUser(null);
    
    console.log("User logged out, redirecting...");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;