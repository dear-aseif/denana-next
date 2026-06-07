'use client';

/*
 * HomeView - Phase 1.5C: Home Command Center
 * A practical command center for the salon owner/staff. It answers, from one
 * place: which campaign is active, how far content has progressed, what the
 * next step is, and which button to click.
 *
 * Sections (in order):
 *   1. Hero / greeting
 *   2. Active campaign card  +  3. Content progress summary  (side by side)
 *   4. Next step card (the obvious main CTA)
 *   5. Core flow cards (secondary): Profil Salon / Rencana Campaign / Rencana Konten
 *   6. Tools Pendukung (clearly secondary, lower on the page)
 *
 * No data-structure changes; everything is derived by reading existing
 * localStorage state and counting existing calendar rows.
 */
import React, { useEffect, useState } from 'react';
import type { BrandSnapshot, Campaign, ContentRow, SeriesBible, CompetitorEntry, KolEntry } from '@/types/content';
import { getBrand, getCampaign, getCalendar, getSeriesBible, getCompetitors, getKols } from '@/lib/storage';
import Button from './Button';
import Footer from './Footer';
import StatusCard from './StatusCard';

const sectionLabelStyle: React.CSSProperties = { marginBottom: 6, marginTop: 0 };
const sectionDescStyle: React.CSSProperties = { marginTop: 0, marginBottom: 14 };
const panelHeadStyle: React.CSSProperties = { marginTop: 8, marginBottom: 14 };
const panelLeadStyle: React.CSSProperties = { marginTop: 0, marginBottom: 16 };

