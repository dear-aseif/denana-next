/*
 * generator.ts
 * The mock content engine ported from the prototype.
 * Generates a content calendar and per-item detail (caption, script, visual
 * direction, checklist) from local content banks — NO real AI.
 *
 * Phase 16I-Rev1: detail generation is now genuinely goal / platform / format
 * aware. Each goal has its OWN caption body structure, and each content format
 * (Reels/Live, Carousel, Stories, Single Post) produces a format-specific
 * outline instead of a one-size-fits-all video guide. Existing rows/campaigns
 * and saved drafts stay safe (the modal loads drafts as-is; generic fallback is
 * used when no campaign metadata is available). Copy stays Bahasa Indonesia.
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
  ContentScript,
  ScriptScene,
} from '@/types/content';
import { uid, isoLocal, addDaysISO, dayNameFromISO } from './utils';
import {
  getGoalStrategy,
  getPlatformStrategy,
  getPlatformDetailStrategy,
  buildGoalAwareCTA,
  buildGoalAwareTopic,
  type GoalStrategy,
  type CanonicalGoal,
} from './goalStrategy';

/* ============================================================
   Content variation helpers (deterministic, no AI)
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

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/* 5 brand-consistent caption middle paragraphs, rotated across the 30 days. */
const CAPTION_BODIES: string[] = [
  'Di DenanavBeauty Salon, kami fokus membantu wajah terlihat lebih fresh dan bersih lewat facial treatment yang nyaman. Setiap langkah dijelaskan dulu sebelum dimulai, jadi kamu bisa lebih rileks.',
  'Lewat facial treatment di DenanavBeauty Salon, kami bantu merawat kulit wajahmu dengan cara yang lembut. Suasana salon dibuat tenang supaya kamu nyaman dari awal sampai selesai.',
  'Di DenanavBeauty Salon, perawatan wajah bukan cuma soal tampilan, tapi juga pengalaman yang menyenangkan. Tim kami siap bantu pilih treatment yang sesuai dengan kondisi kulitmu.',
  'Kami percaya perawatan wajah yang baik dimulai dari kenyamanan. Karena itu setiap facial treatment di DenanavBeauty Salon dilakukan perlahan dengan alat yang bersih dan terjaga.',
  'Facial treatment di DenanavBeauty Salon dibuat untuk membantu kulit terasa lebih segar dan terawat. Kebersihan dan kenyamanan selalu kami utamakan di setiap kunjungan.',
];

