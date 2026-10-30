import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CandidateStage, InterviewType, JobStatus, OfferStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const jobStatusMeta: Record<JobStatus, { label: string; tone: string; dot: string }> = {
  active: { label: "招聘中", tone: "bg-pine-soft text-pine", dot: "bg-pine" },
  reviewing: { label: "审核中", tone: "bg-amber-soft text-[#7a5412]", dot: "bg-amber" },
  draft: { label: "未开始", tone: "bg-[#eef0ec] text-muted", dot: "bg-[#9aa69e]" },
  closed: { label: "已结束", tone: "bg-[#eef0ec] text-muted", dot: "bg-[#9aa69e]" },
  paused: { label: "已暂停", tone: "bg-signal-soft text-signal", dot: "bg-signal" },
};

export const candidateStageMeta: Record<CandidateStage, { label: string; short: string; tone: string; dot: string }> = {
  screening: { label: "待筛选", short: "筛选", tone: "bg-[#eef0ec] text-ink-soft", dot: "bg-[#8c9a91]" },
  interview: { label: "面试中", short: "面试", tone: "bg-[#e8eef5] text-[#2f5c80]", dot: "bg-[#4d7ea8]" },
  offer: { label: "Offer", short: "Offer", tone: "bg-amber-soft text-[#7a5412]", dot: "bg-amber" },
  hired: { label: "已入职", short: "入职", tone: "bg-pine-soft text-pine", dot: "bg-pine" },
  archived: { label: "已归档", short: "归档", tone: "bg-[#f0eeec] text-muted", dot: "bg-[#a9a39a]" },
};

export const interviewTypeMeta: Record<InterviewType, { label: string; tone: string }> = {
  video: { label: "视频面试", tone: "text-[#2f5c80] bg-[#e8eef5]" },
  onsite: { label: "现场面试", tone: "text-[#7a5412] bg-amber-soft" },
  phone: { label: "电话面试", tone: "text-ink-soft bg-[#eef0ec]" },
  ai: { label: "数字人面试", tone: "text-pine bg-pine-soft" },
};

export const offerStatusMeta: Record<OfferStatus, { label: string; tone: string; dot: string }> = {
  draft: { label: "草稿", tone: "bg-[#eef0ec] text-muted", dot: "bg-[#9aa69e]" },
  approving: { label: "审批中", tone: "bg-amber-soft text-[#7a5412]", dot: "bg-amber" },
  sent: { label: "已发送", tone: "bg-[#e8eef5] text-[#2f5c80]", dot: "bg-[#4d7ea8]" },
  accepted: { label: "已接受", tone: "bg-pine-soft text-pine", dot: "bg-pine" },
  declined: { label: "已拒绝", tone: "bg-signal-soft text-signal", dot: "bg-signal" },
};

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
  if (score >= 90) return { text: "text-pine", stroke: "#0c4539", bg: "#dbeae3" };
  if (score >= 85) return { text: "text-[#2f6f8f]", stroke: "#2f6f8f", bg: "#e3ecf2" };
  if (score >= 80) return { text: "text-[#8a6a24]", stroke: "#b1802f", bg: "#f6edd9" };
  return { text: "text-muted", stroke: "#9aa69e", bg: "#eef0ec" };
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
