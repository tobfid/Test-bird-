import { useEffect, useMemo, useState } from 'react';
import { birds } from '../data/birds';
import { RARITIES, type Bird, type Rarity } from '../data/types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { RARITY_LABEL } from '../utils/rarityStyle';
import { BirdImage } from './BirdImage';

interface QuizStats {
  [birdId: string]: { correct: number; wrong: number };
}

interface QuizScope {
  rarities: Rarity[];
  family: string;
}

const ALL_FAMILIES = 'Alle Familien';
const MIN_POOL_SIZE = 4;

const FAMILY_OPTIONS = [ALL_FAMILIES, ...Array.from(new Set(birds.map((b) => b.family))).sort((a, b) => a.localeCompare(b, 'de'))];

const defaultScope: QuizScope = { rarities: ['sehr häufig'], family: ALL_FAMILIES };

function poolFor(scope: QuizScope): Bird[] {
  return birds.filter(
    (b) =>
      (scope.rarities.length === 0 || scope.rarities.includes(b.rarity)) &&
      (scope.family === ALL_FAMILIES || b.family === scope.family),
  );
}

function pickWeighted(stats: QuizStats, pool: Bird[]): Bird {
  const weighted = pool.map((bird) => {
    const s = stats[bird.id];
    const learned = (s?.correct ?? 0) - (s?.wrong ?? 0);
    const weight = Math.max(1, 4 - learned);
    return { bird, weight };
  });
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.bird;
  }
  return pool[0];
}

function buildQuestion(stats: QuizStats, pool: Bird[]) {
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

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function Quiz() {
  const [scope, setScope] = useLocalStorage<QuizScope>('vogelapp-quiz-scope', defaultScope);
  const [stats, setStats] = useLocalStorage<QuizStats>('vogelapp-quiz-stats', {});
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [selected, setSelected] = useState<string | null>(null);

  const pool = useMemo(() => poolFor(scope), [scope]);
  const [question, setQuestion] = useState(() => (pool.length >= MIN_POOL_SIZE ? buildQuestion(stats, pool) : null));

  useEffect(() => {
    setSelected(null);
    setSessionScore({ correct: 0, total: 0 });
    setQuestion(pool.length >= MIN_POOL_SIZE ? buildQuestion(stats, pool) : null);
    // Neue Runde bei Auswahl-Wechsel starten – bewusst nicht auf `stats` reagieren,
    // sonst würde jede Antwort mitten in der Runde eine neue Frage erzwingen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const masteredCount = useMemo(
    () => pool.filter((b) => (stats[b.id]?.correct ?? 0) - (stats[b.id]?.wrong ?? 0) >= 2).length,
    [stats, pool],
  );

  function answer(birdId: string) {
    if (selected || !question) return;
    setSelected(birdId);
    const isCorrect = birdId === question.correct.id;
    setSessionScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setStats((prev) => {
      const current = prev[question.correct.id] ?? { correct: 0, wrong: 0 };
      return {
        ...prev,
        [question.correct.id]: {
          correct: current.correct + (isCorrect ? 1 : 0),
          wrong: current.wrong + (isCorrect ? 0 : 1),
        },
      };
    });
  }

  function next() {
    setSelected(null);
    setQuestion(pool.length >= MIN_POOL_SIZE ? buildQuestion(stats, pool) : null);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Lernquiz</h2>
        <p className="text-stone-500 dark:text-stone-400">
          Erkenne den Vogel anhand des Fotos. Am schnellsten lernst du, wenn du erst die häufigsten Arten sicher
          beherrschst und dich dann Schritt für Schritt vorarbeitest.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800">
        <div>
          <p className="mb-1.5 text-sm font-medium text-stone-500 dark:text-stone-400">Häufigkeit</p>
          <div className="flex flex-wrap gap-2">
            {RARITIES.map((r) => (
              <button
                key={r}
                onClick={() => setScope((s) => ({ ...s, rarities: toggle(s.rarities, r) }))}
                className={`rounded-full border px-3 py-1 text-sm ${
                  scope.rarities.includes(r)
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              >
                {RARITY_LABEL[r]}
              </button>
            ))}
            {scope.rarities.length > 0 && (
              <button
                onClick={() => setScope((s) => ({ ...s, rarities: [] }))}
                className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400"
              >
                Alle
              </button>
            )}
          </div>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Vogelfamilie</span>
          <select
            value={scope.family}
            onChange={(e) => setScope((s) => ({ ...s, family: e.target.value }))}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            {FAMILY_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex justify-around rounded-lg bg-stone-100 p-3 text-center dark:bg-stone-800">
        <div>
          <p className="text-lg font-semibold">
            {sessionScore.correct}/{sessionScore.total}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">diese Runde</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{masteredCount}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">von {pool.length} gemeistert</p>
        </div>
      </div>

      {!question ? (
        <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
          Zu wenige Arten in dieser Auswahl (mindestens {MIN_POOL_SIZE} nötig) – bitte Häufigkeit oder Familie weiter
          fassen.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800">
            <BirdImage
              wikiTitle={question.correct.wikiTitle}
              alt="Welcher Vogel ist das?"
              className="aspect-4/3 w-full object-cover"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {question.options.map((opt) => {
              const isCorrectOpt = opt.id === question.correct.id;
              const showState = selected !== null;
              const isSelected = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => answer(opt.id)}
                  disabled={showState}
                  className={`rounded-lg border p-3 text-left font-medium transition ${
                    showState && isCorrectOpt
                      ? 'border-green-600 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'
                      : showState && isSelected
                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {opt.nameDe}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="flex flex-col gap-3 rounded-lg bg-stone-50 p-4 dark:bg-stone-900">
              <p>
                <strong>{question.correct.nameDe}</strong> — {question.correct.features[0]}
              </p>
              <button onClick={next} className="self-start rounded-lg bg-green-700 px-4 py-2 text-white">
                Nächster Vogel →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
