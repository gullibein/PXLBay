/**
 * Helper to fetch, cache, and provide favicons for URLs.
 */
const faviconCache = new Map<string, HTMLImageElement | null>();
const pendingUrls = new Set<string>();

export function getFavicon(url: string | undefined): HTMLImageElement | null {
  if (!url) return null;

  if (faviconCache.has(url)) {
    return faviconCache.get(url) || null;
  }

  if (pendingUrls.has(url)) {
    return null;
  }

  pendingUrls.add(url);

  let faviconSrc = '';

  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Use Google favicon service for external web links
      faviconSrc = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`;
    } else {
      // Local/relative path (e.g. system_folder/PXLRogue/rogue8.html)
      // Check if there is a favicon near the file or at base URL
      const baseUrl = import.meta.env.BASE_URL || './';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      faviconSrc = `${cleanBase}favicon.ico`;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = faviconSrc;

    img.onload = () => {
      // Check if image is not a blank 1x1 or broken
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
  } catch {
    faviconCache.set(url, null);
    pendingUrls.delete(url);
  }

  return null;
}
