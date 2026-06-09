'use client';

/*
 * HeaderActions (Phase 16A)
 * Top-right header controls. VISUAL ONLY for this phase — language switching,
 * theme/dark mode, and the help center are intentionally not wired up yet.
 */
import React from 'react';
import Icon from './Icon';

export default function HeaderActions() {
  return (
    <div className="header-actions">
      <button type="button" className="header-action-btn" title="Language" aria-label="Language">
        <Icon name="globe" size={17} />
      </button>
      <button type="button" className="header-action-btn" title="Theme" aria-label="Theme">
        <Icon name="contrast" size={17} />
      </button>
      <button type="button" className="header-action-btn header-help" title="Need help?">
        <Icon name="help" size={16} />
        <span>Need Help?</span>
      </button>
    </div>
  );
}
