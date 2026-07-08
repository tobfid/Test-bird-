import { useEffect, useState } from 'react';
import type { Bird } from '../data/types';
import { useWikiSummary } from '../hooks/useWikiSummary';
import { RARITY_BADGE_CLASSES, RARITY_LABEL } from '../utils/rarityStyle';
import { BirdGallery } from './BirdGallery';
import { BirdImage } from './BirdImage';
import { BirdSongPlayer } from './BirdSongPlayer';

export function StudyCard({
  birds,
  masteredIds,
  onMarkKnown,
  onFavorite,
  favoriteIds,
}: {
  birds: Bird[];
  masteredIds: Set<string>;
  onMarkKnown: (birdId: string) => void;
  onFavorite: (birdId: string) => void;
  favoriteIds: string[];
}) {
  const [index, setIndex] = useState(0);
  const bird = birds[index];
  const { data: wiki } = useWikiSummary(bird?.wikiTitle ?? '');

  useEffect(() => {
    setIndex(0);
  }, [birds]);

  if (!bird) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
        Keine Arten in dieser Auswahl.
      </p>
    );
  }

  const isMastered = masteredIds.has(bird.id);
  const isFavorite = favoriteIds.includes(bird.id);
  const atEnd = index === birds.length - 1;

  function goNext() {
    setIndex((i) => Math.min(i + 1, birds.length - 1));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-500 dark:text-stone-400">
          Karte {index + 1} von {birds.length}
        </span>
        <div className="flex gap-1">
          {birds.map((b, i) => (
            <span
              key={b.id}
              className={`h-1.5 w-1.5 rounded-full ${
                i === index
                  ? 'bg-brand-600'
                  : masteredIds.has(b.id)
                    ? 'bg-brand-300 dark:bg-brand-800'
                    : 'bg-stone-200 dark:bg-stone-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <div className="relative aspect-4/3 w-full">
          <BirdImage wikiTitle={bird.wikiTitle} alt={bird.nameDe} className="h-full w-full object-cover" />
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${RARITY_BADGE_CLASSES[bird.rarity]}`}
          >
            {RARITY_LABEL[bird.rarity]}
          </span>
          <button
            onClick={() => onFavorite(bird.id)}
            aria-label={isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            className="tap-shrink absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow dark:bg-stone-800/90"
          >
            <span className={isFavorite ? 'animate-pop inline-block' : 'inline-block'}>
              {isFavorite ? '❤️' : '🤍'}
            </span>
          </button>
        </div>

        <BirdGallery wikiTitle={bird.wikiTitle} heroUrl={wiki?.thumbnailUrl ?? null} alt={bird.nameDe} />

        <div className="flex flex-col gap-4 p-5">
          <div>
            <h3 className="text-2xl font-bold text-brand-900 dark:text-stone-100">{bird.nameDe}</h3>
            <p className="italic text-stone-500 dark:text-stone-400">{bird.nameLatin}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
              🔎 Erkennungsmerkmale
            </p>
            <ul className="list-disc space-y-1 pl-5 text-stone-800 dark:text-stone-200">
              {bird.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
              🕊️ Flugbild
            </p>
            <p className="text-stone-800 dark:text-stone-200">{bird.flight}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
              🎵 Stimme
            </p>
            <p className="mb-2 text-stone-800 dark:text-stone-200">{bird.voice}</p>
            <BirdSongPlayer bird={bird} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="tap-shrink rounded-xl border border-stone-300 py-3 font-medium text-stone-600 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300"
        >
          ← Zurück
        </button>
        {atEnd ? (
          <button
            onClick={() => {
              onMarkKnown(bird.id);
            }}
            className="tap-shrink rounded-xl bg-brand-600 py-3 font-medium text-white shadow-sm shadow-brand-900/20"
          >
            ✓ Letzte Karte fertig
          </button>
        ) : (
          <button
            onClick={() => {
              onMarkKnown(bird.id);
              goNext();
            }}
            className="tap-shrink rounded-xl bg-brand-600 py-3 font-medium text-white shadow-sm shadow-brand-900/20"
          >
            ✓ Kenn ich, weiter
          </button>
        )}
      </div>
      {!atEnd && (
        <button onClick={goNext} className="tap-shrink self-center text-sm text-stone-400 underline">
          Ohne Markierung weiter →
        </button>
      )}
      {isMastered && (
        <p className="text-center text-sm text-brand-700 dark:text-brand-400">
          ⭐ Diese Art hast du schon gut drauf!
        </p>
      )}
    </div>
  );
}
