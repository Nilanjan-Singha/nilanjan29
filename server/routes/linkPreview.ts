import { Router } from 'express';
import { fetchLinkMetadata } from '../lib/fetchLinkMetadata';

export const linkPreviewRouter = Router();

linkPreviewRouter.get('/fetchUrl', async (req, res) => {
  const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
  const result = await fetchLinkMetadata(rawUrl);
  res.json(result);
});
