import { Router } from 'express';
import { searchGifs } from '../lib/searchGifs';

export const gifsRouter = Router();

gifsRouter.get('/gifs', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
  const results = await searchGifs(q, limit);
  res.json({ results });
});
