/*
 * kolBrief.ts
 * Module 1.2C — KOL / UGC Brief Template.
 * Builds a collaboration brief (goal, core message, must-mention points,
 * content angles, do & don't, deliverables, hashtags) from the saved Brand
 * Snapshot, and provides a plain-text export combining the brief with the
 * user-entered list of KOLs / creators.
 *
 * Phase 1: derived locally from brand data — NO real AI, no outreach.
 * KOL entries are filled in manually by the user.
 * Future phases can replace generateKolBrief with a real AI call while
 * keeping the same return shape.
 */
import { PILLARS, TOPIC_BANK, HASHTAG_BANK } from '@/data/sampleContent';
import type { BrandSnapshot, KolBrief, KolEntry } from '@/types/content';
import { lines } from './utils';

/** Pipeline stages for tracking each KOL / creator. */
export const KOL_STATUSES = ['Prospek', 'Dihubungi', 'Negosiasi', 'Deal', 'Selesai'];

function firstSentence(s: string): string {
  const t = (s || '').trim();
  if (!t) return '';
  const idx = t.indexOf('. ');
  return idx > 0 ? t.slice(0, idx + 1) : t;
}

export function generateKolBrief(brand: BrandSnapshot): KolBrief {
  const b = brand;
  const name = b.businessName || 'DenanavBeauty Salon';
  const area = b.area || 'Kota Bima, NTB dan sekitarnya';
  const service = b.mainService || 'Facial Treatment';

  const campaignGoal =
    'Bekerja sama dengan KOL atau kreator lokal yang relevan untuk meningkatkan ' +
    'awareness dan trust ' +
    name +
    ' di ' +
    area +
    ', khususnya untuk ' +
    service.toLowerCase() +
    '. Fokus pada konten yang jujur dan edukatif, bukan hard selling.';

  const coreMessage =
    firstSentence(b.usp) ||
    name +
      ' membantu wajah terlihat lebih fresh, bersih, dan percaya diri lewat facial treatment yang nyaman dan modern.';

  const audience =
    firstSentence(b.targetAudience) ||
    'Wanita di ' + area + ' yang ingin wajahnya terlihat lebih fresh dan terawat.';

  const mustMention: string[] = [
    'Nama brand: ' + name + '.',
    'Lokasi: ' + area + '.',
    b.primaryCTA
      ? 'Ajakan (CTA): ' + b.primaryCTA + '.'
      : 'Ajakan (CTA): konsultasi atau booking.',
    'Selalu ingatkan untuk konsultasi dulu sebelum treatment.',
  ];
  if (b.entryPrice) {
    mustMention.push('Harga facial mulai ' + b.entryPrice + ' (sebut bila relevan).');
  }

  const pillarNames = lines(b.contentPillars);
  const usePillars = pillarNames.length ? pillarNames : (PILLARS as string[]);
  const contentAngles: string[] = [];
  usePillars.slice(0, 4).forEach((p) => {
    const bank = TOPIC_BANK[p];
    if (bank && bank.length) {
      contentAngles.push(p + ': ' + bank[0].t);
    } else {
      contentAngles.push('Angkat satu topik nyata dari pilar ' + p + '.');
    }
  });
  contentAngles.push('Review jujur pengalaman facial pertama di ' + name + '.');

  const dos: string[] = [
    'Gunakan tone yang ramah, jujur, dan edukatif sesuai gaya brand.',
    'Tunjukkan pengalaman nyata: suasana, kebersihan, dan kenyamanan saat treatment.',
    'Jelaskan manfaat dengan bahasa sederhana, bukan klaim medis.',
    'Sertakan ajakan lembut untuk konsultasi atau booking.',
    'Sebut dan tag akun brand serta lokasi (' + area + ').',
  ];

  const donts: string[] = [
    'Hindari klaim medis atau janji hasil instan maupun permanen.',
    'Hindari kata berlebihan seperti pasti, 100%, atau menyembuhkan.',
    'Hindari menyebut layanan di luar facial treatment.',
    'Hindari tone hard selling yang memaksa.',
    'Hindari membandingkan secara negatif dengan salon lain.',
  ];

  const deliverables: string[] = [
    'Format utama: 1 Reels 30-60 detik (rekomendasi).',
    'Tambahan: 2-3 Stories (behind the scene + ajakan).',
    'Sebut dan tag akun brand di caption dan di video.',
    'Kirim draft untuk review sebelum tayang (maksimal 1-2 kali revisi).',
    'Sertakan raw footage bila memungkinkan.',
    'Tentukan tanggal tayang dan deadline bersama.',
  ];

  return {
    generatedAt: new Date().toISOString(),
    businessName: name,
    campaignGoal: campaignGoal.replace(/\s+/g, ' ').trim(),
    coreMessage: coreMessage.replace(/\s+/g, ' ').trim(),
    audience: audience.replace(/\s+/g, ' ').trim(),
    mustMention,
    contentAngles,
    dos,
    donts,
    deliverables,
    hashtags: HASHTAG_BANK.slice(),
  };
}

/** Build a plain-text version of the brief (+ KOL list) for copy / export. */
export function kolBriefToText(brief: KolBrief, kols: KolEntry[]): string {
  const L: string[] = [];
  L.push('KOL / UGC BRIEF — ' + brief.businessName);
  L.push('');
  L.push('=== TUJUAN ===');
  L.push(brief.campaignGoal);
  L.push('');
  L.push('=== PESAN UTAMA ===');
  L.push(brief.coreMessage);
  L.push('');
  L.push('=== TARGET AUDIENCE ===');
  L.push(brief.audience);
  L.push('');
  L.push('=== WAJIB DISEBUT ===');
  brief.mustMention.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== ANGLE KONTEN ===');
  brief.contentAngles.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== LAKUKAN ===');
  brief.dos.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== HINDARI ===');
  brief.donts.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== DELIVERABLES & TEKNIS ===');
  brief.deliverables.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== HASHTAG ===');
  L.push(brief.hashtags.join(' '));
  L.push('');
  L.push('=== DAFTAR KOL / KREATOR ===');
  if (!kols.length) {
    L.push('(Belum ada KOL yang dicatat.)');
  } else {
    kols.forEach((k, i) => {
      L.push('');
      L.push(i + 1 + '. ' + (k.name || '(tanpa nama)') + ' [' + (k.status || 'Prospek') + ']');
      if (k.platform) L.push('   Platform: ' + k.platform);
      if (k.followers) L.push('   Followers: ' + k.followers);
      if (k.contentType) L.push('   Jenis konten: ' + k.contentType);
      const n = lines(k.notes);
      if (n.length) {
        L.push('   Catatan:');
        n.forEach((x) => L.push('   - ' + x));
      }
    });
  }
  return L.join('\n');
}
