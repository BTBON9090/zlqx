import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CandidateStage, Employee, InterviewStatus, InterviewType, Job, JobStatus, OfferStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const jobStatusMeta: Record<JobStatus, { label: string; tone: string; dot: string }> = {
  active: { label: "招聘中", tone: "bg-pine-soft text-pine", dot: "bg-pine" },
  reviewing: { label: "审核中", tone: "bg-amber-soft text-amber-deep", dot: "bg-amber" },
  draft: { label: "未开始", tone: "bg-[#eef0ec] text-muted", dot: "bg-[#9aa69e]" },
  closed: { label: "已结束", tone: "bg-[#eef0ec] text-muted", dot: "bg-[#9aa69e]" },
  paused: { label: "已暂停", tone: "bg-signal-soft text-signal", dot: "bg-signal" },
};

export const candidateStageMeta: Record<CandidateStage, { label: string; short: string; tone: string; dot: string }> = {
  screening: { label: "待筛选", short: "筛选", tone: "bg-[#eef0ec] text-ink-soft", dot: "bg-[#8c9a91]" },
  interview: { label: "面试中", short: "面试", tone: "bg-info-soft text-info-ink", dot: "bg-info-ink" },
  offer: { label: "Offer", short: "Offer", tone: "bg-amber-soft text-amber-deep", dot: "bg-amber" },
  hired: { label: "已入职", short: "入职", tone: "bg-pine-soft text-pine", dot: "bg-pine" },
  archived: { label: "已归档", short: "归档", tone: "bg-[#f0eeec] text-muted", dot: "bg-[#a9a39a]" },
};

export const defaultMatchThresholds = { pass: 85, reject: 65, preset: "medium" as const };

export function getMatchThresholds(job?: Job) {
  return job?.matchThresholds ?? defaultMatchThresholds;
}

export function matchSuggestion(score: number, thresholds: { pass: number; reject: number }) {
  if (score >= thresholds.pass) return { label: "建议通过", tone: "text-pine" };
  if (score < thresholds.reject) return { label: "建议淘汰", tone: "text-danger" };
  return { label: "待定", tone: "text-amber-deep" };
}

export const interviewStatusMeta: Record<
  InterviewStatus,
  { label: string; short: string; tone: string; dot: string; description: string }
> = {
  pending: { label: "待候选人确认", short: "待确认", tone: "bg-amber-soft text-amber-deep", dot: "bg-amber", description: "邀约已发出，等待候选人接受或拒绝" },
  confirmed: { label: "已确认 · 待开始", short: "已确认", tone: "bg-info-soft text-info-ink", dot: "bg-info-ink", description: "候选人已接受邀约，面试尚未开始" },
  in_progress: { label: "进行中", short: "进行中", tone: "bg-pine-soft text-pine", dot: "bg-pine animate-pulse", description: "面试正在进行，面试官已进入" },
  done: { label: "已完成", short: "已完成", tone: "bg-[#eef2ec] text-ink-soft", dot: "bg-[#8d9a90]", description: "面试已结束，反馈可能已提交或待提交" },
  rescheduled: { label: "已改期", short: "已改期", tone: "bg-[#efe9fb] text-[#6d4bb5]", dot: "bg-[#8061c7]", description: "候选人申请改期，已进入新的时间确认" },
  cancelled: { label: "已取消", short: "已取消", tone: "bg-[#f3eeeb] text-[#8a5e4e]", dot: "bg-[#a97664]", description: "面试取消，不再占用日历" },
  no_show: { label: "候选人未出席", short: "未出席", tone: "bg-signal-soft text-danger", dot: "bg-danger", description: "面试时间已过，候选人未进入面试" },
  expired: { label: "邀约已过期", short: "已过期", tone: "bg-[#f1f1ee] text-muted", dot: "bg-[#a7aca6]", description: "候选人在截止时间前未确认邀约" },
};

export const interviewTypeMeta: Record<InterviewType, { label: string; tone: string }> = {
  video: { label: "视频面试", tone: "bg-info-soft text-info-ink" },
  onsite: { label: "现场面试", tone: "bg-amber-soft text-amber-deep" },
  phone: { label: "电话面试", tone: "text-ink-soft bg-[#eef0ec]" },
  ai: { label: "数字人面试", tone: "text-pine bg-pine-soft" },
};

export const offerStatusMeta: Record<OfferStatus, { label: string; tone: string; dot: string }> = {
  draft: { label: "草稿", tone: "bg-[#eef0ec] text-muted", dot: "bg-[#9aa69e]" },
  approving: { label: "审批中", tone: "bg-amber-soft text-amber-deep", dot: "bg-amber" },
  sent: { label: "已发送", tone: "bg-info-soft text-info-ink", dot: "bg-info-ink" },
  accepted: { label: "已接受", tone: "bg-pine-soft text-pine", dot: "bg-pine" },
  declined: { label: "已拒绝", tone: "bg-signal-soft text-signal", dot: "bg-signal" },
};

export function employeeDepartmentIds(employee: Employee) {
  return Array.from(new Set([employee.departmentId, ...(employee.departmentIds ?? [])].filter(Boolean)));
}

export function departmentPickerItems(departments: { id: string; name: string; parentId: string | null }[]) {
  return departments.map((department) => {
    let level = 0;
    let current = department;
    const seen = new Set<string>();
    while (current.parentId && !seen.has(current.parentId)) {
      seen.add(current.parentId);
      const parent = departments.find((d) => d.id === current.parentId);
      if (!parent) break;
      level += 1;
      current = parent;
    }
    return { id: department.id, name: department.name, level };
  });
}

export function initials(name: string) {
  if (!name) return "?";
  const cleaned = name.replace(/\s/g, "");
  if (/[\u4e00-\u9fa5]/.test(cleaned)) return cleaned.slice(-1);
  return cleaned
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const avatarTones = [
  { bg: "#dcebe4", fg: "#0c4539" },
  { bg: "#e7e9d8", fg: "#4c5a2c" },
  { bg: "#f6e5db", fg: "#8a452c" },
  { bg: "#e3e8f1", fg: "#345a7c" },
  { bg: "#efe4dc", fg: "#7b5338" },
  { bg: "#e8e3ee", fg: "#5e4b76" },
  { bg: "#dde9ea", fg: "#2f6567" },
  { bg: "#f3e8d9", fg: "#7d5a2e" },
];

export function avatarTone(name: string) {
  const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return avatarTones[hash % avatarTones.length];
}

export function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function formatDateWithWeek(date: string) {
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

export function isToday(date: string) {
  return date === "2026-10-30";
}

export function scoreTone(score: number) {
  if (score >= 90) return { text: "text-pine", stroke: "var(--pine)", bg: "var(--pine-soft)" };
  if (score >= 85) return { text: "text-info-ink", stroke: "var(--info-ink)", bg: "var(--info-soft)" };
  if (score >= 80) return { text: "text-amber-deep", stroke: "var(--amber)", bg: "var(--amber-soft)" };
  return { text: "text-muted", stroke: "var(--muted)", bg: "var(--mint)" };
}

export function candidateName(candidates: { id: string; name: string }[], id: string) {
  return candidates.find((c) => c.id === id)?.name ?? "未知候选人";
}

export function formatTimeRange(start: string, end: string) {
  return `${start} – ${end}`;
}

export function formatRelativeDate(date: string) {
  if (date === "2026-10-30") return "今天";
  if (date === "2026-10-31") return "明天";
  if (date === "2026-11-01") return "后天";
  return formatDate(date);
}

export function bytesToReadable(gb: number) {
  return `${gb.toFixed(1)} GB`;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
