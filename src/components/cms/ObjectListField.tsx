import React from 'react';
import { Link } from 'react-router-dom';
import { ItemControls } from './ItemControls';

interface ObjectListFieldProps<T> {
  label: string;
  items: T[];
  addLabel: string;
  inline?: boolean;
  top?: boolean;
  isPostList?: boolean;
  summaryKey?: keyof T;
  createItem: () => T;
  onChange: (next: T[]) => void;
  onNewPost?: () => void;
  renderFields: (
    item: T,
    index: number,
    updateItem: (patch: Partial<T>) => void
  ) => React.ReactNode;
}

export function ObjectListField<T extends object>({
  label,
  items,
  addLabel,
  inline,
  top,
  isPostList,
  summaryKey,
  createItem,
  onChange,
  onNewPost,
  renderFields,
}: ObjectListFieldProps<T>) {
  const handleUpdate = (index: number, patch: Partial<T>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const handleMove = (from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
  };

  const handleAdd = () => {
    if (isPostList && onNewPost) {
      onNewPost();
      return;
    }
    const created = createItem();
    const next = top ? [created, ...items] : [...items, created];
    onChange(next);
  };

  return (
    <div className="lst">
      <div className="lh">
        <span className="l">{label}</span>
        <span className="l">{items.length}</span>
      </div>
      <div className="items">
        {items.map((item, idx) => {
          const updateItem = (patch: Partial<T>) => handleUpdate(idx, patch);
          if (inline) {
            return (
              <div className="row" key={idx}>
                <div className="fields inl">
                  {renderFields(item, idx, updateItem)}
                </div>
                <ItemControls
                  index={idx}
                  length={items.length}
                  onMove={handleMove}
                  onDelete={handleDelete}
                />
              </div>
            );
          }

          const titleText =
            summaryKey && item[summaryKey]
              ? String(item[summaryKey])
              : 'Untitled';

          return (
            <details className="item" key={idx}>
              <summary>
                <span className="car">▸</span>
                <span className="st">{titleText}</span>
                <ItemControls
                  index={idx}
                  length={items.length}
                  onMove={handleMove}
                  onDelete={handleDelete}
                />
              </summary>
              <div className="fields">
                {renderFields(item, idx, updateItem)}
                {isPostList && (
                  <div className="f full">
                    <span className="l">Editor</span>
                    <Link
                      className="b2"
                      to={`/cms/writing/edit/${idx}`}
                      style={{ width: 'fit-content', textDecoration: 'none' }}
                    >
                      Open block editor
                    </Link>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
      <button className="add" type="button" onClick={handleAdd}>
        + {addLabel}
      </button>
    </div>
  );
}
