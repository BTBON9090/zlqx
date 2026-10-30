"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  FileText,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BrandLockup, BrandMark, CompanyMark } from "@/components/brand";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/overlay";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { cn, formatDateWithWeek } from "@/lib/utils";

const navGroups: { label: string | null; items: { href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; ai?: boolean; live?: boolean }[] }[] = [
  {
    label: null,
    items: [
      { href: "/", label: "工作台", icon: LayoutDashboard },
      { href: "/ai", label: "AI 中心", icon: Sparkles, ai: true },
    ],
  },
  {
    label: "招聘业务",
    items: [
      { href: "/jobs", label: "职位管理", icon: BriefcaseBusiness },
      { href: "/candidates", label: "候选人", icon: Users },
      { href: "/interviews", label: "面试", icon: CalendarClock, live: true },
      { href: "/pipeline", label: "招聘流程", icon: GitBranch },
      { href: "/offers", label: "Offer 管理", icon: FileText },
    ],
  },
  {
    label: "组织与权限",
    items: [
      { href: "/organization", label: "员工与部门", icon: Building2 },
      { href: "/roles", label: "角色权限", icon: ShieldCheck },
    ],
  },
  {
    label: "企业",
    items: [
      { href: "/messages", label: "消息管理", icon: MessageSquare },
      { href: "/settings", label: "企业设置", icon: Settings },
    ],
  },
];

