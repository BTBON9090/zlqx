"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Minus, Plus } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setOpen(false);
          }}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-[10px] border border-line bg-surface px-3 pr-10 text-[13.5px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-pine/60 focus:ring-4 focus:ring-pine/8"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        <button
          type="button"
          aria-label={open ? "收起选项" : "展开选项"}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#f2f4ee] hover:text-ink"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open ? (
        <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[230px] overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-[0_18px_44px_-24px_rgba(0,0,0,.32)]">
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { onChange(option); setOpen(false); }}
                className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors", selected ? "bg-pine-soft/60 font-medium text-pine" : "text-ink-soft hover:bg-[#fafbf8]")}
              >
                <span className="whitespace-nowrap">{option}</span>
                {selected ? <Check className="size-3.5 shrink-0" /> : null}
              </button>
            );
          })}
          <div className="mt-1 border-t border-line px-2.5 py-2 text-[11.5px] text-muted">可直接输入自定义内容</div>
        </div>
      ) : null}
    </div>
  );
}
