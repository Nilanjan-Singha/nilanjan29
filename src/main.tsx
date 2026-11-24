import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/portfolio.css';
import './styles/tracklist.css';
import './styles/cms.css';
import './styles/editor.css';
import './styles/blocks.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
