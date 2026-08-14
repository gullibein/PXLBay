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

export function getCleanDomainName(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  const domain = extractDomain(trimmed);
  if (!domain) {
    // If it's a file path e.g. "system_folder/PXLRogue/rogue8.html"
    const match = trimmed.match(/([^/\\#?]+)(?:\.html|\.htm)?(?:[#?].*)?$/i);
    if (match && match[1]) {
      return match[1].replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return '';
  }

  // Known clean brand names for common sites
  const knownBrands: Record<string, string> = {
    'google.com': 'Google',
    'github.com': 'GitHub',
    'youtube.com': 'YouTube',
    'reddit.com': 'Reddit',
    'wikipedia.org': 'Wikipedia',
    'twitter.com': 'Twitter',
    'x.com': 'X',
    'instagram.com': 'Instagram',
    'facebook.com': 'Facebook',
    'linkedin.com': 'LinkedIn',
    'amazon.com': 'Amazon',
    'netflix.com': 'Netflix',
    'twitch.tv': 'Twitch',
    'discord.com': 'Discord',
    'duckduckgo.com': 'DuckDuckGo',
    'yahoo.com': 'Yahoo',
    'bing.com': 'Bing'
  };

  const domainKey = domain.toLowerCase();
  if (knownBrands[domainKey]) {
    return knownBrands[domainKey];
  }

  // Extract main domain part before TLD (e.g. "my-awesome-site" from "my-awesome-site.co.uk")
  const parts = domain.split('.');
  let mainName = parts[0];
  if (parts.length > 2 && parts[0] === 'www') {
    mainName = parts[1];
  }
  return mainName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function fetchPageTitle(rawUrl: string): Promise<string | null> {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const url = normalizeUrl(trimmed);
  if (!url) return null;

  const isWebUrl = url.startsWith('http://') || url.startsWith('https://');
  const isLocalHtml = trimmed.endsWith('.html') || trimmed.endsWith('.htm') || trimmed.startsWith('./') || trimmed.startsWith('/');

  if (!isWebUrl && !isLocalHtml) {
    return null;
  }

  // 1. Direct fetch (works for local relative html files and CORS-friendly web servers)
  try {
    const res = await fetch(url, { method: 'GET' });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match && match[1]) {
        const decoded = decodeHtmlEntities(match[1]);
        if (decoded) return decoded;
      }
    }
  } catch {
    // Cross-origin request failed, continue to metadata resolvers
  }

  // 2. For external web URLs, query Microlink metadata API to get the verified page title
  if (isWebUrl) {
    try {
      const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data?.status === 'success' && data?.data?.title) {
          const title = String(data.data.title).trim();
          if (title) return decodeHtmlEntities(title);
        }
      }
    } catch {
      // Fallback to next strategy
    }

    // 3. Fallback via AllOrigins CORS proxy
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const data = await res.json();
        if (data?.contents) {
          const match = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (match && match[1]) {
            const decoded = decodeHtmlEntities(match[1]);
            if (decoded) return decoded;
          }
        }
      }
    } catch {
      // No title found
    }
  }

  return null;
}


