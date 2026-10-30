"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";

export function OverflowTags({
  items,
  max = 2,
  className,
  tagClassName,
  tooltipLabel = "全部内容",
}: {
  items: string[];
  max?: number;
  className?: string;
  tagClassName?: string;
  tooltipLabel?: string;
}) {
  if (items.length === 0) return <span className="text-[12px] text-muted">—</span>;
  const visible = items.slice(0, max);
  const rest = items.slice(max);
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map((item) => (
        <span key={item} className={cn("rounded-md bg-[#f0f3ee] px-1.5 py-0.5 text-[12px] leading-5 text-ink-soft", tagClassName)}>
          {item}
        </span>
      ))}
      {rest.length > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="cursor-help rounded-md border border-line bg-white px-1.5 py-0.5 text-[12px] font-medium leading-5 text-muted outline-none transition-colors hover:border-line-strong hover:text-ink focus-visible:ring-2 focus-visible:ring-signal/40"
              aria-label={`${tooltipLabel}：${items.join("、")}`}
            >
              +{rest.length}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] p-3">
            <div className="mb-1.5 text-[10.5px] font-medium text-white/55">{tooltipLabel}</div>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
                <span key={item} className="rounded bg-white/10 px-1.5 py-0.5 text-[11.5px] leading-5 text-white">{item}</span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
