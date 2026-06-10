'use client';

/*
 * PrimaryActionButton (Phase 16A / refined Phase 16G)
 * The sidebar's main call-to-action ("Create Plan"). It now opens the
 * CreateCampaignWizard modal via the CreateCampaign context instead of
 * navigating to a separate page, so the guided wizard is available from
 * anywhere in the app shell. Reuses the existing .btn / .primary-action-btn
 * styles.
 */
import React from 'react';
import Icon from './Icon';
import { useCreateCampaign } from './CreateCampaignProvider';

export default function PrimaryActionButton({
  label = 'Create Plan',
}: {
  label?: string;
}) {
  const { openWizard } = useCreateCampaign();
  return (
    <button type="button" className="btn primary-action-btn" onClick={openWizard}>
      <Icon name="plus" size={15} />
      <span>{label}</span>
    </button>
  );
}
