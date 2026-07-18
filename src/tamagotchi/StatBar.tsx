const SEGMENTS = 10;

export function StatBar({ icon, label, value }: { icon: string; label: string; value: number }) {
  const filled = Math.round((value / 100) * SEGMENTS);

  return (
    <div className="font-pixel flex items-center gap-2 text-[9px]" style={{ color: 'var(--lcd-fg)' }}>
      <span className="w-4 shrink-0 text-center text-xs">{icon}</span>
      <span className="w-[4.6rem] shrink-0 truncate uppercase">{label}</span>
      <div className="flex flex-1 gap-[3px]">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className="h-3 flex-1"
            style={{
              backgroundColor: i < filled ? 'var(--lcd-fg)' : 'transparent',
              border: '1px solid var(--lcd-fg)',
              opacity: i < filled ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
