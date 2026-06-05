/*
 * StatusCard
 * The Home page status tiles (Profil Brand / Rencana Campaign / Rencana Konten).
 * Ported from the prototype's statusCard() helper.
 */
import React from 'react';
import Button from './Button';

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
    <article className="card status-card">
      <div className="ico">{icon}</div>
      <span className={'status-pill ' + tone}>{pill}</span>
      <h3>{title}</h3>
      <p className="notion-muted" style={descStyle}>
        {desc}
      </p>
      <Button href={href} size="small">
        {btn}
      </Button>
    </article>
  );
}
