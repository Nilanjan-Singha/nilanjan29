export interface GifResult {
  id: string;
  title: string;
  previewUrl: string;
  url: string;
}

export async function searchGifs(query: string, limit = 12): Promise<GifResult[]> {
  const q = query.trim();
  const giphyKey = process.env.GIPHY_API_KEY || process.env.VITE_GIPHY_API_KEY || '';

  if (giphyKey) {
    try {
      const endpoint = q
        ? `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(
            giphyKey
          )}&q=${encodeURIComponent(q)}&limit=${limit}&rating=pg-13`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(
            giphyKey
          )}&limit=${limit}&rating=pg-13`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const json = (await res.json()) as {
          data?: Array<{
            id: string;
            title?: string;
            images?: {
              fixed_height_small?: { url?: string };
              downsized_medium?: { url?: string };
              original?: { url?: string };
            };
          }>;
        };
        const items = (json.data || [])
          .map((item) => ({
            id: item.id,
            title: item.title || 'GIF',
            previewUrl:
              item.images?.fixed_height_small?.url ||
              item.images?.downsized_medium?.url ||
              item.images?.original?.url ||
              '',
            url:
              item.images?.downsized_medium?.url ||
              item.images?.original?.url ||
              '',
          }))
          .filter((item) => item.url);
        if (items.length) return items;
      }
    } catch {
      // fall through
    }
  }

  const tenorKey = process.env.TENOR_API_KEY || '';
  if (tenorKey) {
    try {
      const endpoint = q
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
            q
          )}&key=${encodeURIComponent(tenorKey)}&limit=${limit}&media_filter=gif,tinygif`
        : `https://tenor.googleapis.com/v2/featured?key=${encodeURIComponent(
            tenorKey
          )}&limit=${limit}&media_filter=gif,tinygif`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const json = (await res.json()) as {
          results?: Array<{
            id: string;
            content_description?: string;
            media_formats?: {
              tinygif?: { url?: string };
              gif?: { url?: string };
            };
          }>;
        };
        const items = (json.results || [])
          .map((item) => {
            const url = item.media_formats?.gif?.url || item.media_formats?.tinygif?.url || '';
            const previewUrl = item.media_formats?.tinygif?.url || url;
            return {
              id: item.id,
              title: item.content_description || 'GIF',
              previewUrl,
              url,
            };
          })
          .filter((item) => item.url);
        if (items.length) return items;
      }
    } catch {
      // fall through
    }
  }

  // Free no-key fallback: Wikimedia Commons animated GIF search
  try {
    const searchTerm = q ? `${q} filemime:image/gif` : 'animation filemime:image/gif';
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      searchTerm
    )}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|mime&iiurlwidth=320&format=json`;

    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'PortfolioApp/1.0' },
    });
    if (res.ok) {
      const json = (await res.json()) as {
        query?: {
          pages?: Record<
            string,
            {
              pageid: number;
              title?: string;
              imageinfo?: Array<{
                url?: string;
                thumburl?: string;
                mime?: string;
              }>;
            }
          >;
        };
      };
      const pages = Object.values(json.query?.pages || {});
      return pages
        .map((page) => {
          const info = page.imageinfo?.[0];
          const url = info?.url || '';
          const previewUrl = info?.thumburl || url;
          const cleanTitle = (page.title || 'GIF')
            .replace(/^File:/i, '')
            .replace(/\.gif$/i, '');
          return {
            id: String(page.pageid),
            title: cleanTitle,
            previewUrl,
            url,
          };
        })
        .filter((item) => item.url);
    }
  } catch {
    // ignore network failures
  }

  return [];
}
