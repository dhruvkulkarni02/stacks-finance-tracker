'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-xl font-bold bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">
                $
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Stacks</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Take control of your finances with smart budgeting, expense tracking, and AI-powered insights. 
              Build wealth, one transaction at a time.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                🐦
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="GitHub"
              >
                🐙
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="LinkedIn"
              >
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/ai-platform" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/add-transaction" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Add Transaction
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Stacks Finance Tracker. Made with ❤️ for better financial health.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Powered by AI • Secured with 🔒
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
