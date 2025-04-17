// client/components/auth/AuthProvider.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define the auth context type
interface AuthContextType {
  user: { id: string; name: string } | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use the mock user from env
    const mockUserId = process.env.NEXT_PUBLIC_MOCK_USER_ID;
    
    if (mockUserId) {
      setUser({
        id: mockUserId,
        name: 'Demo User',
      });
    }
    
    setLoading(false);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}