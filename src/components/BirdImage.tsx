import { useWikiSummary } from '../hooks/useWikiSummary';

function BirdSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M78 46c-2-9-9-16-18-18-1-6-6-11-13-11-6 0-11 4-13 9-8 1-14 7-14 15 0 3 1 6 2 8-6 2-10 7-10 13 0 8 6 14 14 14h4l-3 12c-1 3 1 5 4 4l14-6c3 5 8 8 14 8 10 0 18-8 18-18 0-2 0-4-1-6 5-2 8-7 8-13 0-4-2-8-6-11z" />
    </svg>
  );
}

export function BirdImage({
  wikiTitle,
  alt,
  className,
}: {
  wikiTitle: string;
  alt: string;
  className?: string;
}) {
  const { data, status } = useWikiSummary(wikiTitle);

  if (status === 'ready' && data?.thumbnailUrl) {
    return (
      <img
        src={data.thumbnailUrl}
        alt={alt}
        loading="lazy"
        className={className}
      />
    );
  }

  return (
    <div
      className={`${className ?? ''} flex items-center justify-center bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-600`}
    >
      <BirdSilhouette className={status === 'loading' ? 'w-1/3 animate-pulse' : 'w-1/3'} />
    </div>
  );
}
