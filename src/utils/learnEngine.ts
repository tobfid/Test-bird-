import { birds } from '../data/birds';
import { HABITATS, RARITIES, type Bird, type Habitat, type Rarity } from '../data/types';

export interface LearnStats {
  [birdId: string]: { correct: number; wrong: number };
}

export type LearnAxis = 'haeufigkeit' | 'lebensraum' | 'familie';

export const LEARN_AXES: { id: LearnAxis; label: string; icon: string }[] = [
  { id: 'haeufigkeit', label: 'Häufigkeit', icon: '📊' },
  { id: 'lebensraum', label: 'Lebensraum', icon: '🌳' },
  { id: 'familie', label: 'Familie', icon: '🧬' },
];

export interface LearnScope {
  axis: LearnAxis;
  rarities: Rarity[];
  habitats: Habitat[];
  family: string;
}

export const ALL_FAMILIES = 'Alle Familien';
export const MIN_POOL_SIZE = 4;

export const FAMILY_OPTIONS = [
  ALL_FAMILIES,
  ...Array.from(new Set(birds.map((b) => b.family))).sort((a, b) => a.localeCompare(b, 'de')),
];

export const defaultScope: LearnScope = {
  axis: 'haeufigkeit',
  rarities: ['sehr häufig'],
  habitats: [],
  family: ALL_FAMILIES,
};

export function poolFor(scope: LearnScope): Bird[] {
  if (scope.axis === 'lebensraum') {
    return birds.filter((b) => scope.habitats.length === 0 || scope.habitats.some((h) => b.habitats.includes(h)));
  }
  if (scope.axis === 'familie') {
    return birds.filter((b) => scope.family === ALL_FAMILIES || b.family === scope.family);
  }
  return birds.filter((b) => scope.rarities.length === 0 || scope.rarities.includes(b.rarity));
}

/** Für die Anzeige verfügbarer Lebensräume in der UI. */
export { HABITATS };

/** Häufigste Arten zuerst - für den sequenziellen Lernmodus. */
export function sortByRarity(pool: Bird[]): Bird[] {
  return [...pool].sort((a, b) => RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity));
}

function netScore(stats: LearnStats, birdId: string): number {
  const s = stats[birdId];
  return (s?.correct ?? 0) - (s?.wrong ?? 0);
}

export function isMastered(stats: LearnStats, birdId: string): boolean {
  return netScore(stats, birdId) >= 2;
}

export function pickWeighted(stats: LearnStats, pool: Bird[]): Bird {
  const weighted = pool.map((bird) => ({
    bird,
    weight: Math.max(1, 4 - netScore(stats, bird.id)),
  }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.bird;
  }
  return pool[0];
}

export function buildMultipleChoice(stats: LearnStats, pool: Bird[]) {
  const correct = pickWeighted(stats, pool);
  const rest = pool.filter((b) => b.id !== correct.id);
  const sameHabitat = rest.filter((b) => b.habitats.some((h) => correct.habitats.includes(h)));
  const distractorPool = sameHabitat.length >= 3 ? sameHabitat : rest;
  const distractors: Bird[] = [];
  const copy = [...distractorPool];
  while (distractors.length < 3 && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    distractors.push(copy.splice(idx, 1)[0]);
  }
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  return { correct, options };
}

export function recordAnswer(stats: LearnStats, birdId: string, correct: boolean): LearnStats {
  const current = stats[birdId] ?? { correct: 0, wrong: 0 };
  return {
    ...stats,
    [birdId]: {
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
    },
  };
}

/** Fortschritt je Häufigkeitsstufe, für die "häufigste zuerst"-Lernreihenfolge. */
export function progressByRarity(stats: LearnStats): { rarity: Rarity; mastered: number; total: number }[] {
  return RARITIES.map((rarity) => {
    const tierBirds = birds.filter((b) => b.rarity === rarity);
    return {
      rarity,
      mastered: tierBirds.filter((b) => isMastered(stats, b.id)).length,
      total: tierBirds.length,
    };
  });
}
