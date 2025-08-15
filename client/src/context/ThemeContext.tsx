// src/context/ThemeContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Get the initial theme
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    // Check what's currently applied to the HTML element
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('dark')) {
      return 'dark';
    }
    
    // Check localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  };

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Remove all theme classes
      root.classList.remove('light', 'dark');
      
      // Add the new theme class
      root.classList.add(newTheme);
      
      // Set data attribute
      root.setAttribute('data-theme', newTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Set color scheme for native elements
      root.style.colorScheme = newTheme;
      
      console.log(`Theme applied: ${newTheme}, HTML classes: ${root.className}`);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDark: theme === 'dark' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      isDark: false
    };
  }
  return context;
}
