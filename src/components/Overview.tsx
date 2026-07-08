import { useMemo, useState } from 'react';
import { birds } from '../data/birds';
import { emptyFilterState, filterBirds } from '../utils/filterBirds';
import { BirdCard } from './BirdCard';
import { FilterBar } from './FilterBar';

export function Overview({
  favorites,
  onToggleFavorite,
  onSelectBird,
  onlyFavorites = false,
}: {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectBird: (id: string) => void;
  onlyFavorites?: boolean;
}) {
  const [filter, setFilter] = useState(emptyFilterState);

  const results = useMemo(() => {
    const base = onlyFavorites ? birds.filter((b) => favorites.includes(b.id)) : birds;
    return filterBirds(base, filter);
  }, [filter, onlyFavorites, favorites]);

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {!onlyFavorites && (
        <aside className="md:w-64 md:shrink-0">
          <FilterBar filter={filter} onChange={setFilter} />
        </aside>
      )}
      <div className="flex-1">
        <p className="mb-3 text-sm text-stone-500 dark:text-stone-400">
          {results.length} {results.length === 1 ? 'Art' : 'Arten'}
        </p>
        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
            {onlyFavorites
              ? 'Noch keine Favoriten gemerkt. Tippe auf das Herz bei einem Vogel, um ihn hier zu sammeln.'
              : 'Keine Vögel gefunden. Versuche andere Filter oder Suchbegriffe.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((bird) => (
              <BirdCard
                key={bird.id}
                bird={bird}
                isFavorite={favorites.includes(bird.id)}
                onSelect={onSelectBird}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
