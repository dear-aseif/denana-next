/*
 * AppShell (Phase 16A)
 * The desktop application shell: a fixed left Sidebar plus a main column that
 * contains a top-right header-actions bar and the routed page content. Page
 * content continues to use the existing <Shell> container for width.
 */
import React from 'react';
import Sidebar from './Sidebar';
import HeaderActions from './HeaderActions';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <header className="app-topbar">
          <HeaderActions />
        </header>
        {children}
      </div>
    </div>
  );
}
