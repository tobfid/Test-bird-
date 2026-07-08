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

function fetchSummary(title: string): Promise<WikiSummary> {
  return fetch(`https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`).then((res) => {
    if (!res.ok) throw new Error(`Wikipedia-Anfrage fehlgeschlagen (${res.status})`);
    return res.json().then((json) => ({
      thumbnailUrl: json.thumbnail?.source ?? json.originalimage?.source ?? null,
      extract: json.extract ?? null,
      pageUrl: json.content_urls?.desktop?.page ?? null,
    }));
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lädt Vorschaubild und Kurztext eines Wikipedia-Artikels zur Laufzeit,
 * damit die App keine fest verdrahteten (und potenziell veralteten) Bild-URLs pflegen muss.
 *
 * `enabled` erlaubt Lazy Loading: Solange `false`, wird nicht geladen (aber ein
 * bereits gecachtes Ergebnis trotzdem sofort angezeigt). So lassen sich viele
 * gleichzeitige Anfragen vermeiden, wenn z.B. eine ganze Kartenliste rendert.
 */
export function useWikiSummary(title: string, enabled = true) {
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
    if (!enabled || !title) return;

    let cancelled = false;
    setStatus('loading');

    fetchSummary(title)
      // Bei Fehlschlag (z.B. kurzzeitiges Rate-Limit) einmal nach kurzer Pause erneut versuchen,
      // bevor endgültig aufgegeben wird.
      .catch(() => delay(800).then(() => fetchSummary(title)))
      .then((summary) => {
        if (cancelled) return;
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
  }, [title, enabled]);

  return { data, status };
}
