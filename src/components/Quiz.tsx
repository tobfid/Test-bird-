import { useMemo, useState } from 'react';
import { birds } from '../data/birds';
import type { Bird } from '../data/types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BirdImage } from './BirdImage';

interface QuizStats {
  [birdId: string]: { correct: number; wrong: number };
}

function pickWeighted(stats: QuizStats): Bird {
  const weighted = birds.map((bird) => {
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
  return birds[0];
}

function buildQuestion(stats: QuizStats) {
  const correct = pickWeighted(stats);
  const pool = birds.filter((b) => b.id !== correct.id);
  const sameHabitat = pool.filter((b) => b.habitats.some((h) => correct.habitats.includes(h)));
  const distractorPool = sameHabitat.length >= 3 ? sameHabitat : pool;
  const distractors: Bird[] = [];
  const copy = [...distractorPool];
  while (distractors.length < 3 && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    distractors.push(copy.splice(idx, 1)[0]);
  }
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  return { correct, options };
}

export function Quiz() {
  const [stats, setStats] = useLocalStorage<QuizStats>('vogelapp-quiz-stats', {});
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [question, setQuestion] = useState(() => buildQuestion({}));
  const [selected, setSelected] = useState<string | null>(null);

  const masteredCount = useMemo(
    () => Object.values(stats).filter((s) => s.correct - s.wrong >= 2).length,
    [stats],
  );

  function answer(birdId: string) {
    if (selected) return;
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
    setQuestion(buildQuestion(stats));
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Lernquiz</h2>
        <p className="text-stone-500 dark:text-stone-400">
          Erkenne den Vogel anhand des Fotos. Häufig falsch beantwortete Arten kommen öfter dran.
        </p>
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
          <p className="text-xs text-stone-500 dark:text-stone-400">von {birds.length} gemeistert</p>
        </div>
      </div>

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
    </div>
  );
}
