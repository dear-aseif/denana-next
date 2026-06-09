'use client';

/*
 * Sidebar (Phase 16A)
 * The desktop left navigation: product logo/title, business ProfileCard,
 * the "Create Plan" primary action, main navigation, and a supporting-tools
 * section. A minimal mobile bottom-nav is preserved for the routable core
 * items so the existing mobile behavior does not regress (mobile is not a
 * focus of this phase).
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileCard from './ProfileCard';
import PrimaryActionButton from './PrimaryActionButton';
import NavItem from './NavItem';
import Icon, { IconName } from './Icon';

type Item = { label: string; icon: IconName; href?: string; disabled?: boolean; badge?: string };

const MAIN: Item[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'My Campaign', icon: 'campaign', href: '/campaign-setup' },
  { label: 'Content Planner', icon: 'planner', href: '/content-calendar' },
  { label: 'Work Calendar', icon: 'calendar', href: '/work-calendar' },
];

const TOOLS: Item[] = [
  { label: 'Series Bible', icon: 'book', href: '/series-bible' },
  { label: 'Competitor Audit', icon: 'search', href: '/competitor-audit' },
  { label: 'KOL Brief', icon: 'users', href: '/kol-brief' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href?: string) =>
    !!href && (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">D</span>
          <span className="sidebar-brand-name">Denana Next OS</span>
        </div>

        <ProfileCard />
        <div className="sidebar-create">
          <PrimaryActionButton />
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main Menu</span>
          {MAIN.map((it) => (
            <NavItem
              key={it.label}
              label={it.label}
              icon={it.icon}
              href={it.href}
              disabled={it.disabled}
              badge={it.badge}
              active={isActive(it.href)}
            />
          ))}

          <div className="sidebar-divider" />

          <span className="sidebar-section-label">Supporting Tools</span>
          {TOOLS.map((it) => (
            <NavItem
              key={it.label}
              label={it.label}
              icon={it.icon}
              href={it.href}
              active={isActive(it.href)}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>Denana Next OS</span>
          <span>Phase 1 &middot; Facial Treatment</span>
        </div>
      </aside>

      {/* Mobile bottom nav — preserved, routable core items only */}
      <nav className="bottom-nav">
        {MAIN.filter((it) => it.href).map((it) => (
          <Link
            key={it.label}
            href={it.href as string}
            className={'bottom-nav-link' + (isActive(it.href) ? ' active' : '')}
          >
            <span className="bottom-nav-icon">
              <Icon name={it.icon} />
            </span>
            <span className="bottom-nav-label">{it.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
