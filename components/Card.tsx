/*
 * Card (Phase 16A)
 * Thin reusable wrapper over the existing .card style so pages can compose
 * cards consistently. Extra classes can be appended via className.
 */
import React from 'react';

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={'card' + (className ? ' ' + className : '')}>{children}</div>;
}
