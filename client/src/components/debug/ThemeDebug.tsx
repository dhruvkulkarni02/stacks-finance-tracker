// src/components/debug/ThemeDebug.tsx
'use client';

import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeDebug() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [htmlClass, setHtmlClass] = useState('');
  const [localStorage, setLocalStorage] = useState('');

  useEffect(() => {
    // Check what classes are actually on the html element
    const updateInfo = () => {
      if (typeof document !== 'undefined') {
        setHtmlClass(document.documentElement.className);
        setLocalStorage(window.localStorage.getItem('theme') || 'null');
      }
    };

    updateInfo();
    
    // Update when theme changes
    const observer = new MutationObserver(updateInfo);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => observer.disconnect();
  }, [theme]);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 text-sm max-w-sm">
      <div className="space-y-2">
        <div className="font-bold text-blue-600 dark:text-blue-400">
          Theme Debug:
        </div>
        <div className="space-y-1 text-xs">
          <div>Context Theme: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{theme}</span></div>
          <div>Is Dark: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{isDark.toString()}</span></div>
          <div>LocalStorage: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{localStorage}</span></div>
          <div>HTML Classes: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs break-all">{htmlClass}</span></div>
        </div>
        
        <button
          onClick={toggleTheme}
          className="w-full mt-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
        >
          Toggle Theme
        </button>
        
        <div className="mt-3 space-y-2">
          <div className="text-xs font-medium">Visual Tests:</div>
          <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded border flex items-center justify-center text-xs">
            Background Test
          </div>
          <div className="text-gray-900 dark:text-gray-100 text-xs text-center p-2 border rounded">
            Text Color Test
          </div>
        </div>
      </div>
    </div>
  );
}
