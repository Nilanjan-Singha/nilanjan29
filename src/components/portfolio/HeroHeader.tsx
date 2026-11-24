import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SOCIALS } from '../../data/staticData';
import type { ProfileData } from '../../types/cms';
import { resolveAvatarSrc } from '../../utils/cmsHelpers';
import { SocialLinks } from './SocialLinks';

interface HeroHeaderProps {
  profile: ProfileData;
  hidden?: boolean;
}

function buildWavePath(p: number, a: number, y: number): string {
  let d = `M0 ${y} Q${p / 4} ${y - a} ${p / 2} ${y}`;
  for (let x = p; x <= 2400; x += p / 2) {
    d += ` T${x} ${y}`;
  }
  return `${d} V80 H0Z`;
}

const WAVES: [number, number, number][] = [
  [600, 14, 30],
  [400, 10, 42],
  [300, 8, 54],
];

export const HeroHeader: React.FC<HeroHeaderProps> = ({ profile, hidden }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        return saved !== 'light' && saved !== 'catppuccin-latte';
      }
    } catch {
      // ignore
    }
    const currentAttr = document.documentElement.getAttribute('data-theme');
    if (currentAttr) {
      return currentAttr !== 'light' && currentAttr !== 'catppuccin-latte';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!document.documentElement.getAttribute('data-theme')) {
        setIsDark(mq.matches);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.removeAttribute('data-ng-theme');
    try {
      localStorage.setItem('theme', next);
      localStorage.removeItem('ng-editor-theme');
    } catch {
      // ignore
    }
    setIsDark(next === 'dark');
  };

  return (
    <div className="top" style={hidden ? { display: 'none' } : undefined}>
      <div className="cover-img" id="cover-wrap">
        <button
          className="tgl"
          id="tgl"
          type="button"
          aria-label="Toggle theme"
          aria-pressed={isDark}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        >
          {isDark ? (
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
            </svg>
          )}
        </button>

        <div className="waves" aria-hidden="true">
          {WAVES.map(([p, a, y], idx) => (
            <svg key={idx} viewBox="0 0 2400 80" preserveAspectRatio="none">
              <path d={buildWavePath(p, a, y)} />
            </svg>
          ))}
        </div>

        {profile.cover && <img src={profile.cover} alt="" />}
      </div>

      <div className="wrap">
        <section className="profile">
          <motion.div
            className="pfp-wrap"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <img
              id="pfp"
              src={resolveAvatarSrc(profile.avatar)}
              alt={profile.name}
              width={150}
              height={150}
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <div>
            <div className="prow">
              <h1 id="pname">{profile.name}</h1>
            </div>
            <ul className="stats" id="pstats">
              {(profile.stats || []).map((s, idx) => (
                <li key={idx}>
                  <b>{s.n}</b> {s.l}
                </li>
              ))}
            </ul>
            <p className="bio" id="pbio">
              <strong>{profile.role}</strong>{' '}
              <span dangerouslySetInnerHTML={{ __html: profile.bio }} />
            </p>
            <SocialLinks items={SOCIALS.primary} ariaLabel="Social links" />
          </div>
        </section>
      </div>
    </div>
  );
};
