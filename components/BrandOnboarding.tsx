'use client';

/*
 * BrandOnboarding (Phase 1.5A — Guided brand setup)
 * Step-by-step guided brand setup with selectable suggestions. Saves the SAME
 * BrandSnapshot structure to localStorage so the generator and tools keep
 * working unchanged. It never alters the data model, generator, or core funcs.
 *
 * Two render modes:
 *  - Standalone (default): used as an edit/setup surface with its own page-head,
 *    scope note, footer, and an internal success screen.
 *  - Embedded (embedded + onComplete): used inside the full-screen first-run
 *    flow. Renders only the wizard card and calls onComplete() after saving,
 *    letting the parent advance to the next phase (campaign).
 */
import React, { useEffect, useState } from 'react';
import { defaultBrandSnapshot, PILLARS } from '@/data/sampleContent';
import type { BrandSnapshot } from '@/types/content';
import { saveBrand } from '@/lib/storage';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';

const TOTAL_STEPS = 5;

const SERVICE_OPTIONS = [
  'Microdermabrasion',
  'Hydra Peel',
  'Totok wajah',
  'Facial treatment rutin',
];

const REASON_OPTIONS = [
  'Ruangan nyaman dan bersih',
  'Treatment dijelaskan dulu sebelum mulai',
  'Cocok untuk self-care rutin',
  'Lokasi mudah dijangkau di Kota Bima',
  'Harga mulai Rp350.000',
  'Pelayanan ramah dan tidak terburu-buru',
];

const TONE_OPTIONS = [
  'Ramah dan menenangkan',
  'Profesional tapi tetap hangat',
  'Edukatif dan tidak hard selling',
  'Simple dan mudah dipahami',
];

const VISUAL_OPTIONS = [
  'Bersih dan minimalis',
  'Hangat dan elegan',
  'Natural dan soft',
  'White & gold clean look',
];

const headStyle: React.CSSProperties = { marginTop: 0 };
const leadStyle: React.CSSProperties = { marginTop: 0, marginBottom: 14 };
const fieldSpacer: React.CSSProperties = { marginTop: 16 };
const errStyle: React.CSSProperties = {
  color: '#c0561f',
  fontSize: 13,
  marginTop: 14,
  marginBottom: 0,
};
const navRowStyle: React.CSSProperties = { marginTop: 22 };
const successBtnRow: React.CSSProperties = { justifyContent: 'center', marginTop: 18 };

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function joinNatural(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ', dan ' + items[items.length - 1];
}

function buildUsp(businessName: string, reasons: string[]): string {
  const name = (businessName || 'Salon kami').trim();
  if (reasons.length === 0) return defaultBrandSnapshot.usp;
  return name + ' dipilih karena ' + joinNatural(reasons.map(lowerFirst)) + '.';
}

