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
} from '@/lib/storage';
import { productionStatusLabel } from '@/lib/labels';
import Button from './Button';
import Card from './Card';
import PageHeader from './PageHeader';
import Footer from './Footer';
import StatusCard from './StatusCard';
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

  function refresh() {
    setBrand(getBrand());
    setCampaign(getCampaign());
    setCalendar(getCalendar());
    setCampaigns(getCampaigns());
    setActiveId(getActiveCampaignId());
    setBible(getSeriesBible());
    setCompetitors(getCompetitors());
    setKols(getKols());
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

  /* ---- Content progress counts (count existing rows only) ---- */
  const countBy = (status: string) => calendar.filter((r) => r.productionStatus === status).length;
  const counts = {
    total: calendar.length,
    ide: countBy('Ide'),
    direncanakan: countBy('Direncanakan'),
    sedangDibuat: countBy('Sedang Dibuat'),
    sudahDiposting: countBy('Sudah Diposting'),
  };

  /* ---- Recommended next step (one clear action based on data state) ---- */
  let next: { title: string; cta: string; href: string };
  if (!hasBrand) {
    next = { title: 'Set up your salon profile first.', cta: 'Start setup', href: '/brand-setup' };
  } else if (!hasCampaign) {
    next = { title: 'Your profile is ready. Now create your first campaign.', cta: 'Create first campaign', href: '/campaign-setup' };
  } else if (!hasCalendar) {
    next = { title: 'Your campaign is ready. Now build the content plan.', cta: 'Create content plan', href: '/content-calendar' };
  } else if (counts.sudahDiposting > 0) {
    next = { title: 'Your campaign is live. Track progress and prepare the next content.', cta: 'View content plan', href: '/content-calendar' };
  } else if (counts.sedangDibuat > 0) {
    next = { title: 'Some content is in production. Continue producing it.', cta: 'View content', href: '/content-calendar' };
  } else {
    next = { title: 'Your content plan is ready. Pick the first week of content to start producing.', cta: 'View content plan', href: '/content-calendar' };
  }

  const statItems = [
    { key: 'ide', label: productionStatusLabel('Ide'), value: counts.ide },
    { key: 'direncanakan', label: productionStatusLabel('Direncanakan'), value: counts.direncanakan },
    { key: 'dibuat', label: productionStatusLabel('Sedang Dibuat'), value: counts.sedangDibuat },
    { key: 'diposting', label: productionStatusLabel('Sudah Diposting'), value: counts.sudahDiposting },
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
              <>
                <div className="cc-total">
                  <span className="cc-total-num">{counts.total}</span>
                  <span className="cc-total-label">total content</span>
                </div>
                <div className="cc-stats">
                  {statItems.map((s) => (
                    <div key={s.key} className="cc-stat">
                      <span className="cc-stat-num">{s.value}</span>
                      <span className="cc-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </>
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

      {/* ---- 4. Next step card (the obvious main CTA) ---- */}
      <section>
        <Card className="cc-next">
          <div className="cc-next-text">
            <p className="cc-next-label">Next step</p>
            <p className="cc-next-title">{next.title}</p>
          </div>
          <Button href={next.href}>{next.cta} &rarr;</Button>
        </Card>
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
