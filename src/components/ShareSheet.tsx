import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export function ShareSheet({ onClose }: { onClose: () => void }) {
  const url = window.location.href;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 320, margin: 1, color: { dark: '#14532d', light: '#ffffff' } })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Zwischenablage evtl. ohne Berechtigung – Link steht als Text trotzdem sichtbar da
    }
  }

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-sheet-in pb-safe flex w-full max-w-sm flex-col items-center gap-4 rounded-t-3xl bg-white p-6 text-center sm:rounded-3xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-1 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        <div className="flex w-full items-center justify-between">
          <h2 className="text-lg font-semibold">App teilen</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="tap-shrink flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400">
          Mit dem Smartphone scannen, um die App direkt zu öffnen.
        </p>

        <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-white p-2 shadow-inner">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR-Code zum Öffnen der App" className="h-full w-full" />
          ) : (
            <div className="h-full w-full animate-pulse rounded-lg bg-stone-100" />
          )}
        </div>

        <div className="flex w-full items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 dark:bg-stone-800">
          <p className="flex-1 truncate text-left text-sm text-stone-600 dark:text-stone-300">{url}</p>
          <button
            onClick={copyLink}
            className="tap-shrink shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white"
          >
            {copied ? 'Kopiert ✓' : 'Kopieren'}
          </button>
        </div>

        <p className="text-xs text-stone-400">
          Tipp: Auf dem Smartphone im Browser-Menü „Zum Startbildschirm hinzufügen" wählen, damit die App wie eine
          eigene App-Kachel erscheint.
        </p>
      </div>
    </div>
  );
}
