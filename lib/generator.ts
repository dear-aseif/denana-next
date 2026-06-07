/*
 * generator.ts
 * The mock content engine ported verbatim from the prototype.
 * Phase 1 generates a 30-day calendar and per-item detail (caption, script,
 * visual direction, checklist) from the local content banks — NO real AI.
 *
 * Future phases can replace generateCalendar / generateDetail with calls to a
 * real AI service while keeping the same return shapes.
 */
import {
  PILLARS,
  PILLAR_PLAN,
  TOPIC_BANK,
  CTA_BANK,
  HASHTAG_BANK,
  FIRST_WEEK_FORMATS,
} from '@/data/sampleContent';
import type {
  BrandSnapshot,
  Campaign,
  ContentRow,
  ContentDetail,
} from '@/types/content';
import { toISO, dayName, uid } from './utils';

/* ============================================================
   BATCH 3 — Content variation helpers (deterministic, no AI)
   Reduces repetitive captions & video scripts by rotating
   brand-consistent variations and adapting to treatment type.
   ============================================================ */
type TreatmentType = 'Microdermabrasion' | 'Hydra Peel' | 'Totok wajah' | 'General';

/* Detect the treatment a content idea is about, from its topic + hook. */
function detectTreatment(text: string): TreatmentType {
  const s = (text || '').toLowerCase();
  if (s.includes('hydra peel') || s.includes('hydrapeel')) return 'Hydra Peel';
  if (s.includes('microdermabrasion') || s.includes('mikrodermabrasi'))
    return 'Microdermabrasion';
  if (s.includes('totok')) return 'Totok wajah';
  return 'General';
}

/* Stable seed from a string so the same idea always picks the same
   variation (keeps regenerate / saved drafts predictable). */
function variationSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* 5 brand-consistent caption middle paragraphs, rotated across the 30 days. */
const CAPTION_BODIES: string[] = [
  'Di DenanavBeauty Salon, kami fokus membantu wajah terlihat lebih fresh dan bersih lewat facial treatment yang nyaman. Setiap langkah dijelaskan dulu sebelum dimulai, jadi kamu bisa lebih rileks.',
  'Lewat facial treatment di DenanavBeauty Salon, kami bantu merawat kulit wajahmu dengan cara yang lembut. Suasana salon dibuat tenang supaya kamu nyaman dari awal sampai selesai.',
  'Di DenanavBeauty Salon, perawatan wajah bukan cuma soal tampilan, tapi juga pengalaman yang menyenangkan. Tim kami siap bantu pilih treatment yang sesuai dengan kondisi kulitmu.',
  'Kami percaya perawatan wajah yang baik dimulai dari kenyamanan. Karena itu setiap facial treatment di DenanavBeauty Salon dilakukan perlahan dengan alat yang bersih dan terjaga.',
  'Facial treatment di DenanavBeauty Salon dibuat untuk membantu kulit terasa lebih segar dan terawat. Kebersihan dan kenyamanan selalu kami utamakan di setiap kunjungan.',
];

/* Soft, treatment-specific sentence added to the body (no medical claims,
   no guaranteed results). */
const TREATMENT_CAPTION_LINE: Record<TreatmentType, string> = {
  Microdermabrasion:
    'Microdermabrasion membantu mengangkat sel kulit mati secara lembut sehingga wajah terasa lebih halus.',
  'Hydra Peel':
    'Hydra Peel membantu membersihkan dan menjaga kelembapan kulit supaya wajah terasa lebih segar.',
  'Totok wajah':
    'Totok wajah bisa jadi momen relaksasi sederhana sekaligus merawat wajahmu.',
  General:
    'Kamu bisa mulai dari Microdermabrasion, Hydra Peel, sampai totok wajah sesuai kebutuhan wajahmu.',
};

/* 3 reassurance lines (guardrail: results vary + suggest consultation). */
const REASSURE_LINES: string[] = [
  'Hasil bisa berbeda pada setiap orang, jadi sebaiknya konsultasi dulu supaya treatment-nya sesuai dengan kebutuhan wajahmu.',
  'Setiap kulit punya kebutuhan yang berbeda, jadi enaknya konsultasi dulu sebelum menentukan treatment yang pas.',
  'Karena kondisi kulit tiap orang berbeda, kami sarankan konsultasi dulu supaya treatment-nya benar-benar terasa sesuai untukmu.',
];

/* Treatment-specific scene direction for the video script (scenes 2 & 3). */
const TREATMENT_SCRIPT: Record<
  TreatmentType,
  { scene2Visual: string; scene3Visual: string; scene3VO: string; overlay3: string }
