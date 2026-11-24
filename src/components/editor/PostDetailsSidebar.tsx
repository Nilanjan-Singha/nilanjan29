import React from 'react';

interface PostDetailsSidebarProps {
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onChangeTitle: (value: string) => void;
  onChangeDate: (value: string) => void;
  onChangeTags: (value: string) => void;
  onChangeExcerpt: (value: string) => void;
  onOpenPreview: () => void;
}

export const PostDetailsSidebar: React.FC<PostDetailsSidebarProps> = ({
  title,
  date,
  tags,
  excerpt,
  collapsed,
  onToggleCollapse,
  onChangeTitle,
  onChangeDate,
  onChangeTags,
  onChangeExcerpt,
  onOpenPreview,
}) => (
  <aside className={`editor-meta${collapsed ? ' collapsed' : ''}`}>
    <div className="editor-meta-head">
      <strong>Post details</strong>
      <button
        className="editor-collapse-button"
        type="button"
        aria-expanded={!collapsed}
        aria-controls="editor-meta-fields"
        aria-label={collapsed ? 'Expand post details' : 'Collapse post details'}
        onClick={onToggleCollapse}
      >
        ‹
      </button>
    </div>

    <div className="editor-meta-fields" id="editor-meta-fields">
      <label>
        <span>Post title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
      </label>
      <label>
        <span>Date</span>
        <input
          type="text"
          value={date}
          onChange={(e) => onChangeDate(e.target.value)}
        />
      </label>
      <label>
        <span>Tags</span>
        <input
          type="text"
          placeholder="design, tools"
          value={tags}
          onChange={(e) => onChangeTags(e.target.value)}
        />
      </label>
      <label>
        <span>Excerpt</span>
        <textarea
          rows={5}
          value={excerpt}
          onChange={(e) => onChangeExcerpt(e.target.value)}
        />
      </label>
      <button
        className="b2 preview-meta-button"
        type="button"
        onClick={onOpenPreview}
      >
        Preview post
      </button>
    </div>
  </aside>
);
