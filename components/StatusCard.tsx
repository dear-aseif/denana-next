/*
 * StatusCard
 * Compact, fully-clickable status tile used on the Home dashboard.
 * The entire card is wrapped in a Next.js Link so the user can click
 * anywhere on the card to navigate, not just the button.
 * Props unchanged from previous version (btn label shown as action text).
 */
import React from 'react';
import Link from 'next/link';

const descStyle: React.CSSProperties = { flex: 1, margin: 0 };

export default function StatusCard({
  icon,
  title,
  tone,
  pill,
  desc,
  btn,
  href,
}: {
  icon: string;
  title: string;
  tone: 'ok' | 'warn';
  pill: string;
  desc: string;
  btn: string;
  href: string;
}) {
  return (
    <Link href={href} className="status-card-link">
      <article className="card status-card">
        <div className="ico">{icon}</div>
        <span className={'status-pill ' + tone}>{pill}</span>
        <h3>{title}</h3>
        <p className="notion-muted" style={descStyle}>
          {desc}
        </p>
        <span className="status-card-action">{btn} →</span>
      </article>
    </Link>
  );
}
