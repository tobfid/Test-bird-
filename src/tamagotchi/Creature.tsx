type VisibleStage = 'baby' | 'kind' | 'erwachsen';
type Mood = 'happy' | 'neutral' | 'sad';

const BODY_RADIUS: Record<VisibleStage, number> = {
  baby: 46,
  kind: 60,
  erwachsen: 74,
};

const BODY_COLOR: Record<VisibleStage, string> = {
  baby: '#8ccf92',
  kind: '#5cb565',
  erwachsen: '#2b7d35',
};

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
  const radius = BODY_RADIUS[stage];
  const bodyColor = sick ? '#b9e3bd' : BODY_COLOR[stage];
  const cx = 110;
  const cy = 120;

  return (
    <div className={`relative flex h-56 w-56 items-center justify-center ${asleep ? '' : 'animate-float'}`}>
      <svg viewBox="0 0 220 220" className="h-full w-full drop-shadow-lg">
        <ellipse cx={cx} cy={cy + radius - 6} rx={radius * 0.9} ry={radius * 0.22} fill="black" opacity="0.08" />
        <circle cx={cx} cy={cy} r={radius} fill={bodyColor} />

        {dirty && (
          <>
            <ellipse cx={cx - radius * 0.4} cy={cy + radius * 0.3} rx="9" ry="6" fill="#7c5c34" opacity="0.55" />
            <ellipse cx={cx + radius * 0.5} cy={cy - radius * 0.1} rx="7" ry="5" fill="#7c5c34" opacity="0.5" />
          </>
        )}

        {sick && !asleep && (
          <>
            <circle cx={cx - radius * 0.35} cy={cy - radius * 0.15} r="5" fill="#84cc9a" opacity="0.7" />
            <circle cx={cx + radius * 0.3} cy={cy + radius * 0.25} r="4" fill="#84cc9a" opacity="0.7" />
          </>
        )}

        {asleep ? (
          <>
            <path
              d={`M ${cx - 22} ${cy - 6} q 8 6 16 0`}
              stroke="#14261a"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 6} ${cy - 6} q 8 6 16 0`}
              stroke="#14261a"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : sick ? (
          <>
            <path
              d={`M ${cx - 26} ${cy - 12} l 12 12 M ${cx - 26} ${cy} l 12 -12`}
              stroke="#14261a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d={`M ${cx + 2} ${cy - 12} l 12 12 M ${cx + 2} ${cy} l 12 -12`}
              stroke="#14261a"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx={cx - 18} cy={cy - 6} r="6" fill="#14261a" />
            <circle cx={cx + 18} cy={cy - 6} r="6" fill="#14261a" />
          </>
        )}

        {asleep ? null : mood === 'happy' ? (
          <path
            d={`M ${cx - 16} ${cy + 16} q 16 16 32 0`}
            stroke="#14261a"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : mood === 'sad' ? (
          <path
            d={`M ${cx - 16} ${cy + 28} q 16 -14 32 0`}
            stroke="#14261a"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <line x1={cx - 14} y1={cy + 20} x2={cx + 14} y2={cy + 20} stroke="#14261a" strokeWidth="3.5" strokeLinecap="round" />
        )}
      </svg>

      {asleep && <span className="absolute -top-2 right-4 animate-pulse text-2xl">💤</span>}
    </div>
  );
}
