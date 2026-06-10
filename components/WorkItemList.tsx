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
export default function WorkItemList({ items }: { items: WorkItem[] }) {
  return (
    <ul className="wi-list">
      {items.map((item) => {
        const meta: React.ReactNode[] = [];
        if (item.campaignName) meta.push(<span key="c" className="wi-meta-item">{item.campaignName}</span>);
        if (item.scheduledTime) meta.push(<span key="t" className="wi-meta-item">{item.scheduledTime}</span>);
        if (item.assignee) meta.push(<span key="a" className="wi-meta-item wi-assignee">{item.assignee}</span>);
        return (
          <li key={item.id} className="wi-row">
            <div className="wi-main">
              <p className="wi-title">{item.topicTitle || 'Untitled content'}</p>
              {meta.length > 0 && <div className="wi-meta">{meta}</div>}
            </div>
            <StatusBadge status={item.productionStatus} />
          </li>
        );
      })}
    </ul>
  );
}
