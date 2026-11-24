import React, { useEffect } from 'react';
import { BlockRenderer } from 'nextgen-block-editor';
import type { EditorJSData } from '../../types/cms';

interface PostPreviewModalProps {
  open: boolean;
  title: string;
  date: string;
  tags: string;
  data: EditorJSData | null;
  onClose: () => void;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  open,
  title,
  date,
  tags,
  data,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="editor-preview-modal">
      <header className="editor-preview-bar">
        <strong>Post preview</strong>
        <button className="b2" type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="editor-preview-scroll">
        <article className="editor-preview-document">
          <div className="editor-canvas-meta" style={{ marginBottom: '14px' }}>
            <span>{date || 'Draft'}</span>
            {tagList.length > 0 && <span aria-hidden="true">•</span>}
            {tagList.map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="editor-tag-chip">
                #{tag}
              </span>
            ))}
          </div>
          <h1>{title.trim() || 'Untitled post'}</h1>
          <BlockRenderer data={data} />
        </article>
      </div>
    </div>
  );
};
