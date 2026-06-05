/*
 * sampleContent.ts
 * All static content data for Denana Social Growth OS (Phase 1).
 * Ported verbatim from the original prototype — defaults, field metadata,
 * pillars, formats, and the Bahasa Indonesia topic / CTA / hashtag banks.
 *
 * Keeping this data here (instead of inline) makes future phases easier:
 * swap these banks for real AI generation without touching UI components.
 */
import type {
  BrandSnapshot,
  Campaign,
  BrandField,
  TopicBankItem,
  Pillar,
  ContentFormat,
  Objective,
  ProductionStatus,
  PillarPlanEntry,
} from '@/types/content';

/* ---------- localStorage keys ---------- */
export const STORAGE_KEYS = {
  brandSnapshot: 'denana_brand_snapshot',
  campaign: 'denana_campaign',
  contentCalendar: 'denana_content_calendar',
  contentDrafts: 'denana_content_drafts',
  seriesBible: 'denana_series_bible',
} as const;

/* ---------- Defaults ---------- */
export const defaultBrandSnapshot: BrandSnapshot = {
  businessName: 'DenanavBeauty Salon',
  instagramHandle: '',
  area: 'Kota Bima, NTB dan sekitarnya',
  niche: 'Beauty salon lokal dengan fokus pada facial treatment dan perawatan wajah.',
  targetAudience:
    'Wanita di Kota Bima dan sekitarnya yang ingin wajah terlihat lebih fresh, bersih, dan percaya diri melalui facial treatment yang nyaman dan modern.',
  mainService: 'Facial Treatment',
  serviceDetails: 'Microdermabrasion facial treatment\nHydra Peel\nTotok wajah',
  entryPrice: 'Rp350.000',
  usp: 'DenanavBeauty Salon membantu customer tampil lebih fresh, bersih, dan percaya diri melalui facial treatment yang nyaman, modern, dan mudah diakses di Kota Bima.',
  primaryCTA: 'Booking via website atau contact via WhatsApp',
  ctaLink: '',
  websiteLink: '',
  primaryColor: 'White',
  secondaryColor: 'Gold',
  visualStyle: 'Clean minimal',
  toneOfVoice:
    'Friendly, reassuring, clean, professional, edukatif, dan tidak terlalu hard selling.',
  tagline: 'Wajah lebih fresh, percaya diri setiap hari.',
  platforms: 'Instagram, Facebook',
  contentPillars:
    'Facial Education\nSkin Concern & Solution\nTreatment Experience\nTestimonial & Trust\nPromo & Booking Awareness',
};

export function defaultCampaign(): Campaign {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 29);
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  return {
    campaignName: 'Facial Awareness Campaign',
    periodStart: toISO(start),
    periodEnd: toISO(end),
    priorityService: 'Facial Treatment',
    campaignGoal: 'Awareness',
    mainPlatform: 'Instagram dan Facebook',
    postingFrequency: '1 konten per hari selama 30 hari',
    notes:
      'Fokus bulan pertama adalah edukasi, awareness, trust building, dan pengenalan treatment facial.',
  };
}

/* ---------- Brand field metadata (labels + helper text) ---------- */
export const REQUIRED_FIELDS: Array<keyof BrandSnapshot> = [
  'businessName',
  'area',
  'mainService',
  'entryPrice',
  'primaryCTA',
  'visualStyle',
  'contentPillars',
];

