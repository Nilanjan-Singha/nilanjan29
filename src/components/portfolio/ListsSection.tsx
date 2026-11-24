import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ListShelf } from '../../types/cms';
import { AccordionSection } from './AccordionSection';

interface ListsSectionProps {
  lists: ListShelf[];
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
}

const BOOK_WIDTH = 62;

export const ListsSection: React.FC<ListsSectionProps> = ({
  lists,
  isOpen,
  isActiveView,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBookByTab, setSelectedBookByTab] = useState<
    Record<number, number | null>
  >({});

  const safeTab = lists.length ? Math.min(activeTab, lists.length - 1) : 0;

  const toggleBook = (tabIndex: number, bookIndex: number) => {
    setSelectedBookByTab((prev) => ({
      ...prev,
      [tabIndex]: prev[tabIndex] === bookIndex ? null : bookIndex,
    }));
  };

  return (
    <AccordionSection
      id="v-lists"
      title="Lists"
      isOpen={isOpen}
      isActiveView={isActiveView}
      onToggle={onToggle}
    >
      <div className="ltabs" role="tablist" aria-label="Lists">
        {lists.map((shelf, idx) => (
          <button
            key={`${shelf.name}-${idx}`}
            type="button"
            role="tab"
            aria-controls={`sl${idx}`}
            aria-selected={idx === safeTab}
            onClick={() => setActiveTab(idx)}
          >
            {shelf.name}
          </button>
        ))}
      </div>

      <div className="lview">
        <div
          className="ltrack"
          id="ltrack"
          style={
            lists.length
              ? { transform: `translateX(-${safeTab * 100}%)` }
              : undefined
          }
        >
          {!lists.length ? (
            <p className="empty">
              <b>No book lists found</b>
              Add a reading, watching, or gaming list in the CMS.
            </p>
          ) : (
            lists.map((shelf, tabIdx) => {
              const items = shelf.items || [];
              const selectedIdx = selectedBookByTab[tabIdx] ?? null;
              const hasSelection = selectedIdx !== null;

              return (
                <div
                  key={`${shelf.name}-${tabIdx}`}
                  className="slide"
                  role="tabpanel"
                  id={`sl${tabIdx}`}
                >
                  <div className={`row${hasSelection ? ' has-selection' : ''}`}>
                    {!items.length ? (
                      <p className="empty">
                        <b>No items in this list yet</b>
                        Add books or albums in the CMS.
                      </p>
                    ) : (
                      items.map((book, bookIdx) => {
                        const isSelected = selectedIdx === bookIdx;
                        const distance =
                          selectedIdx !== null
                            ? Math.min(Math.abs(bookIdx - selectedIdx) * 16, 64)
                            : 0;
                        const shift =
                          !hasSelection || isSelected
                            ? '0px'
                            : bookIdx < (selectedIdx ?? 0)
                              ? `-${distance}px`
                              : `${distance}px`;

                        return (
                          <div
                            key={`${book.t}-${bookIdx}`}
                            className={`sp${book.img ? ' im' : ''}${
                              isSelected ? ' selected' : ''
                            }`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            aria-label={`${book.t}, ${book.s}`}
                            title={`${book.t} - ${book.s}`}
                            style={
                              {
                                '--c': book.c || '#dfe8cf',
                                '--shift': shift,
                                color: book.ink || '#1d2d0b',
                                width: `${BOOK_WIDTH}px`,
                              } as React.CSSProperties
                            }
                            onClick={() => toggleBook(tabIdx, bookIdx)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleBook(tabIdx, bookIdx);
                              }
                            }}
                          >
                            {book.img && (
                              <img
                                className="sp-cover"
                                src={book.img}
                                alt=""
                                loading="lazy"
                              />
                            )}
                            <b>{book.t}</b>
                            <small>{book.s}</small>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="list-footer">
        <Link className="btn ghost" to="/tracklist">
          View all
        </Link>
      </div>
    </AccordionSection>
  );
};
