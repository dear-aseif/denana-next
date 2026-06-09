'use client';

/*
 * PrimaryActionButton (Phase 16A)
 * The sidebar's main call-to-action ("Create Plan"). Reuses the existing .btn
 * style and links to the campaign planner route.
 */
import React from 'react';
import Link from 'next/link';
import Icon from './Icon';

export default function PrimaryActionButton({
  href = '/campaign-setup',
  label = 'Create Plan',
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link href={href} className="btn primary-action-btn">
      <Icon name="plus" size={15} />
      <span>{label}</span>
    </Link>
  );
}
