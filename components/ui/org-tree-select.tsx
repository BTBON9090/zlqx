"use client";

import { useMemo, useState } from "react";
import { Building2, Check, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";
import type { Department } from "@/lib/types";

function descendantsOf(departments: Department[], id: string): string[] {
  const children = departments.filter((d) => d.parentId === id);
  return [id, ...children.flatMap((child) => descendantsOf(departments, child.id))];
}

export function OrgTreeSelect({
  departments,
  value,
  onChange,
  placeholder = "选择部门",
  maxVisible = 2,
}: {
  departments: Department[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  maxVisible?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(departments.map((d) => d.id)));

  const selectedDepartments = useMemo(() => departments.filter((d) => value.includes(d.id)), [departments, value]);
  const visibleSelected = selectedDepartments.slice(0, maxVisible);
  const rest = selectedDepartments.length - visibleSelected.length;

  const visibleSet = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    const matched = new Set<string>();
    const includeAncestors = (node: Department): boolean => {
      const childMatch = departments.filter((d) => d.parentId === node.id).some(includeAncestors);
      const selfMatch = node.name.toLowerCase().includes(q);
      if (selfMatch || childMatch) {
        matched.add(node.id);
        return true;
      }
      return false;
    };
    departments.filter((d) => !d.parentId).forEach(includeAncestors);
    return matched;
  }, [departments, query]);

  const toggle = (department: Department) => {
    const ids = descendantsOf(departments, department.id);
    if (value.includes(department.id)) {
      onChange(value.filter((id) => !ids.includes(id)));
    } else {
      onChange(Array.from(new Set([...value, ...ids])));
    }
  };

  const renderNode = (department: Department, depth = 0): React.ReactNode => {
    if (visibleSet && !visibleSet.has(department.id)) return null;
    const children = departments.filter((d) => d.parentId === department.id);
    const isOpen = query.trim() ? true : expanded.has(department.id);
    const selected = value.includes(department.id);
    const descendantIds = children.flatMap((child) => descendantsOf(departments, child.id));
    const someDescendant = !selected && descendantIds.some((id) => value.includes(id));
    return (
      <div key={department.id}>
        <div className="flex items-center gap-1 rounded-lg pr-2 transition-colors hover:bg-[#fafbf8]" style={{ paddingLeft: 6 + depth * 18 }}>
          <button
            type="button"
            aria-label={isOpen ? "折叠" : "展开"}
            onClick={() => setExpanded((prev) => { const next = new Set(prev); if (next.has(department.id)) next.delete(department.id); else next.add(department.id); return next; })}
            className={cn("flex size-5 shrink-0 items-center justify-center rounded text-muted hover:bg-white hover:text-ink", children.length === 0 && "invisible")}
          >
            {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          <button type="button" onClick={() => toggle(department)} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left">
            <span className={cn("flex size-4 shrink-0 items-center justify-center rounded border transition-colors", selected ? "border-pine bg-pine text-white" : someDescendant ? "border-pine/40 bg-pine-soft text-pine" : "border-[#ccd4ca] bg-white text-transparent")}>
              {selected ? <Check className="size-2.5" strokeWidth={3} /> : someDescendant ? <span className="h-0.5 w-2 rounded-full bg-pine" /> : null}
            </span>
            <Building2 className={cn("size-3.5 shrink-0", selected ? "text-pine" : "text-muted")} />
            <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", selected ? "font-medium text-pine" : "text-ink-soft")}>{department.name}</span>
            {children.length > 0 ? <span className="num text-[10.5px] text-muted">{children.length}</span> : null}
          </button>
        </div>
        {isOpen && children.length > 0 ? <div className="relative">{children.map((child) => renderNode(child, depth + 1))}</div> : null}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-10 w-full items-center gap-1.5 rounded-[10px] border border-line bg-surface px-2.5 py-1.5 text-left text-[13px] outline-none transition-colors hover:border-line-strong focus:border-pine/60 focus:ring-4 focus:ring-pine/8",
            selectedDepartments.length === 0 && "text-[#9ba69f]"
          )}
        >
          {selectedDepartments.length === 0 ? <span className="px-0.5">{placeholder}</span> : null}
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {visibleSelected.map((department) => (
              <span key={department.id} className="inline-flex items-center rounded-md bg-pine-soft px-1.5 py-0.5 text-[12px] leading-5 text-pine">{department.name}</span>
            ))}
            {rest > 0 ? <span className="rounded-md border border-line bg-white px-1.5 py-0.5 text-[12px] leading-5 text-muted">+{rest}</span> : null}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[340px] p-0">
        <div className="border-b border-line p-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索部门"
              className="h-8 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-2.5 text-[12px] outline-none focus:border-pine/50"
            />
          </div>
        </div>
        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {departments.filter((d) => !d.parentId).map((department) => renderNode(department))}
          {departments.length === 0 ? <div className="px-3 py-6 text-center text-[12px] text-muted">暂无部门</div> : null}
        </div>
        <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[11.5px] text-muted">
          <span>已选 {selectedDepartments.length} 个部门</span>
          <button type="button" onClick={() => onChange([])} className="font-medium text-pine hover:underline">清空</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