export default function HomeView() {
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState<BrandSnapshot | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [calendar, setCalendar] = useState<ContentRow[]>([]);
  const [bible, setBible] = useState<SeriesBible | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([]);
  const [kols, setKols] = useState<KolEntry[]>([]);

  useEffect(() => {
    setBrand(getBrand());
    setCampaign(getCampaign());
    setCalendar(getCalendar());
    setBible(getSeriesBible());
    setCompetitors(getCompetitors());
    setKols(getKols());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasBrand = !!brand;
  const hasBible = !!bible;
  const hasCampaign = !!campaign;
  const hasCalendar = calendar.length > 0;
  const hasCompetitors = competitors.length > 0;
  const hasKols = kols.length > 0;

  /* ---- Content progress counts (count existing rows only) ---- */
  const countBy = (status: string) => calendar.filter((r) => r.productionStatus === status).length;
  const counts = {
    total: calendar.length,
    ide: countBy('Ide'),
    direncanakan: countBy('Direncanakan'),
    sedangDibuat: countBy('Sedang Dibuat'),
    sudahDiposting: countBy('Sudah Diposting'),
  };

  /* ---- Recommended next step (one clear action based on data state) ---- */
  let next: { title: string; cta: string; href: string };
  if (!hasBrand) {
    next = { title: 'Siapkan profil salon terlebih dahulu.', cta: 'Mulai setup', href: '/brand-setup' };
  } else if (!hasCampaign) {
    next = { title: 'Profil sudah siap. Sekarang buat campaign pertama.', cta: 'Buat campaign pertama', href: '/campaign-setup' };
  } else if (!hasCalendar) {
    next = { title: 'Campaign sudah siap. Sekarang buat rencana konten.', cta: 'Buat rencana konten', href: '/content-calendar' };
  } else if (counts.sudahDiposting > 0) {
    next = { title: 'Campaign sedang berjalan. Pantau progres dan siapkan konten berikutnya.', cta: 'Lihat rencana konten', href: '/content-calendar' };
  } else if (counts.sedangDibuat > 0) {
    next = { title: 'Ada konten yang sedang dibuat. Lanjutkan produksi konten tersebut.', cta: 'Lihat konten', href: '/content-calendar' };
  } else {
    next = { title: 'Rencana konten sudah siap. Pilih konten minggu pertama untuk mulai diproduksi.', cta: 'Lihat rencana konten', href: '/content-calendar' };
  }

  const statItems = [
    { key: 'ide', label: 'Ide', value: counts.ide },
    { key: 'direncanakan', label: 'Direncanakan', value: counts.direncanakan },
    { key: 'dibuat', label: 'Sedang Dibuat', value: counts.sedangDibuat },
    { key: 'diposting', label: 'Sudah Diposting', value: counts.sudahDiposting },
  ];

  return (
    <>
      {/* ---- 1. Hero / greeting ---- */}
      <section className="page-head">
        <p className="notion-eyebrow" style={sectionLabelStyle}>Command Center</p>
        <h1>Siap mengelola konten Denana hari ini?</h1>
        <p>Lihat campaign aktif, progres konten, dan langkah berikutnya dari satu tempat.</p>
      </section>

      {/* ---- 2 + 3. Active campaign  &  Content progress ---- */}
      <section>
        <div className="grid grid-2">
          {/* 2. Active campaign card */}
          <div className="card cc-panel">
            <p className="notion-eyebrow" style={sectionLabelStyle}>Campaign aktif</p>
            {hasCampaign && campaign ? (
              <>
                <h3 style={panelHeadStyle}>{campaign.campaignName || 'Campaign tanpa nama'}</h3>
                <div className="cc-meta">
                  <div className="cc-meta-row">
                    <span className="cc-meta-label">Periode</span>
                    <span className="cc-meta-value">{campaign.periodStart} &ndash; {campaign.periodEnd}</span>
                  </div>
                  <div className="cc-meta-row">
                    <span className="cc-meta-label">Tujuan</span>
                    <span className="cc-meta-value">{campaign.campaignGoal}</span>
                  </div>
                  <div className="cc-meta-row">
                    <span className="cc-meta-label">Frekuensi</span>
                    <span className="cc-meta-value">{campaign.postingFrequency}</span>
                  </div>
                </div>
                <div className="cc-panel-cta">
                  <Button href="/content-calendar">Lihat rencana konten →</Button>
                </div>
              </>
            ) : (
              <div className="cc-panel-empty">
                <div className="cc-empty-emoji">📣</div>
                <p className="cc-empty-title">Belum ada campaign aktif</p>
                <Button href="/campaign-setup">Buat campaign pertama →</Button>
              </div>
            )}
          </div>

          {/* 3. Content progress summary */}
          <div className="card cc-panel">
            <p className="notion-eyebrow" style={sectionLabelStyle}>Progres konten</p>
            {hasCalendar ? (
              <>
                <div className="cc-total">
                  <span className="cc-total-num">{counts.total}</span>
                  <span className="cc-total-label">total konten</span>
                </div>
                <div className="cc-stats">
                  {statItems.map((s) => (
                    <div key={s.key} className="cc-stat">
                      <span className="cc-stat-num">{s.value}</span>
                      <span className="cc-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="cc-panel-empty">
                <div className="cc-empty-emoji">🗓️</div>
                <p className="cc-empty-title">Rencana konten belum dibuat</p>
                <Button href="/content-calendar">Buat rencana konten →</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- 4. Next step card (the obvious main CTA) ---- */}
      <section>
        <div className="card cc-next">
          <div className="cc-next-text">
            <p className="cc-next-label">Langkah berikutnya</p>
            <p className="cc-next-title">{next.title}</p>
          </div>
          <Button href={next.href}>{next.cta} →</Button>
        </div>
      </section>

      {/* ---- 5. Core flow cards (secondary) ---- */}
      <section>
        <p className="notion-eyebrow" style={sectionLabelStyle}>Alur Utama</p>
        <div className="grid grid-3">
          <StatusCard
            icon="💄"
            title="Profil Salon"
            tone={hasBrand ? 'ok' : 'warn'}
            pill={hasBrand ? 'Lengkap' : 'Belum lengkap'}
            desc="Identitas, layanan facial, tone of voice, dan content pillars."
            btn={hasBrand ? 'Tinjau profil' : 'Isi sekarang'}
            href="/brand-setup"
          />
          <StatusCard
            icon="📅"
            title="Rencana Campaign"
            tone={hasCampaign ? 'ok' : 'warn'}
            pill={hasCampaign ? 'Aktif' : 'Belum ada'}
            desc="Periode, tujuan, platform, dan frekuensi posting campaign."
            btn={hasCampaign ? 'Tinjau campaign' : 'Buat campaign'}
            href="/campaign-setup"
          />
          <StatusCard
            icon="🗓️"
            title="Rencana Konten"
            tone={hasCalendar ? 'ok' : 'warn'}
            pill={hasCalendar ? calendar.length + ' konten' : 'Belum dibuat'}
            desc="Kalender konten beserta caption, script, dan hashtag."
            btn={hasCalendar ? 'Buka rencana' : 'Buat rencana'}
            href="/content-calendar"
          />
        </div>
      </section>

      {/* ---- 6. Tools Pendukung (secondary) ---- */}
      <section>
        <p className="notion-eyebrow" style={sectionLabelStyle}>Tools Pendukung</p>
        <p className="notion-muted" style={sectionDescStyle}>Gunakan setelah alur utama berjalan.</p>
        <div className="grid grid-3">
          <StatusCard
            icon="📖"
            title="Series Bible"
            tone={hasBible ? 'ok' : 'warn'}
            pill={hasBible ? 'Tersimpan' : 'Belum dibuat'}
            desc="Manifesto, persona, visual DNA, caption framework, dan posting strategy."
            btn={hasBible ? 'Buka Series Bible' : 'Buat Series Bible'}
            href="/series-bible"
          />
          <StatusCard
            icon="🔍"
            title="Audit Kompetitor"
            tone={hasCompetitors ? 'ok' : 'warn'}
            pill={hasCompetitors ? competitors.length + ' kompetitor' : 'Belum diisi'}
            desc="Panduan audit konten organik kompetitor dan catatan kekuatan serta celah peluang."
            btn={hasCompetitors ? 'Buka Audit' : 'Mulai Audit'}
            href="/competitor-audit"
          />
          <StatusCard
            icon="🤝"
            title="KOL / UGC Brief"
            tone={hasKols ? 'ok' : 'warn'}
            pill={hasKols ? kols.length + ' KOL' : 'Belum diisi'}
            desc="Brief kerja sama untuk KOL/kreator lokal plus daftar kandidat dan statusnya."
            btn={hasKols ? 'Buka Brief' : 'Buat Brief'}
            href="/kol-brief"
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
