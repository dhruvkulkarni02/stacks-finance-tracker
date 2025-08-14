'use client';

import { useTheme } from '@/context/ThemeContext';

export default function DebugPage() {
  const { theme, toggleTheme, isDark } = useTheme();

  const testDarkMode = () => {
    console.log('=== MANUAL DARK MODE TEST ===');
    const html = document.documentElement;
    console.log('Before - HTML classes:', html.className);
    console.log('Before - Contains dark:', html.classList.contains('dark'));
    
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      console.log('Removed dark class');
    } else {
      html.classList.add('dark');
      console.log('Added dark class');
    }
    
    console.log('After - HTML classes:', html.className);
    console.log('After - Contains dark:', html.classList.contains('dark'));
  };

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900 text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Dark Mode Debug</h1>
      
      <div className="space-y-4 mb-8">
        <p>Theme: {theme}</p>
        <p>Is Dark: {isDark ? 'Yes' : 'No'}</p>
        <p>HTML Classes: {typeof window !== 'undefined' ? document.documentElement.className : 'Loading...'}</p>
      </div>
      
      <div className="space-x-4 mb-8">
        <button 
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Theme (Context)
        </button>
        
        <button 
          onClick={testDarkMode}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Manual Dark Toggle
        </button>
      </div>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <p>This box should change colors when dark mode is toggled</p>
      </div>
    </div>
  );
}
