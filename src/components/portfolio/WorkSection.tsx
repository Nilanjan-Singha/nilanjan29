import React from 'react';
import type { WorkData } from '../../types/cms';
import { AccordionSection } from './AccordionSection';

interface WorkSectionProps {
  work: WorkData;
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  work,
  isOpen,
  isActiveView,
  onToggle,
}) => (
  <AccordionSection
    id="v-work"
    title="Work & resume"
    isOpen={isOpen}
    isActiveView={isActiveView}
    onToggle={onToggle}
  >
    <ol className="jobs" id="jobs">
      {(work.jobs || []).map((job, idx) => (
        <li key={idx}>
          <span className="yr">{job.yr}</span>
          <div>
            <h3>{job.role}</h3>
            <p className="co">{job.co}</p>
            <p>{job.desc}</p>
          </div>
        </li>
      ))}
    </ol>
    <a
      className="btn"
      id="resume"
      href={`mailto:${work.email}?subject=Resume%20request`}
    >
      Request full resume
    </a>
  </AccordionSection>
);
