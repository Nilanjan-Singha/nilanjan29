import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CmsData } from '../../types/cms';

export type CmsSectionId =
  | 'general'
  | 'profile'
  | 'about'
  | 'work'
  | 'skills'
  | 'lists'
  | 'writing'
  | 'projects'
  | 'photos';

export interface CmsSectionMeta {
  id: CmsSectionId;
  label: string;
  description: string;
  getCount?: (data: CmsData) => number;
}

export const CMS_SECTIONS: CmsSectionMeta[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Default theme, typography font family, and accent color.',
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'Cover, avatar, name and the bio shown at the top of the site.',
  },
  {
    id: 'about',
    label: 'About me',
    description: 'Paragraphs and quick facts.',
  },
  {
    id: 'work',
    label: 'Work & resume',
    description: 'Contact email, roles and education.',
    getCount: (d) => d.work.jobs.length,
  },
  {
    id: 'skills',
    label: 'Skills & tools',
    description: 'Core skills and grouped technology icons.',
    getCount: (d) => {
      const s = d.skills;
      return (
        (s?.core?.length || 0) +
        (s?.languages?.length || 0) +
        (s?.frontend?.length || 0) +
        (s?.ai?.length || 0) +
        (s?.tools?.length || 0)
      );
    },
  },
  {
    id: 'lists',
    label: 'Lists',
    description:
      'Shelves for reading, watching, listening and gaming. Each item becomes a book spine. Add a cover image and optional URL, or leave empty for an automatic soft color.',
    getCount: (d) => d.lists.length,
  },
  {
    id: 'writing',
    label: 'Writing',
    description: 'Blog posts with a block-based Editor.js workspace.',
    getCount: (d) => d.posts.length,
  },
  {
    id: 'projects',
    label: 'Projects',
    description:
      'Project cards. Add an image and URL, or leave them empty for an automatic card.',
    getCount: (d) => d.projects.length,
  },
  {
    id: 'photos',
    label: 'Photography',
    description:
      'Your gallery. Upload photos or paste image links. With no photos, the site shows an empty-gallery message.',
    getCount: (d) => d.photos.length,
  },
];

interface CmsSidebarProps {
  data: CmsData;
  activeSection: CmsSectionId;
  previewHtml: string;
  onSelectSection: (id: CmsSectionId) => void;
  onOpenFullPreview: () => void;
  onSaveToDb: () => void;
  onDownloadHtml: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetDefaults: () => void;
}

export const CmsSidebar: React.FC<CmsSidebarProps> = ({
  data,
  activeSection,
  previewHtml,
  onSelectSection,
  onOpenFullPreview,
  onSaveToDb,
  onDownloadHtml,
  onExportJson,
  onImportJson,
  onResetDefaults,
}) => {
  const pvBoxRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState(0.25);
  const [resetArmed, setResetArmed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = pvBoxRef.current;
    if (!el) return;
    const updateScale = () => {
      const nextScale = el.clientWidth / 1200;
      if (nextScale > 0) setScale(nextScale);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleResetClick = () => {
    if (!resetArmed) {
      setResetArmed(true);
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => setResetArmed(false), 3000);
      return;
    }
    setResetArmed(false);
    onResetDefaults();
  };

  const activeMeta = CMS_SECTIONS.find((s) => s.id === activeSection);

  return (
    <aside className="side">
      <div className="cms-mobile-bar">
        <div className="cms-mobile-title">
          <b>Site content</b>
          <span>{activeMeta?.label || 'General'}</span>
        </div>
        <button
          type="button"
          className="b2 cms-burger-btn"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle sections menu"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? '✕ Close' : '☰ Sections'}
        </button>
      </div>

      <div className="brand">
        <b>Site content</b>
        <small>Edit everything on your portfolio</small>
      </div>

      <Link className="b2 portfolio-link" to="/">
        Go to portfolio
      </Link>

      <nav className={mobileMenuOpen ? 'is-menu-open' : undefined} aria-label="Sections">
        {CMS_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            aria-current={activeSection === sec.id ? 'true' : 'false'}
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectSection(sec.id);
            }}
          >
            <span>{sec.label}</span>
            <span className="n">{sec.getCount ? sec.getCount(data) : ''}</span>
          </button>
        ))}
      </nav>

      <div className="pv">
        <div className="pvh">
          <span>Live preview</span>
          <button className="b2" type="button" onClick={onOpenFullPreview}>
            Open full
          </button>
        </div>
        <div
          className="pvbox"
          ref={pvBoxRef}
          style={{ height: `${Math.round(760 * scale)}px` }}
        >
          <iframe
            title="Portfolio preview"
            sandbox="allow-scripts"
            tabIndex={-1}
            srcDoc={previewHtml}
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>

      <div className="acts">
        <button className="b2 p" type="button" onClick={onSaveToDb}>
          Save to DB
        </button>
        <button className="b2" type="button" onClick={onDownloadHtml}>
          Download site (.html)
        </button>
        <button className="b2" type="button" onClick={onExportJson}>
          Export content (.json)
        </button>
        <button
          className="b2"
          type="button"
          onClick={() => importInputRef.current?.click()}
        >
          Import content
        </button>
        <button
          className="b2"
          type="button"
          data-arm={resetArmed ? '' : undefined}
          onClick={handleResetClick}
        >
          {resetArmed ? 'Click again to confirm' : 'Reset to defaults'}
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportJson(file);
            e.target.value = '';
          }}
        />
        <p className="note">
          Edits save in this browser. Download the site to publish your changes.
        </p>
      </div>
    </aside>
  );
};