export const BRAND_FIELDS: BrandField[] = [
  { key: 'businessName', label: 'Nama Bisnis', hint: 'Nama salon yang tampil di konten.', req: true },
  { key: 'instagramHandle', label: 'Instagram Handle', hint: 'Contoh: @denanavbeauty (opsional).' },
  { key: 'area', label: 'Area Target', hint: 'Wilayah utama yang ingin dijangkau.', req: true },
  { key: 'niche', label: 'Niche', hint: 'Fokus utama bisnis dalam satu kalimat.', type: 'textarea' },
  { key: 'targetAudience', label: 'Target Audience', hint: 'Siapa yang ingin dijangkau lewat konten.', type: 'textarea' },
  { key: 'mainService', label: 'Layanan Utama', hint: 'Untuk MVP ini hanya Facial Treatment.', req: true },
  { key: 'serviceDetails', label: 'Detail Layanan Facial', hint: 'Satu layanan per baris. Hanya layanan facial.', type: 'textarea' },
  { key: 'entryPrice', label: 'Harga Mulai', hint: 'Harga entry treatment.', req: true },
  { key: 'usp', label: 'USP (Keunggulan)', hint: 'Apa yang membuat salon berbeda.', type: 'textarea' },
  { key: 'primaryCTA', label: 'CTA Utama', hint: 'Ajakan utama untuk audience.', req: true },
  { key: 'ctaLink', label: 'Link Booking / WhatsApp', hint: 'Kosongkan dulu jika belum ada.' },
  { key: 'websiteLink', label: 'Website', hint: 'Link website jika tersedia (opsional).' },
  { key: 'primaryColor', label: 'Warna Utama', hint: 'Warna brand utama.' },
  { key: 'secondaryColor', label: 'Warna Sekunder', hint: 'Warna aksen brand.' },
  { key: 'visualStyle', label: 'Gaya Visual', hint: 'Mood visual konten.', req: true },
  { key: 'toneOfVoice', label: 'Tone of Voice', hint: 'Gaya bahasa saat berkomunikasi.', type: 'textarea' },
  { key: 'tagline', label: 'Tagline', hint: 'Kalimat singkat khas brand.' },
  { key: 'platforms', label: 'Platform', hint: 'Platform sosial media yang dipakai.' },
  { key: 'contentPillars', label: 'Content Pillars', hint: 'Satu pilar per baris.', type: 'textarea', req: true },
];

/* ---------- Pillars ---------- */
export const PILLARS: Pillar[] = [
  'Facial Education',
  'Skin Concern & Solution',
  'Treatment Experience',
  'Testimonial & Trust',
  'Promo & Booking Awareness',
];

// 30-day ratio: 40/25/15/10/10 -> 12 / 8 / 4 / 3 / 3
export const PILLAR_PLAN: PillarPlanEntry[] = [
  { pillar: 'Facial Education', count: 12 },
  { pillar: 'Skin Concern & Solution', count: 8 },
  { pillar: 'Treatment Experience', count: 4 },
  { pillar: 'Testimonial & Trust', count: 3 },
  { pillar: 'Promo & Booking Awareness', count: 3 },
];

const PILLAR_SHORT: Record<string, string> = {
  'Facial Education': 'Facial',
  'Skin Concern & Solution': 'Skin',
  'Treatment Experience': 'Treatment',
  'Testimonial & Trust': 'Testimonial',
  'Promo & Booking Awareness': 'Promo',
};

export function pillarShort(p: string): string {
  return PILLAR_SHORT[p] || 'Facial';
}

export const FORMATS: ContentFormat[] = ['Reels', 'Carousel', 'Single Post', 'Stories', 'Live'];

// First-week format mix: 2 Reels, 2 Carousel, 2 Stories, 1 Single Post (no back-to-back Reels).
export const FIRST_WEEK_FORMATS: ContentFormat[] = [
  'Reels',
  'Carousel',
  'Stories',
  'Reels',
  'Single Post',
  'Carousel',
  'Stories',
];

export const OBJECTIVES: Objective[] = ['Awareness', 'Engagement', 'Trust', 'Booking'];
export const STATUSES: ProductionStatus[] = ['Idea', 'Planned', 'In Production', 'Posted'];

