"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, LibraryBig, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobLibrary, jobLibraryEntries } from "@/lib/job-library";
import { cn } from "@/lib/utils";

export function JobTitlePicker({
  value,
  onChange,
  placeholder = "搜索标准职位，或直接输入自定义名称",
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState(jobLibrary[0].id);
  const [groupId, setGroupId] = useState(jobLibrary[0].groups[0].id);
  const rootRef = useRef<HTMLDivElement>(null);

  const category = jobLibrary.find((item) => item.id === categoryId) ?? jobLibrary[0];
  const group = category.groups.find((item) => item.id === groupId) ?? category.groups[0];

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return jobLibraryEntries
      .filter((entry) => `${entry.title}${entry.category}${entry.group}`.toLowerCase().includes(keyword))
      .slice(0, 40);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const select = (title: string) => {
    onChange(title);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={open ? "soft" : "secondary"}
          className="h-11 shrink-0"
          onClick={() => { if (!open) setQuery(""); setOpen((prev) => !prev); }}
          aria-expanded={open}
          aria-label="打开标准职位库"
        >
          <LibraryBig className="size-4" />
          <span className="hidden sm:inline">标准职位库</span>
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </Button>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") setOpen(false);
            }}
            placeholder={placeholder}
            className={cn(
              "flex h-11 w-full rounded-[10px] border border-line bg-surface pl-9 pr-9 text-[14px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-line-strong focus:ring-4 focus:ring-[#e9ede6]",
              invalid && "border-signal/60 focus:border-signal/70 focus:ring-signal/10"
            )}
          />
          {value ? (
            <button
              type="button"
              aria-label="清空职位名称"
              onClick={() => { onChange(""); setQuery(""); setOpen(true); }}
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-[#f2f4ee] hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_22px_60px_-28px_rgba(0,0,0,.35)]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-pine-soft text-pine"><LibraryBig className="size-3.5" /></span>
              <div>
                <div className="text-[13px] font-semibold text-ink">标准职位三级分类库</div>
                <div className="mt-0.5 text-[11.5px] text-muted">按「职位类别 → 职能方向 → 具体职位」选择</div>
              </div>
            </div>
            <button type="button" aria-label="关闭标准职位库" onClick={() => setOpen(false)} className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#f2f4ee] hover:text-ink">
              <X className="size-3.5" />
            </button>
          </div>

          <div className="border-b border-line p-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索职位、职能或类别，例如：Java、产品经理、招聘"
                className="h-9 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-8 text-[12.5px] outline-none transition-colors focus:border-line-strong"
              />
              {query ? (
                <button type="button" aria-label="清空搜索" onClick={() => setQuery("")} className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted hover:text-ink">
                  <X className="size-3" />
                </button>
              ) : null}
            </div>
          </div>

          {query.trim() ? (
            <div className="max-h-[330px] overflow-y-auto p-1.5">
              {results.map((entry) => {
                const selected = entry.title === value;
                return (
                  <button
                    key={`${entry.category}-${entry.group}-${entry.title}`}
                    type="button"
                    onClick={() => select(entry.title)}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors", selected ? "bg-pine-soft/55" : "hover:bg-[#fafbf8]")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[12.5px] font-medium", selected ? "text-pine" : "text-ink")}>{entry.title}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted">{entry.category} / {entry.group}</span>
                    </span>
                    {selected ? <Check className="size-3.5 shrink-0 text-pine" /> : <ChevronRight className="size-3 shrink-0 text-muted" />}
                  </button>
                );
              })}
              {results.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <div className="text-[12.5px] font-medium text-ink">没有匹配的标准职位</div>
                  <div className="mt-1 text-[11.5px] text-muted">可以直接使用「{query.trim()}」作为自定义职位名称</div>
                  <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={() => select(query.trim())}>使用自定义名称</Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid max-h-[360px] grid-cols-1 overflow-y-auto sm:grid-cols-[1fr_1fr_1.15fr] sm:overflow-hidden">
              <div className="border-b border-line sm:border-b-0 sm:border-r">
                <div className="sticky top-0 z-10 border-b border-line bg-[#fafbf8] px-3 py-2 text-[11px] font-medium text-muted">一级职位类别</div>
                <div className="max-h-[200px] overflow-y-auto p-1.5 sm:max-h-[300px]">
                  {jobLibrary.map((item) => {
                    const active = item.id === category.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setCategoryId(item.id); setGroupId(item.groups[0].id); }}
                        className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors", active ? "bg-pine-soft/60 font-medium text-pine" : "text-ink-soft hover:bg-[#fafbf8]")}
                      >
                        <span className="min-w-0 truncate">{item.name}</span>
                        <ChevronRight className={cn("size-3 shrink-0", active ? "text-pine" : "text-[#b9c3ba]")} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-b border-line sm:border-b-0 sm:border-r">
                <div className="sticky top-0 z-10 border-b border-line bg-[#fafbf8] px-3 py-2 text-[11px] font-medium text-muted">二级职能类别</div>
                <div className="max-h-[200px] overflow-y-auto p-1.5 sm:max-h-[300px]">
                  {category.groups.map((item) => {
                    const active = item.id === group.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGroupId(item.id)}
                        className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors", active ? "bg-pine-soft/60 font-medium text-pine" : "text-ink-soft hover:bg-[#fafbf8]")}
                      >
                        <span className="min-w-0 truncate">{item.name}</span>
                        <ChevronRight className={cn("size-3 shrink-0", active ? "text-pine" : "text-[#b9c3ba]")} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-[#fafbf8] px-3 py-2 text-[11px] font-medium text-muted">
                  <span>三级具体职位</span>
                  <span className="text-pine">点击选用</span>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1.5 sm:max-h-[300px]">
                  {group.roles.map((role) => {
                    const selected = role === value;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => select(role)}
                        className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors", selected ? "bg-pine-soft/60 font-medium text-pine" : "text-ink-soft hover:bg-[#fafbf8]")}
                      >
                        <span className="min-w-0 truncate">{role}</span>
                        {selected ? <Check className="size-3.5 shrink-0 text-pine" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-line bg-[#fcfcf9] px-3 py-2 text-[11px] text-muted">
            <span>选择标准职位后仍可继续修改</span>
            <span>共 {jobLibraryEntries.length} 个标准职位</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
