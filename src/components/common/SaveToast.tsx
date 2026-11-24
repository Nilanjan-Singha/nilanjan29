import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useCms } from '../../context/CmsContext';

export const SaveToast: React.FC = () => {
  const { saveStatus } = useCms();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const initializedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const isEditingRoute = pathname.startsWith('/cms');

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    if (!isEditingRoute || !saveStatus || saveStatus === 'Ready') return;

    setVisible(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const isErrorMsg =
      saveStatus.includes('Failed') ||
      saveStatus.includes('Could not') ||
      saveStatus.includes('Not saved') ||
      saveStatus.includes('valid');
    const isPending =
      saveStatus.includes('Saving') || saveStatus === 'Unsaved';
    if (!isPending) {
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, isErrorMsg ? 4200 : 2600);
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [saveStatus, isEditingRoute]);

  const isError =
    saveStatus.includes('Failed') ||
    saveStatus.includes('Could not') ||
    saveStatus.includes('Not saved') ||
    saveStatus.includes('valid');
  const isPending =
    saveStatus.includes('Saving') || saveStatus === 'Unsaved';

  return (
    <AnimatePresence>
      {visible && isEditingRoute && (
        <motion.div
          className={`save-toast${isPending ? ' pending' : ''}${
            isError ? ' error' : ''
          }`}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <span className="save-toast-dot" aria-hidden="true" />
          <span className="save-toast-text">{saveStatus}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
