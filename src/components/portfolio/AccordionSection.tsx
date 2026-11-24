import React from 'react';
import { motion } from 'motion/react';

interface AccordionSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  id,
  title,
  isOpen,
  isActiveView,
  onToggle,
  children,
}) => (
  <section
    className={`view acc${isActiveView ? ' on' : ''}${isOpen ? ' open' : ''}`}
    id={id}
  >
    <h2 className="sh">
      <button type="button" aria-expanded={isOpen} onClick={onToggle}>
        <span>{title}</span>
        <motion.svg
          className="chev"
          viewBox="0 0 24 24"
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>
    </h2>
    {children}
  </section>
);
