"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";

export function InfoTip({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`说明：${text}`}
          className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted/70 outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-signal/40", className)}
        >
          <Info className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px] p-3 text-[11.5px] leading-5">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
