// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { currency, currencies, setCurrency } = useCurrency();
  
  const [settings, setSettings] = useState({
    currency: currency.code,
    notifications: true,
    emailUpdates: false,
    budgetAlerts: true,
    goalReminders: true,
    monthlyReports: true,
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    firstDayOfWeek: 'sunday',
    smartForm: {
      enableSmartForm: true,
      autoSuggestions: true,
      learningMode: 'adaptive',
      suggestionCount: 3,
      includeAmountSuggestions: true,
      includeCategorySuggestions: true,
      includeNoteSuggestions: true,
      historicalDataDays: 90,
      minimumTransactionsForSuggestion: 3,
      defaultToSmartForm: false,
      showConfidenceScores: true,
      enableQuickFill: true,
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeSection, setActiveSection] = useState('general');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load saved settings and sync with contexts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stacks_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ 
          ...prev, 
          ...parsedSettings,
          currency: currency.code, // Always sync with current currency
        }));
      } else {
        // Set initial values from contexts
        setSettings(prev => ({
          ...prev,
          currency: currency.code,
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [currency.code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Apply currency changes immediately
    if (name === 'currency') {
      const selectedCurrency = currencies.find(c => c.code === value);
      if (selectedCurrency) {
        setCurrency(selectedCurrency);
      }
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      setIsSubmitting(true);
      
      // Ensure current currency is in settings
      const settingsToSave = {
        ...settings,
        currency: currency.code,
      };
      
      // Save to localStorage
      localStorage.setItem('stacks_settings', JSON.stringify(settingsToSave));
      
      setSaveMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If not authenticated or loading auth state, show loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  
  // If not authenticated after loading, show nothing (redirect happens in useEffect)
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-900 dark:text-white font-medium">Settings</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your finance tracker experience</p>
        </div>

        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            saveMessage.includes('Failed') 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' 
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
          }`}>
            <span className="text-xl mr-2">{saveMessage.includes('Failed') ? '❌' : '✅'}</span>
            {saveMessage}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'general', name: 'General', icon: '⚙️' },
                  { id: 'notifications', name: 'Notifications', icon: '🔔' },
                  { id: 'privacy', name: 'Privacy', icon: '🔒' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeSection === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeSection === 'general' && (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">👤 Profile Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                        <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎨 Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Currency
                        </label>
                        <div className="relative">
                          <select
                            name="currency"
                            value={settings.currency}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
                          >
                            {currencies.map((curr) => (
                              <option key={curr.code} value={curr.code}>
                                {curr.code} ({curr.symbol}) - {curr.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">
                              {currency.symbol}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Current rate: 1 USD = {currency.rate.toFixed(4)} {currency.code}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select
                          name="dateFormat"
                          value={settings.dateFormat}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                          <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                          <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔔 Notification Preferences</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 dark:text-white font-medium">Enable Notifications</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive general app notifications</p>
                        </div>
                        <input
                          type="checkbox"
                          name="notifications"
                          checked={settings.notifications}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 dark:text-white font-medium">Budget Alerts</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when approaching budget limits</p>
                        </div>
                        <input
                          type="checkbox"
                          name="budgetAlerts"
                          checked={settings.budgetAlerts}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 dark:text-white font-medium">Goal Reminders</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reminders about your financial goals</p>
                        </div>
                        <input
                          type="checkbox"
                          name="goalReminders"
                          checked={settings.goalReminders}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 dark:text-white font-medium">Monthly Reports</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive monthly spending summaries</p>
                        </div>
                        <input
                          type="checkbox"
                          name="monthlyReports"
                          checked={settings.monthlyReports}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 dark:text-white font-medium">Email Updates</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive important updates via email</p>
                        </div>
                        <input
                          type="checkbox"
                          name="emailUpdates"
                          checked={settings.emailUpdates}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔒 Data & Privacy</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">📊 Export Your Data</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                          Download all your transactions, settings, and account data in a portable format.
                        </p>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to export your data? This will download all your transactions and settings.')) {
                              alert('This feature is not yet implemented.');
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Export Data
                        </button>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">⚠️ Delete Account</h4>
                        <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                              alert('This feature is not yet implemented.');
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={handleSaveSettings}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}