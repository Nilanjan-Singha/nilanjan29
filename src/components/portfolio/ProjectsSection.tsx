import React from 'react';
import { motion } from 'motion/react';
import type { ProjectItem } from '../../types/cms';
import { AccordionSection } from './AccordionSection';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  isOpen,
  isActiveView,
  onToggle,
}) => (
  <AccordionSection
    id="v-projects"
    title="Projects"
    isOpen={isOpen}
    isActiveView={isActiveView}
    onToggle={onToggle}
  >
    <div className="grid" id="projects">
      {projects.length ? (
        projects.map((p, idx) => {
          const gradient = `linear-gradient(135deg,${p.c1 || '#dfe8cf'},${
            p.c2 || '#8fae5c'
          })`;
          const isExternal = /^https?:\/\//i.test(p.url || '');
          const href = isExternal ? p.url : '#projects';

          return (
            <motion.a
              key={`${p.t}-${idx}`}
              className="proj"
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              {p.img ? (
                <div className="thumb im">
                  <img src={p.img} alt="" />
                </div>
              ) : (
                <div className="thumb" style={{ background: gradient }} />
              )}
              <h2>{p.t}</h2>
              <p>{p.x}</p>
            </motion.a>
          );
        })
      ) : (
        <div className="empty">
          <b>No projects found</b>
          <span>Add projects in the CMS and they will appear here.</span>
        </div>
      )}
    </div>
  </AccordionSection>
);
