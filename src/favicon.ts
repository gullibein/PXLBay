/**
 * Helper to fetch, cache, and provide favicons for URLs.
 */
const faviconCache = new Map<string, HTMLImageElement | null>();
const pendingUrls = new Set<string>();

export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If it's a relative project path (starts with ./ or / or system_folder)
  if (trimmed.startsWith('./') || trimmed.startsWith('/') || trimmed.startsWith('system_folder')) {
    return trimmed;
  }

  // If it contains a domain dot or starts with www (e.g. "google.com" or "www.youtube.com")
  if (trimmed.includes('.') || trimmed.startsWith('www.')) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function extractDomain(url: string): string | null {
  try {
    const normalized = normalizeUrl(url);
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      const parsed = new URL(normalized);
      return parsed.hostname.replace(/^www\./, '');
    }
  } catch {
    // Fallback regex if URL parsing fails
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export function getFavicon(rawUrl: string | undefined): HTMLImageElement | null {
  if (!rawUrl) return null;

  const url = normalizeUrl(rawUrl);
  if (!url) return null;

  if (faviconCache.has(url)) {
    return faviconCache.get(url) || null;
  }

  if (pendingUrls.has(url)) {
    return null;
  }

  pendingUrls.add(url);

  const domain = extractDomain(url);

  if (domain) {
    // Sources to try in sequence
    const sources = [
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://${domain}/favicon.ico`
    ];

    let currentSourceIdx = 0;

    const tryNextSource = () => {
      if (currentSourceIdx >= sources.length) {
        faviconCache.set(url, null);
        pendingUrls.delete(url);
        return;
      }

      const src = sources[currentSourceIdx++];
      const img = new Image();

      img.onload = () => {
        if (img.naturalWidth > 1 && img.naturalHeight > 1) {
          faviconCache.set(url, img);
          pendingUrls.delete(url);
        } else {
          tryNextSource();
        }
      };

      img.onerror = () => {
        tryNextSource();
      };

      img.src = src;
    };

    tryNextSource();
  } else {
    // Local / relative path
    const baseUrl = import.meta.env.BASE_URL || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const localFaviconSrc = `${cleanBase}favicon.ico`;

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 1 && img.naturalHeight > 1) {
        faviconCache.set(url, img);
      } else {
        faviconCache.set(url, null);
      }
      pendingUrls.delete(url);
    };

    img.onerror = () => {
      faviconCache.set(url, null);
      pendingUrls.delete(url);
    };

    img.src = localFaviconSrc;
  }

  return null;
}
