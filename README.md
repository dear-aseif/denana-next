# Denana Social Growth OS — Next.js (Phase 1)

Internal content-planning app for **DenanavBeauty Salon**. It helps generate and
manage 30-day social media content plans (Instagram & Facebook) for Facial
Treatment, with caption / script / hashtag drafting.

This is the **Phase 1** migration of the original single-file HTML prototype
(`Denana_Social_Growth_OS (7).html`) into a clean, scalable **Next.js (App
Router) + TypeScript** project. The look, layout, content, Indonesian copy, and
behavior are preserved — only the code structure changed (plus a layout-width
fix described below).

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # next lint
```

> **Note:** `node_modules` is not bundled in this archive. Run `npm install`
> once (requires network access) before `npm run dev`.

## Project structure

```
app/
  layout.tsx                 # root layout: ToastProvider + Header + body class
  page.tsx                   # Home (dashboard)
  globals.css                # all prototype CSS (verbatim) + layout-width fix
  brand-setup/page.tsx       # Profil Brand
  campaign-setup/page.tsx    # Rencana Campaign
  content-calendar/page.tsx  # Rencana Konten (main feature)
components/
  Header.tsx                 # top bar + nav (was the hash router header)
  Shell.tsx                  # centered content container (.shell)
  RouteBodyClass.tsx         # toggles body.wide-page on the calendar route
  Button.tsx                 # .btn variants (primary/secondary/ghost, sizes)
  Note.tsx                   # gold info callout (.note)
  Footer.tsx                 # footer scope note
  StatusCard.tsx             # Home status tiles
  EmptyState.tsx             # dashed empty-state block
  ToastProvider.tsx          # global toast (replaces prototype toast())
  HomeView.tsx               # Home view content
  BrandForm.tsx              # Profil Brand form
  CampaignForm.tsx           # Rencana Campaign form
  ContentPlanner.tsx         # Rencana Konten orchestrator
  CalendarView.tsx           # 30-day calendar table
  ContentCard.tsx            # one editable calendar row
  DetailModal.tsx            # caption/script/hashtag detail + draft modal
data/
  sampleContent.ts           # defaults + topic/CTA/hashtag banks (verbatim)
lib/
  utils.ts                   # date/string helpers
  storage.ts                 # localStorage persistence (SSR-safe)
  generator.ts               # mock content engine (calendar + detail)
  exportUtils.ts             # CSV export + clipboard helpers
types/
  content.ts                 # shared TypeScript types
```

## Phase 1 scope & constraints

- No authentication, no database, no real AI API — exactly as before.
- All data is stored locally in the browser (`localStorage`), same keys as the
  prototype.
- Content generation uses the same deterministic mock engine and Bahasa
  Indonesia content banks ported verbatim from the prototype.

## Layout / UX fix

The prototype felt too narrow and centered. In `globals.css` the standard page
width was widened (1080 → 1180px) and the wide workspace used on the Rencana
Konten page (1440 → 1600px), side gaps reduced, long text set to wrap
(`overflow-wrap: anywhere`), horizontal overflow disabled, and the calendar font
slightly enlarged on big screens — without changing the white & gold brand style.

## Ready for Phase 2

- Swap `lib/generator.ts` for a real AI service (same return shapes).
- Swap `lib/storage.ts` for an API/database layer (same function signatures).
- Extend `lib/exportUtils.ts` (PDF, Google Sheets, scheduling).
- Add auth and multi-brand support on top of the existing typed data model.
