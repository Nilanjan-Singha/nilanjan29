import 'dotenv/config';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { prisma } from './db';
import { cmsRouter } from './routes/cms';
import { gifsRouter } from './routes/gifs';
import { linkPreviewRouter } from './routes/linkPreview';
import { uploadsRouter } from './routes/uploads';
import { isBucketConfigured } from './storage';

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', async (_req, res) => {
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  res.json({
    ok: dbConnected,
    database: dbConnected ? 'connected' : 'disconnected',
    bucketConfigured: isBucketConfigured(),
  });
});

app.use('/api', cmsRouter);
app.use('/api', uploadsRouter);
app.use('/api', linkPreviewRouter);
app.use('/api', gifsRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Portfolio API listening on http://localhost:${port}`);
});
