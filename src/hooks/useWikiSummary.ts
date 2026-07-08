import { useEffect, useState } from 'react';

interface WikiSummary {
  thumbnailUrl: string | null;
  extract: string | null;
  pageUrl: string | null;
}

const cache = new Map<string, WikiSummary>();
const CACHE_KEY = 'vogelapp-wiki-cache-v1';

function loadPersistedCache() {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, WikiSummary>;
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

/**
 * Lädt Vorschaubild und Kurztext eines Wikipedia-Artikels zur Laufzeit,
 * damit die App keine fest verdrahteten (und potenziell veralteten) Bild-URLs pflegen muss.
 */
export function useWikiSummary(title: string) {
  const [data, setData] = useState<WikiSummary | null>(cache.get(title) ?? null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    cache.has(title) ? 'ready' : 'idle',
  );

  useEffect(() => {
    if (cache.has(title)) {
      setData(cache.get(title)!);
      setStatus('ready');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    fetch(`https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Wikipedia-Anfrage fehlgeschlagen (${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const summary: WikiSummary = {
          thumbnailUrl: json.thumbnail?.source ?? json.originalimage?.source ?? null,
          extract: json.extract ?? null,
          pageUrl: json.content_urls?.desktop?.page ?? null,
        };
        cache.set(title, summary);
        persistCache();
        setData(summary);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [title]);

  return { data, status };
}
