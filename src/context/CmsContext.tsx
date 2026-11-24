import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DEFAULT_SETTINGS, DEFAULT_SKILLS, FONT_FAMILY_OPTIONS } from '../data/staticData';
import type { CmsData } from '../types/cms';
import { cloneData, CMS_STORAGE_KEY } from '../utils/cmsHelpers';

interface CmsContextValue {
  data: CmsData | null;
  defaultData: CmsData | null;
  previewTemplate: string;
  loading: boolean;
  error: string | null;
  saveStatus: string;
  setSaveStatus: (status: string) => void;
  updateData: (
    updater: CmsData | ((prev: CmsData) => CmsData),
    immediate?: boolean,
    syncToDb?: boolean
  ) => void;
  saveToDb: () => void;
  resetToDefaults: () => void;
  importData: (nextData: CmsData) => void;
}

const CmsContext = createContext<CmsContextValue | undefined>(undefined);

function normalizeCmsData(raw: Partial<CmsData> | null | undefined): CmsData {
  const base = cloneData(raw || {}) as CmsData;
  base.photos = (base.photos || []).filter((p) => p && 'src' in p);
  if (!base.skills) {
    base.skills = cloneData(DEFAULT_SKILLS);
  }
  base.settings = {
    ...DEFAULT_SETTINGS,
    ...(base.settings || {}),
  };
  base.lists = base.lists || [];
  base.posts = base.posts || [];
  base.projects = base.projects || [];
  return base;
}

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<CmsData | null>(null);
  const [defaultData, setDefaultData] = useState<CmsData | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('Saved');
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/cms', { cache: 'no-store' })
        .then((r) => (r.ok ? (r.json() as Promise<CmsData>) : null))
        .catch(() => null),
      fetch('/cms/d0.json', { cache: 'no-store' }).then((r) => {
        if (!r.ok) throw new Error('Could not load default content');
        return r.json() as Promise<CmsData>;
      }),
      fetch('/cms/preview-template.html').then((r) => {
        if (!r.ok) throw new Error('Could not load preview template');
        return r.text();
      }),
    ])
      .then(([dbData, defaults, tpl]) => {
        if (!active) return;
        const normalizedDefaults = normalizeCmsData(defaults);
        setDefaultData(normalizedDefaults);
        setPreviewTemplate(tpl);

        let initial = normalizedDefaults;
        if (dbData && dbData.profile && dbData.posts) {
          initial = normalizeCmsData(dbData);
          try {
            localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(initial));
          } catch {
            // ignore
          }
        } else {
          try {
            const saved = localStorage.getItem(CMS_STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved) as CmsData;
              if (parsed && parsed.profile && parsed.posts) {
                initial = normalizeCmsData(parsed);
              }
            }
          } catch {
            // ignore invalid localStorage
          }
        }
        setData(initial);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message || 'Couldn’t load CMS files');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const settings = data?.settings;
    if (!settings) return;
    const root = document.documentElement;
    const fontOpt = FONT_FAMILY_OPTIONS.find((f) => f.value === settings.fontFamily);
    if (fontOpt) {
      root.style.setProperty('--serif', fontOpt.stack);
      root.style.setProperty('--mono', fontOpt.stack);
    }
    if (settings.accentColor && /^#[0-9a-f]{6}$/i.test(settings.accentColor)) {
      const hex = settings.accentColor;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      root.style.setProperty('--accent', hex);
      root.style.setProperty('--accent-ink', luminance > 0.58 ? '#10160a' : '#ffffff');
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-ink');
    }

    // Only apply CMS default theme if user hasn't explicitly toggled a local override
    let userOverride: string | null = null;
    try {
      userOverride = localStorage.getItem('theme');
    } catch {
      // ignore
    }
    if (!userOverride) {
      if (settings.theme && settings.theme !== 'system') {
        root.setAttribute('data-theme', settings.theme);
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }, [data?.settings]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CMS_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as CmsData;
        if (parsed && parsed.profile && parsed.posts) {
          setData(normalizeCmsData(parsed));
        }
      } catch (err) {
        console.error('Could not apply CMS content update', err);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistToStorage = useCallback(
    (next: CmsData, immediate = false, syncToDb = false) => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
      const write = () => {
        try {
          localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          setSaveStatus('Not saved in this browser');
          return;
        }

        if (!syncToDb) {
          setSaveStatus('Saved locally (click Save to sync DB)');
          return;
        }

        fetch('/api/cms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        })
          .then((res) => {
            setSaveStatus(
              res.ok ? 'Saved to DB' : 'Failed to save to DB (saved locally)'
            );
          })
          .catch(() => {
            setSaveStatus('Saved locally (DB offline)');
          });
      };
      if (immediate) {
        write();
      } else {
        setSaveStatus('Saving…');
        saveTimerRef.current = window.setTimeout(write, 350);
      }
    },
    []
  );

  const updateData = useCallback(
    (
      updater: CmsData | ((prev: CmsData) => CmsData),
      immediate = false,
      syncToDb = false
    ) => {
      setData((prev) => {
        if (!prev) return prev;
        const next =
          typeof updater === 'function' ? updater(prev) : updater;
        const normalized = normalizeCmsData(next);
        persistToStorage(normalized, immediate, syncToDb);
        return normalized;
      });
    },
    [persistToStorage]
  );

  const saveToDb = useCallback(() => {
    if (!data) return;
    setSaveStatus('Saving…');
    persistToStorage(data, true, true);
  }, [data, persistToStorage]);

  const resetToDefaults = useCallback(() => {
    if (!defaultData) return;
    const fresh = cloneData(defaultData);
    setData(fresh);
    persistToStorage(fresh, true, true);
  }, [defaultData, persistToStorage]);

  const importData = useCallback(
    (nextData: CmsData) => {
      const normalized = normalizeCmsData(nextData);
      setData(normalized);
      persistToStorage(normalized, true, true);
    },
    [persistToStorage]
  );

  return (
    <CmsContext.Provider
      value={{
        data,
        defaultData,
        previewTemplate,
        loading,
        error,
        saveStatus,
        setSaveStatus,
        updateData,
        saveToDb,
        resetToDefaults,
        importData,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return ctx;
}
