import crypto from 'node:crypto';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

function getBucketConfig() {
  const bucket = process.env.S3_BUCKET || '';
  const region = process.env.S3_REGION || 'us-east-1';
  const endpoint = process.env.S3_ENDPOINT || undefined;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';
  const publicUrl = (process.env.S3_PUBLIC_URL || '').replace(/\/+$/, '');
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';

  return {
    bucket,
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    publicUrl,
    forcePathStyle,
  };
}

export function isBucketConfigured(): boolean {
  const cfg = getBucketConfig();
  return Boolean(cfg.bucket && cfg.accessKeyId && cfg.secretAccessKey);
}

function createS3Client() {
  const cfg = getBucketConfig();
  return new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    forcePathStyle: cfg.forcePathStyle,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

function buildPublicUrl(key: string): string {
  const cfg = getBucketConfig();
  if (cfg.publicUrl) {
    return `${cfg.publicUrl}/${key}`;
  }
  if (cfg.endpoint) {
    const base = cfg.endpoint.replace(/\/+$/, '');
    return `${base}/${cfg.bucket}/${key}`;
  }
  return `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${key}`;
}

export async function uploadBufferToBucket(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder = 'uploads'
): Promise<{ key: string; url: string; bucket: string }> {
  const cfg = getBucketConfig();
  if (!isBucketConfigured()) {
    throw new Error(
      'Object storage bucket is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in .env.'
    );
  }

  const ext = path.extname(originalName || '').toLowerCase() || '.bin';
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '') || 'uploads';
  const key = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}${ext}`;

  const client = createS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType || 'application/octet-stream',
    })
  );

  return {
    key,
    url: buildPublicUrl(key),
    bucket: cfg.bucket,
  };
}