/* Soft, treatment-specific sentence (no medical claims, no guaranteed results). */
const TREATMENT_CAPTION_LINE: Record<TreatmentType, string> = {
  Microdermabrasion:
    'Microdermabrasion membantu mengangkat sel kulit mati secara lembut sehingga wajah terasa lebih halus.',
  'Hydra Peel':
    'Hydra Peel membantu membersihkan dan menjaga kelembapan kulit supaya wajah terasa lebih segar.',
  'Totok wajah':
    'Totok wajah bisa jadi momen relaksasi sederhana sekaligus merawat wajahmu.',
  General:
    'Facial treatment membantu membersihkan dan merawat kulit wajah secara lembut sesuai kebutuhanmu.',
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
   MOCK GENERATOR — Content Calendar
   ============================================================ */
/* Duration-based row count from the campaign period (inclusive). Falls back to
 * 30 when missing/invalid. */
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

/* Phase 16I-Rev1: resolve the campaign start as a local YYYY-MM-DD string so
 * date math never shifts across timezones (a June 10 start stays June 10). */
function resolveStartISO(campaign: Campaign | null): string {
  if (
    campaign &&
    campaign.periodStart &&
    /^\d{4}-\d{2}-\d{2}/.test(campaign.periodStart)
  ) {
    return campaign.periodStart.slice(0, 10);
  }
  return isoLocal(new Date());
}

/* Phase 16H: optional goal/platform/focus aware generation. When goalAware is
 * not set, generateCalendar behaves exactly as before (legacy fallback). */
export interface GenerateOptions {
  goalAware?: boolean;
  goal?: string;
  focus?: string;
  focusDesc?: string;
  platforms?: string[];
}

export function generateCalendar(
  _brand: BrandSnapshot | null,
  campaign: Campaign | null,
  opts?: GenerateOptions,
): ContentRow[] {
  if (opts && opts.goalAware) {
    return generateGoalAwareCalendar(_brand, campaign, opts);
  }
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
  const startISO = resolveStartISO(campaign);

  const rows: ContentRow[] = [];
  let liveUsed = false;
  for (let i = 0; i < dayCount; i++) {
    const pillar = sequence[i] || 'Edukasi Facial';
    const bank = TOPIC_BANK[pillar];
    const item = bank[topicCursor[pillar] % bank.length];
    topicCursor[pillar]++;

    const dateStr = addDaysISO(startISO, i);

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

    const now = new Date().toISOString();
    rows.push({
      id: uid(),
      date: dateStr,
      day: dayNameFromISO(dateStr),
      format,
      pillar,
      topicTitle: item.t,
      hook: item.h,
      cta,
      objective,
      productionStatus: 'Planning',
      scheduledDate: null,
      scheduledTime: null,
      assignee: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  return rows;
}

/* ============================================================
   PHASE 16H — Goal-Aware Calendar
   ============================================================ */
function generateGoalAwareCalendar(
  _brand: BrandSnapshot | null,
  campaign: Campaign | null,
  opts: GenerateOptions,
): ContentRow[] {
  const dayCount = campaignDayCount(campaign);
  const goal = opts.goal || (campaign ? String(campaign.campaignGoal || '') : '');
  const focus =
    opts.focus || (campaign && campaign.priorityService ? campaign.priorityService : '');
  const platforms =
    opts.platforms && opts.platforms.length
      ? opts.platforms
      : campaign && campaign.mainPlatform
        ? campaign.mainPlatform.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

  const strategy: GoalStrategy = getGoalStrategy(goal);
  const platformStrategy = getPlatformStrategy(platforms);
  const seq = strategy.pillarSequence;

  const topicCursor: Record<string, number> = {};
  PILLARS.forEach((p) => {
    topicCursor[p] = 0;
  });

  const startISO = resolveStartISO(campaign);

  const rows: ContentRow[] = [];
  for (let i = 0; i < dayCount; i++) {
    const pillar = seq[i % seq.length] || 'Edukasi Facial';
    const item = buildGoalAwareTopic(pillar, topicCursor[pillar] || 0, focus);
    topicCursor[pillar] = (topicCursor[pillar] || 0) + 1;

    const dateStr = addDaysISO(startISO, i);

    // Platform-aware format, preserving the "no 3 Reels in a row" guardrail.
    let format: string =
      platformStrategy.formatPool[i % platformStrategy.formatPool.length] || item.f;
    if (
      format === 'Reels' &&
      rows.length >= 2 &&
      rows[rows.length - 1].format === 'Reels' &&
      rows[rows.length - 2].format === 'Reels'
    ) {
      format = 'Carousel';
    }

    const cta = buildGoalAwareCTA(strategy.goal, platforms, focus, i);

    const now = new Date().toISOString();
    rows.push({
      id: uid(),
      date: dateStr,
      day: dayNameFromISO(dateStr),
      format,
      pillar,
      topicTitle: item.t,
      hook: item.h,
      cta,
      objective: strategy.objective,
      productionStatus: 'Planning',
      scheduledDate: null,
      scheduledTime: null,
      assignee: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  return rows;
}

/* ============================================================
   MOCK GENERATOR — Content Detail (generic / legacy fallback)
   ============================================================ */
/* Phase 16I: optional goal/platform/focus context for detail generation. When
 * omitted (or empty), generateDetail behaves exactly as before (generic
 * fallback), so legacy rows/campaigns and existing saved drafts are unaffected. */
export interface DetailOptions {
  goal?: string;
  platforms?: string[];
  focus?: string;
  focusDesc?: string;
}

export function generateDetail(
  row: ContentRow,
  brand: BrandSnapshot | null,
  opts?: DetailOptions,
): ContentDetail {
  if (opts && (opts.goal || opts.focus || (opts.platforms && opts.platforms.length))) {
    return generateGoalAwareDetail(row, brand, opts);
  }
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

  const script: ContentScript = {
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

/* ============================================================
   PHASE 16I-Rev1 — Goal-Aware Content Detail
   Each goal has its own caption body structure (buildCaptionByGoal) and each
   content format produces a format-specific outline (buildVideoScript /
   buildCarouselOutline / buildStoryFrames / buildSinglePostDirection). The row
   CTA is always enforced as the ending. Price lines are suppressed unless the
   goal is Booking/Sales or the row CTA/topic mentions price (shouldShowPriceLine).
   Copy stays Bahasa Indonesia; only the STRATEGY is goal/platform/focus aware.
   ============================================================ */

function mentionsPrice(text: string): boolean {
  const s = (text || '').toLowerCase();
  return (
    s.includes('rp') ||
    s.includes('harga') ||
    s.includes('promo') ||
    s.includes('diskon') ||
    s.includes('price')
  );
}

/* Awareness/Education/Trust/Engagement never show a price by default; only when
 * the row CTA or topic explicitly mentions it. Booking/Sales always may. */
function shouldShowPriceLine(goal: CanonicalGoal, row: ContentRow): boolean {
  if (goal === 'Booking' || goal === 'Sales') return true;
  return mentionsPrice(row.cta) || mentionsPrice(row.topicTitle);
}

interface GoalDetailContext {
  goal: CanonicalGoal;
  hook: string;
  topic: string;
  focusMention: string;
  treatmentLine: string;
  reassure: string;
  cta: string;
  price: string;
  showPrice: boolean;
  short: boolean;
  seed: number;
  usesWhatsApp: boolean;
  usesTikTok: boolean;
  plat: ReturnType<typeof getPlatformDetailStrategy>;
  ts: { scene2Visual: string; scene3Visual: string; scene3VO: string; overlay3: string };
}

function locLine(): string {
  return '\ud83d\udccd Kota Bima, NTB dan sekitarnya';
}

function priceTail(ctx: GoalDetailContext): string {
  return ctx.showPrice ? '\nFacial treatment mulai ' + ctx.price + '.' : '';
}

/* ---------- Goal-specific caption bodies ---------- */
function buildCaptionByGoal(ctx: GoalDetailContext): string {
  const f = ctx.focusMention;
  const fl = f.toLowerCase();

  if (ctx.goal === 'Awareness') {
    // Hook -> Simple explanation -> Why it matters -> Soft CTA. No price.
    const why = pick(
      [
        'Makin kenal kebutuhan kulit, makin gampang merawatnya tiap hari.',
        'Mengenali kondisi kulit sejak awal bikin perawatan jadi lebih tepat.',
        'Hal kecil seperti ini sering jadi awal kulit lebih sehat dan terawat.',
      ],
      ctx.seed,
    );
    if (ctx.short) {
      return ctx.hook + '\n\n' + f + ' itu sederhana kok. ' + ctx.treatmentLine + '\n\n' + ctx.cta;
    }
    return [
      ctx.hook,
      f + ' itu sebenarnya sederhana. ' + ctx.treatmentLine,
      why,
      ctx.cta,
      locLine(),
    ].join('\n\n');
  }

  if (ctx.goal === 'Engagement') {
    // Question/relatable hook -> shared problem -> simple prompt -> comment/DM CTA.
    const prompt = pick(
      [
        'Menurut kamu, mana yang paling sering kamu rasain?',
        'Kamu tim yang mana nih?',
        'Coba ceritain pengalamanmu, penasaran banget.',
      ],
      ctx.seed,
    );
    if (ctx.short) {
      return ctx.hook + '\n\n' + prompt + '\n\n' + ctx.cta;
    }
    return [
      ctx.hook,
      'Banyak yang ngalamin hal serupa soal ' + fl + '. Jadi kamu nggak sendirian kok.',
      prompt,
      ctx.cta,
    ].join('\n\n');
  }

  if (ctx.goal === 'Booking') {
    // Problem/pain -> Treatment benefit -> What to expect -> Booking CTA.
    const expect = pick(
      [
        'Prosesnya dijelaskan dulu dari awal, jadi kamu bisa rileks selama treatment.',
        'Dari konsultasi singkat sampai treatment, semua dibuat nyaman dan nggak terburu-buru.',
        'Kamu tinggal datang, sisanya kami pandu langkah demi langkah.',
      ],
      ctx.seed,
    );
    if (ctx.short) {
      return ctx.hook + '\n\n' + ctx.treatmentLine + '\n\n' + ctx.cta + priceTail(ctx);
    }
    return [
      ctx.hook,
      'Lewat ' + f + ', kamu bisa merawat wajah dengan lebih nyaman. ' + ctx.treatmentLine,
      expect,
      ctx.cta + priceTail(ctx),
      locLine(),
    ].join('\n\n');
  }

  if (ctx.goal === 'Sales') {
    // Offer/value -> Why worth it -> Who it is for -> Claim/book CTA.
    const worth = pick(
      [
        'Bukan cuma soal harga, tapi soal kenyamanan dan hasil yang natural.',
        'Nilainya kerasa dari pengalaman treatment yang rapi dan bersih.',
        'Kamu dapat perawatan yang nyaman dengan langkah yang jelas.',
      ],
      ctx.seed,
    );
    if (ctx.short) {
      return ctx.hook + '\n\n' + worth + '\n\n' + ctx.cta + priceTail(ctx);
    }
    return [
      ctx.hook,
      worth,
      'Cocok buat kamu yang mau mulai merawat wajah tanpa ribet.',
      ctx.cta + priceTail(ctx),
      locLine(),
    ].join('\n\n');
  }

  if (ctx.goal === 'Education') {
    // Topic intro -> 3 key points -> Practical tip -> Save/share CTA. No selling.
    const points = [
      '1) ' + ctx.treatmentLine,
      '2) Konsistensi lebih penting daripada buru-buru.',
      '3) Kenali dulu jenis kulitmu sebelum pilih treatment.',
    ].join('\n');
    if (ctx.short) {
      return ctx.hook + '\n\n' + ctx.treatmentLine + '\n\n' + ctx.cta;
    }
    return [
      ctx.hook,
      'Biar nggak salah langkah, ini beberapa poin penting soal ' + fl + ':',
      points,
      'Tips: catat perubahan kulitmu tiap minggu biar gampang dievaluasi.',
      ctx.cta,
    ].join('\n\n');
  }

  // Trust Building — Concern -> Transparent process/proof -> Reassurance -> Consultative CTA.
  const proof = pick(
    [
      'Setiap alat dijaga kebersihannya dan setiap langkah dijelaskan dulu.',
      'Kami terbuka soal proses, mulai dari persiapan sampai selesai.',
      'Kenyamanan dan kebersihan selalu jadi prioritas di setiap kunjungan.',
    ],
    ctx.seed,
  );
  if (ctx.short) {
    return ctx.hook + '\n\n' + proof + '\n\n' + ctx.cta;
  }
  return [ctx.hook, proof, ctx.reassure, ctx.cta, locLine()].join('\n\n');
}

function buildShortCaptionByGoal(ctx: GoalDetailContext): string {
  if (ctx.usesWhatsApp) {
    return 'Halo kak \ud83d\udc4b ' + ctx.topic + '. ' + ctx.cta;
  }
  if (ctx.goal === 'Booking' || ctx.goal === 'Sales') {
    return (
      ctx.hook + ' ' + ctx.cta + (ctx.showPrice ? ' Mulai ' + ctx.price + '.' : '') + ' \u2728'
    );
  }
  if (ctx.goal === 'Engagement') {
    return ctx.hook + ' ' + ctx.cta;
  }
  return ctx.hook + ' ' + ctx.cta + ' \u2728';
}

/* ---------- Goal helpers for scripts ---------- */
function videoProblemVO(ctx: GoalDetailContext): string {
  switch (ctx.goal) {
    case 'Engagement':
      return 'Banyak yang relate sama ini, kamu juga ngerasain?';
    case 'Booking':
    case 'Sales':
      return 'Ini yang bisa kamu rasakan dari treatment-nya.';
    case 'Trust Building':
      return 'Kami tunjukkan prosesnya biar kamu makin tenang.';
    case 'Education':
      return 'Yuk pahami pelan-pelan biar nggak salah langkah.';
    default:
      return 'Kenali dulu kebutuhan wajahmu pelan-pelan.';
  }
}

function videoProblemOverlay(ctx: GoalDetailContext): string {
  switch (ctx.goal) {
    case 'Engagement':
      return 'Kamu juga ngerasain?';
    case 'Booking':
    case 'Sales':
      return 'Apa yang kamu dapat';
    case 'Trust Building':
      return 'Prosesnya transparan';
    default:
      return 'Kenali kebutuhan wajahmu';
  }
}

function goalOverlayText(goal: CanonicalGoal): string {
  switch (goal) {
    case 'Engagement':
      return 'Kamu tim yang mana?';
    case 'Booking':
    case 'Sales':
      return 'Siap rawat wajahmu?';
    case 'Trust Building':
      return 'Tenang, prosesnya jelas';
    case 'Education':
      return 'Catat poin pentingnya';
    default:
      return 'Kenali kebutuhan wajahmu';
  }
}

function tikTokHook(ctx: GoalDetailContext): string {
  const opts = [
    'POV: kamu akhirnya nemu tempat facial yang bikin nyaman.',
    'Pernah ngerasa wajah kusam padahal udah perawatan? Nah...',
    'Stop dulu, ini yang sering kelewat soal ' + ctx.focusMention.toLowerCase() + '.',
  ];
  return pick(opts, ctx.seed);
}

/* ---------- Reels / TikTok video script ---------- */
function buildVideoScript(ctx: GoalDetailContext): ContentScript {
  const tk = ctx.usesTikTok;
  const openVO = tk ? tikTokHook(ctx) : ctx.hook;
  const openVisual = tk
    ? 'Ngomong langsung ke kamera, energi santai. Hook nendang di 1 detik pertama, teks besar di layar.'
    : 'Close-up wajah customer yang tenang / teks hook di layar dengan nuansa putih lembut.';
  const ctaVO =
    ctx.cta + (ctx.goal === 'Trust Building' ? ' Konsultasi dulu nggak apa-apa ya.' : '');
  const scenes: ScriptScene[] = [
    {
      time: tk ? '0\u20132 dtk (Hook)' : '0\u20133 dtk (Hook)',
      visual: openVisual,
      voiceover: openVO,
      overlayText: ctx.hook,
    },
    {
      time: tk ? '2\u20136 dtk (Masalah)' : '4\u201310 dtk (Konteks)',
      visual: ctx.ts.scene2Visual,
      voiceover: videoProblemVO(ctx),
      overlayText: videoProblemOverlay(ctx),
    },
    {
      time: tk ? '6\u201315 dtk (Penjelasan)' : '11\u201320 dtk (Penjelasan)',
      visual: ctx.ts.scene3Visual,
      voiceover: ctx.ts.scene3VO,
      overlayText: ctx.ts.overlay3,
    },
    {
      time: tk ? '15\u201320 dtk (CTA)' : '21\u201330 dtk (CTA)',
      visual: 'Tutup dengan suasana hangat + teks CTA yang jelas.',
      voiceover: ctaVO,
      overlayText: ctx.cta,
    },
  ];
  return { opening: openVO, sceneByScene: scenes, closingCTA: ctx.cta };
}

/* ---------- Carousel outline (5–7 slides) ---------- */
function buildCarouselOutline(ctx: GoalDetailContext): ContentScript {
  const s5Title =
    ctx.goal === 'Education'
      ? 'Mitos vs Fakta'
      : ctx.goal === 'Trust Building'
        ? 'Bukti & Proses'
        : ctx.goal === 'Booking' || ctx.goal === 'Sales'
          ? 'Kenapa Worth It'
          : ctx.goal === 'Engagement'
            ? 'Kamu Tim yang Mana?'
            : 'Tips Singkat';
  const slides: ScriptScene[] = [
    {
      time: 'Slide 1 \u2014 Cover / Hook',
      voiceover: 'Hook / Cover',
      overlayText: ctx.hook,
      visual: 'Judul besar + visual ' + ctx.focusMention + ' yang eye-catching.',
    },
    {
      time: 'Slide 2 \u2014 Masalah / Konteks',
      voiceover: 'Masalah / Konteks',
      overlayText: 'Kenapa ini penting buat kamu?',
      visual: 'Gambarkan kebutuhan / keluhan kulit secara halus.',
    },
    {
      time: 'Slide 3 \u2014 Poin Utama',
      voiceover: 'Poin Utama',
      overlayText: 'Apa itu ' + ctx.focusMention + '?',
      visual: 'Penjelasan singkat + ikon / foto proses.',
    },
    {
      time: 'Slide 4 \u2014 Manfaat / Penjelasan',
      voiceover: 'Manfaat / Penjelasan',
      overlayText: ctx.treatmentLine,
      visual: 'Tampilkan 3 poin manfaat yang mudah dibaca.',
    },
    {
      time: 'Slide 5 \u2014 ' + s5Title,
      voiceover: s5Title,
      overlayText: ctx.ts.overlay3,
      visual: ctx.ts.scene3Visual,
    },
    {
      time: 'Slide 6 \u2014 Ringkasan',
      voiceover: 'Action / Ringkasan',
      overlayText: 'Poin penting biar gampang diingat.',
      visual: 'Rangkum 2\u20133 poin utama dalam satu slide bersih.',
    },
    {
      time: 'Slide 7 \u2014 CTA',
      voiceover: 'CTA',
      overlayText: ctx.cta,
      visual: 'Slide penutup: CTA jelas + info kontak / cara booking.',
    },
  ];
  return { opening: ctx.hook, sceneByScene: slides, closingCTA: ctx.cta };
}

/* ---------- Story frame outline (4–5 frames) ---------- */
function buildStoryFrames(ctx: GoalDetailContext): ContentScript {
  const frames: ScriptScene[] = [
    {
      time: 'Frame 1 \u2014 Hook',
      voiceover: ctx.hook,
      overlayText: ctx.hook,
      visual: 'Teks hook di atas foto / klip singkat.',
    },
    {
      time: 'Frame 2 \u2014 Masalah / Konteks',
      voiceover: 'Kenalin masalah atau kebutuhan kulit secara singkat.',
      overlayText: ctx.topic,
      visual: 'Frame info singkat tentang ' + ctx.focusMention + '.',
    },
    {
      time: 'Frame 3 \u2014 Penjelasan / Bukti',
      voiceover: ctx.ts.scene3VO,
      overlayText: ctx.ts.overlay3,
      visual: ctx.ts.scene3Visual,
    },
    {
      time: 'Frame 4 \u2014 CTA',
      voiceover: ctx.cta,
      overlayText: ctx.cta,
      visual: 'Frame CTA: sticker link / "ketuk untuk chat".',
    },
  ];
  if (ctx.goal === 'Engagement') {
    frames.push({
      time: 'Frame 5 \u2014 Interaksi',
      voiceover: 'Pakai sticker poll / question: "Kamu tim yang mana?"',
      overlayText: 'Jawab di sticker ya!',
      visual: 'Tambahkan sticker interaktif (poll / question box).',
    });
  } else {
    frames.push({
      time: 'Frame 5 \u2014 Reminder',
      voiceover: 'Ingatkan lagi poin pentingnya secara singkat.',
      overlayText: 'Simpan & bagikan ya',
      visual: 'Frame pengingat ringkas + ajakan simpan.',
    });
  }
  return { opening: ctx.hook, sceneByScene: frames, closingCTA: ctx.cta };
}

/* ---------- Single Post direction (caption-first, not a video guide) ---------- */
function buildSinglePostDirection(ctx: GoalDetailContext): ContentScript {
  if (ctx.plat.primary === 'website') {
    const sections: ScriptScene[] = [
      {
        time: 'Bagian 1 \u2014 Intro',
        voiceover: ctx.hook,
        overlayText: 'Pendahuluan',
        visual: 'Paragraf pembuka yang memperkenalkan ' + ctx.focusMention + '.',
      },
      {
        time: 'Bagian 2 \u2014 Penjelasan',
        voiceover: 'Apa itu ' + ctx.focusMention + ' dan manfaatnya.',
        overlayText: 'Penjelasan',
        visual: 'Uraikan secara terstruktur dengan sub-poin.',
      },
      {
        time: 'Bagian 3 \u2014 Untuk Siapa',
        voiceover: 'Siapa yang cocok dan kapan sebaiknya treatment.',
        overlayText: 'Cocok untuk',
        visual: 'Bullet list singkat.',
      },
      {
        time: 'Bagian 4 \u2014 FAQ',
        voiceover: '2\u20133 pertanyaan umum + jawaban singkat.',
        overlayText: 'FAQ',
        visual: 'Format tanya-jawab.',
      },
      {
        time: 'Bagian 5 \u2014 Penutup',
        voiceover: ctx.cta,
        overlayText: ctx.cta,
        visual: 'Ringkas + ajakan + info kontak / booking.',
      },
    ];
    return { opening: ctx.hook, sceneByScene: sections, closingCTA: ctx.cta };
  }
  const steps: ScriptScene[] = [
    {
      time: 'Teks Postingan',
      voiceover: 'Gunakan caption di atas sebagai teks utama postingan.',
      overlayText: ctx.hook,
      visual: 'Satu visual kuat: foto ' + ctx.focusMention + ' atau suasana salon yang bersih.',
    },
    {
      time: 'Visual Pendukung',
      voiceover: 'Opsional: 1 foto pendukung (before/after halus atau alat yang bersih).',
      overlayText: ctx.ts.overlay3,
      visual: ctx.ts.scene3Visual,
    },
    {
      time: 'Variasi Caption',
      voiceover: buildShortCaptionByGoal(ctx),
      overlayText: 'Alternatif caption singkat',
      visual: 'Bisa dipakai kalau mau versi yang lebih ringkas.',
    },
    {
      time: 'CTA',
      voiceover: ctx.cta,
      overlayText: ctx.cta,
      visual: 'Pastikan CTA terlihat jelas di caption & desain.',
    },
  ];
  return { opening: ctx.hook, sceneByScene: steps, closingCTA: ctx.cta };
}

function generateGoalAwareDetail(
  row: ContentRow,
  brand: BrandSnapshot | null,
  opts: DetailOptions,
): ContentDetail {
  const b = brand || ({} as Partial<BrandSnapshot>);
  const price = b.entryPrice || 'Rp350.000';
  const pillar = row.pillar;
  const topic = row.topicTitle;
  const hook = row.hook;
  const focus = (opts.focus || '').trim();

  const goalStrat = getGoalStrategy(opts.goal);
  const goal = goalStrat.goal;
  const plat = getPlatformDetailStrategy(opts.platforms);

  // Caption treatment prefers the campaign focus; script visuals fall back to
  // the row topic/hook when the focus is generic.
  const focusTreatment = focus ? detectTreatment(focus) : 'General';
  const topicTreatment = detectTreatment(topic + ' ' + hook);
  const captionTreatment = focusTreatment !== 'General' ? focusTreatment : topicTreatment;
  const scriptTreatment = topicTreatment !== 'General' ? topicTreatment : captionTreatment;

  const seed = variationSeed(topic + '|' + goal + '|' + plat.primary);
  const ts = TREATMENT_SCRIPT[scriptTreatment];
  const treatmentLine = TREATMENT_CAPTION_LINE[captionTreatment];
  const reassure = REASSURE_LINES[(seed + 1) % REASSURE_LINES.length];
  const focusMention = focus || 'facial treatment';
  const showPrice = shouldShowPriceLine(goal, row);

  const ctx: GoalDetailContext = {
    goal,
    hook,
    topic,
    focusMention,
    treatmentLine,
    reassure,
    cta: row.cta,
    price,
    showPrice,
    short: plat.captionLength === 'short',
    seed,
    usesWhatsApp: plat.usesWhatsApp,
    usesTikTok: plat.usesTikTok,
    plat,
    ts,
  };

  const caption = buildCaptionByGoal(ctx);
  const shortCaption = buildShortCaptionByGoal(ctx);

  // Format-specific output. Only Reels/Live produce a true video script.
  let script: ContentScript;
  if (row.format === 'Carousel') script = buildCarouselOutline(ctx);
  else if (row.format === 'Stories') script = buildStoryFrames(ctx);
  else if (row.format === 'Single Post') script = buildSinglePostDirection(ctx);
  else script = buildVideoScript(ctx);

  const visualDirection =
    'Gaya clean minimal dengan nuansa putih dan sentuhan gold. Pencahayaan terang dan lembut, suasana salon yang tenang dan bersih. ' +
    plat.styleNote +
    ' ' +
    (goal === 'Trust Building'
      ? 'Tonjolkan kebersihan alat dan transparansi proses. '
      : goal === 'Engagement'
        ? 'Sertakan elemen yang memancing interaksi (pertanyaan / teks ajakan). '
        : goal === 'Booking' || goal === 'Sales'
          ? 'Tonjolkan kenyamanan dan hasil yang natural, sertakan info kontak / booking yang jelas. '
          : goal === 'Education'
            ? 'Gunakan grafis sederhana untuk poin-poin edukasi yang mudah dibaca. '
            : 'Gunakan visual sederhana yang mudah direkam dengan smartphone. ') +
    'Hindari kesan klinis atau menakutkan.';

  const overlayOptions = [
    hook,
    ts.overlay3,
    goalOverlayText(goal),
    showPrice ? 'Mulai ' + price : focusMention,
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
  if (!plat.heavyHashtags) tags = tags.slice(0, 5);

  const checklist = [
    'Siapkan ruang treatment yang bersih dan rapi.',
    'Pastikan pencahayaan terang dan lembut (cahaya natural lebih baik).',
    'Rekam dengan smartphone dalam mode stabil / pakai tripod kecil.',
    'Tampilkan proses facial secara halus, tidak terburu-buru.',
    'Tambahkan teks overlay sesuai pilihan di atas.',
    'Periksa ulang caption: hindari klaim medis & janji hasil pasti.',
  ];
  if (pillar === 'Testimoni & Kepercayaan' || goal === 'Trust Building')
    checklist.unshift('Gunakan review customer asli dan minta izin sebelum menampilkan foto/video.');
  if (row.format === 'Carousel')
    checklist.push('Pastikan tiap slide punya satu poin utama yang mudah dibaca.');
  if (row.format === 'Stories')
    checklist.push('Siapkan sticker interaktif (poll / question) bila perlu.');
  if (row.format === 'Single Post')
    checklist.push('Pilih satu visual utama yang kuat dan pastikan caption rapi.');
  if (goal === 'Engagement')
    checklist.push('Tambahkan pertanyaan / ajakan komentar untuk memancing interaksi.');
  if (goal === 'Booking' || goal === 'Sales')
    checklist.push('Pastikan info slot, jadwal, dan cara booking jelas.');
  if (plat.usesWhatsApp)
    checklist.push('Siapkan template pesan WhatsApp / link wa.me untuk mempermudah booking.');

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

/* ============================================================
   Plain-text export of a detail object (for copy / Copy All).
   Phase 16I-Rev1: the section label adapts to the row format so copied text
   matches what the modal shows (no "video" wording for slides/frames/posts).
   ============================================================ */
export function detailTexts(
  d: ContentDetail,
  format?: string,
): {
  script: string;
  hashtags: string;
  full: string;
} {
  const label =
    format === 'Carousel'
      ? 'CAROUSEL OUTLINE'
      : format === 'Stories'
        ? 'STORY FRAMES'
        : format === 'Single Post'
          ? 'POST DIRECTION'
          : 'VIDEO SCRIPT';
  const scriptText =
    d.script.sceneByScene
      .map((s) => {
        return s.time + '\n' + s.voiceover + '\nVisual: ' + s.visual + '\nText: ' + s.overlayText;
      })
      .join('\n\n') +
    (d.script.closingCTA ? '\n\nCTA: ' + d.script.closingCTA : '');
  const hashtags = d.hashtags.join(' ');
  const fullText =
    '=== CAPTION ===\n' +
    d.caption +
    '\n\n=== CAPTION SINGKAT ===\n' +
    d.shortCaption +
    '\n\n=== ' +
    label +
    ' ===\n' +
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
