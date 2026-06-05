/*
 * competitorAudit.ts
 * Module 1.2B — Competitor Organic Audit.
 * Builds an audit framework (what to evaluate + how to spot gaps) from the
 * saved Brand Snapshot, and provides a plain-text export that combines the
 * framework with the user-entered competitor notes.
 *
 * Phase 1: derived locally from brand data — NO real AI, no scraping.
 * Competitor entries are filled in manually by the user.
 * Future phases can replace generateAuditFramework with a real AI call while
 * keeping the same return shape.
 */
import { PILLARS } from '@/data/sampleContent';
import type {
  BrandSnapshot,
  AuditFramework,
  AuditFocusArea,
  CompetitorEntry,
} from '@/types/content';
import { lines } from './utils';

function firstSentence(s: string): string {
  const t = (s || '').trim();
  if (!t) return '';
  const idx = t.indexOf('. ');
  return idx > 0 ? t.slice(0, idx + 1) : t;
}

/* What to look at when auditing a competitor's organic content. */
const FOCUS_LIBRARY: AuditFocusArea[] = [
  {
    area: 'Positioning & Pesan',
    question: 'Bagaimana kompetitor memposisikan diri dan apa janji utamanya?',
    lookFor: [
      'Kalimat bio / headline dan tagline yang dipakai.',
      'Layanan facial yang paling sering ditonjolkan.',
      'Kata kunci yang sering diulang (mis. bersih, glowing, modern).',
    ],
  },
  {
    area: 'Content Pillars & Format',
    question: 'Tema dan format apa yang paling sering mereka pakai?',
    lookFor: [
      'Perbandingan konten edukasi vs promo vs testimoni.',
      'Format dominan (Reels, Carousel, Single Post, Stories).',
      'Topik yang selalu muncul dan topik yang tidak pernah disentuh.',
    ],
  },
  {
    area: 'Konsistensi & Frekuensi',
    question: 'Seberapa rutin dan konsisten mereka posting?',
    lookFor: [
      'Berapa kali posting per minggu.',
      'Apakah ada jeda panjang tanpa konten.',
      'Jam atau hari posting yang terlihat berpola.',
    ],
  },
  {
    area: 'Engagement & Komunitas',
    question: 'Bagaimana audience merespons dan bagaimana mereka membalas?',
    lookFor: [
      'Rata-rata like dan komentar dibanding jumlah followers.',
      'Apakah komentar dibalas dengan ramah.',
      'Pertanyaan audience yang sering muncul (peluang topik konten).',
    ],
  },
  {
    area: 'Visual & Branding',
    question: 'Seberapa rapi dan konsisten identitas visual mereka?',
    lookFor: [
      'Konsistensi warna, font, dan gaya foto.',
      'Kualitas pencahayaan dan kebersihan visual.',
      'Apakah feed terasa punya identitas atau terlihat acak.',
    ],
  },
  {
    area: 'Penawaran & CTA',
    question: 'Bagaimana mereka mengarahkan audience untuk booking?',
    lookFor: [
      'Jenis penawaran (harga, promo, paket) yang ditampilkan.',
      'Kejelasan CTA dan kemudahan cara booking.',
      'Apakah arahannya lembut atau justru hard selling.',
    ],
  },
];

const GAP_SIGNALS: string[] = [
  'Kompetitor jarang membuat konten edukasi, peluang jadi sumber edukasi facial yang tepercaya.',
  'Caption kompetitor cenderung hard selling, peluang pakai tone yang lebih hangat dan edukatif.',
  'Visual kompetitor kurang konsisten, peluang tampil dengan identitas visual yang rapi dan bersih.',
  'Sedikit testimoni atau bukti nyata, peluang membangun trust lewat cerita customer.',
  'CTA kompetitor tidak jelas, peluang memberi arahan booking yang mudah diikuti.',
  'Kompetitor tidak menonjolkan lokasi, peluang menang di pencarian lokal dengan menyebut area.',
];

