import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { fetchLinkMetadata } from './server/lib/fetchLinkMetadata.ts';
import { searchGifs } from './server/lib/searchGifs.ts';

function linkPreviewDevPlugin(): Plugin {
  return {
    name: 'link-preview-dev',
    configureServer(server) {
      server.middlewares.use('/api/fetchUrl', async (req, res, next) => {
        if (req.method !== 'GET') {
          next();
          return;
        }
        try {
          const reqUrl = new URL(req.url || '', 'http://localhost');
          const target = reqUrl.searchParams.get('url') || '';
          const result = await fetchLinkMetadata(target);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: 0 }));
        }
      });

      server.middlewares.use('/api/gifs', async (req, res, next) => {
        if (req.method !== 'GET') {
          next();
          return;
        }
        try {
          const reqUrl = new URL(req.url || '', 'http://localhost');
          const q = reqUrl.searchParams.get('q') || '';
          const limit = Number(reqUrl.searchParams.get('limit')) || 12;
          const results = await searchGifs(q, limit);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ results }));
        } catch {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ results: [] }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), linkPreviewDevPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
