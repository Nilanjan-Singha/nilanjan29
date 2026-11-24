import React, { useEffect, useState } from 'react';

interface FullPreviewModalProps {
  open: boolean;
  previewHtml: string;
  onClose: () => void;
}

export const FullPreviewModal: React.FC<FullPreviewModalProps> = ({
  open,
  previewHtml,
  onClose,
}) => {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal">
      <div className="mb">
        <b>Full preview</b>
        <button className="b2" type="button" onClick={() => setMobile(false)}>
          Desktop
        </button>
        <button className="b2" type="button" onClick={() => setMobile(true)}>
          Mobile
        </button>
        <button className="b2" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="mfw">
        <iframe
          title="Full portfolio preview"
          sandbox="allow-scripts"
          srcDoc={previewHtml}
          style={{ width: mobile ? '390px' : '100%' }}
        />
      </div>
    </div>
  );
};
