import type { Bird, Color, Habitat, SizeClass } from '../data/types';
import { sizeClass } from '../data/types';

export interface FilterState {
  query: string;
  habitats: Habitat[];
  colors: Color[];
  sizes: SizeClass[];
}

export const emptyFilterState: FilterState = {
  query: '',
  habitats: [],
  colors: [],
  sizes: [],
};

export function filterBirds(birds: Bird[], filter: FilterState): Bird[] {
  const q = filter.query.trim().toLowerCase();

  return birds.filter((bird) => {
    if (q) {
      const haystack = `${bird.nameDe} ${bird.nameLatin} ${bird.family}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filter.habitats.length > 0 && !filter.habitats.some((h) => bird.habitats.includes(h))) {
      return false;
    }
    if (filter.colors.length > 0 && !filter.colors.some((c) => bird.colors.includes(c))) {
      return false;
    }
    if (filter.sizes.length > 0 && !filter.sizes.includes(sizeClass(bird.sizeCm))) {
      return false;
    }
    return true;
  });
}
