import { useMemo, useState } from 'react';
import { birds } from '../data/birds';
import {
  COLORS,
  FORAGING_LOCATIONS,
  HABITATS,
  type Color,
  type ForagingLocation,
  type Habitat,
  type SizeClass,
} from '../data/types';
import { sizeClass } from '../data/types';
import { BirdCard } from './BirdCard';

const SIZE_OPTIONS: { value: SizeClass; label: string; hint: string }[] = [
  { value: 'winzig', label: 'Winzig', hint: 'kleiner als ein Zaunkönig, ca. 9–11 cm' },
  { value: 'klein', label: 'Klein', hint: 'etwa wie eine Meise, ca. 12–19 cm' },
  { value: 'mittel', label: 'Mittel', hint: 'etwa wie eine Amsel, ca. 20–34 cm' },
  { value: 'groß', label: 'Groß', hint: 'etwa wie eine Taube bis Krähe, ca. 35–69 cm' },
  { value: 'sehr groß', label: 'Sehr groß', hint: 'wie ein Storch oder Reiher, ab 70 cm' },
];

interface WizardState {
  size: SizeClass | null;
  habitat: Habitat | null;
  foraging: ForagingLocation | null;
  colors: Color[];
}

const initialState: WizardState = { size: null, habitat: null, foraging: null, colors: [] };

export function IdentifyWizard({
  favorites,
  onToggleFavorite,
  onSelectBird,
}: {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectBird: (id: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);

  const results = useMemo(() => {
    return birds
      .map((bird) => {
        let score = 0;
        let possible = 0;
        if (state.size) {
          possible += 1;
          if (sizeClass(bird.sizeCm) === state.size) score += 1;
        }
        if (state.habitat) {
          possible += 1;
          if (bird.habitats.includes(state.habitat)) score += 1;
        }
        if (state.foraging) {
          possible += 1;
          if (bird.foragingLocations.includes(state.foraging)) score += 1;
        }
        if (state.colors.length > 0) {
          possible += 1;
          if (state.colors.some((c) => bird.colors.includes(c))) score += 1;
        }
        return { bird, score, possible };
      })
      .filter((r) => r.possible === 0 || r.score === r.possible)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.bird);
  }, [state]);

  const started =
    state.size !== null || state.habitat !== null || state.foraging !== null || state.colors.length > 0;

  function reset() {
    setState(initialState);
    setStep(0);
  }

  const steps = ['Größe', 'Lebensraum', 'Beobachtungsort', 'Farbe', 'Ergebnis'];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Bestimmungs-Assistent</h2>
        <p className="text-stone-500 dark:text-stone-400">
          Beantworte ein paar einfache Fragen zu dem Vogel, den du gerade siehst – wir schlagen dir passende Arten vor.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2 text-sm">
        {steps.map((label, i) => (
          <li key={label}>
            <button
              onClick={() => setStep(i)}
              className={`rounded-full px-3 py-1 ${
                i === step
                  ? 'bg-green-700 text-white'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              {i + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setState((s) => ({ ...s, size: opt.value }));
                setStep(1);
              }}
              className={`rounded-lg border p-3 text-left ${
                state.size === opt.value
                  ? 'border-green-700 bg-green-50 dark:bg-green-950'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <p className="font-medium">{opt.label}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{opt.hint}</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {HABITATS.map((h) => (
            <button
              key={h}
              onClick={() => {
                setState((s) => ({ ...s, habitat: h }));
                setStep(2);
              }}
              className={`rounded-lg border p-3 text-left font-medium ${
                state.habitat === h
                  ? 'border-green-700 bg-green-50 dark:bg-green-950'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-2 text-sm text-stone-500 dark:text-stone-400">
            Wo genau hast du den Vogel gesehen? Das grenzt die Kandidaten oft stark ein.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FORAGING_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setState((s) => ({ ...s, foraging: loc }));
                  setStep(3);
                }}
                className={`rounded-lg border p-3 text-left font-medium ${
                  state.foraging === loc
                    ? 'border-green-700 bg-green-50 dark:bg-green-950'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="mt-4 text-sm text-stone-500 underline dark:text-stone-400"
          >
            Überspringen
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="mb-2 text-sm text-stone-500 dark:text-stone-400">
            Mehrfachauswahl möglich – wähle die auffälligsten Farben.
          </p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    colors: s.colors.includes(c) ? s.colors.filter((x) => x !== c) : [...s.colors, c],
                  }))
                }
                className={`rounded-full border px-3 py-1.5 ${
                  state.colors.includes(c)
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(4)}
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white"
          >
            Vögel anzeigen ({results.length})
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {results.length} passende {results.length === 1 ? 'Art' : 'Arten'}, beste Treffer zuerst
            </p>
            <button onClick={reset} className="text-sm text-green-700 underline dark:text-green-400">
              Neu starten
            </button>
          </div>
          {results.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
              Keine Treffer für diese Kombination. Versuche es mit weniger oder anderen Angaben.
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
      )}

      {started && step < 4 && (
        <button onClick={reset} className="self-start text-sm text-stone-500 underline dark:text-stone-400">
          Zurücksetzen
        </button>
      )}
    </div>
  );
}
