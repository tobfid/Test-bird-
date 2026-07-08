import { useMemo, useState } from 'react';
import { birds } from '../data/birds';
import { activeFilterCount, emptyFilterState, filterBirds } from '../utils/filterBirds';
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const base = onlyFavorites ? birds.filter((b) => favorites.includes(b.id)) : birds;
    return filterBirds(base, filter);
  }, [filter, onlyFavorites, favorites]);

  const filterCount = activeFilterCount(filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="search"
          value={filter.query}
          onChange={(e) => setFilter({ ...filter, query: e.target.value })}
          placeholder="Vogel suchen…"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-base outline-none focus:border-brand-500 dark:border-stone-700 dark:bg-stone-900"
        />
        {!onlyFavorites && (
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`tap-shrink relative flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
              filtersOpen
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
            }`}
          >
            🎚️ Filter
            {filterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sun-500 text-xs font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {!onlyFavorites && filtersOpen && (
        <div className="animate-sheet-in">
          <FilterBar filter={filter} onChange={setFilter} />
        </div>
      )}

      <p className="text-sm text-stone-500 dark:text-stone-400">
        {results.length} {results.length === 1 ? 'Art' : 'Arten'}
      </p>

      {results.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
          {onlyFavorites
            ? 'Noch keine Favoriten gemerkt. Tippe auf das Herz bei einem Vogel, um ihn hier zu sammeln.'
            : 'Keine Vögel gefunden. Versuche andere Filter oder Suchbegriffe.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
  );
}
