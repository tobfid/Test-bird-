export function StatBar({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: string;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-center text-lg">{icon}</span>
      <div className="flex-1">
        <div className="mb-0.5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}
