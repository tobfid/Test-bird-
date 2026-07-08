import type { Bird } from '../data/types';
import { RARITY_BADGE_CLASSES, RARITY_LABEL } from '../utils/rarityStyle';
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
      className="tap-shrink group relative flex aspect-3/4 flex-col overflow-hidden rounded-2xl bg-stone-200 text-left shadow-sm dark:bg-stone-800"
    >
      <BirdImage
        wikiTitle={bird.wikiTitle}
        alt={bird.nameDe}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <span
        className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${RARITY_BADGE_CLASSES[bird.rarity]}`}
      >
        {RARITY_LABEL[bird.rarity]}
      </span>

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
        className="tap-shrink absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-base backdrop-blur-sm"
      >
        <span className={isFavorite ? 'animate-pop inline-block' : 'inline-block'}>
          {isFavorite ? '❤️' : '🤍'}
        </span>
      </span>

      <div className="relative mt-auto flex flex-col gap-0.5 p-3">
        <h3 className="text-sm leading-tight font-semibold text-white">{bird.nameDe}</h3>
        <p className="text-xs italic text-white/75">{bird.nameLatin}</p>
      </div>
    </button>
  );
}
