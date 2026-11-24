import React from 'react';
import type { TracklistStatus } from '../../types/cms';

export interface TrackItem {
  category: string;
  title: string;
  creator: string;
  color: string;
  ink: string;
  image: string;
  status: TracklistStatus;
}

export const TrackCard: React.FC<{ item: TrackItem }> = ({ item }) => (
  <article className="track-card">
    <div
      className="track-poster"
      style={
        {
          '--c': item.color,
          color: item.ink,
        } as React.CSSProperties
      }
    >
      {item.image ? (
        <img src={item.image} alt={`${item.title} poster`} />
      ) : (
        <div className="track-poster-fallback">
          <b>{item.title}</b>
          <small>{item.creator}</small>
        </div>
      )}
      <span className="track-status-tag">{item.status}</span>
    </div>
    <div className="track-meta">
      <h2>{item.title}</h2>
      <p>
        {item.category} · {item.creator}
      </p>
    </div>
  </article>
);
