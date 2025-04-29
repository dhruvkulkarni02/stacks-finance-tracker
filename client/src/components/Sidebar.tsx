// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Add Transaction', path: '/add-transaction', icon: '➕' },
    { name: 'Settings', path: '/settings', icon: '⚙️' }
  ];
  
  const handleLogout = () => {
    console.log("Logging out from sidebar");
    logout();
  };
  
  return (
    <div className="w-64 bg-white shadow-md min-h-screen p-4 flex flex-col">
      {/* Main navigation */}
      <nav className="mb-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full mb-6 flex items-center p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
      >
        <span className="mr-3">🚪</span>
        <span>Logout</span>
      </button>
      
      {/* Pro Tip at the bottom */}
      <div className="mb-10">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-700 mb-2">Pro Tip</h3>
          <p className="text-sm text-gray-600">
            Track your daily expenses consistently for the most accurate financial insights.
          </p>
        </div>
      </div>
    </div>
  );
}