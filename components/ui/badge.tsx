import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
  dot = false,
}: {
  className?: string;
  tone?: "neutral" | "pine" | "signal" | "amber" | "blue" | "outline";
  children: React.ReactNode;
  dot?: boolean;
}) {
  const tones = {
    neutral: "bg-[#eef0ec] text-ink-soft",
    pine: "bg-pine-soft text-pine",
    signal: "bg-signal-soft text-signal",
    amber: "bg-amber-soft text-[#7a5412]",
    blue: "bg-[#e8eef5] text-[#2f5c80]",
    outline: "border border-line bg-transparent text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-[11px] font-medium leading-none",
        tones[tone],
        className
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function StatusDot({ tone = "bg-pine", className }: { tone?: string; className?: string }) {
  return <span className={cn("inline-block size-1.5 rounded-full", tone, className)} />;
}
