import React from 'react';

/*
 * Icon (Phase 16A)
 * A small, consistent stroke-based icon set so the shell no longer relies on
 * mismatched emoji. All icons inherit color via currentColor and share the
 * same 24x24 viewBox + stroke style for a clean, premium look.
 */
export type IconName =
  | 'dashboard'
  | 'campaign'
  | 'planner'
  | 'calendar'
  | 'book'
  | 'search'
  | 'users'
  | 'globe'
  | 'contrast'
  | 'help'
  | 'plus'
  | 'chevronRight';

const PATHS: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  campaign: (
    <>
      <path d="M4 9v6h3l8 4V5L7 9H4z" />
      <path d="M17.5 9.5a4 4 0 010 5" />
    </>
  ),
  planner: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="20" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8" y1="2.5" x2="8" y2="6.5" />
      <line x1="16" y1="2.5" x2="16" y2="6.5" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5V4.5z" />
      <path d="M5 19.5A1.5 1.5 0 006.5 21H19" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="20.5" y1="20.5" x2="16.5" y2="16.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7.5" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0111 0" />
      <path d="M16 5.6a3 3 0 010 5.4" />
      <path d="M20.5 20a5.6 5.6 0 00-3.2-5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" />
    </>
  ),
  contrast: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 010 18z" fill="currentColor" stroke="none" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.6a2.5 2.5 0 014.6 1.4c0 1.7-2.2 2-2.2 3.5" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  chevronRight: <polyline points="9 6 15 12 9 18" />,
};

export default function Icon({
  name,
  size = 16,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
