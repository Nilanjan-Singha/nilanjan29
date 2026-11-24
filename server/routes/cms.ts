import { Router } from 'express';
import { prisma } from '../db';
import type { CmsData, ListShelf, PhotoItem, PostItem, ProjectItem } from '../../src/types/cms';

export const cmsRouter = Router();

function slugify(text: string): string {
  return (
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'post'
  );
}

async function readCmsFromDb(): Promise<CmsData | null> {
  const [config, shelves, projects, posts, photos] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: 1 } }),
    prisma.listShelf.findMany({
      orderBy: { position: 'asc' },
      include: { items: { orderBy: { position: 'asc' } } },
    }),
    prisma.project.findMany({ orderBy: { position: 'asc' } }),
    prisma.post.findMany({ orderBy: { position: 'asc' } }),
    prisma.photo.findMany({ orderBy: { position: 'asc' } }),
  ]);

  if (!config) return null;

  return {
    settings: (config.settings as unknown as CmsData['settings']) ?? {
      theme: 'system',
      fontFamily: 'geist-mono',
    },
    profile: config.profile as unknown as CmsData['profile'],
    about: config.about as unknown as CmsData['about'],
    work: config.work as unknown as CmsData['work'],
    skills: config.skills as unknown as CmsData['skills'],
    lists: shelves.map((s) => ({
      name: s.name,
      items: s.items.map((item) => ({
        t: item.title,
        s: item.subtitle,
        status: item.status as ListShelf['items'][number]['status'],
        c: item.color ?? undefined,
        c2: item.color2 ?? undefined,
        ink: item.ink ?? undefined,
        img: item.imageUrl || undefined,
      })),
    })),
    projects: projects.map((p) => ({
      t: p.title,
      x: p.description,
      url: p.url || undefined,
      img: p.imageUrl || undefined,
      c1: p.color1 ?? undefined,
      c2: p.color2 ?? undefined,
    })),
    posts: posts.map((p) => ({
      id: p.slug,
      t: p.title,
      d: p.dateLabel,
      tags: p.tags,
      x: p.excerpt,
      body: p.body,
      bodyData: (p.bodyData as PostItem['bodyData']) ?? null,
    })),
    photos: photos.map((p) => ({
      src: p.url,
      alt: p.alt,
    })),
  };
}

export async function writeCmsToDb(data: CmsData): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      await tx.siteConfig.upsert({
        where: { id: 1 },
        update: {
          settings: (data.settings ?? { theme: 'system', fontFamily: 'geist-mono' }) as object,
          profile: data.profile as object,
          about: data.about as object,
          work: data.work as object,
          skills: (data.skills || {}) as object,
        },
        create: {
          id: 1,
          settings: (data.settings ?? { theme: 'system', fontFamily: 'geist-mono' }) as object,
          profile: data.profile as object,
          about: data.about as object,
          work: data.work as object,
          skills: (data.skills || {}) as object,
        },
      });

      await Promise.all([
        tx.listItem.deleteMany(),
        tx.project.deleteMany(),
        tx.post.deleteMany(),
        tx.photo.deleteMany(),
      ]);
      await tx.listShelf.deleteMany();

      const tasks: Promise<unknown>[] = [];

      for (let sIdx = 0; sIdx < (data.lists || []).length; sIdx++) {
        const shelf = data.lists[sIdx];
        tasks.push(
          tx.listShelf.create({
            data: {
              name: shelf.name,
              position: sIdx,
              items: {
                create: (shelf.items || []).map((item, iIdx) => ({
                  title: item.t || '',
                  subtitle: item.s || '',
                  status: item.status || 'Want to',
                  color: item.c ?? null,
                  color2: item.c2 ?? null,
                  ink: item.ink ?? null,
                  imageUrl: item.img || '',
                  position: iIdx,
                })),
              },
            },
          })
        );
      }

      if (data.projects?.length) {
        tasks.push(
          tx.project.createMany({
            data: data.projects.map((p: ProjectItem, idx: number) => ({
              title: p.t || '',
              description: p.x || '',
              url: p.url || '',
              imageUrl: p.img || '',
              color1: p.c1 ?? null,
              color2: p.c2 ?? null,
              position: idx,
            })),
          })
        );
      }

      if (data.posts?.length) {
        tasks.push(
          tx.post.createMany({
            data: data.posts.map((p: PostItem, idx: number) => {
              const tags = Array.isArray(p.tags)
                ? p.tags
                : String(p.tags || '')
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);
              const bodyStr = Array.isArray(p.body)
                ? p.body.join('\n')
                : String(p.body || '');
              return {
                slug: slugify(p.t),
                title: p.t || 'Untitled post',
                dateLabel: p.d || '',
                tags,
                excerpt: p.x || '',
                body: bodyStr,
                bodyData: (p.bodyData ?? undefined) as object | undefined,
                position: idx,
              };
            }),
          })
        );
      }

      const validPhotos = (data.photos || []).filter((p: PhotoItem) => p && 'src' in p);
      if (validPhotos.length) {
        tasks.push(
          tx.photo.createMany({
            data: validPhotos.map((p: PhotoItem, idx: number) => ({
              url: p.src || '',
              alt: p.alt || '',
              position: idx,
            })),
          })
        );
      }

      await Promise.all(tasks);
    },
    { maxWait: 10000, timeout: 30000 }
  );
}

cmsRouter.get('/cms', async (_req, res, next) => {
  try {
    const data = await readCmsFromDb();
    if (!data) {
      res.status(404).json({ error: 'Database not seeded yet' });
      return;
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

cmsRouter.put('/cms', async (req, res, next) => {
  try {
    const payload = req.body as CmsData;
    if (!payload || !payload.profile || !Array.isArray(payload.posts)) {
      res.status(400).json({ error: 'Invalid CMS payload' });
      return;
    }
    await writeCmsToDb(payload);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

cmsRouter.get('/lists', async (_req, res, next) => {
  try {
    const shelves = await prisma.listShelf.findMany({
      orderBy: { position: 'asc' },
      include: { items: { orderBy: { position: 'asc' } } },
    });
    res.json(shelves);
  } catch (err) {
    next(err);
  }
});

cmsRouter.get('/projects', async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { position: 'asc' } });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

cmsRouter.get('/posts', async (_req, res, next) => {
  try {
    const posts = await prisma.post.findMany({ orderBy: { position: 'asc' } });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

cmsRouter.get('/photos', async (_req, res, next) => {
  try {
    const photos = await prisma.photo.findMany({ orderBy: { position: 'asc' } });
    res.json(photos);
  } catch (err) {
    next(err);
  }
});
