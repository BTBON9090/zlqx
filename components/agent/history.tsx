"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Ellipsis,
  MessageSquare,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { agentSkills, formatClock, formatDayLabel, formatRelativeTime, groupSessionsByDay, skillById, SkillIcon } from "./data";
import type { AgentSession, SkillId } from "./types";

function SessionIcon({ skill, size = "md" }: { skill: SkillId | null; size?: "sm" | "md" }) {
  const definition = skill ? skillById(skill) : null;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[6px]",
        size === "sm" ? "size-6" : "size-7"
      )}
      style={{
        background: definition?.tint ?? "#f2f3f5",
        color: definition?.color ?? "#4e5969",
      }}
    >
      {definition ? <SkillIcon id={definition.id} className="size-3.5" /> : <MessageSquare className="size-3.5" />}
    </span>
  );
}

export function HistoryPopover({
  sessions,
  onOpenSession,
  onOpenAll,
  onClose,
}: {
  sessions: AgentSession[];
  onOpenSession: (id: string) => void;
  onOpenAll: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const ongoing = sessions.filter(
    (session) => session.messages.length > 0 && session.thinking && (!normalized || session.title.toLowerCase().includes(normalized))
  );
  const recent = sessions
    .filter((session) => session.messages.length > 0 && !session.openInTab && (!normalized || session.title.toLowerCase().includes(normalized)))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6);

  return (
    <div className="agent-pop absolute left-3 top-[46px] z-[62] w-[300px] overflow-hidden rounded-[10px] border border-[var(--a-border-2)] bg-white agent-shadow-pop">
      <div className="border-b border-[var(--a-border-1)] p-2">
        <div className="flex h-8 items-center gap-2 rounded-[6px] border border-[var(--a-border-2)] px-2">
          <Search className="size-3.5 text-[var(--a-text-3)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="搜索对话记录"
            placeholder="搜索对话记录..."
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--a-text-1)] outline-none placeholder:text-[var(--a-text-4)]"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" className="text-[var(--a-text-3)] hover:text-[var(--a-text-1)]">
              <X className="size-3" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto px-2 py-2">
        <div className="px-1.5 pb-1.5 pt-1 text-[11.5px] font-medium text-[var(--a-text-3)]">进行中的对话</div>
        {ongoing.length === 0 ? (
          <div className="px-1.5 pb-2 text-[11.5px] text-[var(--a-text-3)]">暂无进行中的对话</div>
        ) : (
          ongoing.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => {
                onOpenSession(session.id);
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-[6px] px-1.5 py-2 text-left hover:bg-[var(--a-fill-1)]"
            >
              <SessionIcon skill={session.skill} size="sm" />
              <span className="flex-1 truncate text-[12px] text-[var(--a-text-1)]">{session.title}</span>
              <span className="size-3 animate-spin rounded-full border border-[var(--a-primary)] border-r-transparent" />
            </button>
          ))
        )}

        <div className="mt-2 flex items-center justify-between px-1.5 py-1">
          <span className="text-[11.5px] font-medium text-[var(--a-text-3)]">最近关闭的对话</span>
          <span className="text-[10px] text-[var(--a-text-4)]">按时间倒序</span>
        </div>
        {recent.length === 0 ? (
          <div className="px-1.5 py-2 text-[11.5px] text-[var(--a-text-3)]">暂无已关闭的对话</div>
        ) : (
          recent.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => {
                onOpenSession(session.id);
                onClose();
              }}
              className="group flex w-full items-start gap-2 rounded-[6px] px-1.5 py-2 text-left hover:bg-[var(--a-fill-1)]"
            >
              <SessionIcon skill={session.skill} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] text-[var(--a-text-1)]">{session.title}</span>
                <span className="mt-0.5 block text-[10.5px] text-[var(--a-text-3)]">
                  已关闭 · {formatRelativeTime(session.closedAt ?? session.updatedAt)}
                </span>
              </span>
              <ChevronRight className="mt-1 size-3 text-[var(--a-text-4)] opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          onOpenAll();
          onClose();
        }}
        className="flex w-full items-center justify-center gap-1 border-t border-[var(--a-border-1)] py-2.5 text-[11.5px] font-medium text-[var(--a-primary)] transition-colors hover:bg-[var(--a-fill-1)]"
      >
        全部历史记录 <ChevronRight className="size-3" />
      </button>
    </div>
  );
}

