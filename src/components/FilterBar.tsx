import {
  COLORS,
  HABITATS,
  RARITIES,
  SIZE_CLASSES,
  type Color,
  type Habitat,
  type Rarity,
  type SizeClass,
} from '../data/types';
import type { FilterState } from '../utils/filterBirds';
import { RARITY_LABEL } from '../utils/rarityStyle';

function Chip<T extends string>({
  label,
  active,
  onClick,
}: {
  label: T;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        active
          ? 'border-green-700 bg-green-700 text-white'
          : 'border-stone-300 bg-white text-stone-700 hover:border-green-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
      }`}
    >
      {label}
    </button>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterBar({
  filter,
  onChange,
}: {
  filter: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const hasActiveFilters =
    filter.habitats.length > 0 ||
    filter.colors.length > 0 ||
    filter.sizes.length > 0 ||
    filter.rarities.length > 0 ||
    filter.query.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={filter.query}
        onChange={(e) => onChange({ ...filter, query: e.target.value })}
        placeholder="Vogel suchen (Name oder Familie)…"
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-base outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-900"
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-stone-500 dark:text-stone-400">Lebensraum</p>
        <div className="flex flex-wrap gap-2">
          {HABITATS.map((h: Habitat) => (
            <Chip
              key={h}
              label={h}
              active={filter.habitats.includes(h)}
              onClick={() => onChange({ ...filter, habitats: toggle(filter.habitats, h) })}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-stone-500 dark:text-stone-400">Farbe</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c: Color) => (
            <Chip
              key={c}
              label={c}
              active={filter.colors.includes(c)}
              onClick={() => onChange({ ...filter, colors: toggle(filter.colors, c) })}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-stone-500 dark:text-stone-400">Größe</p>
        <div className="flex flex-wrap gap-2">
          {SIZE_CLASSES.map((s: SizeClass) => (
            <Chip
              key={s}
              label={s}
              active={filter.sizes.includes(s)}
              onClick={() => onChange({ ...filter, sizes: toggle(filter.sizes, s) })}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-stone-500 dark:text-stone-400">Häufigkeit</p>
        <div className="flex flex-wrap gap-2">
          {RARITIES.map((r: Rarity) => (
            <Chip
              key={r}
              label={RARITY_LABEL[r]}
              active={filter.rarities.includes(r)}
              onClick={() => onChange({ ...filter, rarities: toggle(filter.rarities, r) })}
            />
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({ query: '', habitats: [], colors: [], sizes: [], rarities: [] })}
          className="self-start text-sm text-green-700 underline dark:text-green-400"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
