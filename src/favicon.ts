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

export function getFavicon(rawUrl: string | undefined, rawIconUrl?: string | undefined): HTMLImageElement | null {
  if (!rawUrl && !rawIconUrl) return null;

  const url = normalizeUrl(rawUrl || rawIconUrl || '');
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

    const sources: string[] = [];
    if (rawIconUrl) {
      const cleanIcon = rawIconUrl.startsWith('/') || rawIconUrl.startsWith('./') ? rawIconUrl : `${cleanBase}${rawIconUrl.replace(/^\/+/, '')}`;
      sources.push(cleanIcon);
    }

    // Extract directory from url (e.g. "system_folder/PXL_folder/PXLRogue/index.html" -> "system_folder/PXL_folder/PXLRogue")
    const dirMatch = url.match(/^(.*?)(?:\/[^/]+\.html)?$/i);
    const dirPath = dirMatch && dirMatch[1] ? dirMatch[1].replace(/^\/+/, '') : '';
    if (dirPath) {
      sources.push(`${cleanBase}${dirPath}/favicon.ico`);
      sources.push(`${cleanBase}${dirPath}/favicon.png`);
      sources.push(`${cleanBase}${dirPath}/icon.png`);
      sources.push(`${cleanBase}${dirPath}/apple-touch-icon.png`);
    }
    sources.push(`${cleanBase}favicon.ico`);

    let currentSourceIdx = 0;

    const tryNextLocalSource = () => {
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
          tryNextLocalSource();
        }
      };

      img.onerror = () => {
        tryNextLocalSource();
      };

      img.src = src;
    };

    tryNextLocalSource();
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

export function cleanPageTitle(rawTitle: string | null | undefined, rawUrl: string): string | null {
  const cleanBrand = getCleanDomainName(rawUrl);
  if (!rawTitle) return cleanBrand || null;

  let title = rawTitle.trim();
  if (!title) return cleanBrand || null;

  const domain = extractDomain(rawUrl);

  // If the title is literally the URL or domain (e.g. "pinterest.com" or "https://www.pinterest.com")
  if (
    title.toLowerCase() === rawUrl.toLowerCase() || 
    (domain && title.toLowerCase() === domain.toLowerCase()) ||
    (domain && title.toLowerCase() === `www.${domain.toLowerCase()}`)
  ) {
    return cleanBrand || title;
  }

  // Remove leading protocol and www
  title = title.replace(/^https?:\/\/(?:www\.)?/i, '');

  // If title is a bare domain with TLD (e.g. "pinterest.com")
  if (/^[a-zA-Z0-9-]+\.(?:com|org|net|io|co|is|app|dev|edu|gov|tv|ai)$/i.test(title)) {
    return cleanBrand || title.replace(/\.[a-zA-Z]+$/i, '').replace(/\b\w/g, c => c.toUpperCase());
  }

  // Check for common title separators (e.g. "Pinterest: Discover recipes...", "GitHub: Where...")
  const separators = [' - ', ' | ', ' – ', ' — ', ' : ', ': ', ' • '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep);
      const first = parts[0].trim();
      if (first.length >= 2 && first.length <= 20) {
        title = first;
        break;
      }
      const last = parts[parts.length - 1].trim();
      if (last.length >= 2 && last.length <= 20) {
        title = last;
        break;
      }
    }
  }

  // If title is long and contains the clean brand name, use the clean brand name
  if (title.length > 24 && cleanBrand && title.toLowerCase().includes(cleanBrand.toLowerCase())) {
    title = cleanBrand;
  }

  return title.substring(0, 24).trim();
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

  const cleanBrand = getCleanDomainName(trimmed);

  // 1. Direct fetch (works for local relative html files and CORS-friendly web servers)
  try {
    const res = await fetch(url, { method: 'GET' });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match && match[1]) {
        const decoded = decodeHtmlEntities(match[1]);
        const cleaned = cleanPageTitle(decoded, trimmed);
        if (cleaned) return cleaned;
      }
    }
  } catch {
    // Cross-origin request failed, continue to metadata resolvers
  }

  // 2. For external web URLs, query Microlink metadata API to get the verified page title
  if (isWebUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data?.status === 'success' && data?.data?.title) {
          const title = String(data.data.title).trim();
          const cleaned = cleanPageTitle(decodeHtmlEntities(title), trimmed);
          if (cleaned) return cleaned;
        }
      }
    } catch {
      // Fallback
    }

    // 3. Fallback via AllOrigins CORS proxy
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data?.contents) {
          const match = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (match && match[1]) {
            const decoded = decodeHtmlEntities(match[1]);
            const cleaned = cleanPageTitle(decoded, trimmed);
            if (cleaned) return cleaned;
          }
        }
      }
    } catch {
      // No live title scraped
    }
  }

  // 4. Return the verified clean brand / site name from domain/path (e.g. Pinterest, Google, etc.)
  if (cleanBrand) {
    return cleanBrand;
  }

  return null;
}




