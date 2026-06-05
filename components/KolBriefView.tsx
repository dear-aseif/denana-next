'use client';

/*
 * KolBriefView (Module 1.2C — KOL / UGC Brief)
 * Shows a collaboration brief generated from the saved Brand Snapshot (goal,
 * core message, must-mention points, content angles, do & don't, deliverables,
 * hashtags), plus a manual tool to track KOLs / creators and their status.
 * KOL entries are saved locally and can be copied as plain text.
 */
import React, { useEffect, useState } from 'react';
import type { BrandSnapshot, KolBrief, KolEntry } from '@/types/content';
import { getBrand, getKols, saveKols } from '@/lib/storage';
import { generateKolBrief, kolBriefToText, KOL_STATUSES } from '@/lib/kolBrief';
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
  platform: string;
  followers: string;
  contentType: string;
  status: string;
  notes: string;
};

const emptyDraft: Draft = {
  name: '',
  platform: '',
  followers: '',
  contentType: '',
  status: 'Prospek',
  notes: '',
};

function trimDraft(d: Draft) {
  return {
    name: d.name.trim(),
    platform: d.platform.trim(),
    followers: d.followers.trim(),
    contentType: d.contentType.trim(),
    status: d.status,
    notes: d.notes.trim(),
  };
}

export default function KolBriefView() {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState<BrandSnapshot | null>(null);
  const [kols, setKols] = useState<KolEntry[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setBrand(getBrand());
    setKols(getKols());
    setMounted(true);
  }, []);

  const brief: KolBrief | null = brand ? generateKolBrief(brand) : null;

  function setField(key: keyof Draft, v: string) {
    setDraft((prev) => ({ ...prev, [key]: v }));
  }

  function persist(rows: KolEntry[]) {
    setKols(rows);
    saveKols(rows);
  }

  function handleSubmit() {
    if (!draft.name.trim()) {
      toast('Isi minimal nama KOL dulu');
      return;
    }
    if (editingId) {
      const rows = kols.map((k) =>
        k.id === editingId ? { ...k, ...trimDraft(draft), id: editingId } : k,
      );
      persist(rows);
      toast('KOL diperbarui ✅');
    } else {
      const entry: KolEntry = { id: uid(), ...trimDraft(draft) };
      persist([...kols, entry]);
      toast('KOL ditambahkan ✅');
    }
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function handleEdit(k: KolEntry) {
    setEditingId(k.id);
    setDraft({
      name: k.name,
      platform: k.platform,
      followers: k.followers,
      contentType: k.contentType,
      status: k.status || 'Prospek',
      notes: k.notes,
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
    persist(kols.filter((k) => k.id !== id));
    if (editingId === id) handleCancelEdit();
    toast('KOL dihapus');
  }

  function handleCopyAll() {
    if (!brief) return;
    copyText(kolBriefToText(brief, kols), 'KOL Brief', toast);
  }

  if (!mounted) return null;

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Phase 1 · Fondasi Brand</span>
        <h1>KOL / UGC Brief</h1>
        <p>
          Template brief untuk mengajak KOL atau kreator lokal membuat konten
          tentang DenanavBeauty Salon. Brief di bawah disusun otomatis dari Profil
          Brand, lalu catat daftar KOL yang ingin diajak kerja sama.
        </p>
      </section>

      {!brand || !brief ? (
        <section>
          <div className="card">
            <EmptyState
              big="🤝"
              title="Isi Profil Brand dulu"
              action={<Button href="/brand-setup">Isi Profil Brand →</Button>}
            >
              Brief KOL disusun dari data Profil Brand. Lengkapi profil brand dulu,
              lalu kembali ke sini untuk membuatnya dan mencatat KOL.
            </EmptyState>
          </div>
        </section>
      ) : (
        <>
          <section>
            <div className="card">
              <h2>Brief KOL / UGC</h2>
              <h3>Tujuan</h3>
              <div className="detail-box">{brief.campaignGoal}</div>
              <h3>Pesan utama</h3>
              <div className="detail-box">{brief.coreMessage}</div>
              <h3>Target audience</h3>
              <div className="detail-box">{brief.audience}</div>
              <div className="btn-row" style={introBtnRow}>
                <Button variant="secondary" onClick={handleCopyAll}>
                  Salin semua (brief + daftar KOL)
                </Button>
              </div>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Wajib disebut</h2>
              <ul className="chk">
                {brief.mustMention.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Angle konten yang disarankan</h2>
              <ul className="chk">
                {brief.contentAngles.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Do &amp; Don't</h2>
              <h3>Lakukan</h3>
              <ul className="chk">
                {brief.dos.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
              <h3>Hindari</h3>
              <ul className="chk">
                {brief.donts.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Deliverables &amp; ketentuan teknis</h2>
              <ul className="chk">
                {brief.deliverables.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>Hashtag</h2>
              <div className="tag-list">
                {brief.hashtags.map((h, i) => (
                  <span className="tag" key={i}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="card">
              <h2>{editingId ? 'Edit KOL / kreator' : 'Tambah KOL / kreator'}</h2>
              <p className="notion-muted">
                Catat KOL atau kreator yang ingin diajak kerja sama, satu per satu.
              </p>
              <div className="form-grid">
                <div className="field">
                  <label>
                    Nama KOL / kreator<span className="req"> *</span>
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Platform</label>
                  <input
                    type="text"
                    value={draft.platform}
                    onChange={(e) => setField('platform', e.target.value)}
                    placeholder="Instagram / TikTok"
                  />
                </div>
                <div className="field">
                  <label>Jumlah followers</label>
                  <input
                    type="text"
                    value={draft.followers}
                    onChange={(e) => setField('followers', e.target.value)}
                    placeholder="mis. 12.000"
                  />
                </div>
                <div className="field">
                  <label>Jenis konten</label>
                  <input
                    type="text"
                    value={draft.contentType}
                    onChange={(e) => setField('contentType', e.target.value)}
                    placeholder="Reels review / Story"
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) => setField('status', e.target.value)}
                  >
                    {KOL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field full">
                  <label>Catatan</label>
                  <textarea
                    rows={3}
                    value={draft.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    placeholder="Satu poin per baris (kontak, rate, ide konten, dll)"
                  />
                  <p className="hint">Tulis satu poin per baris.</p>
                </div>
              </div>
              <div className="btn-row" style={formBtnRow}>
                <Button onClick={handleSubmit}>
                  {editingId ? '💾 Simpan perubahan' : '➕ Tambah KOL'}
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
              <h2>Daftar KOL / kreator ({kols.length})</h2>
              {kols.length === 0 ? (
                <p className="notion-muted">
                  Belum ada KOL. Tambahkan lewat form di atas.
                </p>
              ) : (
                kols.map((k) => (
                  <div className="detail-block" key={k.id}>
                    <div className="dh">
                      <h3>{k.name}</h3>
                    </div>
                    <div className="chips">
                      <span className="chip">{k.status || 'Prospek'}</span>
                      {k.platform ? <span className="chip">{k.platform}</span> : null}
                      {k.followers ? (
                        <span className="chip">{k.followers} followers</span>
                      ) : null}
                      {k.contentType ? (
                        <span className="chip">{k.contentType}</span>
                      ) : null}
                    </div>
                    {lines(k.notes).length ? (
                      <ul className="chk">
                        {lines(k.notes).map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="btn-row" style={itemBtnRow}>
                      <Button variant="ghost" size="small" onClick={() => handleEdit(k)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDelete(k.id)}
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
          Brief ini untuk kerja sama konten seputar <strong>Facial Treatment</strong>.
          Jaga tone tetap jujur dan edukatif, hindari klaim medis. Semua data
          tersimpan lokal di browser ini.
        </Note>
      </section>

      <Footer />
    </>
  );
}
