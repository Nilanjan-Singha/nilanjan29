import React from 'react';
import type { AboutData } from '../../types/cms';
import { AccordionSection } from './AccordionSection';

interface AboutSectionProps {
  about: AboutData;
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  about,
  isOpen,
  isActiveView,
  onToggle,
}) => (
  <AccordionSection
    id="v-about"
    title="About me"
    isOpen={isOpen}
    isActiveView={isActiveView}
    onToggle={onToggle}
  >
    <div className="about">
      <div id="aboutp">
        {(about.paras || []).map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
      <aside className="facts" id="facts">
        {(about.facts || []).map((fact, idx) => (
          <div key={idx}>
            <span>{fact.k}</span>
            {fact.v}
          </div>
        ))}
      </aside>
    </div>
  </AccordionSection>
);
