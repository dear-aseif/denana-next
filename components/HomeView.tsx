'use client';

/*
 * HomeView — Dashboard / Command Center
 *
 * Phase 16C-Rev1 (visual alignment): the dashboard is reworked to read as an
 * operational command center rather than a long landing page.
 *  - Compact page header.
 *  - Top command grid: a primary Active Campaign card (wider) + a Content
 *    Progress card (status breakdown).
 *  - Today's / Upcoming Work agenda panel directly below.
 *  - A compact Next Step banner.
 *  - Main Flow reduced to a small secondary row; the Supporting Tools section
 *    was removed from the dashboard (those already live in the sidebar).
 *
 * This revision is visual only. The data model, status model, storage logic,
 * campaign generation, and Work Calendar helpers are unchanged.
 */
import React, { useEffect, useState } from 'react';
import type { BrandSnapshot, Campaign, CampaignRecord, ContentRow } from '@/types/content';
import {
  getBrand,
  getCampaign,
  getCalendar,
  getCampaigns,
  getActiveCampaignId,
  setActiveCampaignId,
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
const panelHeadStyle: React.CSSProperties = { marginTop: 8, marginBottom: 14 };

export default function HomeView() {
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState<BrandSnapshot | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [calendar, setCalendar] = useState<ContentRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [todayWork, setTodayWork] = useState<WorkItem[]>([]);
  const [upcomingWork, setUpcomingWork] = useState<WorkItem[]>([]);

  function refresh() {
    setBrand(getBrand());
    setCampaign(getCampaign());
    setCalendar(getCalendar());
    setCampaigns(getCampaigns());
    setActiveId(getActiveCampaignId());
    setTodayWork(getTodayWorkItems());
    setUpcomingWork(getUpcomingWorkItems());
  }

  useEffect(() => {
    refresh();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasBrand = !!brand;
  const hasCampaign = !!campaign;
  const hasCalendar = calendar.length > 0;

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
      <div className="cc-page">
        {/* ---- 1. Header / greeting ---- */}
        <PageHeader
          eyebrow="Command Center"
          title={brand ? `Welcome, ${brand.businessName} 👋` : 'Welcome 👋'}
          subtitle="See your active campaign, content progress, and next step in one place."
        />

        {/* ---- 2 + 3. Command grid: primary campaign card + progress ---- */}
        <div className="cc-grid">
          {/* 2. Active campaign — the primary working card */}
          <Card className="cc-panel cc-panel-campaign">
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
          <Card className="cc-panel cc-panel-progress">
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

        {/* ---- 4. Today's / Upcoming work agenda (Work Calendar helper data) ---- */}
        {hasCalendar && (
          <TodayWorkCard today={todayWork} upcoming={upcomingWork} />
        )}

        {/* ---- 5. Next step banner (compact main CTA) ---- */}
        <NextStepBanner title={next.title} cta={next.cta} href={next.href} />

        {/* ---- 6. Main Flow (compact, secondary) ---- */}
        <section className="cc-flow">
          <p className="notion-eyebrow" style={sectionLabelStyle}>Main Flow</p>
          <div className="grid grid-3 cc-flow-grid">
            <StatusCard
              compact
              icon="💄"
              title="Salon Profile"
              tone={hasBrand ? 'ok' : 'warn'}
              pill={hasBrand ? 'Complete' : 'Incomplete'}
              href="/brand-setup"
            />
            <StatusCard
              compact
              icon="📅"
              title="Campaign Plan"
              tone={hasCampaign ? 'ok' : 'warn'}
              pill={hasCampaign ? 'Active' : 'None yet'}
              href="/campaign-setup"
            />
            <StatusCard
              compact
              icon="🗓️"
              title="Content Plan"
              tone={hasCalendar ? 'ok' : 'warn'}
              pill={hasCalendar ? calendar.length + ' content' : 'Not created'}
              href="/content-calendar"
            />
          </div>
        </section>
      </div>

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
