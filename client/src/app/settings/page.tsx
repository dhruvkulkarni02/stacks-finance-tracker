// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState({
    currency: 'USD',
    theme: 'light',
    notifications: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      setIsSubmitting(true);
      
      // For now, we'll just save to localStorage
      // In a full implementation, you'd update the user's preferences in the database
      localStorage.setItem('stacks_settings', JSON.stringify(settings));
      
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
    <div className="container mx-auto max-w-2xl bg-gray-100 p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Account Settings</h1>
      
      {saveMessage && (
        <div className={`mb-4 p-4 rounded ${
          saveMessage.includes('Failed') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {saveMessage}
        </div>
      )}
      
      <div className="p-6 border-b shadow-sm rounded-md bg-white mb-4">
        {/* Profile Section */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Profile</h2>
        
        <div className="mb-4">
          <p className="text-gray-800 font-semibold text-sm mb-1">Name</p>
          <p className="font-medium text-gray-900">{user.name}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-800 font-semibold text-sm mb-1">Email</p>
          <p className="font-medium text-gray-900">{user.email}</p>
        </div>
      </div>
      
      <div className="p-6 border-b shadow-sm rounded-md bg-white mb-4">
        {/* Preferences Section */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Preferences</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={settings.currency}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD ($)</option>
            <option value="AUD">AUD ($)</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1" htmlFor="theme">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={settings.theme}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="notifications"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="notifications" className="ml-2 block text-gray-700">
            Enable Notifications
          </label>
        </div>
      </div>
      
      <div className="p-6 border-b shadow-sm rounded-md bg-white mb-4">
        {/* Data & Privacy Section */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Data & Privacy</h2>
        
        <button
          type="button"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-md my-2"
          onClick={() => {
            if (confirm('Are you sure you want to export your data? This will download all your transactions and settings.')) {
              alert('This feature is not yet implemented.');
            }
          }}
        >
          Export My Data
        </button>
        
        <button
          type="button"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-md my-2"
          onClick={() => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              alert('This feature is not yet implemented.');
            }
          }}
        >
          Delete My Account
        </button>
      </div>
      
      {/* Actions */}
      <div className="p-6">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md shadow-md my-2"
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}