import React from 'react';
import { Link } from 'react-router-dom';
import type { RenderedPost } from '../../types/cms';
import { AccordionSection } from './AccordionSection';

interface WritingSectionProps {
  posts: RenderedPost[];
  isOpen: boolean;
  isActiveView: boolean;
  onToggle: () => void;
}

export const PostMeta: React.FC<{ date: string; tags: string[] }> = ({
  date,
  tags,
}) => (
  <div className="meta">
    <span>{date}</span>
    <span aria-hidden="true">•</span>
    {tags.map((tag, idx) => (
      <span key={`${tag}-${idx}`} className="t">
        #{tag}
      </span>
    ))}
  </div>
);

export const WritingSection: React.FC<WritingSectionProps> = ({
  posts,
  isOpen,
  isActiveView,
  onToggle,
}) => (
  <AccordionSection
    id="v-writing"
    title="Writing"
    isOpen={isOpen}
    isActiveView={isActiveView}
    onToggle={onToggle}
  >
    <div id="list">
      {posts.length ? (
        posts.map((post) => (
          <article key={post.id} className="post">
            <PostMeta date={post.d} tags={post.tags} />
            <h2>
              <Link to={`/writing/${post.id}`}>{post.t}</Link>
            </h2>
            <p>{post.x}</p>
          </article>
        ))
      ) : (
        <div className="empty">
          <b>No writing found</b>
          <span>Add posts in the CMS and they will appear here.</span>
        </div>
      )}
    </div>
  </AccordionSection>
);
