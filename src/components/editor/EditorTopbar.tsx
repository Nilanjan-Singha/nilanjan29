import React from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/cmsHelpers';

interface EditorTopbarProps {
  title: string;
  saveStatus: string;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export const EditorTopbar: React.FC<EditorTopbarProps> = ({
  title,
  saveStatus,
  onBack,
  onUndo,
  onRedo,
  onPreview,
  onSave,
}) => {
  const isDirty =
    saveStatus === 'Unsaved' || saveStatus === 'Saving...';
  const isError = saveStatus === 'Could not save' || saveStatus.includes('failed');

  return (
    <header className="editor-topbar">
      <div className="editor-topbar-left">
        <Link
          className="b2 editor-icon-btn editor-back-btn"
          to="/cms/writing"
          title="Back to CMS"
          aria-label="Back to CMS"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="editor-slug-pill" title="Post URL slug">
          /writing/{slugify(title)}
        </span>
      </div>

      <div className="editor-actions">
        <span
          className={`editor-status-pill${isDirty ? ' dirty' : ''}${
            isError ? ' error' : ''
          }`}
          title={saveStatus}
        >
          <span className="editor-status-dot" aria-hidden="true" />
          <span>{saveStatus}</span>
        </span>

        <button
          className="b2 editor-icon-btn"
          type="button"
          title="Undo"
          aria-label="Undo"
          onClick={onUndo}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>

        <button
          className="b2 editor-icon-btn"
          type="button"
          title="Redo"
          aria-label="Redo"
          onClick={onRedo}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>

        <button
          className="b2 editor-icon-btn"
          type="button"
          title="Preview post"
          aria-label="Preview post"
          onClick={onPreview}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        <button
          className="b2 p editor-icon-btn"
          type="button"
          title="Save post"
          aria-label="Save post"
          onClick={onSave}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </button>
      </div>
    </header>
  );
};
