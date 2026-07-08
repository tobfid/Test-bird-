import { useEffect, useMemo, useState } from 'react';
import { RARITIES } from '../data/types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  buildMultipleChoice,
  defaultScope,
  FAMILY_OPTIONS,
  isMastered,
  MIN_POOL_SIZE,
  pickWeighted,
  poolFor,
  progressByRarity,
  recordAnswer,
  sortByRarity,
  type LearnScope,
  type LearnStats,
} from '../utils/learnEngine';
import { RARITY_LABEL } from '../utils/rarityStyle';
import { BirdImage } from './BirdImage';
import { Flashcard } from './Flashcard';
import { StudyCard } from './StudyCard';

type Mode = 'lernen' | 'karteikarten' | 'quiz';
const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'lernen', label: 'Lernen', icon: '📖' },
  { id: 'karteikarten', label: 'Karteikarten', icon: '🃏' },
  { id: 'quiz', label: 'Quiz', icon: '🎯' },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function scopeSummary(scope: LearnScope): string {
  const rarityPart =
    scope.rarities.length === 0 ? 'Alle Häufigkeiten' : scope.rarities.map((r) => RARITY_LABEL[r]).join(', ');
  const familyPart = scope.family === FAMILY_OPTIONS[0] ? 'alle Familien' : scope.family;
  return `${rarityPart} · ${familyPart}`;
}

export function Learn({
  favorites,
  onToggleFavorite,
}: {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  const [mode, setMode] = useState<Mode>('lernen');
  const [scope, setScope] = useLocalStorage<LearnScope>('vogelapp-learn-scope', defaultScope);
  const [stats, setStats] = useLocalStorage<LearnStats>('vogelapp-quiz-stats', {});
  const [scopeOpen, setScopeOpen] = useState(false);

  const pool = useMemo(() => poolFor(scope), [scope]);
  const studyPool = useMemo(() => sortByRarity(pool), [pool]);
  const masteredIds = useMemo(() => new Set(pool.filter((b) => isMastered(stats, b.id)).map((b) => b.id)), [pool, stats]);
  const tiers = useMemo(() => progressByRarity(stats), [stats]);

  function markCorrect(birdId: string) {
    setStats((s) => recordAnswer(s, birdId, true));
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-brand-900 dark:text-brand-200">🎓 Lernen</h2>
        <p className="text-stone-500 dark:text-stone-400">
          Erst anschauen und einprägen, dann testen. Am schnellsten wirst du Experte, wenn du bei den häufigsten
          Arten anfängst.
        </p>
      </div>

      <div className="flex gap-1 rounded-2xl bg-stone-100 p-1 dark:bg-stone-900">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`tap-shrink flex-1 rounded-xl py-2 text-sm font-medium ${
              mode === m.id
                ? 'bg-white text-brand-800 shadow-sm dark:bg-stone-800 dark:text-brand-300'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tiers.map((t) => (
          <span
            key={t.rarity}
            className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-300"
          >
            {RARITY_LABEL[t.rarity]}: {t.mastered}/{t.total}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setScopeOpen((o) => !o)}
          className="tap-shrink flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Lern-Auswahl</p>
            <p className="text-sm font-medium">{scopeSummary(scope)}</p>
          </div>
          <span className="text-stone-400">{scopeOpen ? '▲' : '▼'}</span>
        </button>
        {scopeOpen && (
          <div className="animate-sheet-in flex flex-col gap-3 border-t border-stone-200 p-4 dark:border-stone-800">
            <div>
              <p className="mb-1.5 text-sm font-medium text-stone-500 dark:text-stone-400">Häufigkeit</p>
              <div className="flex flex-wrap gap-2">
                {RARITIES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setScope((s) => ({ ...s, rarities: toggle(s.rarities, r) }))}
                    className={`tap-shrink rounded-full border px-3 py-1 text-sm ${
                      scope.rarities.includes(r)
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {RARITY_LABEL[r]}
                  </button>
                ))}
                {scope.rarities.length > 0 && (
                  <button
                    onClick={() => setScope((s) => ({ ...s, rarities: [] }))}
                    className="tap-shrink rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400"
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
        )}
      </div>

      {mode === 'lernen' && (
        <StudyCard
          birds={studyPool}
          masteredIds={masteredIds}
          onMarkKnown={markCorrect}
          onFavorite={onToggleFavorite}
          favoriteIds={favorites}
        />
      )}

      {mode === 'karteikarten' && (
        <FlashcardMode pool={pool} stats={stats} setStats={setStats} masteredCount={masteredIds.size} />
      )}

      {mode === 'quiz' && <QuizMode pool={pool} stats={stats} setStats={setStats} masteredCount={masteredIds.size} />}
    </div>
  );
}

