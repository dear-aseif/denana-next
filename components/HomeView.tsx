'use client';

/*
 * HomeView
 * The dashboard / landing view. Ported from renderHome() in the prototype:
 * intro, an empty-state CTA when no brand is saved, three status cards, a
 * quick-steps card, and the scope note.
 */
import React, { useEffect, useState } from 'react';
import type { BrandSnapshot, Campaign, ContentRow, SeriesBible, CompetitorEntry, KolEntry } from '@/types/content';
import { getBrand, getCampaign, getCalendar, getSeriesBible, getCompetitors, getKols } from '@/lib/storage';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';
import EmptyState from './EmptyState';
import StatusCard from './StatusCard';

const stepListStyle: React.CSSProperties = { margin: 0, paddingLeft: 0, listStyle: 'none' };
const quickHeadStyle: React.CSSProperties = { marginTop: 0 };

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

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Phase 1 · Organic Foundation</span>
        <h1>Denana Social Growth OS</h1>
        <p>
          Sistem sederhana untuk merencanakan dan mengelola konten sosial media
          DenanavBeauty Salon. Fokus bulan ini: edukasi, awareness, dan trust
          building untuk Facial Treatment.
        </p>
      </section>

      {!hasBrand ? (
        <section>
          <div className="card">
            <EmptyState
              big="💎"
              title="Mulai dari Profil Brand"
              action={<Button href="/brand-setup">Isi Profil Brand →</Button>}
            >
              Lengkapi profil brand DenanavBeauty Salon dulu untuk mulai membuat
              rencana konten 30 hari.
            </EmptyState>
          </div>
        </section>
      ) : null}

      <section>
        <div className="grid grid-3">
          <StatusCard
            icon="💄"
            title="Profil Brand"
            tone={hasBrand ? 'ok' : 'warn'}
            pill={hasBrand ? 'Tersimpan' : 'Belum diisi'}
            desc="Identitas, layanan facial, tone of voice, dan content pillars."
            btn={hasBrand ? 'Tinjau Profil' : 'Isi Sekarang'}
            href="/brand-setup"
          />
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
            icon="📅"
            title="Rencana Campaign"
            tone={hasCampaign ? 'ok' : 'warn'}
            pill={hasCampaign ? 'Tersimpan' : 'Belum diisi'}
            desc="Periode, tujuan, platform, dan frekuensi posting campaign."
            btn={hasCampaign ? 'Tinjau Campaign' : 'Buat Campaign'}
            href="/campaign-setup"
          />
          <StatusCard
            icon="🗓️"
            title="Rencana Konten"
            tone={hasCalendar ? 'ok' : 'warn'}
            pill={hasCalendar ? calendar.length + ' konten' : 'Belum dibuat'}
            desc="Kalender konten 30 hari beserta caption, script, dan hashtag."
            btn={hasCalendar ? 'Buka Rencana' : 'Buat Rencana'}
            href="/content-calendar"
          />
          <StatusCard
            icon="🔍"
            title="Audit Kompetitor"
            tone={hasCompetitors ? 'ok' : 'warn'}
            pill={hasCompetitors ? competitors.length + ' kompetitor' : 'Belum diisi'}
            desc="Panduan audit konten organik kompetitor plus catatan kekuatan, kelemahan, dan celah peluang."
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

      <section>
        <div className="card">
          <h3 style={quickHeadStyle}>Langkah cepat</h3>
          <ol className="kv" style={stepListStyle}>
            <li>
              <strong>1. Profil Brand</strong> — pastikan identitas dan layanan
              facial sudah benar. <Button href="/brand-setup" variant="ghost" size="tiny">Buka</Button>
            </li>
            <li>
              <strong>2. Series Bible</strong> — susun fondasi brand (manifesto,
              persona, visual, caption). <Button href="/series-bible" variant="ghost" size="tiny">Buka</Button>
            </li>
            <li>
              <strong>3. Rencana Campaign</strong> — atur periode dan tujuan
              awareness. <Button href="/campaign-setup" variant="ghost" size="tiny">Buka</Button>
            </li>
            <li>
              <strong>4. Rencana Konten</strong> — buat 30 konten lalu susun caption
              &amp; script. <Button href="/content-calendar" variant="ghost" size="tiny">Buka</Button>
            </li>
            <li>
              <strong>5. Audit Kompetitor</strong> — pelajari konten kompetitor dan
              temukan celah yang bisa kita menangkan. <Button href="/competitor-audit" variant="ghost" size="tiny">Buka</Button>
            </li>
            <li>
              <strong>6. KOL / UGC Brief</strong> — siapkan brief kerja sama untuk
              kreator lokal dan catat kandidatnya. <Button href="/kol-brief" variant="ghost" size="tiny">Buka</Button>
            </li>
          </ol>
        </div>
      </section>

      <section>
        <Note icon="💡">
          Phase 1 fokus pada fondasi organik: profil brand, rencana campaign, dan
          rencana konten 30 hari untuk <strong>Facial Treatment</strong>. Belum ada
          login, database, atau koneksi AI — semua data tersimpan lokal di browser.
        </Note>
      </section>

      <Footer />
    </>
  );
}
