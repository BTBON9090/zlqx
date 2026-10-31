"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Department, Employee } from "@/lib/types";

export function PersonSelect({
  employees,
  departments,
  value,
  onChange,
  placeholder = "选择成员",
}: {
  employees: Employee[];
  departments: Department[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = employees.find((e) => e.id === value);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const dept = departments.find((d) => d.id === e.departmentId)?.name ?? "";
      return `${e.name}${e.email}${dept}`.toLowerCase().includes(q);
    });
  }, [employees, departments, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("flex h-10 w-full items-center gap-2 rounded-[10px] border border-line bg-surface px-2.5 text-left text-[13px] outline-none transition-colors hover:border-line-strong focus:border-pine/60 focus:ring-4 focus:ring-pine/8", !selected && "text-[#9ba69f]")}
        >
          {selected ? (
            <>
              <Avatar name={selected.name} size={24} />
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{selected.name}</span>
            </>
          ) : (
            <span className="min-w-0 flex-1 px-0.5">{placeholder}</span>
          )}
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0">
        <div className="border-b border-line p-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索姓名、邮箱或部门"
              className="h-8 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-2.5 text-[12px] outline-none focus:border-pine/50"
            />
          </div>
        </div>
        <div className="max-h-[260px] overflow-y-auto p-1.5">
          {list.map((employee) => {
            const checked = employee.id === value;
            const dept = departments.find((d) => d.id === employee.departmentId)?.name;
            return (
              <button
                key={employee.id}
                type="button"
                onClick={() => {
                  onChange(employee.id);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors", checked ? "bg-pine-soft/40" : "hover:bg-[#fafbf8]")}
              >
                <Avatar name={employee.name} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-ink">{employee.name}</span>
                  <span className="mt-0.5 block truncate text-[10.5px] text-muted">{employee.email} · {dept}</span>
                </span>
                {checked ? <Check className="size-3.5 text-pine" /> : null}
              </button>
            );
          })}
          {list.length === 0 ? <div className="px-3 py-6 text-center text-[12px] text-muted">没有找到成员</div> : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
