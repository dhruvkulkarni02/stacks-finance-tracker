// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { currency, currencies, setCurrency } = useCurrency();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return nothing during SSR
  }
  
  const handleLogout = () => {
    logout();
  };

  const isActivePage = (path: string) => pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-xl font-bold bg-blue-500 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                $
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Stacks</span>
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActivePage('/') 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                Dashboard
              </button>
            </Link>
            <Link href="/add-transaction">
              <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActivePage('/add-transaction') 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                Add
              </button>
            </Link>
            <Link href="/analytics">
              <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActivePage('/analytics') 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                Analytics
              </button>
            </Link>
            <Link href="/settings">
              <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActivePage('/settings') 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                Settings
              </button>
            </Link>
          </div>
          
          {/* Right Controls */}
          <div className="flex items-center space-x-4">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <span>{currency.symbol}</span>
                <span className="font-medium">{currency.code}</span>
                <span className="text-xs">▼</span>
              </button>
              
              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-y-auto">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        currency.code === curr.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span>{curr.symbol}</span>
                        <div>
                          <div className="font-medium">{curr.code}</div>
                          <div className="text-xs opacity-75">{curr.name}</div>
                        </div>
                      </div>
                      <div className="text-xs opacity-75">
                        {curr.rate.toFixed(4)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}