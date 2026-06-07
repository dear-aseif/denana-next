'use client';

/*
 * CampaignList - "Daftar Campaign" (Phase 1.5 campaign history / switcher)
 * A simple, read-only list of every saved campaign record with a "Jadikan
 * aktif" action. No filtering / search / archive - just view + switch active.
 *
 * Backed entirely by the existing storage helpers (getCampaigns /
 * getActiveCampaignId / setActiveCampaignId); the storage model is unchanged.
 */
import React, { useEffect, useState } from 'react';
import type { CampaignRecord } from '@/types/content';
import { getCampaigns, getActiveCampaignId, setActiveCampaignId } from '@/lib/storage';
import { fmtDate } from '@/lib/utils';
import { useToast } from './ToastProvider';
import Button from './Button';

const sectionLabelStyle: React.CSSProperties = { marginBottom: 6, marginTop: 0 };
const sectionDescStyle: React.CSSProperties = { marginTop: 0, marginBottom: 14 };

function statusClass(s: string): string {
  if (s === 'Aktif') return 'ok';
  if (s === 'Selesai') return 'done';
  return 'warn'; // Draft / anything else
}

export default function CampaignList({ onActivate }: { onActivate?: () => void }) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  function refresh() {
    setCampaigns(getCampaigns());
    setActiveId(getActiveCampaignId());
  }

  useEffect(() => {
    refresh();
    setMounted(true);
  }, []);

  if (!mounted || campaigns.length === 0) return null;

  // Newest first by createdAt.
  const ordered = [...campaigns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  function activate(id: string) {
    setActiveCampaignId(id);
    refresh();
    toast('Campaign aktif diganti ✅');
    if (onActivate) onActivate();
  }

  return (
    <section>
      <p className="notion-eyebrow" style={sectionLabelStyle}>Daftar Campaign</p>
      <p className="notion-muted" style={sectionDescStyle}>
        Semua campaign tetap tersimpan di sini. Pilih salah satu untuk dijadikan campaign aktif.
      </p>
      <div className="camp-list">
        {ordered.map((r) => {
          const isActive = r.id === activeId;
          const hasPeriod = !!(r.campaign.periodStart || r.campaign.periodEnd);
          const period = hasPeriod
            ? fmtDate(r.campaign.periodStart) + ' – ' + fmtDate(r.campaign.periodEnd)
            : 'Periode belum diatur';
          return (
            <div key={r.id} className={'camp-item' + (isActive ? ' active' : '')}>
              <div className="camp-item-main">
                <p className="camp-item-name">{r.campaign.campaignName || 'Campaign tanpa nama'}</p>
                <p className="camp-item-meta">{period} · {r.calendar.length} konten</p>
              </div>
              <div className="camp-item-side">
                <span className={'camp-status ' + statusClass(r.status)}>{r.status}</span>
                {isActive ? (
                  <span className="camp-active-label">✓ Aktif</span>
                ) : (
                  <Button size="small" variant="secondary" onClick={() => activate(r.id)}>
                    Jadikan aktif
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