/* ---------- Facial-only content banks (Bahasa Indonesia) ---------- */
export const TOPIC_BANK: Record<string, TopicBankItem[]> = {
  'Facial Education': [
    { t: 'Apa itu Hydra Peel dan kapan wajah membutuhkannya?', h: 'Sering dengar Hydra Peel tapi belum tahu fungsinya?', f: 'Reels' },
    { t: 'Cara menjaga wajah tetap fresh di cuaca Bima', h: 'Tips sederhana menjaga wajah tetap fresh di cuaca Bima.', f: 'Single Post' },
    { t: 'Mempersiapkan wajah sebelum acara penting', h: 'Ada acara penting? Yuk siapkan wajahmu dari jauh hari.', f: 'Carousel' },
    { t: 'Mengenal Microdermabrasion untuk wajah lebih halus', h: 'Kulit terasa kasar? Yuk kenali Microdermabrasion.', f: 'Carousel' },
    { t: 'Manfaat totok wajah sebagai bagian relaksasi', h: 'Totok wajah bukan cuma soal cantik, tapi juga rileks.', f: 'Reels' },
    { t: 'Kapan sebaiknya wajah mulai rutin facial treatment?', h: 'Bingung kapan waktu yang pas untuk facial?', f: 'Single Post' },
    { t: 'Bedanya facial biasa dan facial dengan alat', h: 'Facial biasa vs facial dengan alat, apa bedanya?', f: 'Carousel' },
    { t: 'Hal yang sebaiknya dilakukan sebelum facial treatment', h: 'Mau facial pertama kali? Siapkan ini dulu.', f: 'Carousel' },
    { t: 'Hal yang perlu diperhatikan setelah facial treatment', h: 'Sudah facial? Ini tips merawat wajah setelahnya.', f: 'Stories' },
    { t: 'Mitos dan fakta seputar facial treatment', h: 'Masih percaya mitos facial ini?', f: 'Reels' },
    { t: 'Kenapa kulit wajah butuh perawatan rutin?', h: 'Cuci muka aja belum tentu cukup, lho.', f: 'Single Post' },
    { t: 'Mengenal tahapan dasar facial treatment', h: 'Penasaran apa saja tahapan facial?', f: 'Carousel' },
    { t: 'Hydra Peel vs Microdermabrasion, mana yang cocok?', h: 'Pilih Hydra Peel atau Microdermabrasion?', f: 'Carousel' },
    { t: 'Seberapa sering sebaiknya melakukan facial?', h: 'Facial sebulan sekali, cukup nggak ya?', f: 'Single Post' },
    { t: 'Tanda wajah sedang butuh perhatian ekstra', h: 'Wajah mulai terasa kurang fresh? Perhatikan tanda ini.', f: 'Reels' },
    { t: 'Kenapa konsultasi sebelum facial itu penting', h: 'Sebelum facial, kenapa perlu konsultasi dulu?', f: 'Single Post' },
  ],
  'Skin Concern & Solution': [
    { t: 'Kenapa wajah terlihat kusam walau sudah cuci muka?', h: 'Sudah rajin cuci muka tapi wajah tetap kusam?', f: 'Reels' },
    { t: 'Kulit terasa kusam karena cuaca panas di Kota Bima', h: 'Cuaca panas bikin wajah terasa kusam dan lelah?', f: 'Reels' },
    { t: 'Komedo terasa menumpuk? Ini yang bisa membantu', h: 'Komedo balik lagi terus? Yuk pahami penyebabnya.', f: 'Carousel' },
    { t: 'Tekstur wajah terasa kasar, apa solusinya?', h: 'Wajah terasa kasar saat disentuh?', f: 'Single Post' },
    { t: 'Wajah terlihat lelah padahal sudah istirahat', h: 'Wajah terlihat capek walau tidur cukup?', f: 'Reels' },
    { t: 'Kulit terasa kurang fresh di cuaca panas', h: 'Cuaca Kota Bima bikin kulit terasa lengket?', f: 'Stories' },
    { t: 'Bingung memilih facial yang cocok untuk wajahmu', h: 'Banyak pilihan facial bikin bingung?', f: 'Carousel' },
    { t: 'Pori-pori terlihat besar, ini hal yang perlu dipahami', h: 'Pori terlihat besar bikin kurang pede?', f: 'Single Post' },
    { t: 'Wajah terasa berminyak sepanjang hari', h: 'Wajah cepat berminyak dari pagi sampai sore?', f: 'Reels' },
    { t: 'Kulit terasa kering dan kurang nyaman', h: 'Kulit terasa kering dan ketarik?', f: 'Single Post' },
    { t: 'Warna kulit terlihat kurang merata', h: 'Warna wajah terlihat belang dan kurang rata?', f: 'Carousel' },
  ],
  'Treatment Experience': [
    { t: 'Step-by-step facial treatment di DenanavBeauty Salon', h: 'Penasaran serunya facial di DenanavBeauty Salon?', f: 'Reels' },
    { t: 'Self-care wajah setelah aktivitas seharian', h: 'Capek setelah seharian beraktivitas? Sempatkan self-care.', f: 'Stories' },
    { t: 'Suasana treatment room yang bersih dan nyaman', h: 'Intip suasana treatment room kami.', f: 'Stories' },
    { t: 'Proses Hydra Peel dari awal sampai selesai', h: 'Begini proses Hydra Peel di tempat kami.', f: 'Reels' },
    { t: 'Totok wajah untuk momen relaksasi sejenak', h: 'Self-care sebentar lewat totok wajah.', f: 'Reels' },
    { t: 'Pengalaman facial pertama kali, apa yang dirasakan?', h: 'Baru pertama facial? Begini rasanya.', f: 'Carousel' },
    { t: 'Alat dan persiapan sebelum treatment dimulai', h: 'Kebersihan alat jadi prioritas kami.', f: 'Stories' },
  ],
  'Testimonial & Trust': [
    { t: 'Cerita customer setelah rutin facial treatment', h: 'Dengar cerita customer kami yuk.', f: 'Carousel' },
    { t: 'FAQ calon customer sebelum facial pertama', h: 'Pertanyaan yang sering ditanyakan sebelum facial.', f: 'Carousel' },
    { t: 'Kenapa customer merasa nyaman treatment di sini', h: 'Hal kecil yang bikin treatment terasa nyaman.', f: 'Single Post' },
    { t: 'Bagaimana kami menjelaskan treatment sebelum mulai', h: 'Sebelum mulai, kami jelaskan dulu prosesnya.', f: 'Reels' },
    { t: 'Komitmen kebersihan di setiap treatment', h: 'Kebersihan adalah hal yang tidak kami tawar.', f: 'Single Post' },
  ],
  'Promo & Booking Awareness': [
    { t: 'Facial treatment mulai Rp350.000, cocok untuk siapa?', h: 'Facial treatment mulai Rp350.000, ini untukmu?', f: 'Single Post' },
    { t: 'Cara booking facial treatment di DenanavBeauty Salon', h: 'Mau facial? Begini cara bookingnya.', f: 'Carousel' },
    { t: 'Reminder self-care mingguan untuk wajahmu', h: 'Sudah luangkan waktu untuk wajahmu minggu ini?', f: 'Stories' },
    { t: 'Cek slot treatment facial minggu ini', h: 'Slot treatment minggu ini sudah mulai terisi.', f: 'Stories' },
    { t: 'Kenapa konsultasi dulu sebelum booking itu membantu', h: 'Bingung pilih treatment? Konsultasi dulu yuk.', f: 'Single Post' },
  ],
};

