import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AboutSection } from '../components/portfolio/AboutSection';
import { HeroHeader } from '../components/portfolio/HeroHeader';
import { ListsSection } from '../components/portfolio/ListsSection';
import { PhotographySection } from '../components/portfolio/PhotographySection';
import { PortfolioFooter } from '../components/portfolio/PortfolioFooter';
import { PostArticleView } from '../components/portfolio/PostArticleView';
import { ProjectsSection } from '../components/portfolio/ProjectsSection';
import { SkillsSection } from '../components/portfolio/SkillsSection';
import { WorkSection } from '../components/portfolio/WorkSection';
import { WritingSection } from '../components/portfolio/WritingSection';
import { useCms } from '../context/CmsContext';
import { cmsPostToRendered } from '../utils/cmsHelpers';

type SectionKey =
  | 'about'
  | 'work'
  | 'skills'
  | 'lists'
  | 'writing'
  | 'projects'
  | 'photography';

const SECTION_KEYS: SectionKey[] = [
  'about',
  'work',
  'skills',
  'lists',
  'writing',
  'projects',
  'photography',
];

export const PortfolioPage: React.FC = () => {
  const { data, loading, error } = useCms();
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [hash, setHash] = useState<string>(() =>
    (window.location.hash || '').slice(1)
  );
  const [openSection, setOpenSection] = useState<SectionKey | null>('about');

  const renderedPosts = useMemo(
    () => (data?.posts || []).map(cmsPostToRendered),
    [data?.posts]
  );

  const activePost = useMemo(() => {
    if (slug) {
      return renderedPosts.find((p) => p.id === slug) || null;
    }
    return renderedPosts.find((p) => p.id === hash) || null;
  }, [renderedPosts, slug, hash]);

  useEffect(() => {
    if (!slug && hash) {
      const legacyPost = renderedPosts.find((p) => p.id === hash);
      if (legacyPost) {
        navigate(`/writing/${legacyPost.id}`, { replace: true });
      }
    }
  }, [slug, hash, renderedPosts, navigate]);

  useEffect(() => {
    const onHashChange = () => {
      setHash((window.location.hash || '').slice(1));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (activePost && data?.profile) {
      document.title = `${activePost.t} — ${data.profile.name}`;
    } else if (data?.profile) {
      document.title = `${data.profile.name} — ${data.profile.role}`;
    }
  }, [activePost, data?.profile]);

  useEffect(() => {
    if (!hash || activePost) {
      window.scrollTo(0, 0);
      return;
    }
    if (SECTION_KEYS.includes(hash as SectionKey)) {
      const key = hash as SectionKey;
      setOpenSection(key);
      window.requestAnimationFrame(() => {
        const el = document.getElementById(`v-${key}`);
        if (el) el.scrollIntoView();
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, activePost]);

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '64px 32px' }}>
        Loading portfolio…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="wrap" style={{ padding: '64px 32px' }}>
        {error || 'Could not load portfolio data.'}
      </div>
    );
  }

  const toggle = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const showSections = !activePost;

  return (
    <>
      <HeroHeader profile={data.profile} hidden={Boolean(activePost)} />
      <main>
        <div className="wrap">
          <AboutSection
            about={data.about}
            isOpen={openSection === 'about'}
            isActiveView={showSections}
            onToggle={() => toggle('about')}
          />
          <WorkSection
            work={data.work}
            isOpen={openSection === 'work'}
            isActiveView={showSections}
            onToggle={() => toggle('work')}
          />
          <SkillsSection
            skills={data.skills}
            isOpen={openSection === 'skills'}
            isActiveView={showSections}
            onToggle={() => toggle('skills')}
          />
          <ListsSection
            lists={data.lists}
            isOpen={openSection === 'lists'}
            isActiveView={showSections}
            onToggle={() => toggle('lists')}
          />
          <WritingSection
            posts={renderedPosts}
            isOpen={openSection === 'writing'}
            isActiveView={showSections}
            onToggle={() => toggle('writing')}
          />
          <ProjectsSection
            projects={data.projects}
            isOpen={openSection === 'projects'}
            isActiveView={showSections}
            onToggle={() => toggle('projects')}
          />
          <PhotographySection
            photos={data.photos}
            isOpen={openSection === 'photography'}
            isActiveView={showSections}
            onToggle={() => toggle('photography')}
          />
          {activePost && <PostArticleView post={activePost} />}
        </div>
      </main>
      <PortfolioFooter profile={data.profile} />
    </>
  );
};