export default function BrandOnboarding({
  onUseManualForm,
  embedded = false,
  onComplete,
}: {
  onUseManualForm?: () => void;
  embedded?: boolean;
  onComplete?: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  // Step 1 — Identitas Usaha
  const [businessName, setBusinessName] = useState(defaultBrandSnapshot.businessName);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [area, setArea] = useState(defaultBrandSnapshot.area);

  // Step 2 — Layanan Utama
  const [services, setServices] = useState<string[]>([
    'Microdermabrasion',
    'Hydra Peel',
    'Totok wajah',
  ]);

  // Step 3 — Alasan customer memilih (USP)
  const [reasons, setReasons] = useState<string[]>([
    'Ruangan nyaman dan bersih',
    'Treatment dijelaskan dulu sebelum mulai',
  ]);
  const [uspText, setUspText] = useState('');
  const [uspEdited, setUspEdited] = useState(false);

  // Step 4 — Gaya komunikasi & visual
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [visual, setVisual] = useState(VISUAL_OPTIONS[0]);

  // Step 5 — Topik konten utama (content pillars)
  const [pillars, setPillars] = useState<string[]>([...PILLARS]);

  // Keep the USP text in sync with selected reasons until the user edits it.
  useEffect(() => {
    if (!uspEdited) setUspText(buildUsp(businessName, reasons));
  }, [businessName, reasons, uspEdited]);

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  function finish() {
    const profile: BrandSnapshot = {
      ...defaultBrandSnapshot,
      businessName: businessName.trim() || defaultBrandSnapshot.businessName,
      instagramHandle: instagramHandle.trim(),
      area: area.trim() || defaultBrandSnapshot.area,
      mainService: 'Facial Treatment',
      serviceDetails: services.join('\n'),
      usp: uspText.trim() || defaultBrandSnapshot.usp,
      toneOfVoice: tone,
      visualStyle: visual,
      contentPillars: pillars.join('\n'),
    };
    if (visual === 'White & gold clean look') {
      profile.primaryColor = 'White';
      profile.secondaryColor = 'Gold';
    }
    saveBrand(profile);
    toast('Profil usaha tersimpan ✅');
    if (onComplete) {
      onComplete();
      return;
    }
    setDone(true);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  function next() {
    setErr('');
    if (step === 1 && (!businessName.trim() || !area.trim())) {
      setErr('Isi nama usaha dan kota/wilayah layanan dulu ya.');
      return;
    }
    if (step === 2 && services.length === 0) {
      setErr('Pilih minimal satu layanan facial.');
      return;
    }
    if (step === 5) {
      if (pillars.length === 0) {
        setErr('Pilih minimal satu topik konten.');
        return;
      }
      finish();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  function back() {
    setErr('');
    setStep((s) => Math.max(1, s - 1));
  }

  /* ---------- Standalone success screen ---------- */
  if (done && !embedded) {
    return (
      <>
        <section>
          <div className="card">
            <div className="ob-success">
              <div className="big">🎉</div>
              <h2>Profil usaha siap!</h2>
              <p className="notion-muted">
                Profil <strong>{businessName.trim() || 'usahamu'}</strong> sudah
                tersimpan. Sekarang kamu bisa lanjut membuat rencana campaign untuk
                bulan ini.
              </p>
              <div className="btn-row" style={successBtnRow}>
                <Button href="/campaign-setup">Lanjut buat rencana campaign bulan ini →</Button>
                <Button href="/" variant="ghost">
                  Nanti dulu, ke Home
                </Button>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const barFillStyle: React.CSSProperties = { width: pct + '%' };

  const wizard = (
    <section>
      <div className="card">
        {/* Progress */}
        <div className="ob-progress">
          <div className="ob-bar">
            <div className="ob-bar-fill" style={barFillStyle} />
          </div>
          <span className="ob-progress-label">Langkah {step} dari {TOTAL_STEPS}</span>
        </div>

        {/* Step 1 — Identitas Usaha */}
        {step === 1 && (
          <div>
            <h3 style={headStyle}>1. Identitas Usaha</h3>
            <p className="notion-muted" style={leadStyle}>
              Info dasar yang akan tampil di konten.
            </p>
            <div className="form-grid">
              <div className="field">
                <label>Nama usaha <span className="req">*</span></label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: DenanavBeauty Salon"
                />
              </div>
              <div className="field">
                <label>Username Instagram</label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="Contoh: @denanavbeauty (opsional)"
                />
              </div>
              <div className="field full">
                <label>Kota / Wilayah layanan <span className="req">*</span></label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Contoh: Kota Bima, NTB dan sekitarnya"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Layanan Utama */}
        {step === 2 && (
          <div>
            <h3 style={headStyle}>2. Layanan Utama</h3>
            <p className="notion-muted" style={leadStyle}>
              Fokus utama tetap <strong>Facial Treatment</strong>. Pilih layanan yang
              kamu tawarkan (boleh lebih dari satu).
            </p>
            <div className="ob-choices">
              {SERVICE_OPTIONS.map((opt) => {
                const on = services.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    className={'ob-choice' + (on ? ' on' : '')}
                    onClick={() => toggle(services, setServices, opt)}
                  >
                    {on ? <span className="ob-check">✓</span> : null}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — Alasan Customer Memilih */}
        {step === 3 && (
          <div>
            <h3 style={headStyle}>3. Kenapa customer memilih salonmu?</h3>
            <p className="notion-muted" style={leadStyle}>
              Pilih hal-hal yang membuat salonmu spesial. Kami akan merangkainya jadi
              satu kalimat keunggulan — bisa kamu ubah di bawah.
            </p>
            <div className="ob-choices">
              {REASON_OPTIONS.map((opt) => {
                const on = reasons.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    className={'ob-choice' + (on ? ' on' : '')}
                    onClick={() => toggle(reasons, setReasons, opt)}
                  >
                    {on ? <span className="ob-check">✓</span> : null}
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="field full" style={fieldSpacer}>
              <label>Kalimat keunggulan (boleh diedit)</label>
              <textarea
                rows={3}
                value={uspText}
                onChange={(e) => {
                  setUspText(e.target.value);
                  setUspEdited(true);
                }}
              />
              <p className="hint">
                Otomatis dibuat dari pilihanmu. Ubah jika ingin lebih sesuai.
              </p>
            </div>
          </div>
        )}

        {/* Step 4 — Gaya Komunikasi & Visual */}
        {step === 4 && (
          <div>
            <h3 style={headStyle}>4. Gaya komunikasi &amp; visual</h3>
            <p className="notion-muted" style={leadStyle}>
              Pilih satu gaya bahasa dan satu gaya visual yang paling cocok.
            </p>
            <div className="ob-group">
              <h4>Gaya bahasa (tone)</h4>
              <div className="ob-choices">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={'ob-choice' + (tone === opt ? ' on' : '')}
                    onClick={() => setTone(opt)}
                  >
                    {tone === opt ? <span className="ob-check">✓</span> : null}
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="ob-group">
              <h4>Gaya visual</h4>
              <div className="ob-choices">
                {VISUAL_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={'ob-choice' + (visual === opt ? ' on' : '')}
                    onClick={() => setVisual(opt)}
                  >
                    {visual === opt ? <span className="ob-check">✓</span> : null}
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Topik Konten Utama */}
        {step === 5 && (
          <div>
            <h3 style={headStyle}>5. Topik konten utama</h3>
            <p className="notion-muted" style={leadStyle}>
              Ini tema yang akan sering muncul di kontenmu. Pilih yang ingin kamu
              fokuskan (disarankan pilih semua).
            </p>
            <div className="ob-choices">
              {PILLARS.map((opt) => {
                const on = pillars.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    className={'ob-choice' + (on ? ' on' : '')}
                    onClick={() => toggle(pillars, setPillars, opt)}
                  >
                    {on ? <span className="ob-check">✓</span> : null}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {err ? <p style={errStyle}>{err}</p> : null}

        {/* Navigation */}
        <div className="btn-row" style={navRowStyle}>
          {step > 1 ? (
            <Button variant="ghost" onClick={back}>
              ← Kembali
            </Button>
          ) : null}
          <Button onClick={next}>
            {step === TOTAL_STEPS ? (embedded ? 'Lanjut ke campaign →' : 'Selesai & Simpan ✅') : 'Lanjut →'}
          </Button>
          {onUseManualForm && !embedded ? (
            <Button variant="ghost" size="tiny" onClick={onUseManualForm}>
              Isi manual (form lengkap)
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );

  if (embedded) return wizard;

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Selamat datang</span>
        <h1>Yuk siapkan profil usahamu</h1>
        <p>
          Jawab beberapa pertanyaan singkat. Pilih saja dari saran yang tersedia —
          nanti tetap bisa kamu ubah kapan saja.
        </p>
      </section>

      {wizard}

      <section>
        <Note icon="🧴">
          Layanan pada aplikasi ini fokus pada <strong>Facial Treatment</strong>. Semua
          jawaban tersimpan di perangkat ini dan bisa diubah lagi lewat{' '}
          <strong>Pengaturan Profil Salon</strong>.
        </Note>
      </section>

      <Footer />
    </>
  );
}
