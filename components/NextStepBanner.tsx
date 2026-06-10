'use client';

import React from 'react';
import Card from './Card';
import Button from './Button';

/*
 * NextStepBanner (Phase 16C)
 * The single, obvious main CTA on the dashboard. The title text and CTA are
 * computed by the caller based on the current workflow state (see HomeView).
 */
export default function NextStepBanner({
  title,
  cta,
  href,
}: {
  title: string;
  cta: string;
  href: string;
}) {
  return (
    <Card className="cc-next dash-next">
      <div className="dash-next-row">
        <span className="dash-next-ico" aria-hidden="true">🧭</span>
        <div className="cc-next-text">
          <p className="cc-next-label">Next step</p>
          <p className="cc-next-title">{title}</p>
        </div>
      </div>
      <Button href={href} variant="secondary" size="small">{cta} &rarr;</Button>
    </Card>
  );
}
