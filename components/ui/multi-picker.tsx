"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { Checkbox } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PickerItem {
  id: string;
  name: string;
  description?: string;
}

export function MultiPicker({
  items,
  value,
  onChange,
  placeholder = "请选择",
  searchPlaceholder = "搜索",
  emptyText = "没有可选项",
  maxVisible = 2,
}: {
  items: PickerItem[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  maxVisible?: number;
}) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => items.filter((item) => value.includes(item.id)), [items, value]);
  const filtered = useMemo(
    () => items.filter((item) => `${item.name}${item.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query]
  );
  const visible = selected.slice(0, maxVisible);
  const rest = selected.length - visible.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-10 w-full items-center gap-1.5 rounded-[10px] border border-line bg-surface px-2.5 py-1.5 text-left text-[13px] outline-none transition-colors hover:border-line-strong focus:border-pine/60 focus:ring-4 focus:ring-pine/8",
            selected.length === 0 && "text-[#9ba69f]"
          )}
        >
          {selected.length === 0 ? <span className="px-0.5">{placeholder}</span> : null}
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {visible.map((item) => (
              <span key={item.id} className="inline-flex items-center rounded-md bg-pine-soft px-1.5 py-0.5 text-[12px] leading-5 text-pine">
                {item.name}
              </span>
            ))}
            {rest > 0 ? <span className="rounded-md border border-line bg-white px-1.5 py-0.5 text-[12px] leading-5 text-muted">+{rest}</span> : null}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <div className="border-b border-line p-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-2.5 text-[12px] outline-none focus:border-pine/50"
            />
          </div>
        </div>
        <div className="max-h-[240px] overflow-y-auto p-1.5">
          {filtered.map((item) => {
            const checked = value.includes(item.id);
            return (
              <label key={item.id} className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors", checked ? "bg-pine-soft/40" : "hover:bg-[#fafbf8]")}>
                <Checkbox checked={checked} onCheckedChange={(v) => onChange(v ? [...value, item.id] : value.filter((id) => id !== item.id))} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-ink">{item.name}</span>
                  {item.description ? <span className="mt-0.5 block truncate text-[11px] text-muted">{item.description}</span> : null}
                </span>
                {checked ? <Check className="size-3.5 text-pine" /> : null}
              </label>
            );
          })}
          {filtered.length === 0 ? <div className="px-3 py-6 text-center text-[12px] text-muted">{emptyText}</div> : null}
        </div>
        <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[11.5px] text-muted">
          <span>已选 {value.length} 项</span>
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[11.5px]" onClick={() => onChange([])}>清空</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
