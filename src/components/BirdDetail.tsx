import { useEffect, type ReactNode } from 'react';
import { birds } from '../data/birds';
import { sizeClass } from '../data/types';
import { useWikiSummary } from '../hooks/useWikiSummary';
import { BirdImage } from './BirdImage';

const RARITY_LABEL: Record<string, string> = {
  'sehr häufig': 'Sehr häufig',
  häufig: 'Häufig',
  mittel: 'Mittel häufig',
  selten: 'Selten',
};

export function BirdDetail({
  birdId,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectBird,
}: {
  birdId: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onSelectBird: (id: string) => void;
}) {
  const bird = birds.find((b) => b.id === birdId);
  const { data: wiki } = useWikiSummary(bird?.wikiTitle ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!bird) return null;

  const confusionBirds = (bird.confusionWith ?? [])
    .map((id) => birds.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92svh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-16/9 w-full shrink-0">
          <BirdImage wikiTitle={bird.wikiTitle} alt={bird.nameDe} className="h-full w-full object-cover sm:rounded-t-2xl" />
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow dark:bg-stone-900/90"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">{bird.nameDe}</h2>
              <p className="italic text-stone-500 dark:text-stone-400">{bird.nameLatin}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{bird.family}</p>
            </div>
            <button
              onClick={() => onToggleFavorite(bird.id)}
              aria-label={isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 text-xl dark:border-stone-700"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoBox label="Größe" value={`${bird.sizeCm[0]}–${bird.sizeCm[1]} cm`} />
            <InfoBox label="Größenklasse" value={sizeClass(bird.sizeCm)} />
            <InfoBox label="Status" value={bird.status} />
            <InfoBox label="Häufigkeit" value={RARITY_LABEL[bird.rarity]} />
          </div>

          <Section title="Wann & wo in Deutschland">
            <p>{bird.seasonInfo}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {bird.habitats.map((h) => (
                <span
                  key={h}
                  className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-950 dark:text-green-300"
                >
                  {h}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Erkennungsmerkmale">
            <ul className="list-disc space-y-1 pl-5">
              {bird.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Section>

          <Section title="Stimme">
            <p>{bird.voice}</p>
          </Section>

          {confusionBirds.length > 0 && (
            <Section title="Leicht zu verwechseln mit">
              <div className="flex flex-wrap gap-2">
                {confusionBirds.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectBird(c.id)}
                    className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  >
                    {c.nameDe}
                  </button>
                ))}
              </div>
            </Section>
          )}

          <Section title="Wusstest du schon?">
            <p>{bird.funFact}</p>
          </Section>

          {wiki?.pageUrl && (
            <a
              href={wiki.pageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-green-700 underline dark:text-green-400"
            >
              Mehr auf Wikipedia →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-100 p-2 text-center dark:bg-stone-800">
      <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
        {title}
      </h3>
      <div className="text-stone-800 dark:text-stone-200">{children}</div>
    </div>
  );
}
