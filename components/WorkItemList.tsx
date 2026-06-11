import React from 'react';
import type { WorkItem } from '@/lib/storage';
import StatusBadge from './StatusBadge';

/*
 * WorkItemList (Phase 16J-Rev2 — neutral)
 * Compact presentational list of Work Calendar items for the Homepage right
 * rail. Each row shows the content title/topic, small neutral tag chips
 * (pillar, format, campaign, assignee when available), a status badge, and a
 * subtle chevron affordance. Reads the Phase 16B WorkItem shape; never mutates.
 */
export default function WorkItemList({ items }: { items: WorkItem[] }) {
  return (
    <ul className="hn-wi-list">
      {items.map((item) => {
        const chips: Array<{ key: string; label: string; kind: string }> = [];
        if (item.pillar) chips.push({ key: 'p', label: String(item.pillar), kind: 'pillar' });
        if (item.format) chips.push({ key: 'f', label: String(item.format), kind: 'format' });
        if (item.campaignName)
          chips.push({ key: 'c', label: String(item.campaignName), kind: 'campaign' });
        if (item.assignee) chips.push({ key: 'a', label: String(item.assignee), kind: 'assignee' });
        return (
          <li key={item.id} className="hn-wi-row">
            <div className="hn-wi-main">
              <p className="hn-wi-title">{item.topicTitle || 'Untitled content'}</p>
              {chips.length > 0 ? (
                <div className="hn-wi-chips">
                  {chips.map((c) => (
                    <span key={c.key} className={'hn-chip hn-chip-' + c.kind}>{c.label}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <span className="hn-wi-side">
              <StatusBadge status={item.productionStatus} />
              <span className="hn-wi-chevron" aria-hidden="true">›</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
