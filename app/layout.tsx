/*
 * Root layout
 * Wraps every page with the toast provider, the route-aware body class
 * (wide-page on the calendar), the shared header, and global styles.
 */
import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import ToastProvider from '@/components/ToastProvider';
import Header from '@/components/Header';
import RouteBodyClass from '@/components/RouteBodyClass';

export const metadata: Metadata = {
  title: 'Denana Social Growth OS',
  description:
    'Content planning OS for DenanavBeauty Salon — generate and manage social media content plans for Instagram and Facebook.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>
          <RouteBodyClass />
          <div className="app-layout">
            <Header />
            <div className="app-content">{children}</div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
