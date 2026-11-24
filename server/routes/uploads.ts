import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db';
import { isBucketConfigured, uploadBufferToBucket } from '../storage';

export const uploadsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
});

uploadsRouter.get('/uploads', async (_req, res, next) => {
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(assets);
  } catch (err) {
    next(err);
  }
});

uploadsRouter.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided under field "file"' });
      return;
    }
    if (!isBucketConfigured()) {
      res.status(503).json({
        error:
          'Object storage bucket is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.',
      });
      return;
    }

    const folder =
      typeof req.body?.folder === 'string' && req.body.folder.trim()
        ? req.body.folder.trim()
        : 'uploads';

    const uploaded = await uploadBufferToBucket(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    const asset = await prisma.mediaAsset.create({
      data: {
        key: uploaded.key,
        url: uploaded.url,
        bucket: uploaded.bucket,
        mimeType: req.file.mimetype,
        size: req.file.size,
        originalName: req.file.originalname,
      },
    });

    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
});
