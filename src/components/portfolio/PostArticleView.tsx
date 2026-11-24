import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInteractiveArticle } from 'nextgen-block-editor';
import 'nextgen-block-editor/styles.css';
import type { RenderedPost } from '../../types/cms';
import { SocialIcon } from './SocialLinks';
import { PostMeta } from './WritingSection';

interface PostArticleViewProps {
  post: RenderedPost | null;
}

export const PostArticleView: React.FC<PostArticleViewProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyHtml = post ? post.bodyHtml.join('') : '';
  useInteractiveArticle(bodyRef, bodyHtml);

  if (!post) {
    return <section className="view" id="v-post" />;
  }

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  return (
    <section className="view on" id="v-post">
      <div className="article nextgen-editor-article" id="article">
        <Link className="back" to="/#writing">
          ← Back to writing
        </Link>
        <div
          className="cover"
          role="img"
          aria-label="Wireframe sketches"
        />
        <PostMeta date={post.d} tags={post.tags} />
        <h1>{post.t}</h1>
        <div ref={bodyRef} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        <div className="share">
          <span>{copied ? 'Link copied!' : 'Share this article'}</span>
          <div>
            <button
              type="button"
              aria-label="Copy link"
              onClick={handleCopy}
            >
              <SocialIcon name="link" />
            </button>
            <button type="button" aria-label="Share on Twitter">
              <SocialIcon name="twitter" />
            </button>
            <button type="button" aria-label="Share on Dribbble">
              <SocialIcon name="dribbble" />
            </button>
            <button type="button" aria-label="Share on LinkedIn">
              <SocialIcon name="linkedin" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
