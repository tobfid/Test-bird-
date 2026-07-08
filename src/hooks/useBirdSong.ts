import { useEffect, useState } from 'react';

interface BirdSong {
  audioUrl: string;
  sonoUrl: string | null;
  recordist: string | null;
  sourceUrl: string;
  quality: string | null;
}

interface BirdSongResult {
  song: BirdSong | null;
  fallbackUrl: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
}

const cache = new Map<string, BirdSong | null>();
const CACHE_KEY = 'vogelapp-xeno-canto-cache-v1';
const API_KEY = import.meta.env.VITE_XENO_CANTO_KEY as string | undefined;

function loadPersistedCache() {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, BirdSong | null>;
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

function withProtocol(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url;
}

function buildFallbackUrl(nameLatin: string): string {
  const slug = nameLatin.trim().split(/\s+/).slice(0, 2).join('-');
  return `https://xeno-canto.org/species/${encodeURIComponent(slug)}`;
}

/**
 * Lädt eine echte Gesangsaufnahme von xeno-canto.org (offene, CC-lizenzierte
 * Vogelstimmen-Datenbank). Funktioniert am besten mit einem kostenlosen API-Key
 * (VITE_XENO_CANTO_KEY), versucht es aber auch ohne. Schlägt die Anfrage fehl
 * (kein Key, Netzwerkfehler, keine Treffer), liefert der Hook trotzdem sofort
 * einen synchron berechneten Link zur Artseite auf xeno-canto.org als Fallback,
 * damit die App nie ohne Möglichkeit dasteht, den Gesang anzuhören.
 */
export function useBirdSong(nameLatin: string): BirdSongResult {
  const fallbackUrl = buildFallbackUrl(nameLatin);
  const [song, setSong] = useState<BirdSong | null>(cache.get(nameLatin) ?? null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    cache.has(nameLatin) ? (cache.get(nameLatin) ? 'ready' : 'error') : 'idle',
  );

  useEffect(() => {
    if (!nameLatin) return;
    if (cache.has(nameLatin)) {
      const cached = cache.get(nameLatin) ?? null;
      setSong(cached);
      setStatus(cached ? 'ready' : 'error');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    const query = encodeURIComponent(`${nameLatin} type:song`);
    const endpoint = API_KEY
      ? `https://xeno-canto.org/api/3/recordings?query=${query}&key=${API_KEY}`
      : `https://xeno-canto.org/api/2/recordings?query=${query}`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`xeno-canto-Anfrage fehlgeschlagen (${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const recordings: unknown[] = Array.isArray(json.recordings) ? json.recordings : [];
        const best = recordings
          .map((raw) => raw as Record<string, unknown>)
          .find((r) => typeof r.file === 'string' && r.file);

        if (!best) {
          cache.set(nameLatin, null);
          persistCache();
          setSong(null);
          setStatus('error');
          return;
        }

        const result: BirdSong = {
          audioUrl: withProtocol(best.file as string),
          sonoUrl:
            best.sono && typeof best.sono === 'object'
              ? withProtocol((best.sono as Record<string, string>).small ?? '')
              : null,
          recordist: typeof best.rec === 'string' ? best.rec : null,
          sourceUrl: typeof best.url === 'string' ? withProtocol(best.url) : fallbackUrl,
          quality: typeof best.q === 'string' ? best.q : null,
        };

        cache.set(nameLatin, result);
        persistCache();
        setSong(result);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        cache.set(nameLatin, null);
        setSong(null);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameLatin]);

  return { song, fallbackUrl, status };
}
