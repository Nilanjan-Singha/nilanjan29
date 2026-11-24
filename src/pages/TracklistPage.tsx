import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrackCard, type TrackItem } from '../components/tracklist/TrackCard';
import { useCms } from '../context/CmsContext';
import { TRACKLIST_STATUSES } from '../data/staticData';
import type { TracklistStatus } from '../types/cms';

export const TracklistPage: React.FC = () => {
  const { data, loading } = useCms();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    document.title = `Tracklist - ${data?.profile?.name || 'Nilanjan Singha'}`;
  }, [data?.profile?.name]);

  const allItems = useMemo<TrackItem[]>(() => {
    if (!data?.lists) return [];
    const items: TrackItem[] = [];
    data.lists.forEach((list) => {
      (list.items || []).forEach((item) => {
        items.push({
          category: list.name,
          title: item.t,
          creator: item.s,
          color: item.c || '#dfe8cf',
          ink: item.ink || '#1d2d0b',
          image: item.img || '',
          status: (item.status || 'Want to') as TracklistStatus,
        });
      });
    });
    return items;
  }, [data?.lists]);

  const categories = useMemo(
    () => ['All', ...(data?.lists || []).map((l) => l.name)],
    [data?.lists]
  );

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter(
      (item) =>
        (activeCategory === 'All' || item.category === activeCategory) &&
        (activeStatus === 'All' || item.status === activeStatus) &&
        (!q ||
          item.title.toLowerCase().includes(q) ||
          item.creator.toLowerCase().includes(q))
    );
  }, [allItems, activeCategory, activeStatus, query]);

  const completedCount = useMemo(
    () => allItems.filter((i) => i.status === 'Completed').length,
    [allItems]
  );
  const inProgressCount = useMemo(
    () => allItems.filter((i) => i.status === 'In progress').length,
    [allItems]
  );

  if (loading) {
    return (
      <main className="tracklist-page">
        <div className="wrap" style={{ padding: '48px 32px' }}>
          Loading tracklist…
        </div>
      </main>
    );
  }

  return (
    <main className="tracklist-page">
      <div className="wrap">
        <header className="tracklist-header">
          <h1>Tracklist</h1>
          <Link to="/">← Back to portfolio</Link>
        </header>

        <div className="tracklist-toolbar">
          <div className="tracklist-filters" aria-label="List categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={activeCategory === cat ? 'active' : undefined}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            id="track-search"
            type="search"
            placeholder="Search title or name"
            aria-label="Search tracklist"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="tracklist-status-filters" aria-label="Status filters">
          {['All', ...TRACKLIST_STATUSES].map((status) => (
            <button
              key={status}
              type="button"
              className={activeStatus === status ? 'active' : undefined}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="tracklist-stats">
          <span>{allItems.length} items</span>
          <span>{inProgressCount} in progress</span>
          <span>{completedCount} completed</span>
        </div>

        <div className="tracklist-grid">
          {visibleItems.length ? (
            visibleItems.map((item, idx) => (
              <TrackCard key={`${item.category}-${item.title}-${idx}`} item={item} />
            ))
          ) : (
            <div className="track-empty">No items match these filters.</div>
          )}
        </div>
      </div>
    </main>
  );
};
