"use client";

import { ChevronDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex h-10 items-center rounded-[10px] border border-line bg-surface", className)}>
      <button type="button" aria-label="减少" onClick={() => onChange(Math.max(min, value - 1))} className="flex h-full w-10 items-center justify-center rounded-l-[9px] text-muted transition-colors hover:bg-[#f2f4ee] hover:text-ink disabled:opacity-30" disabled={value <= min}>
        <Minus className="size-3.5" />
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isNaN(next)) return;
          onChange(Math.max(min, Math.min(max, next)));
        }}
        className="h-full min-w-0 flex-1 border-x border-line bg-transparent text-center text-[13px] font-medium text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="招聘人数"
      />
      <button type="button" aria-label="增加" onClick={() => onChange(Math.min(max, value + 1))} className="flex h-full w-10 items-center justify-center rounded-r-[9px] text-muted transition-colors hover:bg-[#f2f4ee] hover:text-ink disabled:opacity-30" disabled={value >= max}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function ComboInput({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <input
        list="combo-options"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-[10px] border border-line bg-surface px-3 pr-9 text-[13.5px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-pine/60 focus:ring-4 focus:ring-pine/8"
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
      <datalist id="combo-options">
        {options.map((option) => <option key={option} value={option} />)}
      </datalist>
    </div>
  );
}
