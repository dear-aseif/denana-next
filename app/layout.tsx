/*
 * Root layout
 * Wraps every page with the toast provider, the route-aware body class
 * (wide-page on the calendar), the shared header, and global styles.
 */
import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import ToastProvider from '@/components/ToastProvider';
import RouteBodyClass from '@/components/RouteBodyClass';
import AppFrame from '@/components/AppFrame';

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
          <AppFrame>{children}</AppFrame>
        </ToastProvider>
      </body>
    </html>
  );
}
