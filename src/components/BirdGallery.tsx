import { useWikiGallery } from '../hooks/useWikiGallery';

/**
 * Zeigt zusätzliche echte Fotos einer Art unterhalb des Hero-Bilds (z.B.
 * andere Ansichten, Männchen/Weibchen, im Flug) als anklickbare Thumbnail-Reihe.
 * Rendert nichts, wenn Wikipedia keine weiteren Bilder für den Artikel liefert.
 */
export function BirdGallery({
  wikiTitle,
  heroUrl,
  alt,
}: {
  wikiTitle: string;
  heroUrl: string | null;
  alt: string;
}) {
  const { images } = useWikiGallery(wikiTitle, heroUrl);

  if (images.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-stone-50 p-2 dark:border-stone-700 dark:bg-stone-950">
      {images.map((img) => (
        <button
          key={img.fileTitle}
          type="button"
          onClick={() => window.open(img.url, '_blank', 'noopener,noreferrer')}
          className="shrink-0 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700"
          aria-label={`${alt} – weiteres Foto in neuem Tab öffnen`}
        >
          <img src={img.url} alt={alt} loading="lazy" className="h-16 w-16 object-cover" />
        </button>
      ))}
    </div>
  );
}
