'use client';

/*
 * CreateCampaignProvider (Phase 16G)
 * App-wide provider that owns the Create Campaign Wizard modal and exposes an
 * openWizard() action via context. Mounted once in the root layout (inside the
 * ToastProvider) so any control — e.g. the sidebar "Create Plan" button — can
 * open the same wizard.
 *
 * It does not change any storage / generator / status logic; it only manages
 * the open/closed state of the wizard dialog.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import CreateCampaignWizard from './CreateCampaignWizard';

type CreateCampaignContextValue = {
  openWizard: () => void;
  closeWizard: () => void;
};

const CreateCampaignContext = createContext<CreateCampaignContextValue>({
  openWizard: () => {},
  closeWizard: () => {},
});

export function useCreateCampaign(): CreateCampaignContextValue {
  return useContext(CreateCampaignContext);
}

export default function CreateCampaignProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openWizard = useCallback(() => setOpen(true), []);
  const closeWizard = useCallback(() => setOpen(false), []);
  const value = useMemo<CreateCampaignContextValue>(
    () => ({ openWizard, closeWizard }),
    [openWizard, closeWizard],
  );

  return (
    <CreateCampaignContext.Provider value={value}>
      {children}
      <CreateCampaignWizard open={open} onClose={closeWizard} />
    </CreateCampaignContext.Provider>
  );
}
