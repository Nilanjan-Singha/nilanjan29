import React from 'react';
import { SKILL_LABELS } from '../../data/staticData';
import type { SkillsData } from '../../types/cms';
import { AccordionSection } from './AccordionSection';

interface SkillsSectionProps {
  skills: SkillsData;
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
}

interface ToolGroupProps {
  title: string;
  names: string[];
}

const ToolGroup: React.FC<ToolGroupProps> = ({ title, names }) => (
  <section className="tool-group">
    <h3>{title}</h3>
    <div className="tool-icons">
      {(names || []).map((name, idx) => {
        const label = SKILL_LABELS[name] || name;
        return (
          <img
            key={`${name}-${idx}`}
            src={`https://skillicons.dev/icons?i=${encodeURIComponent(name)}`}
            alt={label}
            title={label}
          />
        );
      })}
    </div>
  </section>
);

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  isOpen,
  isActiveView,
  onToggle,
}) => (
  <AccordionSection
    id="v-skills"
    title="Skills & tools"
    isOpen={isOpen}
    isActiveView={isActiveView}
    onToggle={onToggle}
  >
    <div className="skills-tools-content">
      <div className="skills" id="core-skills" aria-label="Core skills">
        {(skills.core || []).map((item, idx) => (
          <span key={idx}>{item}</span>
        ))}
      </div>
      <div className="tool-groups">
        <ToolGroup title="Languages" names={skills.languages} />
        <ToolGroup title="Frontend & backend" names={skills.frontend} />
        <ToolGroup title="AI & data" names={skills.ai} />
        <ToolGroup title="Tools & platforms" names={skills.tools} />
      </div>
    </div>
  </AccordionSection>
);
