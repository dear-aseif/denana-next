/*
 * Note
 * The gold info callout (".note") used throughout the prototype.
 * `tone` maps to the data-tone attribute (default | saved | warn).
 */
import React from 'react';

export default function Note({
  icon,
  tone,
  children,
  style,
}: {
  icon: string;
  tone?: 'saved' | 'warn';
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="note" data-tone={tone} style={style}>
      <span className="ni">{icon}</span>
      <div>{children}</div>
    </div>
  );
}
