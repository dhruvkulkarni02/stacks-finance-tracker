// src/components/settings/SmartFormSettings.tsx
'use client';

import { useState, useEffect } from 'react';

interface SmartFormSettingsProps {
  onSettingsChange: (settings: any) => void;
  currentSettings: any;
}

export default function SmartFormSettings({ onSettingsChange, currentSettings }: SmartFormSettingsProps) {
  const [smartSettings, setSmartSettings] = useState({
    enableSmartForm: true,
    autoSuggestions: true,
    learningMode: 'adaptive', // 'conservative', 'adaptive', 'aggressive'
    suggestionCount: 3,
    includeAmountSuggestions: true,
    includeCategorySuggestions: true,
    includeNoteSuggestions: true,
    historicalDataDays: 90,
    minimumTransactionsForSuggestion: 3,
    defaultToSmartForm: false,
    showConfidenceScores: true,
    enableQuickFill: true,
  });

  useEffect(() => {
    // Load settings from props or localStorage
    const savedSmartSettings = currentSettings.smartForm || {};
    setSmartSettings(prev => ({ ...prev, ...savedSmartSettings }));
  }, [currentSettings]);

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...smartSettings, [key]: value };
    setSmartSettings(newSettings);
    onSettingsChange({ ...currentSettings, smartForm: newSettings });
  };

  const learningModeDescriptions = {
    conservative: 'Only suggest when very confident based on clear patterns',
    adaptive: 'Balance between accuracy and helpful suggestions',
    aggressive: 'Provide suggestions even with limited data'
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🧠 Smart Form Features</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure how the AI-powered transaction form learns from your spending patterns
        </p>
      </div>

      {/* Main Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div>
          <h4 className="font-medium text-blue-900 dark:text-blue-300">Enable Smart Form</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">Turn on AI-powered transaction suggestions</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={smartSettings.enableSmartForm}
            onChange={(e) => handleChange('enableSmartForm', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {smartSettings.enableSmartForm && (
        <div className="space-y-4">
          {/* Default Form Type */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Default to Smart Form</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Always start with smart form when adding transactions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smartSettings.defaultToSmartForm}
                onChange={(e) => handleChange('defaultToSmartForm', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Learning Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Learning Mode
            </label>
            <select
              value={smartSettings.learningMode}
              onChange={(e) => handleChange('learningMode', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="conservative">Conservative</option>
              <option value="adaptive">Adaptive</option>
              <option value="aggressive">Aggressive</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {learningModeDescriptions[smartSettings.learningMode as keyof typeof learningModeDescriptions]}
            </p>
          </div>

          {/* Suggestion Types */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Suggestion Types</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={smartSettings.includeAmountSuggestions}
                  onChange={(e) => handleChange('includeAmountSuggestions', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Amount suggestions based on similar transactions</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={smartSettings.includeCategorySuggestions}
                  onChange={(e) => handleChange('includeCategorySuggestions', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Category suggestions based on description patterns</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={smartSettings.includeNoteSuggestions}
                  onChange={(e) => handleChange('includeNoteSuggestions', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Note suggestions from similar transactions</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={smartSettings.enableQuickFill}
                  onChange={(e) => handleChange('enableQuickFill', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Quick-fill buttons for frequent transactions</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={smartSettings.showConfidenceScores}
                  onChange={(e) => handleChange('showConfidenceScores', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show confidence scores for suggestions</span>
              </label>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white">Advanced Settings</h4>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Number of suggestions to show: {smartSettings.suggestionCount}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={smartSettings.suggestionCount}
                onChange={(e) => handleChange('suggestionCount', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>3</span>
                <span>5</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Historical data period: {smartSettings.historicalDataDays} days
              </label>
              <input
                type="range"
                min="30"
                max="365"
                step="30"
                value={smartSettings.historicalDataDays}
                onChange={(e) => handleChange('historicalDataDays', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>30d</span>
                <span>6m</span>
                <span>12m</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Minimum transactions for suggestions: {smartSettings.minimumTransactionsForSuggestion}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={smartSettings.minimumTransactionsForSuggestion}
                onChange={(e) => handleChange('minimumTransactionsForSuggestion', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
