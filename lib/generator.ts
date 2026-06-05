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
   MOCK GENERATOR — 30-Day Content Calendar
   ============================================================ */
export function generateCalendar(
  _brand: BrandSnapshot | null,
  campaign: Campaign | null,
): ContentRow[] {
  const buckets = PILLAR_PLAN.map((p) => ({ pillar: p.pillar, n: p.count }));
  const sequence: string[] = [];
  const remaining = buckets.map((b) => b.n);
  const order = [0, 1, 2, 0, 1, 3, 0, 1, 4, 0]; // weighted cycle favoring education
  let oi = 0;
  let guard = 0;
  while (sequence.length < 30 && guard < 500) {
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
  for (let i = 0; i < 30; i++) {
    const pillar = sequence[i] || 'Facial Education';
    const bank = TOPIC_BANK[pillar];
    const item = bank[topicCursor[pillar] % bank.length];
    topicCursor[pillar]++;

    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);

    let format: string = item.f;
    if (i < 7) {
      format = FIRST_WEEK_FORMATS[i];
    }
    if (!liveUsed && i === 17 && pillar === 'Treatment Experience') {
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
    if (pillar === 'Facial Education') objective = 'Awareness';
    else if (pillar === 'Skin Concern & Solution')
      objective = i % 2 === 0 ? 'Awareness' : 'Engagement';
    else if (pillar === 'Treatment Experience')
      objective = i % 2 === 0 ? 'Engagement' : 'Trust';
    else if (pillar === 'Testimonial & Trust') objective = 'Trust';
    else if (pillar === 'Promo & Booking Awareness')
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
      productionStatus: 'Idea',
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

  const intro =
    (
      {
        'Facial Education':
          'Banyak yang masih bingung soal perawatan wajah. Lewat konten ini kita bahas pelan-pelan supaya lebih mudah dipahami.',
        'Skin Concern & Solution':
          'Kondisi wajah seperti ini cukup umum dialami. Yuk pahami pelan-pelan tanpa perlu khawatir berlebihan.',
        'Treatment Experience':
          'Biar lebih tenang sebelum treatment, yuk intip bagaimana prosesnya berlangsung di DenanavBeauty Salon.',
        'Testimonial & Trust':
          'Kenyamanan dan kepercayaan adalah hal yang kami jaga di setiap treatment.',
        'Promo & Booking Awareness':
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
    'Di DenanavBeauty Salon, facial treatment kami fokus membantu kulit terlihat lebih fresh dan bersih lewat Microdermabrasion, Hydra Peel, dan totok wajah. Setiap treatment dijelaskan dulu sebelum dimulai, jadi kamu bisa lebih tenang.\n\n' +
    'Hasil bisa berbeda pada setiap orang, jadi sebaiknya konsultasi dulu supaya treatment-nya sesuai dengan kebutuhan wajahmu.\n\n' +
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
          'Tampilkan konteks: ' +
          (pillar === 'Skin Concern & Solution'
            ? 'gambaran keluhan wajah secara halus.'
            : 'suasana salon yang bersih dan nyaman.'),
        voiceover: intro,
        overlayText: 'Kenali dulu kebutuhan wajahmu',
      },
      {
        time: '11\u201320 dtk',
        visual:
          'Perlihatkan proses facial treatment (Microdermabrasion / Hydra Peel / totok wajah) dengan pencahayaan terang.',
        voiceover:
          'Facial treatment di DenanavBeauty Salon membantu kulit terlihat lebih fresh dan bersih, dengan proses yang dijelaskan dulu sebelum dimulai.',
        overlayText: 'Facial treatment yang nyaman & modern',
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
    (pillar === 'Treatment Experience'
      ? 'Tampilkan langkah treatment secara halus dan menenangkan.'
      : 'Gunakan visual sederhana yang mudah direkam dengan smartphone.');

  const overlayOptions = [
    hook,
    'Facial treatment yang nyaman & modern',
    'Kenali dulu kebutuhan wajahmu',
    'Mulai ' + price,
    row.cta,
  ];

  let tags = HASHTAG_BANK.slice(0, 6);
  if (pillar === 'Promo & Booking Awareness')
    tags = [
      '#DenanavBeautySalon',
      '#FacialBima',
      '#SalonBima',
      '#FacialTreatment',
      '#FacialKotaBima',
      '#PerawatanWajah',
    ];
  if (pillar === 'Treatment Experience')
    tags = [
      '#DenanavBeautySalon',
      '#FacialTreatment',
      '#HydraPeel',
      '#Microdermabrasion',
      '#TotokWajah',
      '#FacialBima',
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
  if (pillar === 'Testimonial & Trust') {
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
