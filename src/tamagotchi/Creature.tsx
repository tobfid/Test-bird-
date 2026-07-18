type VisibleStage = 'baby' | 'kind' | 'erwachsen';
type Mood = 'happy' | 'neutral' | 'sad';

const CELL_PX: Record<VisibleStage, number> = {
  baby: 9,
  kind: 12,
  erwachsen: 15,
};

// 9x9 Pixel-Silhouette (1 = Körper-Pixel)
const BODY: number[][] = [
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
];

const DIRT_ICON: number[][] = [
  [0, 1, 1, 0],
  [1, 1, 1, 1],
  [0, 1, 1, 0],
];

function facePixels(asleep: boolean, sick: boolean): [number, number][] {
  if (asleep) return [[3, 2], [3, 3], [3, 5], [3, 6]];
  if (sick) return [[2, 2], [3, 3], [2, 6], [3, 5]];
  return [[3, 2], [3, 6]];
}

function mouthPixels(mood: Mood, asleep: boolean): [number, number][] {
  if (asleep) return [];
  if (mood === 'happy') return [[6, 3], [7, 4], [6, 5]];
  if (mood === 'sad') return [[6, 3], [5, 4], [6, 5]];
  return [[6, 3], [6, 4], [6, 5]];
}

export function Creature({
  stage,
  mood,
  asleep,
  sick,
  dirty,
}: {
  stage: VisibleStage;
  mood: Mood;
  asleep: boolean;
  sick: boolean;
  dirty: boolean;
}) {
  const cellPx = CELL_PX[stage];
  const size = cellPx * 9;
  const cutouts = new Set(
    [...facePixels(asleep, sick), ...mouthPixels(mood, asleep)].map(([r, c]) => `${r}-${c}`),
  );

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 9 9"
        shapeRendering="crispEdges"
        className={asleep ? '' : 'animate-float'}
      >
        {BODY.map((row, r) =>
          row.map((filled, c) => {
            if (!filled) return null;
            const isCutout = cutouts.has(`${r}-${c}`);
            return (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill={isCutout ? 'var(--lcd-bg)' : 'var(--lcd-fg)'}
              />
            );
          }),
        )}
      </svg>

      {dirty && !asleep && (
        <svg
          width={24}
          height={18}
          viewBox="0 0 4 3"
          shapeRendering="crispEdges"
          className="absolute -right-2 -bottom-2"
        >
          {DIRT_ICON.map((row, r) =>
            row.map((filled, c) =>
              filled ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="var(--lcd-mid)" /> : null,
            ),
          )}
        </svg>
      )}

      {asleep && (
        <span className="font-pixel absolute -top-4 right-0 text-[10px]" style={{ color: 'var(--lcd-fg)' }}>
          Zzz
        </span>
      )}
    </div>
  );
}

const EGG: number[][] = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
];
const EGG_SHINE = new Set(['1-2']);

export function EggSprite() {
  const cellPx = 14;
  const size = cellPx * 7;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      className="animate-float"
    >
      {EGG.map((row, r) =>
        row.map((filled, c) => {
          if (!filled) return null;
          const isShine = EGG_SHINE.has(`${r}-${c}`);
          return (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={isShine ? 'var(--lcd-bg)' : 'var(--lcd-fg)'}
            />
          );
        }),
      )}
    </svg>
  );
}
