// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  console.log("Navbar rendered, user:", user?.name);
  
  const handleLogout = () => {
    console.log("Logout clicked");
    logout();
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Stacks
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <h1 className="text-lg font-medium">
                {pathname === '/' ? 'Dashboard' : 
                 pathname === '/add-transaction' ? 'Add Transaction' : 
                 pathname === '/settings' ? 'Settings' : ''}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/add-transaction">
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium">
                + Add Transaction
              </button>
            </Link>
            
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden md:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
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