> = {
  Microdermabrasion: {
    scene2Visual:
      'Close-up kulit wajah, lalu perlihatkan alat Microdermabrasion yang bersih dan siap dipakai.',
    scene3Visual:
      'Rekam proses Microdermabrasion mengangkat sel kulit mati secara perlahan; fokus ke gerakan alat di wajah.',
    scene3VO:
      'Microdermabrasion di DenanavBeauty Salon membantu wajah terasa lebih halus, dengan proses lembut yang dijelaskan dulu sebelum mulai.',
    overlay3: 'Wajah terasa lebih halus',
  },
  'Hydra Peel': {
    scene2Visual:
      'Tampilkan tekstur cairan Hydra Peel dan suasana treatment room yang bersih dan rapi.',
    scene3Visual:
      'Rekam proses Hydra Peel membersihkan dan melembapkan kulit; tampilkan ekspresi customer yang rileks.',
    scene3VO:
      'Hydra Peel membantu membersihkan dan menjaga kelembapan kulit supaya wajah terasa lebih segar, dengan langkah yang nyaman.',
    overlay3: 'Kulit terasa lebih segar',
  },
  'Totok wajah': {
    scene2Visual:
      'Tampilkan suasana tenang treatment room dan handuk bersih sebelum totok wajah dimulai.',
    scene3Visual:
      'Rekam gerakan totok wajah yang lembut dan menenangkan; fokus ke ekspresi rileks customer.',
    scene3VO:
      'Totok wajah jadi momen relaksasi yang membantu kamu merasa lebih rileks sekaligus merawat wajah.',
    overlay3: 'Momen relaksasi untuk wajahmu',
  },
  General: {
    scene2Visual:
      'Tampilkan suasana salon yang bersih dan nyaman serta alat facial yang tertata rapi.',
    scene3Visual:
      'Perlihatkan proses facial treatment (Microdermabrasion, Hydra Peel, atau totok wajah) dengan pencahayaan terang dan lembut.',
    scene3VO:
      'Facial treatment di DenanavBeauty Salon membantu kulit terlihat lebih fresh dan bersih, dengan proses yang dijelaskan dulu sebelum dimulai.',
    overlay3: 'Facial treatment yang nyaman & modern',
  },
};

/* ============================================================
   MOCK GENERATOR — 30-Day Content Calendar
   ============================================================ */
/* Duration-based row count: derive the number of content days from the
 * campaign period (periodStart..periodEnd inclusive). Falls back to 30 when
 * the period is missing/invalid. 7-day -> 7 rows, 14-day -> 14, 30-day -> 30. */
function campaignDayCount(campaign: Campaign | null): number {
  if (campaign && campaign.periodStart && campaign.periodEnd) {
    const s = new Date(campaign.periodStart + 'T00:00:00');
    const e = new Date(campaign.periodEnd + 'T00:00:00');
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diff = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
      if (diff >= 1 && diff <= 60) return diff;
    }
  }
  return 30;
}

