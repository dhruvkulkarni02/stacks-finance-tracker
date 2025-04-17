// client/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Stacks
            </Link>
          </div>
          <div className="flex items-center">
            <Link href="/add-transaction">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                + Add Transaction
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}