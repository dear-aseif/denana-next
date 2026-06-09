'use client';

/*
 * HomeView - Dashboard (Phase 16A: English copy + shell primitives)
 * A practical command center for the salon owner/staff. It answers, from one
 * place: which campaign is active, how far content has progressed, what the
 * next step is, and which button to click.
 *
 * Phase 16A: UI copy converted to English and the hero/cards now use the
 * reusable PageHeader + Card primitives. Production-status counts still read
 * the original stored values ('Ide' | 'Direncanakan' | 'Sedang Dibuat' |
 * 'Sudah Diposting'); only the displayed labels are mapped to English via
 * lib/labels. No data-structure, generator, or storage changes.
 */
import React, { useEffect, useState } from 'react';
import type { BrandSnapshot, Campaign, CampaignRecord, ContentRow, SeriesBible, CompetitorEntry, KolEntry } from '@/types/content';
import {
  getBrand,
  getCampaign,
  getCalendar,
  getCampaigns,
  getActiveCampaignId,
  setActiveCampaignId,
  getSeriesBible,
  getCompetitors,
  getKols,
  getTodayWorkItems,
  getUpcomingWorkItems,
  type WorkItem,
} from '@/lib/storage';
import { getContentStatusLabel, getContentStatusTone, normalizeContentStatus } from '@/lib/labels';
import Button from './Button';
import Card from './Card';
import PageHeader from './PageHeader';
import Footer from './Footer';
import StatusCard from './StatusCard';
import DashboardStatGrid from './DashboardStatGrid';
import TodayWorkCard from './TodayWorkCard';
import NextStepBanner from './NextStepBanner';
import CampaignSwitcherModal from './CampaignSwitcherModal';

const sectionLabelStyle: React.CSSProperties = { marginBottom: 6, marginTop: 0 };
const sectionDescStyle: React.CSSProperties = { marginTop: 0, marginBottom: 14 };
const panelHeadStyle: React.CSSProperties = { marginTop: 8, marginBottom: 14 };

