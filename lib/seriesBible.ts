/*
 * seriesBible.ts
 * Module 1.1 — Brand DNA + Series Bible generator.
 * Builds a structured Series Bible (manifesto, positioning, persona + pain
 * points, visual DNA, caption framework, content pillars, posting strategy)
 * from the saved Brand Snapshot.
 *
 * Phase 1: derived locally from the brand data + content banks — NO real AI.
 * Future phases can replace generateSeriesBible with a real AI call while
 * keeping the same return shape.
 */
import { PILLARS, PILLAR_PLAN, TOPIC_BANK, HASHTAG_BANK } from '@/data/sampleContent';
import type { BrandSnapshot, SeriesBible, SeriesBiblePillar } from '@/types/content';
import { lines } from './utils';

/* Short descriptive library for the five known facial pillars. */
const PILLAR_LIBRARY: Record<string, { goal: string; description: string }> = {
  'Edukasi Facial': {
    goal: 'Awareness & otoritas lewat edukasi ringan.',
    description:
      'Konten yang menjelaskan dasar perawatan wajah dan jenis facial treatment dengan bahasa sederhana, supaya audience merasa terbantu sebelum memutuskan treatment.',
  },
  'Masalah & Solusi Kulit': {
    goal: 'Relevansi dengan keluhan nyata audience.',
    description:
      'Konten yang mengangkat keluhan kulit yang umum dialami (kusam, kasar, berminyak) lalu mengaitkannya dengan solusi facial treatment secara halus dan tidak menakut-nakuti.',
  },
  'Pengalaman Treatment': {
    goal: 'Trust lewat transparansi proses.',
    description:
      'Konten yang memperlihatkan suasana, proses, dan kebersihan treatment di salon agar calon customer merasa tenang dan tahu apa yang akan mereka alami.',
  },
  'Testimoni & Kepercayaan': {
    goal: 'Social proof & kredibilitas.',
    description:
      'Konten berisi cerita customer, FAQ, dan komitmen kebersihan untuk membangun kepercayaan calon customer baru.',
  },
  'Promo & Booking': {
    goal: 'Mendorong langkah konkret (konsultasi/booking).',
    description:
      'Konten yang mengajak audience mengambil langkah berikutnya: konsultasi, cek slot, atau booking facial treatment, tanpa terkesan memaksa.',
  },
};

function firstSentence(s: string): string {
  const t = (s || '').trim();
  if (!t) return '';
  const idx = t.indexOf('. ');
  return idx > 0 ? t.slice(0, idx + 1) : t;
}

