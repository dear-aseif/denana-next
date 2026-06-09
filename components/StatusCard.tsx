/*
 * StatusCard
 * Fully-clickable status tile used on the Home dashboard. The whole card is
 * wrapped in a Next.js Link so the user can click anywhere to navigate.
 *
 * Phase 16C-Rev1: added an optional `compact` variant — a tighter single-row
 * tile (icon + title + status pill + arrow, no description) used for the
 * secondary "Main Flow" row so it no longer dominates the command center.
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
  compact,
}: {
  icon: string;
  title: string;
  tone: 'ok' | 'warn';
  pill: string;
  desc?: string;
  btn?: string;
  href: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link href={href} className="status-card-link">
        <article className="card status-card status-card-compact">
          <span className="ico">{icon}</span>
          <div className="scc-main">
            <h3>{title}</h3>
            <span className={'status-pill ' + tone}>{pill}</span>
          </div>
          <span className="scc-arrow" aria-hidden="true">&rarr;</span>
        </article>
      </Link>
    );
  }

  return (
    <Link href={href} className="status-card-link">
      <article className="card status-card">
        <div className="ico">{icon}</div>
        <span className={'status-pill ' + tone}>{pill}</span>
        <h3>{title}</h3>
        <p className="notion-muted" style={descStyle}>
          {desc}
        </p>
        <span className="status-card-action">{btn} &rarr;</span>
      </article>
    </Link>
  );
}