export default function HomeView() {
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState<BrandSnapshot | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [calendar, setCalendar] = useState<ContentRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [bible, setBible] = useState<SeriesBible | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([]);
  const [kols, setKols] = useState<KolEntry[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [todayWork, setTodayWork] = useState<WorkItem[]>([]);
  const [upcomingWork, setUpcomingWork] = useState<WorkItem[]>([]);

  function refresh() {
    setBrand(getBrand());
    setCampaign(getCampaign());
    setCalendar(getCalendar());
    setCampaigns(getCampaigns());
    setActiveId(getActiveCampaignId());
    setBible(getSeriesBible());
    setCompetitors(getCompetitors());
    setKols(getKols());
    setTodayWork(getTodayWorkItems());
    setUpcomingWork(getUpcomingWorkItems());
  }

  useEffect(() => {
    refresh();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasBrand = !!brand;
  const hasBible = !!bible;
  const hasCampaign = !!campaign;
  const hasCalendar = calendar.length > 0;
  const hasCompetitors = competitors.length > 0;
  const hasKols = kols.length > 0;

  /* ---- Content progress counts (Phase 16B five-status workflow) ---- */
  const countBy = (status: string) =>
    calendar.filter((r) => normalizeContentStatus(r.productionStatus) === status).length;
  const counts = {
    total: calendar.length,
    planning: countBy('Planning'),
    scheduled: countBy('Scheduled'),
    inProduction: countBy('In Production'),
    readyToPost: countBy('Ready to Post'),
    posted: countBy('Posted'),
  };

  /* ---- Recommended next step (one clear action based on data state) ---- */
  let next: { title: string; cta: string; href: string };
  if (!hasBrand) {
    next = { title: 'Set up your salon profile first.', cta: 'Start setup', href: '/brand-setup' };
  } else if (!hasCampaign) {
    next = { title: 'Your profile is ready. Now create your first campaign.', cta: 'Create first campaign', href: '/campaign-setup' };
  } else if (!hasCalendar) {
    next = { title: 'Your campaign is ready. Now build the content plan.', cta: 'Create content plan', href: '/content-calendar' };
  } else if (counts.readyToPost > 0) {
    next = { title: 'You have content ready to post.', cta: 'Review work', href: '/content-calendar' };
  } else if (counts.inProduction > 0) {
    next = { title: 'Some content is currently in production. Review progress and prepare for posting.', cta: 'Review work', href: '/content-calendar' };
  } else if (counts.scheduled > 0) {
    next = { title: 'You have scheduled content ready to assign or start producing.', cta: 'Review work', href: '/content-calendar' };
  } else if (counts.posted > 0 && counts.posted === counts.total) {
    next = { title: 'All your content is posted. Plan your next move.', cta: 'View content plan', href: '/content-calendar' };
  } else {
    next = { title: 'Your content plan is ready. Pick content to schedule for production.', cta: 'View content plan', href: '/content-calendar' };
  }

  const statItems = [
    { key: 'planning', label: getContentStatusLabel('Planning'), value: counts.planning, tone: getContentStatusTone('Planning') },
    { key: 'scheduled', label: getContentStatusLabel('Scheduled'), value: counts.scheduled, tone: getContentStatusTone('Scheduled') },
    { key: 'production', label: getContentStatusLabel('In Production'), value: counts.inProduction, tone: getContentStatusTone('In Production') },
    { key: 'ready', label: getContentStatusLabel('Ready to Post'), value: counts.readyToPost, tone: getContentStatusTone('Ready to Post') },
    { key: 'posted', label: getContentStatusLabel('Posted'), value: counts.posted, tone: getContentStatusTone('Posted') },
  ];

  function switchCampaign(id: string) {
    setActiveCampaignId(id);
    setSwitcherOpen(false);
    refresh();
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  return (
    <>
      {/* ---- 1. Hero / greeting ---- */}
      <PageHeader
        eyebrow="Command Center"
        title={brand ? `Welcome, ${brand.businessName} 👋` : 'Welcome 👋'}
        subtitle="See your active campaign, content progress, and next step in one place."
      />

      {/* ---- 2 + 3. Active campaign  &  Content progress ---- */}
      <section>
        <div className="grid grid-2">
          {/* 2. Active campaign card (with switcher when >1 campaign) */}
          <Card className="cc-panel">
            <p className="notion-eyebrow" style={sectionLabelStyle}>Active campaign</p>
            {hasCampaign && campaign ? (
              <>
                <h3 style={panelHeadStyle}>{campaign.campaignName || 'Untitled campaign'}</h3>
                <div className="cc-meta">
                  <div className="cc-meta-row">
                    <span className="cc-meta-label">Period</span>
                    <span className="cc-meta-value">{campaign.periodStart} &ndash; {campaign.periodEnd}</span>
                  </div>
                  <div className="cc-meta-row">
                    <span className="cc-meta-label">Goal</span>
                    <span className="cc-meta-value">{campaign.campaignGoal}</span>
                  </div>
                  <div className="cc-meta-row">
                    <span className="cc-meta-label">Frequency</span>
                    <span className="cc-meta-value">{campaign.postingFrequency}</span>
                  </div>
                </div>
                <div className="cc-panel-cta">
                  <Button href="/content-calendar">View content plan &rarr;</Button>
                  {campaigns.length > 1 && (
                    <Button variant="secondary" onClick={() => setSwitcherOpen(true)}>Switch campaign</Button>
                  )}
                </div>
              </>
            ) : (
              <div className="cc-panel-empty">
                <div className="cc-empty-emoji">📣</div>
                <p className="cc-empty-title">No active campaign yet</p>
                <Button href="/campaign-setup">Create your first campaign &rarr;</Button>
              </div>
            )}
          </Card>

          {/* 3. Content progress summary */}
          <Card className="cc-panel">
            <p className="notion-eyebrow" style={sectionLabelStyle}>Content progress</p>
            {hasCalendar ? (
              <DashboardStatGrid total={counts.total} stats={statItems} />
            ) : (
              <div className="cc-panel-empty">
                <div className="cc-empty-emoji">🗓️</div>
                <p className="cc-empty-title">No content plan yet</p>
                <Button href="/content-calendar">Create content plan &rarr;</Button>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ---- 3b. Today's / Upcoming work (Work Calendar helper data) ---- */}
      {hasCalendar && (
        <section>
          <TodayWorkCard today={todayWork} upcoming={upcomingWork} />
        </section>
      )}

      {/* ---- 4. Next step banner (the obvious main CTA) ---- */}
      <section>
        <NextStepBanner title={next.title} cta={next.cta} href={next.href} />
      </section>

      {/* ---- 5. Core flow cards (secondary) ---- */}
      <section>
        <p className="notion-eyebrow" style={sectionLabelStyle}>Main Flow</p>
        <div className="grid grid-3">
          <StatusCard
            icon="💄"
            title="Salon Profile"
            tone={hasBrand ? 'ok' : 'warn'}
            pill={hasBrand ? 'Complete' : 'Incomplete'}
            desc="Identity, facial services, tone of voice, and content pillars."
            btn={hasBrand ? 'Review profile' : 'Complete now'}
            href="/brand-setup"
          />
          <StatusCard
            icon="📅"
            title="Campaign Plan"
            tone={hasCampaign ? 'ok' : 'warn'}
            pill={hasCampaign ? 'Active' : 'None yet'}
            desc="Period, goal, platform, and posting frequency for the campaign."
            btn={hasCampaign ? 'Review campaign' : 'Create campaign'}
            href="/campaign-setup"
          />
          <StatusCard
            icon="🗓️"
            title="Content Plan"
            tone={hasCalendar ? 'ok' : 'warn'}
            pill={hasCalendar ? calendar.length + ' content' : 'Not created'}
            desc="Content calendar with captions, scripts, and hashtags."
            btn={hasCalendar ? 'Open plan' : 'Create plan'}
            href="/content-calendar"
          />
        </div>
      </section>

      {/* ---- 6. Supporting tools (secondary) ---- */}
      <section>
        <p className="notion-eyebrow" style={sectionLabelStyle}>Supporting Tools</p>
        <p className="notion-muted" style={sectionDescStyle}>Use these once your main flow is running.</p>
        <div className="grid grid-3">
          <StatusCard
            icon="📖"
            title="Series Bible"
            tone={hasBible ? 'ok' : 'warn'}
            pill={hasBible ? 'Saved' : 'Not created'}
            desc="Manifesto, persona, visual DNA, caption framework, and posting strategy."
            btn={hasBible ? 'Open Series Bible' : 'Create Series Bible'}
            href="/series-bible"
          />
          <StatusCard
            icon="🔍"
            title="Competitor Audit"
            tone={hasCompetitors ? 'ok' : 'warn'}
            pill={hasCompetitors ? competitors.length + ' competitors' : 'Empty'}
            desc="A guide to auditing competitors' organic content plus notes on their strengths and gaps."
            btn={hasCompetitors ? 'Open Audit' : 'Start Audit'}
            href="/competitor-audit"
          />
          <StatusCard
            icon="🤝"
            title="KOL / UGC Brief"
            tone={hasKols ? 'ok' : 'warn'}
            pill={hasKols ? kols.length + ' KOLs' : 'Empty'}
            desc="Collaboration brief for local KOLs/creators plus a candidate list and their status."
            btn={hasKols ? 'Open Brief' : 'Create Brief'}
            href="/kol-brief"
          />
        </div>
      </section>

      <Footer />

      {switcherOpen && campaigns.length > 0 && (
        <CampaignSwitcherModal
          campaigns={campaigns}
          activeId={activeId}
          onActivate={switchCampaign}
          onClose={() => setSwitcherOpen(false)}
        />
      )}
    </>
  );
}