export function generateSeriesBible(brand: BrandSnapshot): SeriesBible {
  const b = brand;
  const area = b.area || 'Kota Bima, NTB dan sekitarnya';
  const name = b.businessName || 'DenanavBeauty Salon';
  const price = b.entryPrice || 'Rp350.000';
  const service = b.mainService || 'Facial Treatment';

  const manifesto =
    name +
    ' hadir untuk membantu audience di ' +
    area +
    ' tampil lebih fresh, bersih, dan percaya diri melalui ' +
    service.toLowerCase() +
    ' yang nyaman, modern, dan mudah diakses. ' +
    (b.usp || '') +
    ' Setiap treatment selalu dijelaskan lebih dulu, sehingga customer merasa tenang dan terinformasi.';

  const positioning =
    'Untuk ' +
    (firstSentence(b.targetAudience) ||
      'wanita yang ingin wajah lebih fresh dan percaya diri.') +
    ' ' +
    name +
    ' adalah ' +
    (firstSentence(b.niche) ||
      'beauty salon lokal dengan fokus facial treatment.') +
    ' Yang membedakan kami adalah penekanan pada kenyamanan, kebersihan, dan edukasi sebelum setiap treatment.';

  const persona = {
    name: 'Calon Customer Facial (Persona Utama)',
    snapshot:
      (firstSentence(b.targetAudience) ||
        'Wanita di ' + area + ' yang ingin wajahnya terlihat lebih fresh dan terawat.') +
      ' Aktif di Instagram dan Facebook, dan sedang mencari tempat facial yang nyaman serta terpercaya di sekitar ' +
      area +
      '.',
    goals: [
      'Wajah terlihat lebih fresh, bersih, dan terawat.',
      'Tampil lebih percaya diri di keseharian maupun acara penting.',
      'Menemukan tempat facial yang nyaman, bersih, dan terpercaya di ' + area + '.',
    ],
    painPoints: [
      'Wajah terasa kusam, lelah, atau kurang fresh walau sudah cuci muka.',
      'Bingung memilih jenis facial yang cocok untuk kondisi kulitnya.',
      'Ragu karena belum tahu proses dan standar kebersihan tempat facial.',
      'Khawatir treatment terasa tidak nyaman atau hasilnya tidak sesuai harapan.',
      'Belum punya gambaran harga (facial treatment mulai ' + price + ').',
    ],
  };

  const visual = {
    primaryColor: b.primaryColor || 'White',
    secondaryColor: b.secondaryColor || 'Gold',
    style: b.visualStyle || 'Clean minimal',
    moodKeywords: [
      'Clean',
      'Minimal',
      'Terang & lembut',
      'Putih dengan aksen gold',
      'Elegan & menenangkan',
    ],
    dos: [
      'Gunakan nuansa putih bersih dengan sentuhan gold sebagai aksen.',
      'Pencahayaan terang dan lembut, dengan kesan natural.',
      'Tunjukkan kebersihan: handuk bersih, alat tertata rapi, ruangan rapi.',
      'Tampilkan ekspresi customer yang rileks dan nyaman.',
    ],
    donts: [
      'Hindari kesan klinis, dingin, atau menakutkan.',
      'Hindari visual gelap, berantakan, atau buram.',
      'Hindari menampilkan layanan di luar facial treatment.',
      'Hindari klaim hasil instan atau before-after yang berlebihan.',
    ],
  };

  const caption = {
    structure: [
      'Hook — kalimat pembuka yang relatable (1 baris).',
      'Konteks / Edukasi — jelaskan topik atau keluhan secara singkat.',
      'Solusi — kaitkan dengan facial treatment di ' + name + '.',
      'Reassurance — ingatkan bahwa hasil bisa berbeda, konsultasi dulu.',
      'CTA — ' + (b.primaryCTA || 'ajak konsultasi atau booking') + '.',
      'Lokasi + Hashtag — sebutkan ' + area + ' dan hashtag brand.',
    ],
    dos: [
      'Pakai bahasa ramah, edukatif, dan tidak hard selling.',
      'Selalu beri ruang untuk konsultasi sebelum treatment.',
      'Cantumkan lokasi (' + area + ') agar relevan secara lokal.',
    ],
    donts: [
      'Hindari klaim medis atau janji kesembuhan.',
      'Hindari kata berlebihan seperti pasti, permanen, atau 100%.',
      'Hindari menyebut layanan non-facial (rambut, makeup, bridal, spa tubuh).',
    ],
  };

  const pillarNames = lines(b.contentPillars);
  const usePillars = pillarNames.length ? pillarNames : (PILLARS as string[]);
  const pillars: SeriesBiblePillar[] = usePillars.map((p) => {
    const lib = PILLAR_LIBRARY[p];
    const bank = TOPIC_BANK[p];
    const angles = bank ? bank.slice(0, 3).map((x) => x.t) : [];
    return {
      name: p,
      goal: lib ? lib.goal : 'Mendukung fondasi konten organik brand.',
      description: lib
        ? lib.description
        : 'Pilar konten pendukung untuk memperkuat kehadiran organik ' + name + '.',
      exampleAngles: angles.length
        ? angles
        : ['Angkat satu topik spesifik dari pilar ini setiap minggu.'],
    };
  });

  const pillarRatio = PILLAR_PLAN.map((p) => ({
    pillar: p.pillar as string,
    count: p.count,
    pct: Math.round((p.count / 30) * 100) + '%',
  }));

  const postingStrategy = {
    cadence:
      '1 konten per hari selama 30 hari di ' +
      (b.platforms || 'Instagram, Facebook') +
      '.',
    formatMix: [
      'Reels — untuk jangkauan dan demonstrasi treatment.',
      'Carousel — untuk edukasi bertahap (step-by-step).',
      'Single Post — untuk satu pesan tunggal yang jelas.',
      'Stories — untuk keseharian, suasana salon, dan reminder.',
      'Live — sesekali untuk interaksi dan tanya jawab.',
    ],
    pillarRatio,
    tips: [
      'Mulai minggu pertama dengan edukasi dan awareness sebelum promosi.',
      'Selingi format agar tidak monoton (hindari 3 Reels berturut-turut).',
      'Posting di jam aktif audience lokal (pagi dan malam hari).',
      'Selalu sertakan CTA konsultasi atau booking yang lembut.',
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    businessName: name,
    tagline: b.tagline || '',
    manifesto: manifesto.replace(/\s+/g, ' ').trim(),
    positioning: positioning.replace(/\s+/g, ' ').trim(),
    toneOfVoice:
      b.toneOfVoice || 'Friendly, reassuring, clean, profesional, dan edukatif.',
    persona,
    visual,
    caption,
    pillars,
    postingStrategy,
    hashtags: HASHTAG_BANK.slice(),
  };
}

/** Build a plain-text version of the Series Bible for copy/export. */
export function seriesBibleToText(b: SeriesBible): string {
  const L: string[] = [];
  L.push('SERIES BIBLE — ' + b.businessName);
  if (b.tagline) L.push('Tagline: ' + b.tagline);
  L.push('');
  L.push('=== BRAND MANIFESTO ===');
  L.push(b.manifesto);
  L.push('');
  L.push('=== POSITIONING ===');
  L.push(b.positioning);
  L.push('');
  L.push('=== TONE OF VOICE ===');
  L.push(b.toneOfVoice);
  L.push('');
  L.push('=== AUDIENCE PERSONA & PAIN POINTS ===');
  L.push(b.persona.name);
  L.push(b.persona.snapshot);
  L.push('Tujuan & harapan:');
  b.persona.goals.forEach((g) => L.push('- ' + g));
  L.push('Pain points:');
  b.persona.painPoints.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== VISUAL DNA ===');
  L.push(
    'Warna utama: ' +
      b.visual.primaryColor +
      ' | Warna sekunder: ' +
      b.visual.secondaryColor,
  );
  L.push('Gaya: ' + b.visual.style);
  L.push('Mood: ' + b.visual.moodKeywords.join(', '));
  L.push('Lakukan:');
  b.visual.dos.forEach((g) => L.push('- ' + g));
  L.push('Hindari:');
  b.visual.donts.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== CAPTION FRAMEWORK ===');
  b.caption.structure.forEach((g, i) => L.push(i + 1 + '. ' + g));
  L.push('Lakukan:');
  b.caption.dos.forEach((g) => L.push('- ' + g));
  L.push('Hindari:');
  b.caption.donts.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== CONTENT PILLARS ===');
  b.pillars.forEach((p) => {
    L.push('* ' + p.name + ' — ' + p.goal);
    L.push('  ' + p.description);
    p.exampleAngles.forEach((a) => L.push('  - ' + a));
  });
  L.push('');
  L.push('=== POSTING STRATEGY ===');
  L.push('Kadensi: ' + b.postingStrategy.cadence);
  L.push('Format mix:');
  b.postingStrategy.formatMix.forEach((g) => L.push('- ' + g));
  L.push('Rasio pilar (30 hari):');
  b.postingStrategy.pillarRatio.forEach((r) =>
    L.push('- ' + r.pillar + ': ' + r.count + ' konten (' + r.pct + ')'),
  );
  L.push('Tips:');
  b.postingStrategy.tips.forEach((g) => L.push('- ' + g));
  L.push('');
  L.push('=== HASHTAG SET ===');
  L.push(b.hashtags.join(' '));
  return L.join('\n');
}
