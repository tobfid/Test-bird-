import { useMemo, useState, type ReactNode } from 'react';
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
const STEP_LABELS = ['Größe', 'Lebensraum', 'Beobachtungsort', 'Farbe', 'Ergebnis'];

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`tap-shrink flex items-center justify-between rounded-xl border p-3 text-left ${
        active
          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950'
          : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'
      }`}
    >
      <span className="flex-1">{children}</span>
      {active && <span className="text-brand-600 dark:text-brand-400">✓</span>}
    </button>
  );
}

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

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-brand-900 dark:text-stone-100">Bestimmungs-Assistent</h2>
        <p className="text-stone-500 dark:text-stone-400">
          Beantworte ein paar einfache Fragen zu dem Vogel, den du gerade siehst.
        </p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>
            Schritt {Math.min(step + 1, STEP_LABELS.length)} von {STEP_LABELS.length}
          </span>
          <span className="font-medium text-brand-700 dark:text-brand-400">{STEP_LABELS[step]}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {step > 0 && step < 4 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="tap-shrink self-start text-sm text-stone-500 dark:text-stone-400"
        >
          ← Zurück
        </button>
      )}

      {step === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {SIZE_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.value}
              active={state.size === opt.value}
              onClick={() => {
                setState((s) => ({ ...s, size: opt.value }));
                setStep(1);
              }}
            >
              <p className="font-medium">{opt.label}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{opt.hint}</p>
            </OptionButton>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {HABITATS.map((h) => (
            <OptionButton
              key={h}
              active={state.habitat === h}
              onClick={() => {
                setState((s) => ({ ...s, habitat: h }));
                setStep(2);
              }}
            >
              <span className="font-medium">{h}</span>
            </OptionButton>
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
              <OptionButton
                key={loc}
                active={state.foraging === loc}
                onClick={() => {
                  setState((s) => ({ ...s, foraging: loc }));
                  setStep(3);
                }}
              >
                <span className="font-medium">{loc}</span>
              </OptionButton>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="tap-shrink mt-4 text-sm text-stone-500 underline dark:text-stone-400"
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
                className={`tap-shrink rounded-full border px-3 py-1.5 ${
                  state.colors.includes(c)
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(4)}
            className="tap-shrink mt-4 rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white shadow-sm shadow-brand-900/20"
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
            <button onClick={reset} className="tap-shrink text-sm text-brand-700 underline dark:text-brand-400">
              Neu starten
            </button>
          </div>
          {results.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
              Keine Treffer für diese Kombination. Versuche es mit weniger oder anderen Angaben.
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
      )}

      {started && (
        <button
          onClick={reset}
          className="tap-shrink self-start text-sm text-stone-400 underline dark:text-stone-500"
        >
          Alles zurücksetzen
        </button>
      )}
    </div>
  );
}