const pageMeta: Record<string, { group: string; title: string }> = {
  "/": { group: "概览", title: "工作台" },
  "/ai": { group: "智能", title: "AI 中心" },
  "/jobs": { group: "招聘业务", title: "职位管理" },
  "/jobs/new": { group: "招聘业务", title: "发布新职位" },
  "/candidates": { group: "招聘业务", title: "候选人" },
  "/interviews": { group: "招聘业务", title: "面试安排" },
  "/pipeline": { group: "招聘业务", title: "招聘流程" },
  "/offers": { group: "招聘业务", title: "Offer 管理" },
  "/organization": { group: "组织与权限", title: "员工与部门" },
  "/roles": { group: "组织与权限", title: "角色权限" },
  "/messages": { group: "企业", title: "消息管理" },
  "/settings": { group: "企业", title: "企业设置" },
  "/profile": { group: "个人", title: "个人中心" },
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { interviews } = useApp();
  const todayCount = interviews.filter((i) => i.date === "2026-10-30" && i.status !== "done" && i.status !== "cancelled").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[64px] items-center px-5">
        <Link href="/" onClick={onNavigate} aria-label="智聘千寻首页">
          <BrandLockup light />
        </Link>
      </div>

      <div className="mx-3 flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.045] px-2.5 py-2">
        <CompanyMark name="澄明科技" size={28} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-medium text-[var(--rail-text)]">澄明科技</div>
          <div className="mt-0.5 truncate text-[12.5px] text-[var(--rail-muted)]">企业版 · 华东区</div>
        </div>
        <ChevronDown className="size-3.5 text-[var(--rail-muted)]" />
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4 scroll-none">
        {navGroups.map((group, gi) => (
          <div key={group.label ?? "main"} className={cn(gi > 0 && "mt-5")}>
            {group.label ? (
              <div className="mb-1.5 px-2.5 text-[12.5px] font-medium tracking-[0.06em] text-[var(--rail-icon)]">{group.label}</div>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex h-[36px] items-center gap-2.5 rounded-[9px] px-2.5 text-[13.5px] font-medium transition-colors",
                      active ? "bg-white/[0.09] text-white" : "text-[var(--rail-muted)] hover:bg-white/[0.05] hover:text-[var(--rail-text)]"
                    )}
                  >
                    {active ? <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-signal" /> : null}
                    <Icon className={cn("size-[15px] shrink-0", active ? "text-[var(--rail-accent)]" : "text-[var(--rail-icon)] group-hover:text-[var(--rail-text)]")} strokeWidth={1.8} />
                    <span className="flex-1">{item.label}</span>
                    {item.ai ? (
                      <span className="rounded bg-signal/18 px-1.5 py-0.5 text-[12px] font-semibold tracking-[0.04em] text-[var(--rail-accent)]">AI</span>
                    ) : null}
                    {item.live && todayCount > 0 ? (
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[12px] num text-[var(--rail-text)]">{todayCount}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="rail-ai-card mx-3 mb-3 rounded-xl border border-white/8 p-3">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--rail-text)]">
          <Sparkles className="size-3.5 text-[var(--rail-accent)]" />
          小聘 · AI 助手
        </div>
        <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[var(--rail-muted)]">今天的 3 个招聘信号，已经整理好了。</p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-copilot"))}
          className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--rail-accent)] transition-colors hover:text-white"
        >
          查看简报 <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-white/8 px-4 py-3">
        <Link href="/profile" onClick={onNavigate} className="flex min-w-0 items-center gap-2">
          <Avatar name="林岚" size={28} />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-[var(--rail-text)]">林岚</div>
            <div className="truncate text-[12px] text-[var(--rail-muted)]">招聘负责人</div>
          </div>
        </Link>
        <Link href="/settings" onClick={onNavigate} aria-label="企业设置" className="flex size-7 items-center justify-center rounded-lg text-[var(--rail-muted)] transition-colors hover:bg-white/8 hover:text-white">
          <Settings className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const { jobs, candidates, interviews } = useApp();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = navGroups
      .flatMap((g) => g.items)
      .filter((i) => !q || i.label.toLowerCase().includes(q) || i.href.includes(q))
      .map((i) => ({ id: i.href, label: i.label, meta: "页面", href: i.href, icon: i.icon, kind: "page" as const }));
    const jobResults = jobs
      .filter((j) => !q || j.title.toLowerCase().includes(q) || j.code.toLowerCase().includes(q))
      .slice(0, 5)
      .map((j) => ({ id: j.id, label: j.title, meta: `${j.code} · ${j.location}`, href: `/jobs/${j.id}`, icon: BriefcaseBusiness, kind: "job" as const }));
    const candidateResults = candidates
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.currentCompany.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({ id: c.id, label: c.name, meta: `${c.currentCompany} · ${c.currentTitle}`, href: `/candidates?candidate=${c.id}`, icon: Users, kind: "candidate" as const }));
    const interviewResults = interviews
      .filter((i) => !q || i.round.includes(q) || i.date.includes(q))
      .slice(0, 3)
      .map((i) => ({ id: i.id, label: `${i.round}面试 · ${i.date} ${i.start}`, meta: "面试安排", href: `/interviews?interview=${i.id}`, icon: CalendarClock, kind: "interview" as const }));
    return [...pages, ...jobResults, ...candidateResults, ...interviewResults];
  }, [query, jobs, candidates, interviews]);

  const grouped = useMemo(() => {
    const labels = { page: "快速前往", job: "职位", candidate: "候选人", interview: "面试" };
    const order: ("page" | "job" | "candidate" | "interview")[] = ["page", "job", "candidate", "interview"];
    return order
      .map((kind) => [labels[kind], items.filter((i) => i.kind === kind)] as const)
      .filter(([, arr]) => arr.length > 0);
  }, [items]);

  useEffect(() => setActiveIndex(0), [query]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const flat = items;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[14%] max-w-[620px] !-translate-y-0 p-0" hideClose size="xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="size-4 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
              }
              if (e.key === "Enter" && flat[activeIndex]) go(flat[activeIndex].href);
            }}
            placeholder="搜索职位、候选人、面试，或输入页面名称…"
            className="h-6 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-[#9ba69f]"
          />
          <kbd className="rounded border border-line bg-[#f5f6f2] px-1.5 py-0.5 text-[12px] text-muted">ESC</kbd>
        </div>
        <div className="max-h-[440px] overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13.5px] text-muted">没有找到匹配结果</div>
          ) : (
            grouped.map(([label, groupItems]) => (
              <div key={label} className="mb-1.5">
                <div className="px-2.5 pb-1 pt-2 text-[12.5px] font-medium text-muted">{label}</div>
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const index = flat.findIndex((f) => f.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => go(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        activeIndex === index ? "bg-pine-soft/70" : "hover:bg-[#f3f5f0]"
                      )}
                    >
                      <span className={cn("flex size-7 items-center justify-center rounded-lg", activeIndex === index ? "bg-white text-pine" : "bg-[#f3f5f0] text-muted")}>
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">{item.label}</span>
                        <span className="block truncate text-[12.5px] text-muted">{item.meta}</span>
                      </span>
                      {activeIndex === index ? <span className="text-[12.5px] text-muted">↵ 打开</span> : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line bg-[#fafbf8] px-4 py-2.5 text-[12.5px] text-muted">
          <span>↑↓ 选择 · ↵ 打开</span>
          <span>智聘千寻 搜索</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ChatMessage = { role: "assistant" | "user"; content: string };

function CopilotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "早上好，林岚。今天有 5 场面试，周予安的二面最值得关注。\n\n我还注意到：裴然的 Offer 仍在财务审批中，招聘业务授权将在 11 月 5 日到期。要我帮你逐项处理吗？",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, thinking]);

  const reply = (q: string) => {
    if (/今天|优先|先做/.test(q)) return "今天建议按这个顺序处理：\n\n1. 10:00 周予安二面，提前 10 分钟看一下他的初试反馈；\n2. 催促顾清审批裴然的 Offer，已停留 1 天；\n3. 处理 6 份待筛选简历，优先看匹配度 85 分以上的 3 份。\n\n需要我把这三件事加入今日待办吗？";
    if (/面试|安排/.test(q)) return "可以。建议先确认周予安 10:00 的二面，面试官陈墨已确认；江屿 11:30 的数字人初试已自动发出提醒。需要我把今天的面试整理成一份日程发给你吗？";
    if (/报告|推荐|匹配/.test(q)) return "周予安的匹配度是 92%。核心优势是 8 年 B 端产品经验与 HR SaaS 背景；需要重点验证的是薪资预期（42–50K）和近两段经历的稳定性。我可以直接生成一份完整的推荐报告。";
    if (/offer|审批|薪资/.test(q)) return "裴然的 Offer（40K · 14 薪）正在等待顾清审批，已停留 1 天。需要我发一条提醒，或者先拉一个 15 分钟的审批会吗？";
    if (/职位|jd|招聘/.test(q)) return "高级产品经理这个职位本周新增 6 份简历，其中 3 份匹配度超过 85%。我建议优先查看叶青和周予安。需要我生成一份职位健康度简报吗？";
    if (/邀约|消息|短信/.test(q)) return "我可以基于「面试邀约 · 视频面试」模板生成一条邀约，自动带入候选人姓名、职位、时间和会议链接。确认后可以直接发送邮件和短信。";
    return "我已经记下了。你可以让我处理招聘流程里的具体任务，比如筛选简历、安排面试、生成推荐报告、起草 Offer 或汇总招聘数据。";
  };

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: reply(value) }]);
      setThinking(false);
    }, 900);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[392px]">
      <div className="flex max-h-[min(620px,calc(100vh-32px))] flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-pop animate-rise">
        <div className="flex items-center gap-3 bg-pine-deep px-4 py-3.5 text-white">
          <div className="relative flex size-8 items-center justify-center rounded-[10px] bg-white/10">
            <Sparkles className="size-4 text-[var(--rail-accent)]" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-pine-deep bg-[var(--rail-accent)]" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-medium">小聘 · AI 招聘助手</div>
            <div className="mt-0.5 text-[12.5px] text-[var(--rail-muted)]">在线 · 可以读取当前招聘数据</div>
          </div>
          <button onClick={onClose} aria-label="关闭 AI 助手" className="flex size-7 items-center justify-center rounded-lg text-[var(--rail-muted)] transition-colors hover:bg-white/10 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-[#fafbf8] px-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2.5", m.role === "user" && "justify-end")}>
              {m.role === "assistant" ? (
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-pine text-white">
                  <Sparkles className="size-3" />
                </span>
              ) : null}
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-[1.75]",
                  m.role === "assistant" ? "rounded-tl-md border border-line bg-white text-ink-soft" : "rounded-tr-md bg-pine text-white"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {thinking ? (
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-lg bg-pine text-white">
                <Sparkles className="size-3" />
              </span>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3">
                <span className="size-1.5 animate-bounce rounded-full bg-[#9aab9f]" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-[#9aab9f]" style={{ animationDelay: "120ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-[#9aab9f]" style={{ animationDelay: "240ms" }} />
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-line bg-white px-3 pb-3 pt-2.5">
          <div className="mb-2 flex gap-1.5 overflow-x-auto scroll-none">
            {["今天先做什么？", "周予安的匹配点", "提醒审批 Offer"].map((q) => (
              <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[12.5px] text-muted transition-colors hover:border-pine/30 hover:text-pine">
                {q}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="让小聘帮你处理招聘工作…"
              className="h-9 flex-1 rounded-[10px] border border-line bg-[#fafbf8] px-3 text-[13.5px] outline-none placeholder:text-[#9ba69f] focus:border-pine/50"
            />
            <button onClick={() => send()} className="flex size-9 items-center justify-center rounded-[10px] bg-pine text-white transition-colors hover:bg-pine-deep" aria-label="发送">
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tasks, toggleTask, notifications, resetDemo } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const meta = useMemo(() => {
    if (pathname.startsWith("/jobs/") && pathname !== "/jobs/new") return { group: "招聘业务", title: "职位详情" };
    if (pathname.startsWith("/candidates/")) return { group: "招聘业务", title: "候选人详情" };
    return pageMeta[pathname] ?? { group: "智聘千寻", title: "工作台" };
  }, [pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    const openCopilot = () => setCopilotOpen(true);
    window.addEventListener("keydown", down);
    window.addEventListener("open-copilot", openCopilot);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("open-copilot", openCopilot);
    };
  }, []);

  const openTasks = tasks.filter((t) => !t.done).length;
  const unread = notifications.filter((n) => n.status === "delivered").length;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-paper">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] bg-pine-deep lg:block">
          <SidebarContent />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="关闭菜单" className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} />
            <aside className="relative h-full w-[264px] bg-pine-deep shadow-pop animate-[sheetIn_.25s_ease-out]">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
              <button onClick={() => setMobileOpen(false)} aria-label="关闭菜单" className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg text-[var(--rail-muted)] hover:bg-white/10 hover:text-white">
                <X className="size-4" />
              </button>
            </aside>
          </div>
        ) : null}

        <div className="lg:pl-[236px]">
          <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-xl md:px-6">
            <button className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-[#eef0ec] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="打开菜单">
              <Menu className="size-4.5" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-[13.5px]">
              <span className="hidden text-muted sm:block">{meta.group}</span>
              <ChevronRight className="hidden size-3 text-[#aeb8b0] sm:block" />
              <span className="truncate font-medium text-ink">{meta.title}</span>
            </div>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden h-9 items-center gap-2 rounded-[10px] border border-line bg-[#f7f8f4] pl-2.5 pr-1.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-ink md:flex"
              >
                <Search className="size-3.5" />
                <span className="w-[124px] text-left xl:w-[160px]">搜索职位、候选人…</span>
                <kbd className="flex items-center gap-0.5 rounded border border-line bg-white px-1.5 py-0.5 text-[12px] text-muted">
                  <Command className="size-2.5" />K
                </kbd>
              </button>
              <button onClick={() => setCommandOpen(true)} aria-label="搜索" className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-[#eef0ec] md:hidden">
                <Search className="size-4" />
              </button>
              <button onClick={() => setCopilotOpen(true)} aria-label="AI 助手" className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-[#eef0ec] sm:hidden">
                <Sparkles className="size-4 text-signal" />
              </button>

              <ThemeSwitcher />

              <Popover>
                <PopoverTrigger asChild>
                  <button aria-label="待办" className="relative hidden size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-[#eef0ec] sm:flex">
                    <ListTodo className="size-4" />
                    {openTasks > 0 ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-signal ring-2 ring-white" /> : null}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-0">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <span className="text-[13.5px] font-semibold">今日待办</span>
                    <span className="text-[12.5px] text-muted">{openTasks} 项未完成</span>
                  </div>
                  <div className="p-2">
                    {tasks.map((task) => (
                      <label key={task.id} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-[#f5f7f2]">
                        <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} className="mt-0.5" />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-[13px] leading-5", task.done ? "text-muted line-through" : "text-ink")}>{task.title}</span>
                          <span className="mt-0.5 block text-[12.5px] text-muted">{task.due}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-line px-4 py-2.5">
                    <Link href="/interviews" className="flex items-center justify-between text-[13px] font-medium text-pine hover:underline">
                      查看面试安排 <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button aria-label="通知" className="relative flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-[#eef0ec]">
                    <Bell className="size-4" />
                    {unread > 0 ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-signal ring-2 ring-white" /> : null}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <span className="text-[13.5px] font-semibold">通知</span>
                    <span className="rounded-full bg-signal-soft px-2 py-0.5 text-[12.5px] font-medium text-signal">{unread} 条新通知</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1.5">
                    {notifications.slice(0, 5).map((n) => (
                      <Link key={n.id} href="/messages" className="flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 hover:bg-[#f5f7f2]">
                        <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", n.status === "failed" ? "bg-signal" : n.status === "read" ? "bg-[#9aa69e]" : "bg-pine")} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] leading-5 text-ink">
                            {n.recipient} · {n.scenario}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] text-muted">{n.sentAt} · {n.status === "failed" ? "发送失败" : n.status === "read" ? "已读" : "已送达"}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-line px-4 py-2.5">
                    <Link href="/messages" className="flex items-center justify-between text-[13px] font-medium text-pine hover:underline">
                      查看全部通知记录 <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setHelpOpen(true)} aria-label="帮助" className="hidden size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-[#eef0ec] sm:flex">
                    <HelpCircle className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>帮助与快捷键</TooltipContent>
              </Tooltip>

              <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-[#eef0ec] sm:flex">
                    <CompanyMark size={26} />
                    <span className="hidden text-[13px] font-medium text-ink xl:block">澄明科技</span>
                    <ChevronDown className="size-3 text-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>当前企业</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <span className="flex size-5 items-center justify-center rounded bg-pine-soft text-[12px] font-semibold text-pine">澄</span>
                    <span className="flex-1">澄明科技</span>
                    <Check className="size-3.5 text-pine" />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="flex size-5 items-center justify-center rounded bg-info-soft text-[12px] font-semibold text-info-ink">上</span>
                    <span className="flex-1">澄明科技 · 上海</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings /> 企业设置
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 rounded-full p-0.5 transition-opacity hover:opacity-80" aria-label="个人菜单">
                    <Avatar name="林岚" size={32} ring />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[230px]">
                  <div className="px-2.5 py-2">
                    <div className="text-[13.5px] font-semibold">林岚</div>
                    <div className="mt-0.5 text-[12.5px] text-muted">lin.lan@chengming.ai</div>
                    <div className="mt-2 inline-flex rounded bg-pine-soft px-1.5 py-0.5 text-[12px] font-medium text-pine">超级管理员</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User /> 个人中心
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/roles")}>
                    <ShieldCheck /> 我的权限
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setHelpOpen(true)}>
                    <HelpCircle /> 帮助与反馈
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      resetDemo();
                      toast.success("演示数据已重置");
                    }}
                  >
                    <RotateCcw /> 重置演示数据
                  </DropdownMenuItem>
                  <DropdownMenuItem danger onClick={() => router.push("/login")}>
                    <LogOut /> 退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1520px] px-4 pb-20 pt-6 md:px-7 md:pt-7">{children}</main>
        </div>

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)} />

        {!copilotOpen ? (
          <button
            onClick={() => setCopilotOpen(true)}
            className="group fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full bg-pine py-3 pl-3 pr-3 text-white shadow-[0_14px_34px_-12px_rgba(0,0,0,.35)] transition-all hover:bg-pine-deep hover:pr-5 sm:bottom-6 sm:right-6 sm:flex sm:pr-4"
            aria-label="打开 AI 助手"
          >
            <span className="relative flex size-7 items-center justify-center rounded-full bg-white/12">
              <Sparkles className="size-3.5 text-[var(--rail-accent)]" />
              <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
            </span>
            <span className="hidden text-[13px] font-medium sm:block">问小聘</span>
          </button>
        ) : null}

        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogContent size="md">
            <DialogHeader title="帮助与快捷键" description="快速了解智聘千寻的操作方式。" icon={<HelpCircle />} />
            <DialogBody className="space-y-5">
              <div>
                <div className="mb-2 text-[13px] font-medium text-muted">全局快捷键</div>
                <div className="space-y-2">
                  {[
                    ["打开全局搜索", "⌘ K"],
                    ["关闭当前弹层", "ESC"],
                    ["在搜索中移动", "↑ ↓"],
                    ["打开搜索结果", "↵"],
                  ].map(([label, key]) => (
                    <div key={label} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-ink-soft">{label}</span>
                      <kbd className="rounded border border-line bg-[#f6f7f3] px-2 py-0.5 text-[12.5px] text-muted">{key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-line bg-[#fafbf8] p-3.5">
                <div className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
                  <Sparkles className="size-3.5 text-signal" /> 需要更多帮助？
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-muted">联系企业管理员林岚，或直接向小聘描述你遇到的问题。</p>
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => { setHelpOpen(false); setCopilotOpen(true); }}>
                  问问小聘 <ArrowUpRight />
                </Button>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setHelpOpen(false)}>知道了</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