export function generateCalendar(
  _brand: BrandSnapshot | null,
  campaign: Campaign | null,
): ContentRow[] {
  const dayCount = campaignDayCount(campaign);
  const buckets = PILLAR_PLAN.map((p) => ({ pillar: p.pillar, n: p.count }));
  const sequence: string[] = [];
  const remaining = buckets.map((b) => b.n);
  const order = [0, 1, 2, 0, 1, 3, 0, 1, 4, 0]; // weighted cycle favoring education
  let oi = 0;
  let guard = 0;
  while (sequence.length < dayCount && guard < 500) {
    guard++;
    const idx = order[oi % order.length];
    oi++;
    if (remaining[idx] > 0) {
      sequence.push(buckets[idx].pillar);
      remaining[idx]--;
    } else {
      for (let k = 0; k < remaining.length; k++) {
        if (remaining[k] > 0) {
          sequence.push(buckets[k].pillar);
          remaining[k]--;
          break;
        }
      }
    }
  }

  const topicCursor: Record<string, number> = {};
  PILLARS.forEach((p) => {
    topicCursor[p] = 0;
  });
  let start =
    campaign && campaign.periodStart
      ? new Date(campaign.periodStart + 'T00:00:00')
      : new Date();
  if (isNaN(start.getTime())) start = new Date();

  const rows: ContentRow[] = [];
  let liveUsed = false;
  for (let i = 0; i < dayCount; i++) {
    const pillar = sequence[i] || 'Edukasi Facial';
    const bank = TOPIC_BANK[pillar];
    const item = bank[topicCursor[pillar] % bank.length];
    topicCursor[pillar]++;

    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);

    let format: string = item.f;
    if (i < 7) {
      format = FIRST_WEEK_FORMATS[i];
    }
    if (!liveUsed && i === 17 && pillar === 'Pengalaman Treatment') {
      format = 'Live';
      liveUsed = true;
    }
    // Avoid 3 Reels in a row anywhere (especially at the beginning).
    if (
      format === 'Reels' &&
      rows.length >= 2 &&
      rows[rows.length - 1].format === 'Reels' &&
      rows[rows.length - 2].format === 'Reels'
    ) {
      format = 'Carousel';
    }

    // Objective mapping tuned for an Awareness campaign goal.
    let objective = 'Awareness';
    if (pillar === 'Edukasi Facial') objective = 'Awareness';
    else if (pillar === 'Masalah & Solusi Kulit')
      objective = i % 2 === 0 ? 'Awareness' : 'Engagement';
    else if (pillar === 'Pengalaman Treatment')
      objective = i % 2 === 0 ? 'Engagement' : 'Trust';
    else if (pillar === 'Testimoni & Kepercayaan') objective = 'Trust';
    else if (pillar === 'Promo & Booking')
      objective = i % 2 === 0 ? 'Booking' : 'Awareness';

    const ctaArr = CTA_BANK[pillar];
    const cta = ctaArr[i % ctaArr.length];

    rows.push({
      id: uid(),
      date: toISO(d),
      day: dayName(d),
      format,
      pillar,
      topicTitle: item.t,
      hook: item.h,
      cta,
      objective,
      productionStatus: 'Ide',
    });
  }
  return rows;
}

/* ============================================================
   MOCK GENERATOR — Content Detail
   ============================================================ */
