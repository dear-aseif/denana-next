'use client';

/*
 * CampaignSwitcherModal - Phase 1.5 "Pilih Campaign"
 * A simple, familiar modal for switching the active campaign from the Home
 * Command Center. Presentational only: it receives the campaign list + active
 * id and reports the chosen id back to the parent, which owns the storage
 * write + Home refresh. Reuses the existing .modal-overlay / .modal pattern
 * (Escape + overlay-click to close, body scroll lock) and the .camp-* list
 * styles already used by Daftar Campaign.
 */
import React, { useEffect } from 'react';
import type { CampaignRecord } from '@/types/content';
import { fmtDate } from '@/lib/utils';
import Button from './Button';

function statusClass(s: string): string {
  if (s === 'Aktif') return 'ok';
  if (s === 'Selesai') return 'done';
  return 'warn'; // Draft / anything else
}

export default function CampaignSwitcherModal({
  campaigns,
  activeId,
  onActivate,
  onClose,
}: {
  campaigns: CampaignRecord[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Newest first by createdAt.
  const ordered = [...campaigns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return (
    <div className="modal-overlay show" onClick={onOverlayClick}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-label="Pilih Campaign">
        <div className="modal-head">
          <div className="mt">
            <h2>Pilih Campaign</h2>
            <p className="meta">Pilih campaign yang ingin dijadikan aktif.</p>
          </div>
        </div>
        <div className="modal-body">
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
                      <Button size="small" variant="secondary" onClick={() => onActivate(r.id)}>
                        Jadikan aktif
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-foot">
          <Button variant="ghost" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
}
