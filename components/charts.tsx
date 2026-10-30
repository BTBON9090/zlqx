import { cn } from "@/lib/utils";

export function RadarChart({
  data,
  size = 220,
  color = "var(--pine)",
  fill = "color-mix(in srgb, var(--pine) 12%, transparent)",
  labels = true,
  className,
}: {
  data: { label: string; value: number }[];
  size?: number;
  color?: string;
  fill?: string;
  labels?: boolean;
  className?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const count = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const point = (value: number, i: number, r = radius) => {
    const rr = (value / 100) * r;
    return [cx + Math.cos(angle(i)) * rr, cy + Math.sin(angle(i)) * rr] as const;
  };
  const polygon = data.map((d, i) => point(d.value, i).join(",")).join(" ");
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: labels ? size + 10 : size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {rings.map((r) => (
          <polygon
            key={r}
            points={data.map((_, i) => point(100, i, radius * r).join(",")).join(" ")}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}
        {data.map((_, i) => {
          const [x, y] = point(100, i);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
        })}
        <polygon points={polygon} fill={fill} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        {data.map((d, i) => {
          const [x, y] = point(d.value, i);
          return <circle key={d.label} cx={x} cy={y} r="2.5" fill={color} stroke="#fff" strokeWidth="1.5" />;
        })}
      </svg>
      {labels
        ? data.map((d, i) => {
            const a = angle(i);
            const r = radius + 24;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            return (
              <span
                key={d.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[12px] text-muted"
                style={{ left: x, top: y }}
              >
                {d.label}
              </span>
            );
          })
        : null}
    </div>
  );
}

export function Donut({
  value,
  size = 104,
  stroke = 9,
  color = "var(--pine)",
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[20px] font-semibold tracking-[-0.04em] text-ink">{label ?? `${value}%`}</span>
        {sublabel ? <span className="mt-0.5 text-[12px] text-muted">{sublabel}</span> : null}
      </div>
    </div>
  );
}

export function AreaChart({ data, labels, height = 150 }: { data: number[]; labels: string[]; height?: number }) {
  const width = 560;
  const pad = 8;
  const max = Math.max(...data) * 1.15;
  const min = Math.min(...data) * 0.8;
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - 24 - ((v - min) / span) * (height - 44);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${height - 24} L${pts[0][0]},${height - 24} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="招聘趋势">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--pine)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--pine)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} x2={width - pad} y1={height - 24 - t * (height - 44)} y2={height - 24 - t * (height - 44)} stroke="var(--line)" strokeDasharray="3 5" />
      ))}
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="var(--pine)" strokeWidth="2" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" stroke="var(--pine)" strokeWidth="1.6" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={pts[i][0]} y={height - 4} textAnchor="middle" fontSize="9" fill="#8b9790">
          {l}
        </text>
      ))}
    </svg>
  );
}
