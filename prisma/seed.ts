import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import type { CmsData } from '../src/types/cms';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return (
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'post'
  );
}

async function main() {
  const jsonPath = path.resolve(process.cwd(), 'public/cms/d0.json');
  const raw = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(raw) as CmsData;

  await prisma.$transaction(async (tx) => {
    await tx.siteConfig.upsert({
      where: { id: 1 },
      update: {
        profile: data.profile as object,
        about: data.about as object,
        work: data.work as object,
        skills: (data.skills || {}) as object,
      },
      create: {
        id: 1,
        profile: data.profile as object,
        about: data.about as object,
        work: data.work as object,
        skills: (data.skills || {}) as object,
      },
    });

    await tx.listItem.deleteMany();
    await tx.listShelf.deleteMany();
    for (let sIdx = 0; sIdx < (data.lists || []).length; sIdx++) {
      const shelf = data.lists[sIdx];
      await tx.listShelf.create({
        data: {
          name: shelf.name,
          position: sIdx,
          items: {
            create: (shelf.items || []).map((item, iIdx) => ({
              title: item.t,
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
      });
    }

    await tx.project.deleteMany();
    if (data.projects?.length) {
      await tx.project.createMany({
        data: data.projects.map((p, idx) => ({
          title: p.t,
          description: p.x || '',
          url: p.url || '',
          imageUrl: p.img || '',
          color1: p.c1 ?? null,
          color2: p.c2 ?? null,
          position: idx,
        })),
      });
    }

    await tx.post.deleteMany();
    if (data.posts?.length) {
      await tx.post.createMany({
        data: data.posts.map((p, idx) => {
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
            title: p.t,
            dateLabel: p.d || '',
            tags,
            excerpt: p.x || '',
            body: bodyStr,
            bodyData: (p.bodyData ?? undefined) as object | undefined,
            position: idx,
          };
        }),
      });
    }

    await tx.photo.deleteMany();
    const validPhotos = (data.photos || []).filter((p) => p && p.src);
    if (validPhotos.length) {
      await tx.photo.createMany({
        data: validPhotos.map((p, idx) => ({
          url: p.src,
          alt: p.alt || '',
          position: idx,
        })),
      });
    }
  }, { maxWait: 10000, timeout: 30000 });

  console.log('Seeded PostgreSQL database from public/cms/d0.json');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
