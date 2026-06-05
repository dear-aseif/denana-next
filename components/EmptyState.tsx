/*
 * EmptyState
 * The dashed ".empty" placeholder block used on Home and the Content Plan page.
 * `action` renders any CTA (button/link) below the copy.
 */
import React from 'react';

export default function EmptyState({
  big,
  title,
  children,
  action,
}: {
  big: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <div className="big">{big}</div>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
