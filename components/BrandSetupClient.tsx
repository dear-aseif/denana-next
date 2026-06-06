'use client';

/*
 * BrandSetupClient (Phase 1.5A)
 * Decides what the /brand-setup route shows:
 *  - No saved brand profile  -> guided onboarding wizard (BrandOnboarding)
 *  - Saved brand profile      -> editable settings form (BrandForm)
 *
 * This guarantees:
 *  - New users get the guided setup instead of the long form.
 *  - Existing users are never forced through onboarding again.
 *  - The profile can always be edited later via the same route.
 *
 * localStorage is only available on the client, so we wait for mount before
 * deciding to avoid any SSR/hydration mismatch.
 */
import React, { useEffect, useState } from 'react';
import { getBrand } from '@/lib/storage';
import BrandForm from './BrandForm';
import BrandOnboarding from './BrandOnboarding';

export default function BrandSetupClient() {
  const [mounted, setMounted] = useState(false);
  const [hasBrand, setHasBrand] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    setHasBrand(!!getBrand());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (hasBrand || manual) return <BrandForm />;

  return <BrandOnboarding onUseManualForm={() => setManual(true)} />;
}
