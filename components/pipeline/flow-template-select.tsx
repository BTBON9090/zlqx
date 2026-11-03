"use client";

import { useMemo, useState } from "react";
import { Bot, Check, ChevronDown, Search, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { countInterviewRounds, hasAiStep } from "@/lib/flow";
import { cn } from "@/lib/utils";
import type { FlowTemplate } from "@/lib/types";

export function FlowTemplateSelect({
  templates,
  value,
  onChange,
  placeholder = "选择面试流程模板",
  invalid,
}: {
  templates: FlowTemplate[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = templates.find((template) => template.id === value);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return templates.filter((template) => `${template.name}${template.description}`.toLowerCase().includes(keyword));
  }, [templates, query]);

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-10 w-full items-center gap-2 rounded-[10px] border border-line bg-surface px-3 py-1.5 text-left text-[13px] outline-none transition-colors hover:border-line-strong focus:border-line-strong focus:ring-4 focus:ring-[#e9ede6]",
            !selected && "text-[#9ba69f]",
            invalid && "border-signal/60"
          )}
        >
          {selected ? (
            <>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pine-soft text-pine"><Sparkles className="size-3.5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{selected.name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">{countInterviewRounds(selected)} 轮面试 · {selected.steps.length} 个环节{hasAiStep(selected) ? " · 含数字人初试" : ""}</span>
              </span>
            </>
          ) : (
            <span className="min-w-0 flex-1 px-0.5">{placeholder}</span>
          )}
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[340px] p-0">
        <div className="border-b border-line p-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索流程模板"
              className="h-8 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-2.5 text-[12px] outline-none focus:border-line-strong"
            />
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto p-1.5">
          {filtered.map((template) => {
            const checked = template.id === value;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => { onChange(template.id); setOpen(false); }}
                className={cn("flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors", checked ? "bg-pine-soft/55" : "hover:bg-[#fafbf8]")}
              >
                <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", checked ? "bg-pine text-white" : "bg-[#eef1ec] text-muted")}>
                  {hasAiStep(template) ? <Bot className="size-3.5" /> : <Sparkles className="size-3.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={cn("truncate text-[12.5px] font-medium", checked ? "text-pine" : "text-ink")}>{template.name}</span>
                    {template.isDefault ? <span className="shrink-0 rounded bg-pine-soft px-1 py-0.5 text-[10px] text-pine">默认</span> : null}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted">{countInterviewRounds(template)} 轮面试 · {template.steps.length} 个环节{hasAiStep(template) ? " · 含数字人初试" : ""}</span>
                </span>
                {checked ? <Check className="mt-1 size-3.5 shrink-0 text-pine" /> : null}
              </button>
            );
          })}
          {filtered.length === 0 ? <div className="px-3 py-6 text-center text-[12px] text-muted">没有匹配的流程模板</div> : null}
        </div>
        <div className="border-t border-line px-3 py-2 text-[11px] text-muted">共 {templates.length} 个可用模板 · 可在招聘配置中管理</div>
      </PopoverContent>
    </Popover>
  );
}