const TIPS: string[] = [
  'Pilih 3-5 kompetitor: campur yang lebih besar dan yang setara dengan kita.',
  'Audit 2-4 minggu postingan terakhir, jangan hanya 1-2 konten.',
  'Catat pola yang berulang, bukan satu konten viral yang kebetulan.',
  'Fokus pada celah yang realistis untuk dikerjakan, bukan meniru semuanya.',
  'Perbarui audit ini setiap bulan agar tetap relevan.',
];

export function generateAuditFramework(brand: BrandSnapshot): AuditFramework {
  const b = brand;
  const name = b.businessName || 'DenanavBeauty Salon';
  const area = b.area || 'Kota Bima, NTB dan sekitarnya';
  const service = b.mainService || 'Facial Treatment';

  const intro =
    'Panduan audit ini membantu menilai konten organik kompetitor ' +
    name +
    ' di ' +
    area +
    ', khususnya untuk layanan ' +
    service.toLowerCase() +
    '. Tujuannya menemukan celah yang bisa kita menangkan, bukan meniru.';

  const ourAngles: string[] = [];
  if (b.usp) {
    ourAngles.push('Tonjolkan keunggulan kita: ' + firstSentence(b.usp));
  }
  const pillarNames = lines(b.contentPillars);
  const usePillars = pillarNames.length ? pillarNames : (PILLARS as string[]);
  usePillars.slice(0, 3).forEach((p) => {
    ourAngles.push('Perkuat pilar yang sering diabaikan kompetitor: ' + p + '.');
  });
  ourAngles.push('Menangkan pencarian lokal dengan selalu menyebut ' + area + '.');

  return {
    generatedAt: new Date().toISOString(),
    businessName: name,
    intro: intro.replace(/\s+/g, ' ').trim(),
    focusAreas: FOCUS_LIBRARY.map((f) => ({
      area: f.area,
      question: f.question,
      lookFor: f.lookFor.slice(),
    })),
    gapSignals: GAP_SIGNALS.slice(),
    ourAngles,
    tips: TIPS.slice(),
  };
}

/** Build a plain-text version of the audit (framework + competitors) for copy. */
export function auditToText(
  framework: AuditFramework,
  competitors: CompetitorEntry[],
): string {
  const L: string[] = [];
  L.push('COMPETITOR ORGANIC AUDIT — ' + framework.businessName);
  L.push(framework.intro);
  L.push('');
  L.push('=== APA YANG DINILAI ===');
  framework.focusAreas.forEach((f, i) => {
    L.push(i + 1 + '. ' + f.area + ' — ' + f.question);
    f.lookFor.forEach((x) => L.push('   - ' + x));
  });
  L.push('');
  L.push('=== SINYAL CELAH / PELUANG ===');
  framework.gapSignals.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== ANGLE YANG BISA KITA MENANGKAN ===');
  framework.ourAngles.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== TIPS AUDIT ===');
  framework.tips.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== DAFTAR KOMPETITOR ===');
  if (!competitors.length) {
    L.push('(Belum ada kompetitor yang dicatat.)');
  } else {
    competitors.forEach((c, i) => {
      L.push('');
      L.push(i + 1 + '. ' + (c.name || '(tanpa nama)'));
      if (c.handle) L.push('   Handle: ' + c.handle);
      if (c.followers) L.push('   Followers: ' + c.followers);
      const s = lines(c.strengths);
      const w = lines(c.weaknesses);
      const o = lines(c.opportunities);
      if (s.length) {
        L.push('   Kekuatan:');
        s.forEach((x) => L.push('   - ' + x));
      }
      if (w.length) {
        L.push('   Kelemahan:');
        w.forEach((x) => L.push('   - ' + x));
      }
      if (o.length) {
        L.push('   Celah peluang untuk kita:');
        o.forEach((x) => L.push('   - ' + x));
      }
    });
  }
  return L.join('\n');
}
