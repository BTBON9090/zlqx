"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Circle,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  Copy,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  MessageSquare,
  Pencil,
  ShieldAlert,
  Sparkles,
  SquareTerminal,
  Star,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { skillById, SkillIcon } from "./data";
import type { AgentAction, AgentMessage, ActivityStep, SkillId } from "./types";

function AssistantArtifact({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function TypingIndicator() {
  return (
    <div className="agent-fade flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="agent-typing-dot size-1.5 rounded-full bg-[var(--a-text-3)]"
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </div>
  );
}

function MessageMeta({
  icon,
  text,
  detail,
}: {
  icon?: "clock" | "check" | "alert" | "spark" | "task";
  text: string;
  detail?: string;
}) {
  const Icon = icon === "clock" ? Clock3 : icon === "check" ? CircleCheckBig : icon === "alert" ? CircleAlert : icon === "task" ? MessageSquare : Sparkles;
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--a-text-3)]">
      <Icon className={cn("size-3.5", icon === "check" ? "text-[var(--a-text-3)]" : icon === "alert" ? "text-[var(--a-orange)]" : "")} />
      <span>{text}</span>
      {detail ? <span className="text-[var(--a-text-4)]">{detail}</span> : null}
    </div>
  );
}

function SwitchLine({ skill }: { skill: SkillId }) {
  const definition = skillById(skill);
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-[var(--a-text-3)]">
      <span>已为您切换到</span>
      <span className="inline-flex items-center gap-1 rounded-[4px] bg-[var(--a-fill-2)] px-1.5 py-0.5 font-medium text-[var(--a-text-2)]">
        <SkillIcon id={skill} className="size-3" />
        {definition.name}
      </span>
    </div>
  );
}

