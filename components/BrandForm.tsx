'use client';

/*
 * BrandForm (Profil Brand)
 * Ported from renderBrandSetup() + saveBrandForm() in the prototype.
 * Fields are driven by BRAND_FIELDS data; required-field validation and the
 * "Kembalikan ke default" reset behavior are preserved.
 */
import React, { useEffect, useState } from 'react';
import { BRAND_FIELDS, defaultBrandSnapshot } from '@/data/sampleContent';
import type { BrandSnapshot } from '@/types/content';
import { getBrand, saveBrand } from '@/lib/storage';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';

const btnRowStyle: React.CSSProperties = { marginTop: 22 };

export default function BrandForm() {
  const toast = useToast();
  const [values, setValues] = useState<BrandSnapshot>(defaultBrandSnapshot);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getBrand();
    setValues({ ...defaultBrandSnapshot, ...(stored || {}) });
    setMounted(true);
  }, []);

  function setField(key: keyof BrandSnapshot, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function handleSave() {
    const nextInvalid: Record<string, boolean> = {};
    let firstInvalid: string | null = null;
    BRAND_FIELDS.forEach((f) => {
      const v = (values[f.key] || '').trim();
      if (f.req && !v) {
        nextInvalid[f.key] = true;
        if (!firstInvalid) firstInvalid = f.key;
      }
    });
    setInvalid(nextInvalid);
    if (firstInvalid) {
      const el = document.querySelector('.field[data-field="' + firstInvalid + '"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Lengkapi dulu field wajib (*)');
      return;
    }
    const trimmed = {} as BrandSnapshot;
    (Object.keys(values) as Array<keyof BrandSnapshot>).forEach((k) => {
      trimmed[k] = (values[k] || '').trim();
    });
    saveBrand(trimmed);
    toast('Profil brand tersimpan ✅');
  }

  function handleReset() {
    if (
      !window.confirm(
        'Semua data di form akan dikembalikan ke contoh awal. Lanjutkan?',
      )
    )
      return;
    setValues({ ...defaultBrandSnapshot });
    setInvalid({});
    toast('Form dikembalikan ke contoh awal.');
  }

  if (!mounted) return null;

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Profil</span>
        <h1>Pengaturan Profil Salon</h1>
        <p>
          Ubah dan simpan detail profil DenanavBeauty Salon kapan saja. Data ini
          dipakai untuk membuat rencana konten dan caption. Tersimpan otomatis di
          perangkat ini.
        </p>
      </section>
      <section>
        <div className="card">
          <div className="form-grid">
            {BRAND_FIELDS.map((f) => {
              const fieldClass =
                'field' +
                (f.full ? ' full' : '') +
                (invalid[f.key] ? ' invalid' : '');
              return (
                <div className={fieldClass} data-field={f.key} key={f.key}>
                  <label>
                    {f.label}
                    {f.req ? <span className="req"> *</span> : null}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={values[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  )}
                  <p className="hint">{f.hint}</p>
                </div>
              );
            })}
          </div>
          <div className="btn-row" style={btnRowStyle}>
            <Button onClick={handleSave}>💾 Simpan Profil Brand</Button>
            <Button variant="ghost" onClick={handleReset}>
              Kembalikan ke default
            </Button>
          </div>
        </div>
      </section>
      <section>
        <Note icon="🧴">
          Layanan pada MVP ini dibatasi hanya <strong>Facial Treatment</strong>.
          Jangan menambahkan layanan rambut, makeup, bridal, nail, atau spa tubuh.
        </Note>
      </section>
      <Footer />
    </>
  );
}
