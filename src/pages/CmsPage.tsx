import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CmsSectionPanel } from '../components/cms/CmsSectionPanel';
import {
  CMS_SECTIONS,
  CmsSidebar,
  type CmsSectionId,
} from '../components/cms/CmsSidebar';
import { FullPreviewModal } from '../components/cms/FullPreviewModal';
import { useCms } from '../context/CmsContext';
import type { CmsData, PostItem } from '../types/cms';
import { buildPreviewHtml } from '../utils/cmsHelpers';

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const CmsPage: React.FC = () => {
  const {
    data,
    previewTemplate,
    loading,
    error,
    saveStatus,
    setSaveStatus,
    updateData,
    saveToDb,
    resetToDefaults,
    importData,
  } = useCms();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);

  const activeSection: CmsSectionId = useMemo(() => {
    const found = CMS_SECTIONS.find((s) => s.id === section);
    return found ? found.id : 'general';
  }, [section]);

  useEffect(() => {
    document.title = 'Site content - Portfolio CMS';
  }, []);

  const previewHtml = useMemo(() => {
    if (!data || !previewTemplate) return '';
    return buildPreviewHtml(previewTemplate, data);
  }, [data, previewTemplate]);

  const handleSelectSection = (id: CmsSectionId) => {
    navigate(`/cms/${id}`);
    window.scrollTo(0, 0);
  };

  const handleDownloadHtml = () => {
    if (!previewHtml) return;
    triggerDownload('portfolio.html', previewHtml, 'text/html;charset=utf-8');
  };

  const handleExportJson = () => {
    if (!data) return;
    triggerDownload(
      'content.json',
      JSON.stringify(data, null, 2),
      'application/json;charset=utf-8'
    );
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as CmsData;
      if (!parsed || !parsed.profile || !parsed.posts) {
        throw new Error('Invalid');
      }
      importData(parsed);
    } catch {
      setSaveStatus('That file isn’t valid site content');
    }
  };

  const handleCreateAndEditPost = () => {
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
    navigate('/cms/writing/edit/0');
  };

  if (loading) {
    return (
      <div className="cms-page">
        <div className="app">Loading CMS…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="cms-page">
        <div className="app">{error || 'Couldn’t load CMS files'}</div>
      </div>
    );
  }

  return (
    <div className="cms-page">
      <div className="app">
        <CmsSidebar
          data={data}
          activeSection={activeSection}
          previewHtml={previewHtml}
          onSelectSection={handleSelectSection}
          onOpenFullPreview={() => setFullPreviewOpen(true)}
          onSaveToDb={saveToDb}
          onDownloadHtml={handleDownloadHtml}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onResetDefaults={resetToDefaults}
        />
        <CmsSectionPanel
          sectionId={activeSection}
          data={data}
          saveStatus={saveStatus}
          onUpdate={(updater) => updateData(updater)}
          onCreateAndEditPost={handleCreateAndEditPost}
        />
      </div>

      <FullPreviewModal
        open={fullPreviewOpen}
        previewHtml={previewHtml}
        onClose={() => setFullPreviewOpen(false)}
      />
    </div>
  );
};
