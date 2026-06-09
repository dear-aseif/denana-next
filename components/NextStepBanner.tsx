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
    <Card className="cc-next">
      <div className="cc-next-text">
        <p className="cc-next-label">Next step</p>
        <p className="cc-next-title">{title}</p>
      </div>
      <Button href={href}>{cta} &rarr;</Button>
    </Card>
  );
}
