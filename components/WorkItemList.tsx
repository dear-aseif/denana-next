import React from 'react';
import type { WorkItem } from '@/lib/storage';
import StatusBadge from './StatusBadge';

/*
 * WorkItemList (Phase 16J-Rev1B)
 * Compact presentational list of Work Calendar items for the dashboard right
 * rail. Each row shows the content title/topic, small tag chips (pillar,
 * format, campaign, assignee when available), a status badge, and a chevron
 * affordance. Reads from the Phase 16B WorkItem shape and never mutates data.
 */
export default function WorkItemList({ items }: { items: WorkItem[] }) {
  return (
    <ul className="db-wi-list">
      {items.map((item) => {
        const chips: Array<{ key: string; label: string; kind: string }> = [];
        if (item.pillar) chips.push({ key: 'p', label: String(item.pillar), kind: 'pillar' });
        if (item.format) chips.push({ key: 'f', label: String(item.format), kind: 'format' });
        if (item.campaignName)
          chips.push({ key: 'c', label: String(item.campaignName), kind: 'campaign' });
        if (item.assignee) chips.push({ key: 'a', label: String(item.assignee), kind: 'assignee' });
        return (
          <li key={item.id} className="db-wi-row">
            <div className="db-wi-main">
              <p className="db-wi-title">{item.topicTitle || 'Untitled content'}</p>
              {chips.length > 0 ? (
                <div className="db-wi-chips">
                  {chips.map((c) => (
                    <span key={c.key} className={'db-chip db-chip-' + c.kind}>
                      {c.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <span className="db-wi-status">
              <StatusBadge status={item.productionStatus} />
              <span className="db-wi-chevron" aria-hidden="true">›</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
