/*
 * PageHeader (Phase 16A)
 * Reusable page title block: optional eyebrow, title, optional subtitle, and an
 * optional right-aligned actions slot. Future pages should use this for a
 * consistent typographic hierarchy.
 */
import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="page-head page-header">
      <div className="page-header-text">
        {eyebrow ? <p className="notion-eyebrow page-header-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  );
}
