import {
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  ClipboardList,
  FileBarChart2,
  FileSearch,
  FileText,
  Handshake,
  ListChecks,
  Send,
  ShieldCheck,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { AgentSession, SkillDefinition, SkillId } from "./types";

export const agentSkills: SkillDefinition[] = [
  {
    id: "job-publish",
    name: "职位发布",
    short: "职位发布",
    description: "从一句话开始，生成完整职位并提交平台审核",
    prompt: "帮我创建一个高级软件测试工程师职位",
    category: "招聘流程",
    icon: "briefcase",
    tint: "#e8f3ff",
    color: "#165dff",
  },
  {
    id: "job-profile",
    name: "职位画像",
    short: "职位画像",
    description: "解析岗位要求，生成可复用的人才画像",
    prompt: "为前端开发工程师创建职位画像",
    category: "人才洞察",
    icon: "target",
    tint: "#fff7e8",
    color: "#ff7d00",
  },
  {
    id: "recommend-report",
    name: "推荐报告",
    short: "推荐报告",
    description: "批量解析简历，输出可解释的推荐结论",
    prompt: "为前端开发工程师职位创建推荐报告",
    category: "人才洞察",
    icon: "report",
    tint: "#e8ffea",
    color: "#00b42a",
  },
  {
    id: "resume-parse",
    name: "简历解析",
    short: "简历解析",
    description: "提取履历、技能与风险点，生成候选人卡片",
    prompt: "帮我解析一份简历",
    category: "人才洞察",
    icon: "file-search",
    tint: "#f5e8ff",
    color: "#722ed1",
  },
  {
    id: "interview-plan",
    name: "面试题纲",
    short: "面试题纲",
    description: "基于岗位画像生成结构化问题与追问",
    prompt: "为这个职位设计一场结构化面试",
    category: "招聘流程",
    icon: "list",
    tint: "#e8f7ff",
    color: "#0e83c8",
  },
  {
    id: "offer-draft",
    name: "Offer 起草",
    short: "Offer",
    description: "结合预算与候选人期望，起草可审批的 Offer",
    prompt: "帮周予安起草一份 Offer",
    category: "招聘流程",
    icon: "handshake",
    tint: "#fff0e8",
    color: "#e8582b",
  },
  {
    id: "talent-search",
    name: "人才寻访",
    short: "人才寻访",
    description: "按画像检索人才库，生成触达优先级",
    prompt: "帮我找 5 位匹配的高级前端工程师",
    category: "人才洞察",
    icon: "users",
    tint: "#eef0ff",
    color: "#4e5bd8",
  },
  {
    id: "recruiting-analytics",
    name: "招聘分析",
    short: "招聘分析",
    description: "汇总漏斗、周期与渠道，生成招聘周报",
    prompt: "生成本周招聘漏斗分析",
    category: "数据与合规",
    icon: "chart",
    tint: "#e8f3ff",
    color: "#165dff",
  },
  {
    id: "message-invite",
    name: "消息邀约",
    short: "消息邀约",
    description: "批量生成个性化邀约并跟进候选人",
    prompt: "给待邀约候选人发送面试邀约",
    category: "沟通协作",
    icon: "send",
    tint: "#e8ffea",
    color: "#00b42a",
  },
  {
    id: "compliance-check",
    name: "合规检查",
    short: "合规检查",
    description: "检查 JD、Offer 与沟通话术的合规风险",
    prompt: "检查这个职位的合规风险",
    category: "数据与合规",
    icon: "shield",
    tint: "#fff0f0",
    color: "#f53f3f",
  },
];

export const skillIconMap: Record<string, LucideIcon> = {
  briefcase: BriefcaseBusiness,
  target: Target,
  report: FileBarChart2,
  "file-search": FileSearch,
  list: ListChecks,
  handshake: Handshake,
  users: UsersRound,
  chart: ChartNoAxesColumn,
  send: Send,
  shield: ShieldCheck,
};

export function SkillIcon({ id, className }: { id: SkillId; className?: string }) {
  const skill = skillById(id);
  const Icon = skillIconMap[skill.icon] ?? ClipboardList;
  return <Icon className={className} />;
}

export function skillById(id: SkillId | null | undefined) {
  return agentSkills.find((skill) => skill.id === id) ?? agentSkills[0];
}

const SEED_NOW = Date.parse("2026-11-03T09:30:00+08:00");
const DAY = 24 * 60 * 60 * 1000;

export function createEmptySession(openInTab = true): AgentSession {
  const now = Date.now();
  return {
    id: `sess-${now}-${Math.random().toString(36).slice(2, 7)}`,
    title: "新对话",
    skill: null,
    messages: [],
    panel: null,
    panelStatus: "editing",
    prompt: null,
    createdAt: now,
    updatedAt: now,
    openInTab,
    thinking: false,
  };
}

export function seedSessions(): AgentSession[] {
  return [
    {
      id: "sess-new",
      title: "新对话",
      skill: null,
      messages: [],
      panel: null,
      panelStatus: "editing",
      prompt: null,
      createdAt: SEED_NOW,
      updatedAt: SEED_NOW,
      openInTab: true,
      thinking: false,
    },
  ];
}

export function sessionTitleFromInput(text: string, skill: SkillId | null) {
  const roleMatch = text.match(
    /(?:帮我|请|我想|我要|为|给)?\s*(?:创建|新建|发布|招聘|新增|写|设计|生成)?\s*(?:一个|一份|一位|一场)?\s*([\u4e00-\u9fa5A-Za-z0-9·\s]{2,20}(?:工程师|设计师|产品经理|运营|销售|律师|顾问|分析师|研究员|架构师))/
  );
  if (roleMatch?.[1]) return roleMatch[1].trim().slice(0, 12);
  if (skill) return skillById(skill).short;
  return text.trim().slice(0, 10) || "新对话";
}

export function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60 * 1000) return "刚刚";
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / (60 * 1000)))} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`;
  if (diff < 2 * 24 * 60 * 60 * 1000) return "昨天";
  return `${Math.floor(diff / (24 * 60 * 60 * 1000))} 天前`;
}

export function formatClock(timestamp: number) {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDayLabel(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((start - dayStart) / DAY);
  const base = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  if (diffDays === 0) return `今天 · ${base}`;
  if (diffDays === 1) return `昨天 · ${base}`;
  return base;
}

export function groupSessionsByDay(sessions: AgentSession[]) {
  const groups = new Map<string, AgentSession[]>();
  [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((session) => {
      const key = formatDayLabel(session.createdAt);
      const existing = groups.get(key) ?? [];
      existing.push(session);
      groups.set(key, existing);
    });
  return [...groups.entries()];
}
