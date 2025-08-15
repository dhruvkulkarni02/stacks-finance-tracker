// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}