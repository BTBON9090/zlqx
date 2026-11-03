"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HistoryPopover } from "./history";
import type { AgentSession } from "./types";

export function AgentTabBar({
  sessions,
  allSessions,
  activeId,
  panelOpen,
  panelAvailable,
  onSelect,
  onClose,
  onNew,
  onOpenSession,
  onOpenHistoryModal,
  onTogglePanel,
  onReset,
}: {
  sessions: AgentSession[];
  allSessions: AgentSession[];
  activeId: string;
  panelOpen: boolean;
  panelAvailable: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  onOpenSession: (id: string) => void;
  onOpenHistoryModal: () => void;
  onTogglePanel: () => void;
  onReset: () => void;
}) {
  const [tabsMenuOpen, setTabsMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTabsMenuOpen(false);
        setHistoryOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMenus = () => {
    setTabsMenuOpen(false);
    setHistoryOpen(false);
  };

  return (
    <div className="relative z-20 flex h-[46px] shrink-0 items-center border-b border-line bg-surface">
      <div className="absolute inset-y-0 left-0 z-20 flex items-center gap-1.5 bg-gradient-to-r from-white via-white to-transparent pl-4 pr-7">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setTabsMenuOpen((value) => !value);
              setHistoryOpen(false);
            }}
            aria-label="查看全部标签"
            className="flex size-7 items-center justify-center rounded-lg bg-[#f2f4ef] text-muted transition-colors hover:bg-[#e9ede7] hover:text-ink"
          >
            <ChevronDown className={cn("size-3.5 transition-transform", tabsMenuOpen ? "rotate-180" : "")} />
          </button>
          {tabsMenuOpen ? (
            <div className="agent-pop absolute left-0 top-[36px] z-[65] w-[260px] overflow-hidden rounded-[10px] border border-[var(--a-border-2)] bg-white agent-shadow-pop">
              <div className="border-b border-[var(--a-border-1)] px-3 py-2.5 text-[11.5px] font-medium text-[var(--a-text-3)]">
                打开的标签页
              </div>
              <div className="max-h-[320px] overflow-y-auto p-1.5">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      onSelect(session.id);
                      closeMenus();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[6px] px-2 py-2 text-left",
                      session.id === activeId ? "bg-[var(--a-primary-1)] text-[var(--a-primary)]" : "text-[var(--a-text-2)] hover:bg-[var(--a-fill-1)]"
                    )}
                  >
                    <MessageSquare className="size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-[12px]">{session.title}</span>
                    {session.thinking ? <span className="size-3 animate-spin rounded-full border border-[var(--a-primary)] border-r-transparent" /> : null}
                  </button>
                ))}
              </div>
              <div className="border-t border-line p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onNew();
                    closeMenus();
                  }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium text-pine hover:bg-[#f5f7f2]"
                >
                  <Plus className="size-3.5" /> 新建对话
                </button>
                <Link href="/ai" onClick={closeMenus} className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] text-ink-soft hover:bg-[#f5f7f2]">
                  <Sparkles className="size-3.5 text-muted" /> AI 中心首页
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    closeMenus();
                  }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] text-danger hover:bg-[#fbe9e4]"
                >
                  <X className="size-3.5" /> 清空对话
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setHistoryOpen((value) => !value);
              setTabsMenuOpen(false);
            }}
            aria-label="对话历史"
            title="对话历史"
            className="flex size-7 items-center justify-center rounded-lg bg-[#f2f4ef] text-muted transition-colors hover:bg-[#e9ede7] hover:text-ink"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          {historyOpen ? (
            <HistoryPopover
              sessions={allSessions}
              onOpenSession={onOpenSession}
              onOpenAll={onOpenHistoryModal}
              onClose={() => setHistoryOpen(false)}
            />
          ) : null}
        </div>
      </div>

      <div ref={scrollRef} className="scroll-none flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1.5 pl-[100px] pr-[72px] md:pl-[108px] md:pr-[96px]">
        {sessions.map((session) => {
          const active = session.id === activeId;
          return (
            <div
              key={session.id}
              role="button"
              tabIndex={0}
              aria-label={`打开对话 ${session.title}`}
              onClick={() => onSelect(session.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(session.id);
                }
              }}
              className={cn(
                "group flex h-8 w-[176px] min-w-[150px] max-w-[220px] cursor-pointer items-center gap-1.5 rounded-lg pl-2.5 pr-1.5 text-left transition-colors",
                active
                  ? "bg-pine text-white"
                  : "bg-transparent text-ink-soft hover:bg-[#f5f7f2] hover:text-ink"
              )}
            >
              {session.thinking ? (
                <span
                  className={cn(
                    "size-3.5 shrink-0 animate-spin rounded-full border-2 border-r-transparent",
                    active ? "border-white/80 border-r-transparent" : "border-[var(--a-primary)] border-r-transparent"
                  )}
                />
              ) : (
                <MessageSquare className={cn("size-3.5 shrink-0", active ? "text-white" : "text-[var(--a-text-3)]")} />
              )}
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{session.title}</span>
              <button
                type="button"
                aria-label={`关闭 ${session.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(session.id);
                }}
                className={cn(
                  "flex size-4.5 shrink-0 items-center justify-center rounded-md transition-colors",
                  active ? "text-white/75 hover:bg-white/15 hover:text-white" : "text-muted hover:bg-[#e9ede7] hover:text-ink"
                )}
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={onNew}
          aria-label="新建对话"
          title="新建对话"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#f2f4ef] text-muted transition-colors hover:bg-[#e9ede7] hover:text-ink"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 z-20 flex items-center gap-2 bg-gradient-to-l from-white via-white to-transparent pl-8 pr-3">
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
          aria-label="向右滚动标签"
          title="向右滚动标签"
          className="hidden size-7 items-center justify-center rounded-lg bg-[#f2f4ef] text-muted transition-colors hover:bg-[#e9ede7] hover:text-ink md:flex"
        >
          <ChevronRight className="size-3.5" />
        </button>
        <span className="hidden h-4 w-px bg-[var(--a-border-2)] md:block" />
        <button
          type="button"
          onClick={onTogglePanel}
          aria-label={panelOpen ? "收起可视化面板" : "展开可视化面板"}
          title={panelAvailable ? (panelOpen ? "收起可视化面板" : "展开可视化面板") : "当前对话没有可视化面板"}
          disabled={!panelAvailable}
          className={cn(
            "flex size-7 items-center justify-center rounded-lg transition-colors",
            panelOpen && panelAvailable
              ? "bg-pine-soft text-pine"
              : "text-muted hover:bg-[#f5f7f2] hover:text-ink",
            !panelAvailable && "cursor-not-allowed opacity-35"
          )}
        >
          {panelOpen && panelAvailable ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
        </button>
      </div>

      {tabsMenuOpen || historyOpen ? (
        <button type="button" aria-label="关闭弹层" className="fixed inset-0 z-[60] cursor-default" onClick={closeMenus} />
      ) : null}

      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 text-[10.5px] text-[var(--a-text-4)] 2xl:flex">
        <Sparkles className="size-3" />
        {sessions.length} 个对话
      </div>
    </div>
  );
}
