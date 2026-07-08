import { useState } from 'react';
import type { Bird } from '../data/types';
import { BirdImage } from './BirdImage';

export function Flashcard({ bird, onAnswer }: { bird: Bird; onAnswer: (correct: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setRevealed((r) => !r)}
        className="tap-shrink block w-full overflow-hidden rounded-3xl border border-stone-200 text-left shadow-sm dark:border-stone-800"
      >
        <div className="relative aspect-4/3 w-full">
          <BirdImage wikiTitle={bird.wikiTitle} alt="Welcher Vogel ist das?" className="h-full w-full object-cover" />
        </div>
        <div className="bg-white p-4 dark:bg-stone-900">
          {revealed ? (
            <>
              <h3 className="text-xl font-bold text-brand-900 dark:text-brand-200">{bird.nameDe}</h3>
              <p className="mb-2 italic text-stone-500 dark:text-stone-400">{bird.nameLatin}</p>
              <p className="text-sm text-stone-700 dark:text-stone-300">{bird.features[0]}</p>
            </>
          ) : (
            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              Wie heißt dieser Vogel? Tippe zum Aufdecken.
            </p>
          )}
        </div>
      </button>

      {revealed && (
        <div className="animate-sheet-in grid grid-cols-2 gap-2">
          <button
            onClick={() => onAnswer(false)}
            className="tap-shrink rounded-xl border border-red-300 bg-red-50 py-3 font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            ❌ Nochmal üben
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="tap-shrink rounded-xl border border-brand-300 bg-brand-50 py-3 font-medium text-brand-800 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
          >
            ✅ Wusste ich
          </button>
        </div>
      )}
    </div>
  );
}