export function generateDetail(
  row: ContentRow,
  brand: BrandSnapshot | null,
): ContentDetail {
  const b = brand || ({} as Partial<BrandSnapshot>);
  const price = b.entryPrice || 'Rp350.000';
  const pillar = row.pillar;
  const topic = row.topicTitle;
  const hook = row.hook;
  const treatment = detectTreatment(topic + ' ' + hook);
  const seed = variationSeed(topic);
  const ts = TREATMENT_SCRIPT[treatment];
  const body = CAPTION_BODIES[seed % CAPTION_BODIES.length];
  const treatmentLine = TREATMENT_CAPTION_LINE[treatment];
  const reassure = REASSURE_LINES[(seed + 1) % REASSURE_LINES.length];

  const intro =
    (
      {
        'Edukasi Facial':
          'Banyak yang masih bingung soal perawatan wajah. Lewat konten ini kita bahas pelan-pelan supaya lebih mudah dipahami.',
        'Masalah & Solusi Kulit':
          'Kondisi wajah seperti ini cukup umum dialami. Yuk pahami pelan-pelan tanpa perlu khawatir berlebihan.',
        'Pengalaman Treatment':
          'Biar lebih tenang sebelum treatment, yuk intip bagaimana prosesnya berlangsung di DenanavBeauty Salon.',
        'Testimoni & Kepercayaan':
          'Kenyamanan dan kepercayaan adalah hal yang kami jaga di setiap treatment.',
        'Promo & Booking':
          'Kalau kamu lagi cari facial treatment yang nyaman di Kota Bima, ini bisa jadi awal yang pas.',
      } as Record<string, string>
    )[pillar] || '';

  const caption =
    hook +
    '\n\n' +
    topic +
    '. ' +
    intro +
    '\n\n' +
    body +
    (treatmentLine ? ' ' + treatmentLine : '') +
    '\n\n' +
    reassure +
    '\n\n' +
    row.cta +
    (price ? '\nFacial treatment mulai ' + price + '.' : '') +
    '\n\n' +
    '\ud83d\udccd Kota Bima, NTB dan sekitarnya';

  const shortCaption =
    hook + ' ' + row.cta + ' Facial treatment mulai ' + price + '. \u2728';

  const script = {
    opening: hook,
    sceneByScene: [
      {
        time: '0\u20133 dtk',
        visual:
          'Close-up wajah customer yang tenang / teks hook di layar dengan nuansa putih lembut.',
        voiceover: hook,
        overlayText: hook,
      },
      {
        time: '4\u201310 dtk',
        visual:
          pillar === 'Masalah & Solusi Kulit'
            ? 'Tampilkan gambaran keluhan wajah secara halus tanpa berlebihan, lalu transisi ke suasana salon.'
            : ts.scene2Visual,
        voiceover: intro,
        overlayText: 'Kenali dulu kebutuhan wajahmu',
      },
      {
        time: '11\u201320 dtk',
        visual: ts.scene3Visual,
        voiceover: ts.scene3VO,
        overlayText: ts.overlay3,
      },
      {
        time: '21\u201330 dtk',
        visual: 'Tutup dengan logo / suasana hangat dan teks CTA lembut.',
        voiceover:
          row.cta + ' Hasil bisa berbeda pada setiap orang, konsultasikan dulu ya.',
        overlayText: row.cta,
      },
    ],
    closingCTA: row.cta + ' \u2014 facial treatment mulai ' + price + '.',
  };

  const visualDirection =
    'Gaya clean minimal dengan nuansa putih dan sentuhan gold. Pencahayaan terang dan lembut, suasana salon yang tenang, bersih, dan elegan. ' +
    'Fokus pada kenyamanan: handuk bersih, alat tertata rapi, dan ekspresi customer yang rileks. Hindari kesan klinis atau menakutkan. ' +
    (pillar === 'Pengalaman Treatment'
      ? 'Tampilkan langkah treatment secara halus dan menenangkan.'
      : 'Gunakan visual sederhana yang mudah direkam dengan smartphone.');

  const overlayOptions = [
    hook,
    ts.overlay3,
    'Kenali dulu kebutuhan wajahmu',
    'Mulai ' + price,
    row.cta,
  ];

  let tags = HASHTAG_BANK.slice(0, 10);
  if (pillar === 'Promo & Booking')
    tags = [
      '#DenanavBeautySalon',
      '#FacialBima',
      '#SalonBima',
      '#FacialTreatment',
      '#FacialKotaBima',
      '#PerawatanWajah',
      '#glowingskin',
      '#kulitsehat',
      '#kecantikan',
      '#facialmurah',
    ];
  if (pillar === 'Pengalaman Treatment')
    tags = [
      '#DenanavBeautySalon',
      '#FacialTreatment',
      '#HydraPeel',
      '#Microdermabrasion',
      '#TotokWajah',
      '#FacialBima',
      '#glowingskin',
      '#kulitsehat',
      '#PerawatanWajah',
      '#perawatanwajah',
    ];

  const checklist = [
    'Siapkan ruang treatment yang bersih dan rapi.',
    'Pastikan pencahayaan terang dan lembut (cahaya natural lebih baik).',
    'Rekam dengan smartphone dalam mode stabil / pakai tripod kecil.',
    'Tampilkan proses facial secara halus, tidak terburu-buru.',
    'Tambahkan teks overlay sesuai pilihan di atas.',
    'Gunakan musik latar yang tenang dan lembut.',
    'Periksa ulang caption: hindari klaim medis & janji hasil pasti.',
  ];
  if (pillar === 'Testimoni & Kepercayaan') {
    checklist.unshift(
      'Gunakan review customer asli dan minta izin sebelum menampilkan foto/video.',
    );
  }

  return {
    caption,
    shortCaption,
    script,
    visualDirection,
    overlayOptions,
    hashtags: tags,
    checklist,
  };
}

/** Build plain-text versions of a detail object for copy/export. */
export function detailTexts(d: ContentDetail): {
  script: string;
  hashtags: string;
  full: string;
} {
  const scriptText =
    'Opening: ' +
    d.script.opening +
    '\n\n' +
    d.script.sceneByScene
      .map((s) => {
        return (
          s.time +
          '\nVoiceover: ' +
          s.voiceover +
          '\nVisual: ' +
          s.visual +
          '\nOverlay: ' +
          s.overlayText
        );
      })
      .join('\n\n') +
    '\n\nClosing: ' +
    d.script.closingCTA;
  const hashtags = d.hashtags.join(' ');
  const fullText =
    '=== CAPTION ===\n' +
    d.caption +
    '\n\n=== CAPTION SINGKAT ===\n' +
    d.shortCaption +
    '\n\n=== VIDEO SCRIPT ===\n' +
    scriptText +
    '\n\n=== VISUAL DIRECTION ===\n' +
    d.visualDirection +
    '\n\n=== TEXT OVERLAY ===\n' +
    d.overlayOptions.join('\n') +
    '\n\n=== HASHTAGS ===\n' +
    hashtags +
    '\n\n=== PRODUCTION CHECKLIST ===\n' +
    d.checklist.map((c) => '- ' + c).join('\n');
  return { script: scriptText, hashtags, full: fullText };
}
