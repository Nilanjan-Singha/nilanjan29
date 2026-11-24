export interface LinkMetadataResult {
  success: 0 | 1;
  link?: string;
  meta?: {
    title: string;
    description: string;
    image: { url: string };
  };
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      'i'
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.trim() || '';
}

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower.endsWith('.local') ||
    lower.startsWith('10.') ||
    lower.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(lower)
  );
}

export async function fetchLinkMetadata(rawUrl: string): Promise<LinkMetadataResult> {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { success: 0 };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { success: 0 };
    }
    if (isBlockedHost(parsed.hostname)) {
      return { success: 0 };
    }
  } catch {
    return { success: 0 };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioLinkPreview/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      return {
        success: 1,
        link: parsed.toString(),
        meta: {
          title: parsed.hostname,
          description: parsed.toString(),
          image: { url: '' },
        },
      };
    }

    const html = (await response.text()).slice(0, 200_000);
    const title = extractTitle(html) || parsed.hostname;
    const description =
      extractMeta(html, 'og:description') ||
      extractMeta(html, 'description') ||
      extractMeta(html, 'twitter:description') ||
      parsed.toString();
    let imageUrl =
      extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || '';

    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      try {
        imageUrl = new URL(imageUrl, parsed).toString();
      } catch {
        imageUrl = '';
      }
    }

    return {
      success: 1,
      link: parsed.toString(),
      meta: {
        title,
        description,
        image: { url: imageUrl },
      },
    };
  } catch {
    return {
      success: 1,
      link: parsed.toString(),
      meta: {
        title: parsed.hostname,
        description: parsed.toString(),
        image: { url: '' },
      },
    };
  }
}
