import React, { useEffect, useRef, useState } from 'react';

interface ItemControlsProps {
  index: number;
  length: number;
  onMove: (from: number, to: number) => void;
  onDelete: (index: number) => void;
}

export const ItemControls: React.FC<ItemControlsProps> = ({
  index,
  length,
  onMove,
  onDelete,
}) => {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!armed) {
      setArmed(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setArmed(false), 2500);
      return;
    }
    setArmed(false);
    onDelete(index);
  };

  return (
    <span className="ctl">
      <button
        className="ib"
        type="button"
        title="Move up"
        aria-label="Move up"
        disabled={index === 0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (index > 0) onMove(index, index - 1);
        }}
      >
        ↑
      </button>
      <button
        className="ib"
        type="button"
        title="Move down"
        aria-label="Move down"
        disabled={index >= length - 1}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (index < length - 1) onMove(index, index + 1);
        }}
      >
        ↓
      </button>
      <button
        className="ib"
        type="button"
        title="Delete"
        aria-label="Delete"
        data-arm={armed ? '' : undefined}
        onClick={handleDelete}
      >
        {armed ? 'Delete?' : '×'}
      </button>
    </span>
  );
};
