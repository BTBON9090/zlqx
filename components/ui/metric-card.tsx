import { InfoTip } from "@/components/ui/info-tip";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  suffix,
  tip,
  icon: Icon,
  tone = "pine",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  tip?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "pine" | "amber" | "signal" | "blue";
}) {
  const tones = {
    pine: "bg-pine-soft text-pine",
    amber: "bg-amber-soft text-amber-deep",
    signal: "bg-signal-soft text-signal",
    blue: "bg-info-soft text-info-ink",
  };
  return (
    <div className="surface flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-muted">
          {label}
          {tip ? <InfoTip text={tip} /> : null}
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span>
          {suffix ? <span className="text-[12px] text-muted">{suffix}</span> : null}
        </div>
      </div>
      {Icon ? (
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-4" />
        </span>
      ) : null}
    </div>
  );
}
