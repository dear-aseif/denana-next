'use client';

/*
 * Header (Dashboard sidebar + mobile bottom nav)
 * Desktop: fixed-width left sidebar with brand mark, core nav, and optional
 *          tools section.
 * Mobile:  sidebar hidden; bottom tab bar shows the 4 core routes only.
 *
 * Scope lock: core nav = Home, Profil Brand, Rencana Campaign, Rencana Konten.
 * Optional tools in sidebar only (not in bottom nav).
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { route: string; href: string; label: string; icon: string };

const NAV_CORE: NavItem[] = [
  { route: 'home', href: '/', label: 'Home', icon: '🏠' },
  { route: 'brand-setup', href: '/brand-setup', label: 'Profil Brand', icon: '💄' },
  { route: 'campaign-setup', href: '/campaign-setup', label: 'Rencana Campaign', icon: '📅' },
  { route: 'content-calendar', href: '/content-calendar', label: 'Rencana Konten', icon: '🗓️' },
];

const NAV_TOOLS: NavItem[] = [
  { route: 'series-bible', href: '/series-bible', label: 'Series Bible', icon: '📖' },
  { route: 'competitor-audit', href: '/competitor-audit', label: 'Audit Kompetitor', icon: '🔍' },
  { route: 'kol-brief', href: '/kol-brief', label: 'KOL Brief', icon: '🤝' },
];

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* SIDEBAR — desktop only */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">D</span>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Denana OS</span>
            <span className="sidebar-brand-sub">Social Growth</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Menu Utama</span>
          {NAV_CORE.map((item) => (
            <Link
              key={item.route}
              href={item.href}
              className={'sidebar-link' + (isActive(item.href) ? ' active' : '')}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="sidebar-divider" />

          <div className="sidebar-tools-group">
            <span className="sidebar-section-label">Tools Pendukung</span>
            {NAV_TOOLS.map((item) => (
              <Link
                key={item.route}
                href={item.href}
                className={'sidebar-link' + (isActive(item.href) ? ' active' : '')}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <span>DenanavBeauty Salon</span>
          <span>Facial Treatment · Phase 1</span>
        </div>
      </aside>

      {/* BOTTOM NAV — mobile only (4 core items) */}
      <nav className="bottom-nav">
        {NAV_CORE.map((item) => (
          <Link
            key={item.route}
            href={item.href}
            className={'bottom-nav-link' + (isActive(item.href) ? ' active' : '')}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
