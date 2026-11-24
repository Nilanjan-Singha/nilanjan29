import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  EditorCanvas,
  type EditorCanvasHandle,
} from '../components/editor/EditorCanvas';
import { EditorTopbar } from '../components/editor/EditorTopbar';
import { PostDetailsSidebar } from '../components/editor/PostDetailsSidebar';
import { PostPreviewModal } from '../components/editor/PostPreviewModal';
import { useCms } from '../context/CmsContext';
import type { EditorJSData, PostItem } from '../types/cms';

export const EditorPage: React.FC = () => {
  const { data, loading, updateData, setSaveStatus: setGlobalSaveStatus } = useCms();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const rawId = routeId ?? searchParams.get('id');
  const parsedId = rawId !== null && Number.isInteger(Number(rawId)) ? Number(rawId) : -1;

  const editorRef = useRef<EditorCanvasHandle>(null);
  const saveTimerRef = useRef<number | null>(null);

  const [postIndex, setPostIndex] = useState<number>(parsedId);
  const [title, setTitle] = useState<string>('Untitled post');
  const [date, setDate] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [excerpt, setExcerpt] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('Saved locally');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<EditorJSData | null>(null);
  const [initializedForKey, setInitializedForKey] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Edit post - Portfolio CMS';
  }, []);

  useEffect(() => {
    if (!data) return;
    const key = `${parsedId}`;
    if (initializedForKey === key) return;

    if (parsedId >= 0 && data.posts[parsedId]) {
      const existing = data.posts[parsedId];
      setPostIndex(parsedId);
      setTitle(existing.t || 'Untitled post');
      setDate(existing.d || '');
      setTags(
        Array.isArray(existing.tags)
          ? existing.tags.join(', ')
          : existing.tags || ''
      );
      setExcerpt(existing.x || '');
      setInitializedForKey(key);
    } else {
      const newPost: PostItem = {
        t: 'Untitled post',
        d: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        tags: '',
        x: '',
        body: '',
        bodyData: null,
      };
      updateData((prev) => ({ ...prev, posts: [newPost, ...prev.posts] }), true);
      setPostIndex(0);
      setTitle(newPost.t);
      setDate(newPost.d);
      setTags('');
      setExcerpt('');
      setInitializedForKey(key);
    }
  }, [data, parsedId, initializedForKey, updateData]);

  const initialEditorData = useMemo<EditorJSData>(() => {
    const target = data?.posts?.[postIndex];
    const makeCoverBlock = () => ({
      type: 'cover',
      data: {
        title: target?.t || 'Untitled post',
        subtitle: target?.x || '',
        coverUrl: '',
        icon: '📄',
      },
    });
    if (target?.bodyData && Array.isArray(target.bodyData.blocks) && target.bodyData.blocks.length > 0) {
      const existing = target.bodyData.blocks;
      if (existing[0]?.type === 'cover') {
        return target.bodyData;
      }
      return {
        ...target.bodyData,
        blocks: [makeCoverBlock(), ...existing],
      };
    }
    const text =
      typeof target?.body === 'string'
        ? target.body
        : Array.isArray(target?.body)
          ? target.body.join('\n\n')
          : '';
    const blocks = text
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) =>
        part.startsWith('## ')
          ? { type: 'header', data: { text: part.slice(3), level: 2 } }
          : { type: 'paragraph', data: { text: part } }
      );
    return {
      blocks: [makeCoverBlock(), ...(blocks.length ? blocks : [{ type: 'paragraph', data: { text: '' } }])],
    };
    // Intentionally keyed only on initializedForKey so typing doesn't re-create EditorJS
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializedForKey]);

  const titleRef = useRef(title);
  const dateRef = useRef(date);
  const tagsRef = useRef(tags);
  const excerptRef = useRef(excerpt);
  const postIndexRef = useRef(postIndex);

  titleRef.current = title;
  dateRef.current = date;
  tagsRef.current = tags;
  excerptRef.current = excerpt;
  postIndexRef.current = postIndex;

  const savePost = useCallback(async () => {
    if (!editorRef.current) return;
    setSaveStatus('Saving...');
    setGlobalSaveStatus('Saving…');
    try {
      const blocksData = await editorRef.current.save();
      const idx = postIndexRef.current;
      const firstBlock = blocksData?.blocks?.[0];
      const coverData = firstBlock?.type === 'cover' ? (firstBlock.data as Record<string, unknown>) : null;
      const syncedTitle =
        coverData && typeof coverData.title === 'string' && coverData.title.trim()
          ? coverData.title.trim()
          : titleRef.current.trim() || 'Untitled post';
      const syncedExcerpt =
        coverData && typeof coverData.subtitle === 'string' && coverData.subtitle.trim()
          ? coverData.subtitle.trim()
          : excerptRef.current.trim();
      if (coverData) {
        setTitle(syncedTitle);
        if (syncedExcerpt) setExcerpt(syncedExcerpt);
      }
      updateData(
        (prev) => {
          const nextPosts = [...prev.posts];
          if (!nextPosts[idx]) return prev;
          nextPosts[idx] = {
            ...nextPosts[idx],
            t: syncedTitle,
            d: dateRef.current.trim(),
            tags: tagsRef.current.trim(),
            x: syncedExcerpt,
            bodyData: blocksData,
            body: '',
          };
          return { ...prev, posts: nextPosts };
        },
        true,
        true
      );
      setSaveStatus('Saved to DB');
    } catch {
      setSaveStatus('Could not save');
      setGlobalSaveStatus('Could not save');
    }
  }, [updateData, setGlobalSaveStatus]);

  const queueSave = useCallback(() => {
    setSaveStatus('Unsaved');
    setGlobalSaveStatus('Unsaved');
  }, [setGlobalSaveStatus]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleOpenPreview = async () => {
    if (!editorRef.current) return;
    const saved = await editorRef.current.save();
    setPreviewData(saved);
    setSaveStatus('Preview ready');
    setPreviewOpen(true);
  };

  const handleBackToCms = async () => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    navigate('/cms/writing');
  };

  if (loading || initializedForKey === null) {
    return (
      <div className="editor-page">
        <div className="editor-shell">Loading editor…</div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <EditorTopbar
        title={title}
        saveStatus={saveStatus}
        onBack={() => void handleBackToCms()}
        onUndo={() => editorRef.current?.undo()}
        onRedo={() => editorRef.current?.redo()}
        onPreview={() => void handleOpenPreview()}
        onSave={() => void savePost()}
      />

      <main className={`editor-shell${collapsed ? ' details-collapsed' : ''}`}>
        <PostDetailsSidebar
          title={title}
          date={date}
          tags={tags}
          excerpt={excerpt}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onChangeTitle={(val) => {
            setTitle(val);
            queueSave();
          }}
          onChangeDate={(val) => {
            setDate(val);
            queueSave();
          }}
          onChangeTags={(val) => {
            setTags(val);
            queueSave();
          }}
          onChangeExcerpt={(val) => {
            setExcerpt(val);
            queueSave();
          }}
          onOpenPreview={() => void handleOpenPreview()}
        />

        <EditorCanvas
          ref={editorRef}
          date={date}
          tags={tags}
          initialData={initialEditorData}
          onReady={() => setSaveStatus('Ready')}
          onChange={queueSave}
        />
      </main>

      <PostPreviewModal
        open={previewOpen}
        title={title}
        date={date}
        tags={tags}
        data={previewData}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};
