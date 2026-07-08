import type { Bird } from '../data/types';
import { BirdImage } from './BirdImage';

export function BirdCard({
  bird,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  bird: Bird;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(bird.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <BirdImage
          wikiTitle={bird.wikiTitle}
          alt={bird.nameDe}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(bird.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onToggleFavorite(bird.id);
            }
          }}
          aria-label={isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg shadow dark:bg-stone-900/90"
        >
          {isFavorite ? '❤️' : '🤍'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{bird.nameDe}</h3>
        <p className="text-sm italic text-stone-500 dark:text-stone-400">{bird.nameLatin}</p>
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {bird.habitats.slice(0, 2).map((h) => (
            <span
              key={h}
              className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-950 dark:text-green-300"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
