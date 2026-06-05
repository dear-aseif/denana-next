'use client';

/*
 * RouteBodyClass
 * Mirrors the prototype's `body.wide-page` behavior: the Rencana Konten page
 * uses a wider workspace. We toggle the class on <body> based on the route so
 * the existing CSS rules (body.wide-page .shell / .app-header-inner) still apply.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteBodyClass() {
  const pathname = usePathname();
  useEffect(() => {
    const wide = pathname.startsWith('/content-calendar');
    document.body.classList.toggle('wide-page', wide);
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