function MessageTable({
  title,
  rows,
  actionLabel,
  variant = "grid",
  onAction,
}: {
  title?: string;
  rows: Extract<AgentMessage, { kind: "table" }>["rows"];
  actionLabel?: string;
  variant?: "grid" | "list";
  onAction: (action: AgentAction) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--a-border-1)] bg-white">
      {title ? (
        <div className="flex items-center gap-2 border-b border-[var(--a-border-1)] px-3 py-2">
          <FileText className="size-3.5 text-[var(--a-text-3)]" />
          <span className="text-[11.5px] font-medium text-[var(--a-text-2)]">{title}</span>
          {actionLabel ? (
            <button
              type="button"
              onClick={() => onAction("open-panel")}
              className="ml-auto flex items-center gap-0.5 text-[10.5px] text-[var(--a-primary)] hover:underline"
            >
              {actionLabel} <ArrowUpRight className="size-2.5" />
            </button>
          ) : null}
        </div>
      ) : null}
      {variant === "list" ? (
        <div className="divide-y divide-[var(--a-border-1)]">
          {rows.map((row, index) => (
            <div key={`${row.label}-${index}`} className="flex items-start justify-between gap-4 px-3 py-2.5">
              <span className="text-[11.5px] text-[var(--a-text-3)]">{row.label}</span>
              <span
                className={cn(
                  "max-w-[70%] text-right text-[12px] leading-[18px]",
                  row.tone === "warning"
                    ? "font-medium text-[var(--a-orange)]"
                    : row.tone === "success"
                      ? "font-medium text-[var(--a-green)]"
                      : row.tone === "muted"
                        ? "text-[var(--a-text-3)]"
                        : "font-medium text-[var(--a-text-1)]"
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-px bg-[var(--a-border-1)]">
          {rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className={cn(
                "min-w-0 bg-white px-3 py-2",
                row.span === 2 ? "col-span-2" : row.span === 3 ? "col-span-3" : "col-span-1"
              )}
            >
              <div className="truncate text-[10.5px] text-[var(--a-text-3)]">{row.label}</div>
              <div
                className={cn(
                  "mt-0.5 break-words text-[12px] leading-[18px]",
                  row.tone === "warning"
                    ? "font-medium text-[var(--a-orange)]"
                    : row.tone === "success"
                      ? "font-medium text-[var(--a-green)]"
                      : row.tone === "muted"
                        ? "text-[var(--a-text-3)]"
                        : "font-medium text-[var(--a-text-1)]"
                )}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityBlock({ title, steps }: { title: string; steps: ActivityStep[] }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--a-text-2)]">
        <SquareTerminal className="size-3.5 text-[var(--a-text-3)]" />
        <span>{title}</span>
      </div>
      <div className="ml-[7px] space-y-1.5 border-l border-[var(--a-border-2)] pl-4">
        {steps.map((step, index) => (
          <div key={`${step.label}-${index}`} className="flex items-start gap-2 text-[11.5px] leading-[18px]">
            {step.state === "done" ? (
              <Check className="mt-[3px] size-3 shrink-0 text-[var(--a-text-3)]" />
            ) : step.state === "running" ? (
              <Loader2 className="mt-[3px] size-3 shrink-0 animate-spin text-[var(--a-primary)]" />
            ) : step.state === "warn" ? (
              <TriangleAlert className="mt-[3px] size-3 shrink-0 text-[var(--a-orange)]" />
            ) : (
              <Circle className="mt-[3px] size-3 shrink-0 text-[var(--a-text-4)]" />
            )}
            <span className={cn(step.state === "warn" ? "text-[var(--a-orange)]" : "text-[var(--a-text-2)]")}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssistantText({ text }: { text: string }) {
  return <div className="whitespace-pre-wrap text-[13.5px] leading-[23px] text-[var(--a-text-1)]">{text}</div>;
}

export function ChatMessage({
  message,
  onAction,
  onOpenCandidate,
}: {
  message: AgentMessage;
  onAction: (action: AgentAction) => void;
  onOpenCandidate?: (id: string) => void;
}) {
  switch (message.kind) {
    case "text":
      return message.role === "user" ? (
        <div className="agent-fade flex justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-pine px-3.5 py-2.5 text-[13.5px] leading-[22px] text-white">
            {message.text}
          </div>
        </div>
      ) : (
        <AssistantArtifact>
          <AssistantText text={message.text} />
        </AssistantArtifact>
      );
    case "meta":
      return <MessageMeta text={message.text} icon={message.icon} detail={message.detail} />;
    case "switch":
      return <SwitchLine skill={message.skill} />;
    case "bullets":
      return (
        <AssistantArtifact>
          <div className="space-y-1.5">
            {message.title ? <div className="text-[12.5px] font-medium text-[var(--a-text-1)]">{message.title}</div> : null}
            <ul className="space-y-1 text-[12.5px] leading-[21px] text-[var(--a-text-2)]">
              {message.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[8px] size-1 shrink-0 rounded-full bg-[var(--a-text-3)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </AssistantArtifact>
      );
    case "table":
      return (
        <AssistantArtifact>
          <MessageTable
            title={message.title}
            rows={message.rows}
            actionLabel={message.actionLabel}
            variant={message.variant}
            onAction={onAction}
          />
        </AssistantArtifact>
      );
    case "activity":
      return (
        <AssistantArtifact>
          <ActivityBlock title={message.title} steps={message.steps} />
        </AssistantArtifact>
      );
    case "actions": {
      const visible = message.items.filter((item) => !item.spent);
      if (visible.length === 0) return null;
      return (
        <AssistantArtifact>
          <div className="flex flex-wrap items-center justify-end gap-2">
          {visible.map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => onAction(item.action)}
              className={cn(
                "rounded-[8px] px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                item.variant === "ghost"
                  ? "border border-[var(--a-border-2)] bg-white text-[var(--a-text-2)] hover:border-[var(--a-border-3)] hover:bg-[var(--a-fill-1)]"
                  : "bg-[var(--a-primary-1)] text-[var(--a-primary)] hover:bg-[var(--a-primary-2)]"
              )}
            >
              {item.label}
            </button>
          ))}
          </div>
        </AssistantArtifact>
      );
    }
    case "success":
      return (
        <AssistantArtifact>
        <div className="agent-fade w-full max-w-[560px] rounded-xl border border-[#cfe5d6] bg-[#eef6f0] px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-[var(--a-green)]" />
            <div className="min-w-0">
              <div className="text-[12.5px] font-medium text-[var(--a-text-1)]">{message.title}</div>
              {message.subtitle ? <div className="mt-1 text-[11px] leading-[18px] text-[var(--a-text-3)]">{message.subtitle}</div> : null}
              {message.href ? (
                <Link
                  href={message.href}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--a-primary)] hover:underline"
                >
                  {message.hrefLabel ?? "查看详情"} <ArrowUpRight className="size-3" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        </AssistantArtifact>
      );
    case "upload":
      return (
        <AssistantArtifact>
        <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
          <div className="text-[11px] font-medium text-[var(--a-text-3)]">已提交文件</div>
          <div className="mt-2 space-y-1.5">
            {message.files.map((file) => (
              <div key={file.name} className="flex items-center gap-2 text-[11.5px] text-[var(--a-text-2)]">
                <FileText className="size-3.5 shrink-0 text-[var(--a-text-3)]" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="text-[10.5px] text-[var(--a-text-4)]">{file.size}</span>
              </div>
            ))}
          </div>
        </div>
        </AssistantArtifact>
      );
    case "candidates":
      return (
        <AssistantArtifact>
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Users className="size-4 text-muted" />
              <span className="text-[12.5px] font-medium text-ink">{message.title ?? "候选人"}</span>
              {message.note ? <span className="text-[10.5px] text-muted">{message.note}</span> : null}
            </div>
            <div className="mt-2.5 space-y-1.5">
              {message.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenCandidate?.(item.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-[#fcfdfb] p-2.5 text-left transition-colors hover:border-line-strong hover:bg-white"
                >
                  <Avatar name={item.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-medium text-ink">{item.name}</span>
                      <Badge tone={item.score >= 85 ? "pine" : item.score >= 70 ? "amber" : "neutral"} className="h-[20px] text-[11px]">
                        {item.score}% 匹配
                      </Badge>
                      <span className="ml-auto text-[10.5px] text-muted">
                        {{ screening: "初筛", interview: "面试中", offer: "Offer", hired: "已入职", archived: "已归档" }[item.stage] ?? item.stage}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-muted">{item.title}</div>
                    <div className="mt-0.5 line-clamp-1 text-[10.5px] text-muted">{item.reason}</div>
                  </div>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted" />
                </button>
              ))}
            </div>
          </div>
        </AssistantArtifact>
      );
    case "stats":
      return (
        <AssistantArtifact>
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted" />
              <span className="text-[12.5px] font-medium text-ink">{message.title ?? "招聘数据"}</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {message.items.map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-[#fafbf8] px-2.5 py-2">
                  <div className={cn("text-[17px] font-semibold", item.tone === "success" ? "text-pine" : item.tone === "warning" ? "text-amber-deep" : "text-ink")}>
                    {item.value}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-muted">{item.label}</div>
                  {item.hint ? <div className="mt-0.5 text-[9.5px] text-muted">{item.hint}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </AssistantArtifact>
      );
    case "redlines":
      return (
        <AssistantArtifact>
          <div className="rounded-xl border border-[#efd6cd] bg-[#fff8f5] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldAlert className="size-4 text-[#c2472d]" />
              <span className="text-[12.5px] font-medium text-ink">{message.title}</span>
              <Badge tone={message.confirmed ? "pine" : "amber"} className="h-[20px] text-[10.5px]">
                {message.confirmed ? `已确认 ${message.items.length} 项` : `${message.items.length} 项待确认`}
              </Badge>
              {!message.confirmed ? (
                <button
                  type="button"
                  onClick={() => onAction("open-panel")}
                  className="ml-auto text-[10.5px] font-medium text-[#c2472d] hover:underline"
                >
                  在右侧确认或修改
                </button>
              ) : null}
            </div>
            <div className="mt-2.5 space-y-1.5">
              {message.items.map((item, index) => (
                <div key={item.id} className="rounded-lg border border-[#f4e1da] bg-white/80 px-2.5 py-2">
                  <div className="text-[11.5px] font-medium text-ink">{index + 1}. {item.title}</div>
                  <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-[17px] text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </AssistantArtifact>
      );
    case "compliance":
      return (
        <AssistantArtifact>
          <div className="rounded-xl border border-[#e8d4c4] bg-amber-soft/40 p-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-deep" />
              <span className="text-[12.5px] font-medium text-ink">{message.title ?? "合规风险"}</span>
              <Badge tone="amber" className="ml-auto h-[20px] text-[11px]">{message.items.length} 项</Badge>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {message.items.map((item, index) => (
                <div key={`${item.rule}-${index}`} className="rounded-lg border border-[#f0e2d4] bg-white/80 px-2.5 py-2">
                  <div className="flex items-center gap-2">
                    <TriangleAlert className="size-3.5 text-amber-deep" />
                    <span className="text-[11.5px] font-medium text-ink">{item.rule}</span>
                    <span className="ml-auto text-[9.5px] text-amber-deep">{item.severity === "high" ? "高风险" : "需关注"}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10.5px] leading-[17px] text-muted">{item.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </AssistantArtifact>
      );
    case "candidate-card":
      return (
        <AssistantArtifact>
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center gap-3">
              <Avatar name={message.name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{message.name}</div>
                <div className="mt-0.5 truncate text-[11.5px] text-muted">{message.title} · {message.company}</div>
              </div>
              <button
                type="button"
                onClick={() => onOpenCandidate?.(message.candidateId)}
                className="flex items-center gap-1 text-[11px] font-medium text-pine hover:underline"
              >
                查看档案 <ArrowUpRight className="size-3" />
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10.5px] text-muted">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#fafbf8] px-2 py-1"><Star className="size-3" />{message.years} 年经验</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#fafbf8] px-2 py-1"><GraduationCap className="size-3" />{message.degree} · {message.school}</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#fafbf8] px-2 py-1"><MapPin className="size-3" />{message.skills.slice(0, 3).join("、")}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <div className="text-[11px] font-medium text-pine">匹配亮点</div>
                <ul className="mt-1 space-y-1">
                  {message.highlights.slice(0, 3).map((item) => (
                    <li key={item} className="flex gap-1.5 text-[10.5px] leading-[17px] text-muted">
                      <Check className="mt-0.5 size-3 shrink-0 text-pine" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-medium text-signal">待验证风险</div>
                <ul className="mt-1 space-y-1">
                  {message.risks.slice(0, 3).map((item) => (
                    <li key={item} className="flex gap-1.5 text-[10.5px] leading-[17px] text-muted">
                      <Circle className="mt-1 size-2 shrink-0 text-signal" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AssistantArtifact>
      );
    case "divider":
      return (
        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[var(--a-border-1)]" />
          <span className="text-[10.5px] text-[var(--a-text-4)]">{message.label}</span>
          <span className="h-px flex-1 bg-[var(--a-border-1)]" />
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center gap-2 text-[11.5px] text-[var(--a-text-3)]">
          <span className="size-3 animate-spin rounded-full border border-[var(--a-text-3)] border-r-transparent" />
          {message.label}
        </div>
      );
    default:
      return null;
  }
}


export type MessageTurn = {
  role: "user" | "assistant";
  messages: AgentMessage[];
};

function isUserSideMessage(message: AgentMessage, previousRole?: "user" | "assistant") {
  if (message.kind === "text" && message.role === "user") return true;
  if (message.kind === "upload") {
    if (message.source === "user") return true;
    if (!message.source && previousRole === "user") return true;
  }
  return false;
}

export function groupMessageTurns(messages: AgentMessage[]): MessageTurn[] {
  const turns: MessageTurn[] = [];
  for (const message of messages) {
    const last = turns[turns.length - 1];
    const role: "user" | "assistant" = isUserSideMessage(message, last?.role) ? "user" : "assistant";
    if (last && last.role === role) last.messages.push(message);
    else turns.push({ role, messages: [message] });
  }
  return turns;
}

function isTraceMessage(message: AgentMessage) {
  return (
    message.kind === "meta" ||
    message.kind === "switch" ||
    message.kind === "activity" ||
    message.kind === "divider" ||
    message.kind === "pending" ||
    (message.kind === "table" && message.trace) ||
    (message.kind === "upload" && message.source !== "user")
  );
}

export function UserTurn({
  messages,
  onEdit,
}: {
  messages: AgentMessage[];
  onEdit?: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const texts = messages.filter((message): message is Extract<AgentMessage, { kind: "text" }> => message.kind === "text" && message.role === "user");
  const files = messages.flatMap((message) => (message.kind === "upload" ? message.files : []));
  const fullText = texts.map((message) => message.text).join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success("已复制");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="agent-fade group/user flex flex-col items-end gap-1.5">
      {texts.map((message) => (
        <div
          key={message.id}
          className="max-w-[82%] rounded-2xl rounded-tr-md bg-pine px-3.5 py-2.5 text-[13.5px] leading-[22px] text-white"
        >
          {message.text}
        </div>
      ))}
      {files.length > 0 ? (
        <div className="flex max-w-[82%] flex-wrap justify-end gap-1.5">
          {files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              className="inline-flex h-7 max-w-[250px] items-center gap-1.5 rounded-lg border border-line bg-surface px-2 text-[11px] text-muted"
            >
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-[10px]">{file.size}</span>
            </span>
          ))}
        </div>
      ) : null}
      {fullText ? (
        <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover/user:opacity-100 md:focus-within:opacity-100">
          <button
            type="button"
            onClick={copy}
            title="复制"
            aria-label="复制这条消息"
            className="flex size-7 items-center justify-center rounded-md text-[var(--a-text-4)] transition-colors hover:bg-[#e6ebe3] hover:text-[var(--a-text-1)]"
          >
            <Copy className="size-3.5" />
          </button>
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(fullText)}
              title="编辑"
              aria-label="编辑这条消息"
              className="flex size-7 items-center justify-center rounded-md text-[var(--a-text-4)] transition-colors hover:bg-[#e6ebe3] hover:text-[var(--a-text-1)]"
            >
              <Pencil className="size-3.5" />
            </button>
          ) : null}
          {copied ? <span className="text-[10px] text-[var(--a-green)]">已复制</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function answerText(message: AgentMessage): string {
  switch (message.kind) {
    case "text":
      return message.role === "assistant" ? message.text : "";
    case "bullets":
      return [message.title, ...message.items].filter(Boolean).join("\n");
    case "table":
      return [
        message.title ?? "",
        ...message.rows.map((row) => `${row.label}：${row.value}`),
      ]
        .filter(Boolean)
        .join("\n");
    case "success":
      return [message.title, message.subtitle].filter(Boolean).join("\n");
    case "candidates":
      return [
        message.title ?? "推荐结果",
        message.note ?? "",
        ...message.items.map((item, index) => `${index + 1}. ${item.name} · ${item.score}% · ${item.title}`),
      ]
        .filter(Boolean)
        .join("\n");
    case "stats":
      return [message.title ?? "招聘数据", ...message.items.map((item) => `${item.label}：${item.value}`)].join("\n");
    case "redlines":
      return [message.title, ...message.items.map((item, index) => `${index + 1}. ${item.title}：${item.description}`)].join("\n");
    case "compliance":
      return [message.title ?? "合规风险", ...message.items.map((item) => `${item.rule}：${item.excerpt}`)].join("\n");
    case "candidate-card":
      return [message.name, message.title, message.company, ...message.highlights].filter(Boolean).join("\n");
    default:
      return "";
  }
}

export function AssistantTurn({
  messages,
  onAction,
  onOpenCandidate,
  thinking = false,
}: {
  messages: AgentMessage[];
  onAction: (action: AgentAction) => void;
  onOpenCandidate?: (id: string) => void;
  thinking?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const trace = messages.filter(isTraceMessage);
  const answer = messages.filter((message) => !isTraceMessage(message));
  const running = trace.some(
    (message) => message.kind === "activity" && message.steps.some((step) => step.state === "running")
  );
  const [open, setOpen] = useState(running);

  useEffect(() => {
    if (running) setOpen(true);
  }, [running]);

  const activity = trace.find((message) => message.kind === "activity");
  const switchMessage = trace.find((message) => message.kind === "switch");
  const summary = running
    ? activity?.title ?? "正在执行"
    : switchMessage
      ? `${skillById(switchMessage.skill).name} · 执行过程`
      : "执行过程";
  const answerBody = answer.map(answerText).filter(Boolean).join("\n\n");

  const copy = async () => {
    if (!answerBody) return;
    try {
      await navigator.clipboard.writeText(answerBody);
      setCopied(true);
      toast.success("已复制");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="agent-fade group/turn">
      <div className="min-w-0 space-y-2.5">
        {trace.length > 0 ? (
          <div>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={`思考与执行：${summary}`}
              className="flex items-center gap-1.5 py-0.5 text-[12px] text-[var(--a-text-3)] transition-colors hover:text-[var(--a-text-1)]"
            >
              {running ? <Loader2 className="size-3.5 animate-spin text-pine" /> : null}
              <span>思考与执行</span>
              <ChevronDown className={cn("size-3.5 transition-transform", open ? "rotate-180" : "")} />
            </button>
            {open ? (
              <div className="mt-2 space-y-2.5 pl-0.5">
                {trace.map((message) => (
                  <ChatMessage key={message.id} message={message} onAction={onAction} onOpenCandidate={onOpenCandidate} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {answer.length > 0 ? (
          <div className="space-y-2.5">
            {answer.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAction={onAction}
                onOpenCandidate={onOpenCandidate}
              />
            ))}
          </div>
        ) : null}

        {thinking ? <TypingIndicator /> : null}

        {answerBody && !thinking ? (
          <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover/turn:opacity-100 md:focus-within:opacity-100">
            <button
              type="button"
              onClick={copy}
              title="复制"
              aria-label="复制这条回复"
              className="flex size-7 items-center justify-center rounded-md text-[var(--a-text-4)] transition-colors hover:bg-[#e6ebe3] hover:text-[var(--a-text-1)]"
            >
              <Copy className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toast.success("感谢反馈")}
              title="有帮助"
              aria-label="有帮助"
              className="flex size-7 items-center justify-center rounded-md text-[var(--a-text-4)] transition-colors hover:bg-[#e6ebe3] hover:text-[var(--a-text-1)]"
            >
              <ThumbsUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toast("已记录，会继续校准")}
              title="需改进"
              aria-label="需改进"
              className="flex size-7 items-center justify-center rounded-md text-[var(--a-text-4)] transition-colors hover:bg-[#e6ebe3] hover:text-[var(--a-text-1)]"
            >
              <ThumbsDown className="size-3.5" />
            </button>
            {copied ? <span className="text-[10px] text-[var(--a-green)]">已复制</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AssistantThinking() {
  return (
    <div className="agent-fade py-1">
      <TypingIndicator />
    </div>
  );
}
