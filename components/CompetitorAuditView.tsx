'use client';

/*
 * CompetitorAuditView (Module 1.2B — Competitor Organic Audit)
 * Shows an audit framework generated from the saved Brand Snapshot (what to
 * evaluate + how to spot gaps), plus a manual tool to record competitors and
 * their strengths, weaknesses, and the opportunity gaps for us.
 * Competitor entries are saved locally and can be copied as plain text.
 */
import React, { useEffect, useState } from 'react';
import type { BrandSnapshot, AuditFramework, CompetitorEntry } from '@/types/content';
import { getBrand, getCompetitors, saveCompetitors } from '@/lib/storage';
import { generateAuditFramework, auditToText } from '@/lib/competitorAudit';
import { uid, lines } from '@/lib/utils';
import { copyText } from '@/lib/exportUtils';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';
import EmptyState from './EmptyState';

const introBtnRow: React.CSSProperties = { marginTop: 4 };
const formBtnRow: React.CSSProperties = { marginTop: 16 };
const itemBtnRow: React.CSSProperties = { marginTop: 6 };

type Draft = {
  name: string;
  handle: string;
  followers: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
};

const emptyDraft: Draft = {
  name: '',
  handle: '',
  followers: '',
  strengths: '',
  weaknesses: '',
  opportunities: '',
};

function trimDraft(d: Draft) {
  return {
    name: d.name.trim(),
    handle: d.handle.trim(),
    followers: d.followers.trim(),
    strengths: d.strengths.trim(),
    weaknesses: d.weaknesses.trim(),
    opportunities: d.opportunities.trim(),
  };
}

