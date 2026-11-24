import React from 'react';
import type { PhotoItem } from '../../types/cms';
import { AccordionSection } from './AccordionSection';

interface PhotographySectionProps {
  photos: PhotoItem[];
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
}

export const PhotographySection: React.FC<PhotographySectionProps> = ({
  photos,
  isOpen,
  isActiveView,
  onToggle,
}) => {
  const validPhotos = (photos || []).filter((p) => p && p.src);

  return (
    <AccordionSection
      id="v-photography"
      title="Photography"
      isOpen={isOpen}
      isActiveView={isActiveView}
      onToggle={onToggle}
    >
      <div className="photos" id="photos">
        {validPhotos.length ? (
          validPhotos.map((p, idx) => (
            <img
              key={`${p.src.slice(0, 32)}-${idx}`}
              src={p.src}
              alt={p.alt || ''}
              loading="lazy"
            />
          ))
        ) : (
          <div className="empty photos-empty">
            <b>No photos found</b>
            <span>Add photos in the CMS and they will appear here.</span>
          </div>
        )}
      </div>
    </AccordionSection>
  );
};
