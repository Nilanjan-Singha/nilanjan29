import { blocksToHtml as pkgBlocksToHtml } from 'nextgen-block-editor';
import type {
  CmsData,
  EditorJSData,
  PostItem,
  RenderedPost,
} from '../types/cms';

export const CMS_STORAGE_KEY = 'portfolio-cms-v1';

export function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function escHtml(value: unknown): string {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function slugify(text: unknown): string {
  return (
    String(text == null ? '' : text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'post'
  );
}

export function sanitizeInlineHtml(value: unknown): string {
  const template = document.createElement('template');
  template.innerHTML = String(value == null ? '' : value);
  const allowed = ['A', 'MARK', 'U', 'S', 'STRIKE', 'CODE', 'B', 'STRONG', 'I', 'EM'];
  template.content.querySelectorAll('*').forEach((element) => {
    if (!allowed.includes(element.tagName)) {
      element.replaceWith(document.createTextNode(element.textContent || ''));
      return;
    }
    Array.from(element.attributes).forEach((attribute) => {
      if (element.tagName === 'A' && attribute.name === 'href') return;
      if (
        element.tagName === 'A' &&
        attribute.name === 'class' &&
        attribute.value === 'editor-mention'
      ) {
        return;
      }
      if (['target', 'rel'].includes(attribute.name) && element.tagName === 'A') return;
      element.removeAttribute(attribute.name);
    });
    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
        element.removeAttribute('href');
      }
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }
  });
  return template.innerHTML;
}

export function blocksToHtml(data: EditorJSData | null | undefined): string {
  return pkgBlocksToHtml(data);
}

export function cmsPostToRendered(p: PostItem): RenderedPost {
  const tags = Array.isArray(p.tags)
    ? p.tags
    : String(p.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

  let bodyHtml: string[];
  if (p.bodyData) {
    bodyHtml = [blocksToHtml(p.bodyData)];
  } else if (Array.isArray(p.body)) {
    bodyHtml = p.body;
  } else {
    bodyHtml = [
      String(p.body || '')
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((b) => {
          const trimmed = b.trim();
          return trimmed.slice(0, 3) === '## '
            ? `<h2>${escHtml(trimmed.slice(3))}</h2>`
            : `<p class="lead">${escHtml(trimmed).replace(/\n/g, '<br>')}</p>`;
        })
        .join(''),
    ];
  }

  return {
    id: slugify(p.t),
    d: p.d,
    tags,
    t: p.t,
    x: p.x,
    bodyHtml,
  };
}

export function resizeImageFile(
  file: File,
  maxWidth: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadFileToBucket(
  file: File,
  folder = 'uploads'
): Promise<string | null> {
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { url?: string };
    return json.url || null;
  } catch {
    return null;
  }
}

export function resolveAvatarSrc(avatar?: string): string {
  if (!avatar) return '/main/pfp.jpg';
  if (avatar === './pfp.jpg' || avatar === './main/pfp.jpg') {
    return '/main/pfp.jpg';
  }
  return avatar;
}

export function buildPreviewHtml(template: string, data: CmsData): string {
  const preview = cloneData(data);
  if (preview.profile && preview.profile.avatar) {
    preview.profile.avatar = resolveAvatarSrc(preview.profile.avatar);
  }
  const cleanTpl = template.split('<\\/script').join('</script');
  return cleanTpl
    .split('__DATA__')
    .join(JSON.stringify(preview).replace(/</g, '\\u003c'));
}
