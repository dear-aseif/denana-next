'use client';

/*
 * AppFrame (Phase 1.5A — first-run gate)
 * Decides, on the client, whether to show the full-screen first-time onboarding
 * (no sidebar / no dashboard chrome) or the normal dashboard layout.
 *
 * Rule:
 *  - No saved brand profile  -> full-screen FirstRunOnboarding (no Header)
 *  - Brand profile exists     -> normal dashboard (Header + content)
 *
 * The decision is made once on mount. The onboarding flow finishes with a hard
 * navigation to /content-calendar, which remounts AppFrame; by then the brand
 * profile exists, so the normal dashboard renders. Existing users are never
 * interrupted. This does not touch localStorage shapes, the generator, or any
 * core function — it only chooses which shell to render.
 */
import React, { useEffect, useState } from 'react';
import { getBrand } from '@/lib/storage';
import AppShell from './AppShell';
import FirstRunOnboarding from './FirstRunOnboarding';

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [hasBrand, setHasBrand] = useState(false);

  useEffect(() => {
    setHasBrand(!!getBrand());
    setMounted(true);
  }, []);

  // Avoid hydration mismatch + a flash of the wrong shell: render nothing until
  // we have read localStorage on the client.
  if (!mounted) return null;

  if (!hasBrand) return <FirstRunOnboarding />;

  return <AppShell>{children}</AppShell>;
}
