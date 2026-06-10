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
import Link from 'next/link';
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
import DashboardStatGrid from './DashboardStatGrid';
import TodayWorkCard from './TodayWorkCard';
import NextStepBanner from './NextStepBanner';
import CampaignSwitcherModal from './CampaignSwitcherModal';

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
      <div className="dash-page">
        {/* ---- 1. Command-center header ---- */}
        <PageHeader
          eyebrow="Command Center"
          title={brand ? `Welcome, ${brand.businessName} 👋` : 'Welcome 👋'}
          subtitle="See your active campaign, content progress, and what needs to happen today."
        />

        {/* ---- 2 + 3. Primary grid: campaign (main) + rail (progress + next step) ---- */}
        <div className="dash-primary">
          {/* Active campaign — primary command card */}
          <Card className="cc-panel cc-panel-campaign dash-campaign">
            <div className="dash-card-head">
              <p className="notion-eyebrow">Active campaign</p>
              {hasCampaign && campaign && campaigns.length > 1 && (
                <button type="button" className="dash-switch" onClick={() => setSwitcherOpen(true)}>
                  Switch &rarr;
                </button>
              )}
            </div>
            {hasCampaign && campaign ? (
              <div className="dash-campaign-body">
                <h3 className="dash-campaign-name">{campaign.campaignName || 'Untitled campaign'}</h3>
                <div className="dash-meta">
                  <div className="dash-meta-row">
                    <span className="dash-meta-label">Period</span>
                    <span className="dash-meta-value">{campaign.periodStart} &ndash; {campaign.periodEnd}</span>
                  </div>
                  <div className="dash-meta-row">
                    <span className="dash-meta-label">Goal</span>
                    <span className="dash-meta-value">{campaign.campaignGoal}</span>
                  </div>
                  <div className="dash-meta-row">
                    <span className="dash-meta-label">Frequency</span>
                    <span className="dash-meta-value">{campaign.postingFrequency}</span>
                  </div>
                </div>
                <div className="dash-campaign-cta">
                  <Button href="/content-calendar">View content plan &rarr;</Button>
                </div>
              </div>
            ) : (
              <div className="cc-panel-empty">
                <div className="cc-empty-emoji">📣</div>
                <p className="cc-empty-title">No active campaign yet</p>
                <Button href="/campaign-setup">Create your first campaign &rarr;</Button>
              </div>
            )}
          </Card>

          {/* Right rail: content progress + next-step guidance */}
          <div className="dash-rail">
            <Card className="cc-panel cc-panel-progress dash-progress-card">
              <div className="dash-card-head">
                <p className="notion-eyebrow">Content progress</p>
              </div>
              {hasCalendar ? (
                <DashboardStatGrid total={counts.total} stats={statItems} />
              ) : (
                <div className="cc-panel-empty">
                  <div className="cc-empty-emoji">🗓️</div>
                  <p className="cc-empty-title">No content plan yet</p>
                  <Button href="/content-calendar" variant="secondary" size="small">Create content plan &rarr;</Button>
                </div>
              )}
            </Card>

            <NextStepBanner title={next.title} cta={next.cta} href={next.href} />
          </div>
        </div>

        {/* ---- 4. Operational focus: Today's / Upcoming work ---- */}
        {hasCalendar ? (
          <TodayWorkCard today={todayWork} upcoming={upcomingWork} />
        ) : null}

        {/* ---- 5. Secondary: compact setup-flow strip ---- */}
        <section className="dash-secondary">
          <p className="notion-eyebrow dash-secondary-label">Setup flow</p>
          <div className="dash-flow-strip">
            <Link href="/brand-setup" className={'dash-flow-chip ' + (hasBrand ? 'is-ok' : 'is-warn')}>
              <span className="dash-flow-ico" aria-hidden="true">💄</span>
              <span className="dash-flow-name">Salon Profile</span>
              <span className="dash-flow-state">{hasBrand ? 'Complete' : 'Incomplete'}</span>
            </Link>
            <Link href="/campaign-setup" className={'dash-flow-chip ' + (hasCampaign ? 'is-ok' : 'is-warn')}>
              <span className="dash-flow-ico" aria-hidden="true">📅</span>
              <span className="dash-flow-name">Campaign Plan</span>
              <span className="dash-flow-state">{hasCampaign ? 'Active' : 'None yet'}</span>
            </Link>
            <Link href="/content-calendar" className={'dash-flow-chip ' + (hasCalendar ? 'is-ok' : 'is-warn')}>
              <span className="dash-flow-ico" aria-hidden="true">🗓️</span>
              <span className="dash-flow-name">Content Plan</span>
              <span className="dash-flow-state">{hasCalendar ? calendar.length + ' content' : 'Not created'}</span>
            </Link>
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
