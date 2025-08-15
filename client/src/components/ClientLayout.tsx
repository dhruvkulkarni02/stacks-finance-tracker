// src/components/ClientLayout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <CurrencyProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {isAuthPage ? (
            <main>{children}</main>
          ) : (
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 bg-gray-50">
                {children}
              </main>
              <Footer />
            </div>
          )}
        </div>
      </AuthProvider>
    </CurrencyProvider>
  );
}
