import React from 'react';
import { ICONS } from '../../data/staticData';
import type { SocialKey } from '../../types/cms';

interface SocialLinksProps {
  items: SocialKey[];
  ariaLabel?: string;
}

export const SocialIcon: React.FC<{ name: SocialKey }> = ({ name }) => (
  <svg
    className="i"
    viewBox="0 0 24 24"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: ICONS[name] }}
  />
);

export const SocialLinks: React.FC<SocialLinksProps> = ({ items, ariaLabel }) => (
  <div className="social" aria-label={ariaLabel}>
    {items.map((name) => (
      <a
        key={name}
        href="#"
        aria-label={name}
        onClick={(e) => e.preventDefault()}
      >
        <SocialIcon name={name} />
      </a>
    ))}
  </div>
);
