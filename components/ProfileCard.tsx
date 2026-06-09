'use client';

/*
 * ProfileCard (Phase 16A)
 * Sidebar business-profile block: avatar initials, business name, social
 * username, plus a "Complete business profile" shortcut. Reads the existing
 * BrandSnapshot from localStorage; it does not modify any stored data.
 */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBrand } from '@/lib/storage';
import Icon from './Icon';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfileCard() {
  const [name, setName] = useState('Your Business');
  const [handle, setHandle] = useState('@business');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const b = getBrand();
    if (b) {
      if (b.businessName) setName(b.businessName);
      if (b.instagramHandle) {
        const h = b.instagramHandle.trim();
        setHandle(h.startsWith('@') ? h : '@' + h);
      }
    }
    setMounted(true);
  }, []);

  return (
    <div className="profile-block">
      <Link href="/brand-setup" className="profile-card">
        <span className="profile-avatar">{mounted ? initials(name) : 'NU'}</span>
        <span className="profile-info">
          <span className="profile-name">{name}</span>
          <span className="profile-handle">{handle}</span>
        </span>
        <span className="profile-chevron">
          <Icon name="chevronRight" size={14} />
        </span>
      </Link>
      <Link href="/brand-setup" className="profile-complete">
        Complete business profile
      </Link>
    </div>
  );
}
