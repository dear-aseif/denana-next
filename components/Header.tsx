'use client';

/*
 * Header
 * Top app bar + primary navigation, ported from the prototype's <header>.
 * The original hash routes (#home, #brand-setup, ...) become App Router paths.
 * On the Rencana Konten page the inner bar widens (wide-page) to match the
 * prototype's wider workspace layout.
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { route: string; href: string; label: string };

const NAV: NavItem[] = [
  { route: 'home', href: '/', label: 'Home' },
  { route: 'brand-setup', href: '/brand-setup', label: 'Profil Brand' },
  { route: 'series-bible', href: '/series-bible', label: 'Series Bible' },
  { route: 'campaign-setup', href: '/campaign-setup', label: 'Rencana Campaign' },
  { route: 'content-calendar', href: '/content-calendar', label: 'Rencana Konten' },
  { route: 'competitor-audit', href: '/competitor-audit', label: 'Audit Kompetitor' },
];

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand-mark">
          <span className="brand-logo">D</span>
          <span>
            Denana Social Growth OS
            <small>DenanavBeauty Salon · Facial Treatment</small>
          </span>
        </div>
        <nav className="app-nav">
          {NAV.map((item) => (
            <Link
              key={item.route}
              className={'nav-link' + (isActive(item.href) ? ' active' : '')}
              data-route={item.route}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
