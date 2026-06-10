import React from 'react';
import type { WorkItem } from '@/lib/storage';
import StatusBadge from './StatusBadge';

/*
 * WorkItemList (Phase 16C)
 * Presentational list of Work Calendar items. Each row shows the content
 * title/topic, optional campaign name, optional scheduled time, optional
 * assignee, and a status badge. Reads from the Phase 16B WorkItem shape and
 * never mutates data.
 */
const WI_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Locale-free short date from an ISO yyyy-mm-dd string (avoids timezone drift). */
function wiShortDate(iso?: string | null): string {
  if (!iso) return '';
  const parts = iso.slice(0, 10).split('-');
  if (parts.length < 3) return '';
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!m || !d) return '';
  return WI_MONTHS[m - 1] + ' ' + d;
}

export default function WorkItemList({ items }: { items: WorkItem[] }) {
  return (
    <ul className="wi-list">
      {items.map((item) => {
        const time = item.scheduledTime || '';
        const date = wiShortDate(item.scheduledDate);
        return (
          <li key={item.id} className="wi-row">
            <div className="wi-time">
              <span className="wi-time-val">{time || date || '—'}</span>
              {time && date ? <span className="wi-time-date">{date}</span> : null}
            </div>
            <div className="wi-main">
              <p className="wi-title">{item.topicTitle || 'Untitled content'}</p>
              <div className="wi-meta">
                {item.campaignName ? <span className="wi-meta-item">{item.campaignName}</span> : null}
                {item.assignee ? <span className="wi-meta-item wi-assignee">{item.assignee}</span> : null}
              </div>
            </div>
            <StatusBadge status={item.productionStatus} />
          </li>
        );
      })}
    </ul>
  );
}
