import type { Rarity } from '../data/types';

export const RARITY_LABEL: Record<Rarity, string> = {
  'sehr häufig': 'Sehr häufig',
  häufig: 'Häufig',
  mittel: 'Mittel häufig',
  selten: 'Selten',
};

export const RARITY_BADGE_CLASSES: Record<Rarity, string> = {
  'sehr häufig': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  häufig: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  mittel: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  selten: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};
