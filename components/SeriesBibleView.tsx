'use client';

/*
 * SeriesBibleView (Module 1.1 — Series Bible)
 * Reads the saved Brand Snapshot and generates a structured Series Bible:
 * brand manifesto, positioning, audience persona + pain points, visual DNA,
 * caption framework, content pillars, and posting strategy.
 * The output is saved locally and can be copied as plain text.
 */
import React, { useEffect, useState } from 'react';
import type { BrandSnapshot, SeriesBible } from '@/types/content';
import { getBrand, getSeriesBible, saveSeriesBible } from '@/lib/storage';
import { generateSeriesBible, seriesBibleToText } from '@/lib/seriesBible';
import { fmtDateTime } from '@/lib/utils';
import { copyText } from '@/lib/exportUtils';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';
import EmptyState from './EmptyState';

const introBtnRow: React.CSSProperties = { marginTop: 4 };

export default function SeriesBibleView() {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState<BrandSnapshot | null>(null);
  const [bible, setBible] = useState<SeriesBible | null>(null);

  useEffect(() => {
    setBrand(getBrand());
    setBible(getSeriesBible());
    setMounted(true);
  }, []);

  function handleGenerate() {
    if (!brand) {
      toast('Isi Profil Brand dulu sebelum membuat Series Bible');
      return;
    }
    const next = generateSeriesBible(brand);
    saveSeriesBible(next);
    setBible(next);
    toast('Series Bible berhasil dibuat ✅');
  }

  function handleCopyAll() {
    if (!bible) return;
    copyText(seriesBibleToText(bible), 'Series Bible', toast);
  }

  if (!mounted) return null;

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Phase 1 · Fondasi Brand</span>
        <h1>Series Bible</h1>
        <p>
          Dokumen fondasi brand DenanavBeauty Salon: manifesto, persona audience,
          visual DNA, caption framework, content pillars, dan posting strategy.
          Disusun otomatis dari Profil Brand sebagai acuan semua konten.
        </p>
      </section>

      {!brand ? (
        <section>
          <div className="card">
            <EmptyState
              big="📖"
              title="Isi Profil Brand dulu"
              action={<Button href="/brand-setup">Isi Profil Brand →</Button>}
            >
              Series Bible disusun dari data Profil Brand. Lengkapi profil brand
              dulu, lalu kembali ke sini untuk membuatnya.
            </EmptyState>
          </div>
        </section>
      ) : (
        <>
          <section>
            <div className="card">
              <h3>Buat / perbarui Series Bible</h3>
              <p className="notion-muted">
                Series Bible dibuat dari Profil Brand yang tersimpan. Jika kamu
                memperbarui Profil Brand, buat ulang Series Bible agar selaras.
              </p>
              <div className="btn-row" style={introBtnRow}>
                <Button onClick={handleGenerate}>
                  {bible ? '🔄 Buat ulang Series Bible' : '✨ Buat Series Bible'}
                </Button>
                {bible ? (
                  <Button variant="secondary" onClick={handleCopyAll}>
                    Salin semua
                  </Button>
                ) : null}
              </div>
              {bible ? (
                <p className="notion-faint">
                  Terakhir dibuat: {fmtDateTime(bible.generatedAt)}
                </p>
              ) : null}
            </div>
          </section>

          {bible ? (
            <>
              <section>
                <div className="card">
                  <h2>Brand Manifesto</h2>
                  <div className="detail-box">{bible.manifesto}</div>
                  <h3>Positioning</h3>
                  <div className="detail-box">{bible.positioning}</div>
                  <h3>Tone of Voice</h3>
                  <div className="detail-box">{bible.toneOfVoice}</div>
                  {bible.tagline ? (
                    <div className="chips">
                      <span className="chip">Tagline: {bible.tagline}</span>
                    </div>
                  ) : null}
                </div>
              </section>

              <section>
                <div className="card">
                  <h2>Audience Persona &amp; Pain Points</h2>
                  <h3>{bible.persona.name}</h3>
                  <div className="detail-box">{bible.persona.snapshot}</div>
                  <h3>Tujuan &amp; harapan</h3>
                  <ul className="chk">
                    {bible.persona.goals.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                  <h3>Pain points</h3>
                  <ul className="chk">
                    {bible.persona.painPoints.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <div className="card">
                  <h2>Visual DNA</h2>
                  <div className="chips">
                    <span className="chip">Warna utama: {bible.visual.primaryColor}</span>
                    <span className="chip">Warna sekunder: {bible.visual.secondaryColor}</span>
                    <span className="chip">Gaya: {bible.visual.style}</span>
                  </div>
                  <h3>Mood</h3>
                  <div className="tag-list">
                    {bible.visual.moodKeywords.map((m, i) => (
                      <span className="tag" key={i}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <h3>Lakukan</h3>
                  <ul className="chk">
                    {bible.visual.dos.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                  <h3>Hindari</h3>
                  <ul className="chk">
                    {bible.visual.donts.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <div className="card">
                  <h2>Caption Framework</h2>
                  <ol>
                    {bible.caption.structure.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  <h3>Lakukan</h3>
                  <ul className="chk">
                    {bible.caption.dos.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                  <h3>Hindari</h3>
                  <ul className="chk">
                    {bible.caption.donts.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <div className="card">
                  <h2>Content Pillars</h2>
                  {bible.pillars.map((p, i) => (
                    <div className="detail-block" key={i}>
                      <div className="dh">
                        <h3>{p.name}</h3>
                      </div>
                      <p className="notion-muted">{p.goal}</p>
                      <div className="detail-box">{p.description}</div>
                      <ul className="chk">
                        {p.exampleAngles.map((a, j) => (
                          <li key={j}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="card">
                  <h2>Posting Strategy</h2>
                  <div className="detail-box">{bible.postingStrategy.cadence}</div>
                  <h3>Format mix</h3>
                  <ul className="chk">
                    {bible.postingStrategy.formatMix.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                  <h3>Rasio pilar (30 hari)</h3>
                  <ul className="chk">
                    {bible.postingStrategy.pillarRatio.map((r, i) => (
                      <li key={i}>
                        {r.pillar}: {r.count} konten ({r.pct})
                      </li>
                    ))}
                  </ul>
                  <h3>Tips</h3>
                  <ul className="chk">
                    {bible.postingStrategy.tips.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <div className="card">
                  <h2>Hashtag Set</h2>
                  <div className="tag-list">
                    {bible.hashtags.map((h, i) => (
                      <span className="tag" key={i}>
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </>
      )}

      <section>
        <Note icon="📌">
          Series Bible ini adalah <strong>acuan fondasi</strong> untuk seluruh
          konten Phase 1. Scope tetap dibatasi pada <strong>Facial Treatment</strong>.
          Semua data tersimpan lokal di browser ini.
        </Note>
      </section>

      <Footer />
    </>
  );
}