export function HistoryModal({
  open,
  sessions,
  onClose,
  onOpenSession,
}: {
  open: boolean;
  sessions: AgentSession[];
  onClose: () => void;
  onOpenSession: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [skill, setSkill] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (session.messages.length === 0) return false;
      if (normalized && !session.title.toLowerCase().includes(normalized) && !session.messages.some((message) => message.kind === "text" && message.text.toLowerCase().includes(normalized))) {
        return false;
      }
      if (status === "open" && !session.openInTab) return false;
      if (status === "closed" && session.openInTab) return false;
      if (skill !== "all" && session.skill !== skill) return false;
      return true;
    });
  }, [sessions, query, status, skill]);

  const groups = useMemo(() => groupSessionsByDay(filtered), [filtered]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!open) return null;

  const allSelected = filtered.length > 0 && filtered.every((session) => selected.has(session.id));

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent size="xl" hideClose className="max-w-[960px] p-0">
      <div className="flex max-h-[82vh] w-full flex-col overflow-hidden bg-surface">
        <div className="flex items-center gap-3 border-b border-[var(--a-border-1)] px-6 py-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#f2f4ef] text-muted">
            <Clock3 className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-[var(--a-text-1)]">全部对话历史记录</h2>
            <p className="mt-0.5 text-[11.5px] text-[var(--a-text-3)]">共 {sessions.filter((session) => session.messages.length > 0).length} 个对话，按最近活动时间排序</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭历史记录"
            className="flex size-8 items-center justify-center rounded-[6px] text-[var(--a-text-3)] transition-colors hover:bg-[var(--a-fill-1)] hover:text-[var(--a-text-1)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--a-border-1)] px-6 py-3">
          <div className="flex h-8 w-[240px] items-center gap-2 rounded-[6px] border border-[var(--a-border-2)] px-2.5">
            <Search className="size-3.5 text-[var(--a-text-3)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="搜索对话标题或内容"
              placeholder="搜索对话标题、对话内容..."
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--a-text-1)] outline-none placeholder:text-[var(--a-text-4)]"
            />
          </div>
          <FilterSelect value={status} onChange={setStatus} ariaLabel="选择对话状态">
            <option value="all">选择对话状态</option>
            <option value="open">进行中</option>
            <option value="closed">已关闭</option>
          </FilterSelect>
          <FilterSelect value={skill} onChange={setSkill} ariaLabel="选择技能类型">
            <option value="all">选择技能类型</option>
            {agentSkills.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </FilterSelect>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setSkill("all");
            }}
            className="flex items-center gap-1 px-1 text-[11.5px] text-[var(--a-primary)] hover:underline"
          >
            <X className="size-3" /> 清空筛选
          </button>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--a-text-3)]">
            <SlidersHorizontal className="size-3.5" />
            找到 {filtered.length} 个对话
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[var(--a-text-3)]">
              <MessageSquare className="size-8 text-[var(--a-text-4)]" />
              <p className="mt-3 text-[12px]">没有符合条件的对话</p>
            </div>
          ) : (
            groups.map(([label, groupSessions]) => {
              const collapsed = collapsedGroups.has(label);
              const groupSelected = groupSessions.every((session) => selected.has(session.id));
              return (
                <div key={label} className="mb-3">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(label)}
                      aria-label={collapsed ? "展开分组" : "收起分组"}
                      className="flex size-5 items-center justify-center rounded text-[var(--a-text-3)] hover:bg-[var(--a-fill-1)]"
                    >
                      {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          groupSessions.forEach((session) => (groupSelected ? next.delete(session.id) : next.add(session.id)));
                          return next;
                        });
                      }}
                      aria-label="选择分组"
                      className={cn(
                        "flex size-3.5 items-center justify-center rounded-[3px] border",
                        groupSelected ? "border-[var(--a-primary)] bg-[var(--a-primary)] text-white" : "border-[var(--a-border-3)] bg-white"
                      )}
                    >
                      {groupSelected ? <Check className="size-2.5" /> : null}
                    </button>
                    <h3 className="text-[12.5px] font-medium text-[var(--a-text-1)]">{label}</h3>
                    <span className="text-[10.5px] text-[var(--a-text-4)]">{groupSessions.length} 个</span>
                  </div>

                  {!collapsed
                    ? groupSessions.map((session) => {
                        const definition = session.skill ? skillById(session.skill) : null;
                        const checked = selected.has(session.id);
                        return (
                          <div
                            key={session.id}
                            className="group flex items-center gap-3 rounded-[6px] px-3 py-2.5 transition-colors hover:bg-[var(--a-fill-1)]"
                          >
                            <button
                              type="button"
                              onClick={() => toggleOne(session.id)}
                              aria-label={`选择 ${session.title}`}
                              className={cn(
                                "flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                                checked ? "border-[var(--a-primary)] bg-[var(--a-primary)] text-white" : "border-[var(--a-border-3)] bg-white"
                              )}
                            >
                              {checked ? <Check className="size-2.5" /> : null}
                            </button>
                            <span className="w-9 shrink-0 text-[11px] tabular-nums text-[var(--a-text-3)]">{formatClock(session.updatedAt)}</span>
                            <button
                              type="button"
                              onClick={() => onOpenSession(session.id)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <span className="flex items-center gap-2">
                                <Clock3 className="size-3 shrink-0 text-[var(--a-text-4)]" />
                                <span className="truncate text-[12px] text-[var(--a-text-1)]">{session.title}</span>
                              </span>
                            </button>
                            <span className="hidden w-[64px] shrink-0 text-right text-[10.5px] text-[var(--a-text-3)] sm:block">
                              {Math.max(1, session.messages.length)} 条对话
                            </span>
                            {definition ? (
                              <span
                                className="hidden shrink-0 items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10.5px] font-medium sm:inline-flex"
                                style={{ background: definition.tint, color: definition.color }}
                              >
                                <SkillIcon id={definition.id} className="size-3" />
                                {definition.name}
                              </span>
                            ) : (
                              <span className="hidden shrink-0 rounded-[4px] bg-[var(--a-fill-2)] px-1.5 py-0.5 text-[10.5px] text-[var(--a-text-3)] sm:inline-flex">
                                普通对话
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpenSession(session.id);
                              }}
                              aria-label="打开对话"
                              className="flex size-6 shrink-0 items-center justify-center rounded text-[var(--a-text-3)] opacity-50 transition-opacity hover:bg-white hover:text-[var(--a-text-1)] group-hover:opacity-100"
                            >
                              <Ellipsis className="size-3.5" />
                            </button>
                          </div>
                        );
                      })
                    : null}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--a-border-1)] bg-[var(--a-fill-1)] px-6 py-3 text-[11px] text-[var(--a-text-3)]">
          <label className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(allSelected ? new Set() : new Set(filtered.map((session) => session.id)))}
              className={cn(
                "flex size-3.5 items-center justify-center rounded-[3px] border",
                allSelected ? "border-[var(--a-primary)] bg-[var(--a-primary)] text-white" : "border-[var(--a-border-3)] bg-white"
              )}
              aria-label="全选"
            >
              {allSelected ? <Check className="size-2.5" /> : null}
            </button>
            全选当前结果
          </label>
          <span>{selected.size > 0 ? `已选择 ${selected.size} 个对话` : "对话记录保留 180 天"}</span>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-[156px] appearance-none rounded-[6px] border border-[var(--a-border-2)] bg-white pl-2.5 pr-7 text-[12px] text-[var(--a-text-2)] outline-none transition-colors focus:border-line-strong"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-[var(--a-text-3)]" />
    </div>
  );
}