export const CTA_BANK: Record<string, string[]> = {
  'Facial Education': [
    'Simpan dulu kalau kamu lagi cari info facial di Kota Bima.',
    'Konsultasi dulu untuk kenali treatment yang cocok untukmu.',
    'Simpan dulu untuk referensi facial kamu.',
  ],
  'Skin Concern & Solution': [
    'Konsultasikan dulu kondisi kulitmu dengan tim kami.',
    'Kirim pesan kalau ingin tahu treatment yang cocok.',
    'Boleh tanya dulu di komentar atau WhatsApp.',
  ],
  'Treatment Experience': [
    'Booking facial treatment via website atau WhatsApp.',
    'Cek slot treatment minggu ini lewat website atau WhatsApp.',
    'Konsultasi dulu sebelum treatment pertamamu.',
  ],
  'Testimonial & Trust': [
    'Konsultasi dulu sebelum booking, kami bantu jelaskan.',
    'Hubungi kami via website atau WhatsApp untuk tanya-tanya.',
    'Simpan dulu kalau kamu sedang cari facial terpercaya di Kota Bima.',
  ],
  'Promo & Booking Awareness': [
    'Booking facial treatment via website atau WhatsApp.',
    'Cek slot treatment minggu ini sebelum penuh.',
    'Konsultasi dulu, lalu booking via website atau WhatsApp.',
  ],
};

export const HASHTAG_BANK: string[] = [
  '#DenanavBeautySalon',
  '#FacialBima',
  '#SalonBima',
  '#FacialTreatment',
  '#PerawatanWajah',
  '#HydraPeel',
  '#Microdermabrasion',
  '#TotokWajah',
  '#FacialKotaBima',
  '#KulitFresh',
];
