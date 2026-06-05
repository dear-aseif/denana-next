/*
 * Shell
 * The centered content container (".shell") that wraps each page's sections.
 * Width is controlled by CSS (and widens via body.wide-page on the calendar).
 */
import React from 'react';

export default function Shell({ children }: { children: React.ReactNode }) {
  return <main className="shell">{children}</main>;
}
