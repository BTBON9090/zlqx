import * as React from "react";
import { cn, scoreTone } from "@/lib/utils";

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div className="min-w-0">
        {kicker ? (
          <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-pine">
            <span className="inline-block h-px w-4 bg-pine/50" />
            {kicker}
          </div>
        ) : null}
        <h1 className="text-balance text-[26px] font-semibold leading-[1.2] tracking-[-0.035em] text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-2.5">
        {icon ? <div className="mt-0.5 text-pine [&_svg]:size-[17px]">{icon}</div> : null}
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          {description ? <p className="mt-1 text-[13.5px] leading-5 text-muted">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ScoreRing({
  score,
  size = 40,
  stroke = 3,
  showLabel = false,
}: {
  score: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}) {
  const tone = scoreTone(score);
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, score) / 100) * circ;
  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e9ede7" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <span
          className={cn("absolute inset-0 flex items-center justify-center font-semibold num", tone.text)}
          style={{ fontSize: Math.max(9, Math.round(size * 0.29)) }}
        >
          {score}
        </span>
      </div>
      {showLabel ? <span className="text-[13px] text-muted">匹配度</span> : null}
    </div>
  );
}

export function Sparkline({
  data,
  color = "var(--pine)",
  width = 96,
  height = 32,
  fill = true,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 3 - ((v - min) / span) * (height - 6);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      {fill ? <path d={area} fill={color} opacity={0.08} /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  );
}

export function MiniBars({ data, color = "var(--pine)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-8 items-end gap-[3px]" aria-hidden>
      {data.map((v, i) => (
        <span
          key={i}
          className="w-1.5 rounded-sm"
          style={{ height: `${Math.max(15, (v / max) * 100)}%`, background: i === data.length - 1 ? color : `${color}33` }}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      {icon ? (
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-line bg-[#fafbf8] text-muted [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-[13.5px] leading-5 text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function InfoLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2.5">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className="min-w-0 break-words text-[13px] font-medium leading-5 text-ink">{children}</span>
    </div>
  );
}

export function Stat({
  label,
  value,
  suffix,
  change,
  spark,
  tone = "pine",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  change?: string;
  spark?: number[];
  tone?: "pine" | "signal" | "amber" | "blue";
}) {
  const colors = {
    pine: "var(--pine)",
    signal: "var(--signal)",
    amber: "var(--amber)",
    blue: "var(--info-ink)",
  };
  return (
    <div className="surface flex min-w-0 flex-col justify-between gap-4 p-4.5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13.5px] text-muted">{label}</span>
        {change ? (
          <span className={cn("rounded-md px-1.5 py-0.5 text-[12.5px] font-medium", change.startsWith("-") ? "bg-signal-soft text-signal" : "bg-pine-soft text-pine")}>
            {change}
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1">
          <span className="num text-[28px] font-semibold leading-none tracking-[-0.04em] text-ink">{value}</span>
          {suffix ? <span className="text-[13.5px] text-muted">{suffix}</span> : null}
        </div>
        {spark ? <Sparkline data={spark} color={colors[tone]} width={86} height={28} /> : null}
      </div>
    </div>
  );
}