function FlashcardMode({
  pool,
  stats,
  setStats,
  masteredCount,
}: {
  pool: ReturnType<typeof poolFor>;
  stats: LearnStats;
  setStats: (updater: (s: LearnStats) => LearnStats) => void;
  masteredCount: number;
}) {
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [current, setCurrent] = useState(() => (pool.length > 0 ? pickWeighted(stats, pool) : null));

  useEffect(() => {
    setSessionScore({ correct: 0, total: 0 });
    setCurrent(pool.length > 0 ? pickWeighted(stats, pool) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  function answer(correct: boolean) {
    if (!current) return;
    setSessionScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setStats((s) => recordAnswer(s, current.id, correct));
    setCurrent(pool.length > 0 ? pickWeighted(stats, pool) : null);
  }

  return (
    <div className="flex flex-col gap-4">
      <ScoreBar sessionScore={sessionScore} masteredCount={masteredCount} total={pool.length} />
      {!current ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
          Keine Arten in dieser Auswahl.
        </p>
      ) : (
        <Flashcard key={current.id} bird={current} onAnswer={answer} />
      )}
    </div>
  );
}

function QuizMode({
  pool,
  stats,
  setStats,
  masteredCount,
}: {
  pool: ReturnType<typeof poolFor>;
  stats: LearnStats;
  setStats: (updater: (s: LearnStats) => LearnStats) => void;
  masteredCount: number;
}) {
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [question, setQuestion] = useState(() =>
    pool.length >= MIN_POOL_SIZE ? buildMultipleChoice(stats, pool) : null,
  );

  useEffect(() => {
    setSelected(null);
    setSessionScore({ correct: 0, total: 0 });
    setQuestion(pool.length >= MIN_POOL_SIZE ? buildMultipleChoice(stats, pool) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  function answer(birdId: string) {
    if (selected || !question) return;
    setSelected(birdId);
    const correct = birdId === question.correct.id;
    setSessionScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setStats((s) => recordAnswer(s, question.correct.id, correct));
  }

  function next() {
    setSelected(null);
    setQuestion(pool.length >= MIN_POOL_SIZE ? buildMultipleChoice(stats, pool) : null);
  }

  return (
    <div className="flex flex-col gap-4">
      <ScoreBar sessionScore={sessionScore} masteredCount={masteredCount} total={pool.length} />
      {!question ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500 dark:border-stone-700">
          Zu wenige Arten in dieser Auswahl (mindestens {MIN_POOL_SIZE} nötig) – bitte Häufigkeit oder Familie weiter
          fassen.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm dark:border-stone-800">
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
                  className={`tap-shrink flex items-center gap-2 rounded-xl border p-3 text-left font-medium transition-colors ${
                    showState && isCorrectOpt
                      ? 'border-brand-600 bg-brand-50 text-brand-900 dark:bg-brand-950 dark:text-brand-200'
                      : showState && isSelected
                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
                  }`}
                >
                  {showState && isCorrectOpt && <span>✅</span>}
                  {showState && isSelected && !isCorrectOpt && <span>❌</span>}
                  <span>{opt.nameDe}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="animate-sheet-in flex flex-col gap-3 rounded-2xl bg-stone-50 p-4 dark:bg-stone-900">
              <p>
                <strong>{question.correct.nameDe}</strong> — {question.correct.features[0]}
              </p>
              <button
                onClick={next}
                className="tap-shrink self-start rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white shadow-sm shadow-brand-900/20"
              >
                Nächster Vogel →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScoreBar({
  sessionScore,
  masteredCount,
  total,
}: {
  sessionScore: { correct: number; total: number };
  masteredCount: number;
  total: number;
}) {
  return (
    <div className="flex justify-around rounded-2xl bg-brand-50 p-3 text-center dark:bg-brand-950">
      <div>
        <p className="text-lg font-semibold text-brand-900 dark:text-brand-200">
          {sessionScore.correct}/{sessionScore.total}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">diese Runde</p>
      </div>
      <div>
        <p className="text-lg font-semibold text-brand-900 dark:text-brand-200">{masteredCount}</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">von {total} gemeistert</p>
      </div>
    </div>
  );
}
