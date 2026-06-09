'use client';

/*
 * NavItem (Phase 16A)
 * A single sidebar navigation entry. Renders a Next <Link> when it has an href
 * and is enabled; renders a non-interactive span when disabled (used for items
 * whose pages are not built yet, e.g. Work Calendar).
 */
import React from 'react';
import Link from 'next/link';
import Icon, { IconName } from './Icon';

export type NavItemProps = {
  label: string;
  icon: IconName;
  href?: string | undefined;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
};

export default function NavItem({ label, icon, href, active, disabled, badge }: NavItemProps) {
  const className =
    'nav-item' + (active ? ' active' : '') + (disabled ? ' disabled' : '');
  const inner = (
    <>
      <span className="nav-item-icon">
        <Icon name={icon} />
      </span>
      <span className="nav-item-label">{label}</span>
      {badge ? <span className="nav-item-badge">{badge}</span> : null}
    </>
  );

  if (disabled || !href) {
    return (
      <span className={className} aria-disabled="true">
        {inner}
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
