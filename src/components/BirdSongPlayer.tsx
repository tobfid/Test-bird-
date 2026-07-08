import type { Bird } from '../data/types';
import { useBirdSong } from '../hooks/useBirdSong';

export function BirdSongPlayer({ bird }: { bird: Bird }) {
  const { song, fallbackUrl, status } = useBirdSong(bird.nameLatin);

  if (status === 'loading' || status === 'idle') {
    return <div className="h-10 w-full animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />;
  }

  if (status === 'ready' && song) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
        <div className="flex items-center gap-3">
          {song.sonoUrl && (
            <img
              src={song.sonoUrl}
              alt="Sonogramm der Aufnahme"
              className="h-10 w-24 rounded object-cover"
            />
          )}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls preload="none" src={song.audioUrl} className="h-10 flex-1">
            Dein Browser unterstützt keine Audio-Wiedergabe.
          </audio>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Aufnahme{song.recordist ? ` von ${song.recordist}` : ''} via{' '}
          <a href={song.sourceUrl} target="_blank" rel="noreferrer" className="underline">
            xeno-canto.org
          </a>{' '}
          (CC-Lizenz)
        </p>
      </div>
    );
  }

  return (
    <a
      href={fallbackUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700"
    >
      🔊 Gesang auf xeno-canto.org anhören
    </a>
  );
}
