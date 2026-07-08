import { useEffect, useState } from 'react';

interface GalleryImage {
  url: string;
  fileTitle: string;
}

const cache = new Map<string, GalleryImage[]>();
const CACHE_KEY = 'vogelapp-wiki-gallery-cache-v1';

function loadPersistedCache() {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, GalleryImage[]>;
    for (const [k, v] of Object.entries(parsed)) cache.set(k, v);
  } catch {
    // ignorieren, Cache bleibt einfach leer
  }
}
loadPersistedCache();

function persistCache() {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(cache)));
  } catch {
    // sessionStorage voll oder nicht verfügbar – Cache lebt dann nur im Speicher
  }
}

const PHOTO_EXTENSIONS = /\.(jpe?g|png)$/i;
const MAX_IMAGES = 4;

/**
 * Lädt bis zu vier zusätzliche echte Fotos aus dem Wikipedia-Artikel (über das
 * Hero-Bild aus useWikiSummary hinaus), damit die Detailansicht mehrere
 * Ansichten einer Art zeigen kann (z.B. Männchen/Weibchen, sitzend/fliegend).
 */
export function useWikiGallery(title: string, excludeUrl: string | null) {
  const [images, setImages] = useState<GalleryImage[]>(cache.get(title) ?? []);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    cache.has(title) ? 'ready' : 'idle',
  );

  useEffect(() => {
    if (!title) return;
    if (cache.has(title)) {
      setImages(cache.get(title)!);
      setStatus('ready');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    fetch(`https://de.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Wikipedia-Medienliste fehlgeschlagen (${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const items: unknown[] = Array.isArray(json.items) ? json.items : [];
        const found: GalleryImage[] = [];

        for (const raw of items) {
          const item = raw as {
            type?: string;
            title?: string;
            srcset?: { src: string; scale: string }[];
          };
          if (item.type !== 'image' || !item.title || !PHOTO_EXTENSIONS.test(item.title)) continue;
          const best = item.srcset?.[item.srcset.length - 1] ?? item.srcset?.[0];
          if (!best?.src) continue;
          const url = best.src.startsWith('//') ? `https:${best.src}` : best.src;
          if (excludeUrl && url === excludeUrl) continue;
          if (found.some((f) => f.fileTitle === item.title)) continue;
          found.push({ url, fileTitle: item.title });
          if (found.length >= MAX_IMAGES) break;
        }

        cache.set(title, found);
        persistCache();
        setImages(found);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        cache.set(title, []);
        setImages([]);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [title, excludeUrl]);

  return { images, status };
}
