// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/add-transaction': return 'Add Transaction';
      case '/settings': return 'Settings';
      default: return 'Stacks';
    }
  };

  const isActivePage = (path: string) => pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-lg text-gray-800 shadow-xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="text-2xl font-black bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                $
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Stacks</span>
            </Link>
            
            <div className="hidden sm:flex sm:items-center">
              <h1 className="text-xl font-bold text-gray-700 px-4 py-2 bg-gray-100/80 rounded-xl">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/">
                <button className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActivePage('/') 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform -translate-y-0.5' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}>
                  📊 Dashboard
                </button>
              </Link>
              <Link href="/add-transaction">
                <button className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActivePage('/add-transaction') 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform -translate-y-0.5' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}>
                  ➕ Add
                </button>
              </Link>
              <Link href="/settings">
                <button className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActivePage('/settings') 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform -translate-y-0.5' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}>
                  ⚙️ Settings
                </button>
              </Link>
            </div>

            {/* Quick Add Button */}
            <Link href="/add-transaction">
              <button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                💰 Quick Add
              </button>
            </Link>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="hidden lg:flex items-center space-x-3 bg-gray-100/80 rounded-xl px-4 py-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}