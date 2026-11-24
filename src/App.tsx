import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { SaveToast } from './components/common/SaveToast';
import { CmsProvider } from './context/CmsContext';
import { CmsPage } from './pages/CmsPage';
import { EditorPage } from './pages/EditorPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { TracklistPage } from './pages/TracklistPage';

const NotFoundPage: React.FC = () => (
  <main className="wrap" style={{ padding: '96px 24px', textAlign: 'center' }}>
    <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Page not found</h1>
    <p style={{ color: 'var(--mute)', marginBottom: '24px' }}>
      The page you are looking for does not exist.
    </p>
    <Link className="btn" to="/">
      Back to portfolio
    </Link>
  </main>
);

export const App: React.FC = () => (
  <CmsProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/writing/:slug" element={<PortfolioPage />} />
        <Route path="/tracklist" element={<TracklistPage />} />
        <Route path="/cms" element={<Navigate to="/cms/general" replace />} />
        <Route path="/cms/:section" element={<CmsPage />} />
        <Route path="/cms/writing/new" element={<EditorPage />} />
        <Route path="/cms/writing/edit/:id" element={<EditorPage />} />
        <Route path="/cms/writing/edit" element={<EditorPage />} />

        {/* Legacy static HTML redirects */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/tracklist.html" element={<Navigate to="/tracklist" replace />} />
        <Route path="/cms.html" element={<Navigate to="/cms/general" replace />} />
        <Route path="/cms/cms.html" element={<Navigate to="/cms/general" replace />} />
        <Route
          path="/cms/writing/edit/index.html"
          element={<Navigate to="/cms/writing/edit" replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SaveToast />
    </BrowserRouter>
  </CmsProvider>
);

export default App;
