import { cn } from "@/lib/utils";

export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill="var(--pine)" />
      <path
        d="M6.5 20.2h4.1l2.4-8.1 3.9 11.2 3-8.4h5.6"
        stroke="var(--paper)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25.4" cy="9.4" r="2.1" fill="var(--brand-dot)" />
    </svg>
  );
}

export function BrandLockup({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={compact ? 28 : 32} />
      {!compact ? (
        <div className="leading-none">
          <div className={cn("text-[15px] font-semibold tracking-[-0.03em]", light ? "text-[var(--rail-text)]" : "text-ink")}>
            智聘千寻
          </div>
          <div className={cn("mt-1 text-[11.5px] font-medium tracking-[0.16em]", light ? "text-[var(--rail-muted)]" : "text-muted")}>
            ZHIPIN QIANXUN
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CompanyMark({ name = "澄明科技", size = 32 }: { name?: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className="flex shrink-0 items-center justify-center rounded-[9px] bg-pine-soft font-semibold text-pine"
    >
      {name.slice(0, 1)}
    </div>
  );
}
