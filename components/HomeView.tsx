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
import DashboardStatGrid from './DashboardStatGrid';
import TodayWorkCard from './TodayWorkCard';
import CampaignAgendaCard from './CampaignAgendaCard';
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
      <div className="dash16b">
        {/* ---- 1. Header / greeting (no eyebrow; left-aligned with grid) ---- */}
        <PageHeader
          title={brand ? `Welcome, ${brand.businessName} 👋` : 'Welcome 👋'}
          subtitle="See your active campaign, content progress, and today's work in one place."
        />

        {/* ---- 2. Two-column command layout (reference: Home.png) ---- */}
        <div className="db-grid">
          {/* Left: dominant Campaign Agenda */}
          <div className="db-col-left">
            <CampaignAgendaCard
              campaign={campaign}
              rows={calendar}
              counts={counts}
              canSwitch={campaigns.length > 1}
              onSwitch={() => setSwitcherOpen(true)}
            />
          </div>

          {/* Right rail: Progress Content + Today's Work */}
          <div className="db-col-right">
            <Card className="db-rail-card db-progress-card">
              <div className="db-card-head">
                <span className="db-card-title">📊 Progress Content</span>
              </div>
              <DashboardStatGrid total={counts.total} campaignCount={campaigns.length} stats={statItems} />
            </Card>

            <TodayWorkCard today={todayWork} upcoming={upcomingWork} />
          </div>
        </div>
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
