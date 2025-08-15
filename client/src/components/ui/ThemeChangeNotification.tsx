// src/components/ui/ThemeChangeNotification.tsx
'use client';

import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeChangeNotification() {
  const { theme, isDark } = useTheme();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show notification when theme changes
    setShowNotification(true);
    
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [theme]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className={`px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-600 text-gray-100' 
          : 'bg-white border-gray-300 text-gray-900'
      }`}>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
          <span className="font-medium">
            Switched to {isDark ? 'dark' : 'light'} mode
          </span>
        </div>
      </div>
    </div>
  );
}
