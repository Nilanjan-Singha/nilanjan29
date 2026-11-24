import React, { useRef } from 'react';
import { ItemControls } from './ItemControls';

interface StringListFieldProps {
  label: string;
  items: string[];
  addLabel: string;
  area?: boolean;
  rows?: number;
  onChange: (next: string[]) => void;
}

export const StringListField: React.FC<StringListFieldProps> = ({
  label,
  items,
  addLabel,
  area,
  rows = 3,
  onChange,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleUpdate = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
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
    const next = [...items, ''];
    onChange(next);
    window.requestAnimationFrame(() => {
      const inputs = listRef.current?.querySelectorAll('input, textarea');
      const last = inputs?.[inputs.length - 1] as HTMLElement | undefined;
      last?.focus();
    });
  };

  return (
    <div className="lst">
      <div className="lh">
        <span className="l">{label}</span>
      </div>
      <div className="strs" ref={listRef}>
        {items.map((val, idx) => (
          <div className="row" key={idx}>
            <div className="fields inl">
              <div className="f full">
                {area ? (
                  <textarea
                    rows={rows}
                    value={val}
                    onChange={(e) => handleUpdate(idx, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleUpdate(idx, e.target.value)}
                  />
                )}
              </div>
            </div>
            <ItemControls
              index={idx}
              length={items.length}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
      <button className="add" type="button" onClick={handleAdd}>
        + {addLabel}
      </button>
    </div>
  );
};
