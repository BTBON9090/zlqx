import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#e9ede7]", className)}>
      <div
        className={cn("h-full rounded-full bg-pine transition-[width] duration-500", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
