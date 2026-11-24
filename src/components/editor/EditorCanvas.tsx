import React, { useImperativeHandle, useRef } from 'react';
import { BlockEditor, type BlockEditorHandle } from 'nextgen-block-editor';
import 'nextgen-block-editor/styles.css';
import type { EditorJSData } from '../../types/cms';

export interface EditorCanvasHandle {
  save: () => Promise<EditorJSData | null>;
  undo: () => void;
  redo: () => void;
}

interface EditorCanvasProps {
  date: string;
  tags: string;
  initialData: EditorJSData;
  onReady: () => void;
  onChange: () => void;
}

export const EditorCanvas = React.forwardRef<
  EditorCanvasHandle,
  EditorCanvasProps
>(({ date, tags, initialData, onReady, onChange }, ref) => {
  const blockEditorRef = useRef<BlockEditorHandle>(null);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!blockEditorRef.current) return null;
      return (await blockEditorRef.current.save()) as unknown as EditorJSData | null;
    },
    undo: () => {
      blockEditorRef.current?.undo();
    },
    redo: () => {
      blockEditorRef.current?.redo();
    },
  }));

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <section className="editor-canvas">
      <div className="editor-document">
        {(date || tagList.length > 0) && (
          <div className="editor-canvas-meta">
            <span>{date || 'Draft'}</span>
            {tagList.length > 0 && <span aria-hidden="true">•</span>}
            {tagList.map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="editor-tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <BlockEditor
          ref={blockEditorRef}
          className="editor-canvas-seamless"
          initialData={initialData}
          onReady={onReady}
          onChange={onChange}
        />
      </div>
    </section>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