export default function CompetitorAuditView() {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState<BrandSnapshot | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setBrand(getBrand());
    setCompetitors(getCompetitors());
    setMounted(true);
  }, []);

  const framework: AuditFramework | null = brand ? generateAuditFramework(brand) : null;

  function setField(key: keyof Draft, v: string) {
    setDraft((prev) => ({ ...prev, [key]: v }));
  }

  function persist(rows: CompetitorEntry[]) {
    setCompetitors(rows);
    saveCompetitors(rows);
  }

  function handleSubmit() {
    if (!draft.name.trim()) {
      toast('Isi minimal nama kompetitor dulu');
      return;
    }
    if (editingId) {
      const rows = competitors.map((c) =>
        c.id === editingId ? { ...c, ...trimDraft(draft), id: editingId } : c,
      );
      persist(rows);
      toast('Kompetitor diperbarui ✅');
    } else {
      const entry: CompetitorEntry = { id: uid(), ...trimDraft(draft) };
      persist([...competitors, entry]);
      toast('Kompetitor ditambahkan ✅');
    }
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function handleEdit(c: CompetitorEntry) {
    setEditingId(c.id);
    setDraft({
      name: c.name,
      handle: c.handle,
      followers: c.followers,
      strengths: c.strengths,
      weaknesses: c.weaknesses,
      opportunities: c.opportunities,
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function handleDelete(id: string) {
    persist(competitors.filter((c) => c.id !== id));
    if (editingId === id) handleCancelEdit();
    toast('Kompetitor dihapus');
  }

  function handleCopyAll() {
    if (!framework) return;
    copyText(auditToText(framework, competitors), 'Competitor Audit', toast);
  }

  function renderList(title: string, raw: string) {
    const items = lines(raw);
    if (!items.length) return null;
    return (
      <>
        <h4>{title}</h4>
        <ul className="chk">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </>
    );
  }

  if (!mounted) return null;

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Phase 1 · Fondasi Brand</span>
        <h1>Audit Kompetitor</h1>
        <p>
          Pelajari konten organik kompetitor DenanavBeauty Salon untuk menemukan
          celah yang bisa kita menangkan. Panduan di bawah disusun otomatis dari
          Profil Brand, lalu catat kompetitormu sendiri.
        </p>
      </section>

      {!brand || !framework ? (
        <section>
          <div className="card">
            <EmptyState
              big="🔍"
              title="Isi Profil Brand dulu"
              action={<Button href="/brand-setup">Isi Profil Brand →</Button>}
            >
              Panduan audit disusun dari data Profil Brand. Lengkapi profil brand
              dulu, lalu kembali ke sini untuk mulai mencatat kompetitor.
            </EmptyState>
          </div>
        </section>
      ) : (
        <>
          <section>
            <div className="card">
              <h2>Panduan Audit</h2>
              <div className="detail-box">{framework.intro}</div>
              <div className="btn-row" style={introBtnRow}>
                <Button variant="secondary" onClick={handleCopyAll}>
                  Salin semua (panduan + kompetitor)
                </Button>
              </div>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Apa yang dinilai</h2>
              {framework.focusAreas.map((f, i) => (
                <div className="detail-block" key={i}>
                  <div className="dh">
                    <h3>{f.area}</h3>
                  </div>
                  <p className="notion-muted">{f.question}</p>
                  <ul className="chk">
                    {f.lookFor.map((x, j) => (
                      <li key={j}>{x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Sinyal celah &amp; peluang</h2>
              <ul className="chk">
                {framework.gapSignals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Angle yang bisa kita menangkan</h2>
              <ul className="chk">
                {framework.ourAngles.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Tips audit</h2>
              <ul className="chk">
                {framework.tips.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>{editingId ? 'Edit kompetitor' : 'Tambah kompetitor'}</h2>
              <p className="notion-muted">
                Catat kompetitor satu per satu. Untuk Kekuatan, Kelemahan, dan
                Celah peluang, tulis satu poin per baris.
              </p>
              <div className="form-grid">
                <div className="field">
                  <label>
                    Nama kompetitor<span className="req"> *</span>
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Handle IG / FB</label>
                  <input
                    type="text"
                    value={draft.handle}
                    onChange={(e) => setField('handle', e.target.value)}
                    placeholder="@namasalon"
                  />
                </div>
                <div className="field">
                  <label>Jumlah followers</label>
                  <input
                    type="text"
                    value={draft.followers}
                    onChange={(e) => setField('followers', e.target.value)}
                    placeholder="mis. 4.200"
                  />
                </div>
                <div className="field full">
                  <label>Kekuatan</label>
                  <textarea
                    rows={3}
                    value={draft.strengths}
                    onChange={(e) => setField('strengths', e.target.value)}
                    placeholder="Satu poin per baris"
                  />
                  <p className="hint">Hal yang mereka lakukan dengan baik.</p>
                </div>
                <div className="field full">
                  <label>Kelemahan</label>
                  <textarea
                    rows={3}
                    value={draft.weaknesses}
                    onChange={(e) => setField('weaknesses', e.target.value)}
                    placeholder="Satu poin per baris"
                  />
                  <p className="hint">Hal yang kurang atau bisa diperbaiki.</p>
                </div>
                <div className="field full">
                  <label>Celah peluang untuk kita</label>
                  <textarea
                    rows={3}
                    value={draft.opportunities}
                    onChange={(e) => setField('opportunities', e.target.value)}
                    placeholder="Satu poin per baris"
                  />
                  <p className="hint">Hal yang bisa kita kerjakan lebih baik dari mereka.</p>
                </div>
              </div>
              <div className="btn-row" style={formBtnRow}>
                <Button onClick={handleSubmit}>
                  {editingId ? '💾 Simpan perubahan' : '➕ Tambah kompetitor'}
                </Button>
                {editingId ? (
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    Batal
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Daftar kompetitor ({competitors.length})</h2>
              {competitors.length === 0 ? (
                <p className="notion-muted">
                  Belum ada kompetitor. Tambahkan lewat form di atas.
                </p>
              ) : (
                competitors.map((c) => (
                  <div className="detail-block" key={c.id}>
                    <div className="dh">
                      <h3>{c.name}</h3>
                    </div>
                    <div className="chips">
                      {c.handle ? <span className="chip">{c.handle}</span> : null}
                      {c.followers ? (
                        <span className="chip">{c.followers} followers</span>
                      ) : null}
                    </div>
                    {renderList('Kekuatan', c.strengths)}
                    {renderList('Kelemahan', c.weaknesses)}
                    {renderList('Celah peluang untuk kita', c.opportunities)}
                    <div className="btn-row" style={itemBtnRow}>
                      <Button variant="ghost" size="small" onClick={() => handleEdit(c)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDelete(c.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      <section>
        <Note icon="📌">
          Audit ini fokus pada konten <strong>organik</strong> kompetitor untuk
          <strong> Facial Treatment</strong>. Tujuannya menemukan celah, bukan
          meniru. Semua data tersimpan lokal di browser ini.
        </Note>
      </section>

      <Footer />
    </>
  );
}
