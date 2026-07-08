export type Habitat =
  | 'Garten & Park'
  | 'Wald'
  | 'Wasser & Ufer'
  | 'Feld & Wiese'
  | 'Stadt'
  | 'Fels & Gebirge';

export type Color =
  | 'Schwarz'
  | 'Weiß'
  | 'Braun'
  | 'Grau'
  | 'Rot'
  | 'Gelb'
  | 'Blau'
  | 'Grün'
  | 'Orange';

export type SizeClass = 'winzig' | 'klein' | 'mittel' | 'groß' | 'sehr groß';

export type Status = 'Standvogel' | 'Teilzieher' | 'Sommervogel' | 'Wintergast';

export interface Bird {
  /** URL-freundliche eindeutige Kennung */
  id: string;
  nameDe: string;
  nameLatin: string;
  family: string;
  /** Körperlänge in cm, [min, max] */
  sizeCm: [number, number];
  habitats: Habitat[];
  colors: Color[];
  status: Status;
  /** Kurzer Text, wann/wo man den Vogel in Deutschland sieht */
  seasonInfo: string;
  /** Bestimmungsmerkmale in Stichpunkten */
  features: string[];
  /** Beschreibung des Gesangs/Rufs */
  voice: string;
  /** IDs leicht zu verwechselnder Arten */
  confusionWith?: string[];
  funFact: string;
  /** Titel des deutschen Wikipedia-Artikels, für Bild & weiterführende Infos */
  wikiTitle: string;
  rarity: 'sehr häufig' | 'häufig' | 'mittel' | 'selten';
}

export function sizeClass(sizeCm: [number, number]): SizeClass {
  const avg = (sizeCm[0] + sizeCm[1]) / 2;
  if (avg < 12) return 'winzig';
  if (avg < 20) return 'klein';
  if (avg < 35) return 'mittel';
  if (avg < 70) return 'groß';
  return 'sehr groß';
}

export const HABITATS: Habitat[] = [
  'Garten & Park',
  'Wald',
  'Wasser & Ufer',
  'Feld & Wiese',
  'Stadt',
  'Fels & Gebirge',
];

export const COLORS: Color[] = [
  'Schwarz',
  'Weiß',
  'Braun',
  'Grau',
  'Rot',
  'Gelb',
  'Blau',
  'Grün',
  'Orange',
];

export const SIZE_CLASSES: SizeClass[] = ['winzig', 'klein', 'mittel', 'groß', 'sehr groß'];

export const STATUSES: Status[] = ['Standvogel', 'Teilzieher', 'Sommervogel', 'Wintergast'];
