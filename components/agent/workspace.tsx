"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Layers3, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AgentTabBar } from "./tabbar";
import { AssistantThinking, AssistantTurn, UserTurn, groupMessageTurns } from "./messages";
import { ComposerDock } from "./composer";
import { VisualPanel } from "./panels";
import { HistoryModal } from "./history";
import { CandidateDrawer } from "@/components/candidates/candidate-drawer";
import {
  createEmptySession,
  formatRelativeTime,
  seedSessions,
  sessionTitleFromInput,
  skillById,
} from "./data";
import type { Candidate, Job } from "@/lib/types";
import type {
  AgentAction,
  AgentMessage,
  AgentPrompt,
  AgentSession,
  InterviewDraftPayload,
  JobDraftPayload,
  OfferDraftPayload,
  PanelKind,
  PanelStatus,
  ProfileDraftPayload,
  SkillId,
} from "./types";

const STORAGE_KEY = "zhipin-qianxun-agent-v2";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type MessageDraft = DistributiveOmit<AgentMessage, "id">;

const mid = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function inferSkill(text: string): SkillId | null {
  if (/画像/.test(text)) return "job-profile";
  if (/推荐报告/.test(text)) return "recommend-report";
  if (/简历解析|解析简历|简历/.test(text)) return "resume-parse";
  if (/面试|题纲|初试|复试/.test(text)) return "interview-plan";
  if (/offer|录用|薪资方案/i.test(text)) return "offer-draft";
  if (/寻访|人才库|找人|候选人检索|(找|推荐).*(工程师|设计师|候选人|人才)/.test(text)) return "talent-search";
  if (/邀约|触达|消息/.test(text)) return "message-invite";
  if (/合规|敏感词|风险|审核/.test(text)) return "compliance-check";
  if (/分析|周报|漏斗|数据|转化/.test(text)) return "recruiting-analytics";
  if (/发布|职位|招聘|jd|岗位/i.test(text)) return "job-publish";
  if (/(创建|新建|发布|招聘|新增|写).*(工程师|设计师|产品经理|运营|销售|顾问|分析师)/.test(text)) return "job-publish";
  return null;
}

function panelForSkill(skill: SkillId | null): PanelKind {
  if (skill === "job-publish") return "job";
  if (skill === "job-profile") return "profile";
  if (skill === "recommend-report") return "report";
  if (skill === "interview-plan") return "interview";
  if (skill === "offer-draft") return "offer";
  return null;
}

function skillLabel(skill: SkillId | null) {
  return skill ? skillById(skill).name : "普通对话";
}

function splitLines(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.replace(/^\d+[.、]\s*/, "").trim())
    .filter(Boolean);
}

function employmentValue(label: JobDraftPayload["employment"]) {
  if (label === "实习") return "intern" as const;
  if (label === "兼职" || label === "合同制") return "contract" as const;
  return "fulltime" as const;
}

function salaryText(min: string, max: string, months: string) {
  return `${min}-${max} · ${months}`;
}

const complianceRules = [
  { rule: "年龄限制", pattern: /(年龄|岁数|\b(18|20|25|30|35|40|45)\s*岁)/ },
  { rule: "性别限制", pattern: /(限男|限女|男性|女性|仅限男|仅限女)/ },
  { rule: "婚育状况", pattern: /(婚育|已婚|未婚|生育|备孕)/ },
  { rule: "院校背景限制", pattern: /(985|211|名校|双一流)/ },
  { rule: "地域或籍贯限制", pattern: /(籍贯|本地户口|限本地|本地人)/ },
];

function findComplianceIssues(job: Job) {
  const fields = [job.summary, ...job.responsibilities, ...job.requirements];
  return complianceRules
    .map(({ rule, pattern }) => {
      const excerpt = fields.find((field) => pattern.test(field));
      return excerpt ? { rule, excerpt, severity: "high" as const } : null;
    })
    .filter(Boolean) as { rule: string; excerpt: string; severity: "high" }[];
}

export function AgentWorkspace() {
  const {
    jobs,
    candidates,
    interviews,
    offers,
    departments,
    employees,
    flowTemplates,
    templates,
    addJob,
    updateJob,
    addGeneration,
    addInterview,
    addOffer,
  } = useApp();

  const [sessions, setSessions] = useState<AgentSession[]>(seedSessions);
  const [activeId, setActiveId] = useState("sess-new");
  const [panelOpen, setPanelOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [candidateDrawerId, setCandidateDrawerId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SkillId | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [panelWidth, setPanelWidth] = useState(400);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [candidateId, setCandidateId] = useState(candidates.find((candidate) => candidate.jobId === jobs[0]?.id)?.id ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootPromptRef = useRef<string | null>(null);
  const bootHandledRef = useRef(false);

  const currentJob = useMemo(() => jobs.find((job) => job.id === jobId) ?? jobs[0], [jobs, jobId]);
  const currentCandidate = useMemo(() => {
    const selected = candidates.find(
      (candidate) => candidate.id === candidateId && (!currentJob || candidate.jobId === currentJob.id)
    );
    return selected ?? candidates.find((candidate) => candidate.jobId === currentJob?.id);
  }, [candidates, candidateId, currentJob?.id]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? sessions[0],
    [sessions, activeId]
  );
  const openSessions = useMemo(() => sessions.filter((session) => session.openInTab), [sessions]);
  const taskSessions = useMemo(
    () => sessions.filter((session) => session.skill && !session.closedAt && session.messages.length > 0),
    [sessions]
  );
  const activeTasks = useMemo(
    () =>
      taskSessions.filter(
        (session) =>
          session.thinking ||
          Boolean(session.prompt) ||
          session.panelStatus === "working" ||
          (Boolean(session.panel) && session.panelStatus === "editing")
      ),
    [taskSessions]
  );
  const completedTaskCount = taskSessions.length - activeTasks.length;

  useEffect(() => {
    if (!currentJob && jobs[0]) setJobId(jobs[0].id);
  }, [currentJob, jobs]);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem("zhipin-qianxun-agent-panel-width"));
      if (Number.isFinite(saved) && saved >= 340) setPanelWidth(Math.min(680, saved));
    } catch {
      // Ignore storage access errors.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("zhipin-qianxun-agent-panel-width", String(panelWidth));
    } catch {
      // Ignore storage quota errors.
    }
  }, [panelWidth]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setHistoryOpen(false);
      setTasksOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          sessions?: AgentSession[];
          activeId?: string;
          jobId?: string;
          candidateId?: string;
        };
        if (Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
          const restored = parsed.sessions.map((session) => ({ ...session, thinking: false }));
          setSessions(restored);
          const nextActive =
            parsed.activeId && restored.some((session) => session.id === parsed.activeId && session.openInTab)
              ? parsed.activeId
              : restored.find((session) => session.openInTab)?.id ?? restored[0].id;
          setActiveId(nextActive);
          const target = restored.find((session) => session.id === nextActive);
          setPanelOpen(!!target?.panel);
          if (parsed.jobId && jobs.some((job) => job.id === parsed.jobId)) setJobId(parsed.jobId);
          if (parsed.candidateId && candidates.some((candidate) => candidate.id === parsed.candidateId)) {
            setCandidateId(parsed.candidateId);
          }
        }
      }
    } catch {
      // Ignore malformed snapshots and start with a clean workspace.
    }
    setHydrated(true);
    // The store may hydrate after this effect; IDs are validated on the next render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, activeId, jobId, candidateId }));
    } catch {
      // Ignore storage quota errors.
    }
  }, [sessions, activeId, jobId, candidateId, hydrated]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: activeSession?.thinking ? "smooth" : "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeSession?.messages.length, activeSession?.thinking, activeId]);

  useEffect(() => {
    if (!activeSession?.panel) return;
    setPanelOpen(true);
  }, [activeSession?.id, activeSession?.panel]);

  const updateSession = useCallback((id: string, updater: (session: AgentSession) => AgentSession) => {
    setSessions((prev) => prev.map((session) => (session.id === id ? updater(session) : session)));
  }, []);

  const append = useCallback(
    (id: string, draft: MessageDraft) => {
      const message = { ...draft, id: mid() } as AgentMessage;
      updateSession(id, (session) => ({
        ...session,
        messages: [...session.messages, message],
        updatedAt: Date.now(),
      }));
    },
    [updateSession]
  );

  const setThinking = useCallback(
    (id: string, value: boolean) => {
      updateSession(id, (session) => ({ ...session, thinking: value, updatedAt: Date.now() }));
    },
    [updateSession]
  );

  const setPanelStatus = useCallback(
    (id: string, status: PanelStatus) => {
      updateSession(id, (session) => ({ ...session, panelStatus: status }));
    },
    [updateSession]
  );

  const markActionsSpent = useCallback(
    (id: string, action: AgentAction) => {
      updateSession(id, (session) => ({
        ...session,
        messages: session.messages.map((message) =>
          message.kind === "actions"
            ? { ...message, items: message.items.map((item) => (item.action === action ? { ...item, spent: true } : item)) }
            : message
        ),
      }));
    },
    [updateSession]
  );

  const selectSession = useCallback(
    (id: string) => {
      const target = sessions.find((session) => session.id === id);
      if (!target) return;
      setSessions((prev) =>
        prev.map((session) => (session.id === id ? { ...session, openInTab: true, closedAt: undefined } : session))
      );
      setActiveId(id);
      setPanelOpen(!!target.panel);
      if (target.jobId && jobs.some((job) => job.id === target.jobId)) setJobId(target.jobId);
      const targetJob = jobs.find((job) => job.id === target.jobId);
      const nextCandidate =
        (target.candidateId && candidates.find((candidate) => candidate.id === target.candidateId)) ||
        candidates.find((candidate) => candidate.jobId === targetJob?.id);
      setCandidateId(nextCandidate?.id ?? "");
      setInput("");
      setSelectedSkill(null);
      setTasksOpen(false);
      setHistoryOpen(false);
    },
    [sessions, jobs, candidates]
  );

  const newTab = useCallback(() => {
    const session = createEmptySession(true);
    setSessions((prev) => [...prev, session]);
    setActiveId(session.id);
    setPanelOpen(false);
    setInput("");
    setSelectedSkill(null);
    setHistoryOpen(false);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      const remaining = sessions.filter((session) => session.openInTab && session.id !== id);
      setSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, openInTab: false, closedAt: Date.now(), thinking: false } : session
        )
      );
      if (id === activeId) {
        if (remaining.length > 0) {
          const next = remaining[remaining.length - 1];
          setActiveId(next.id);
          setPanelOpen(!!next.panel);
          if (next.jobId) {
            setJobId(next.jobId);
            const nextCandidate =
              (next.candidateId && candidates.find((candidate) => candidate.id === next.candidateId)) ||
              candidates.find((candidate) => candidate.jobId === next.jobId);
            setCandidateId(nextCandidate?.id ?? "");
          }
        } else {
          const session = createEmptySession(true);
          setSessions((prev) => [...prev, session]);
          setActiveId(session.id);
          setPanelOpen(false);
        }
        setInput("");
        setSelectedSkill(null);
      }
    },
    [sessions, activeId]
  );

  const resetChats = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
    setSessions(seedSessions());
    setActiveId("sess-new");
    setPanelOpen(false);
    setInput("");
    setSelectedSkill(null);
    setJobId(jobs[0]?.id ?? "");
    setCandidateId(candidates.find((candidate) => candidate.jobId === jobs[0]?.id)?.id ?? "");
    toast.success("对话已清空");
  }, [jobs, candidates]);

  const resolveSessionJob = useCallback(
    (session: AgentSession) => jobs.find((job) => job.id === session.jobId) ?? currentJob,
    [jobs, currentJob]
  );

  const resolveSessionCandidate = useCallback(
    (session: AgentSession) =>
      candidates.find((candidate) => candidate.id === session.candidateId) ??
      candidates.find((candidate) => candidate.jobId === resolveSessionJob(session)?.id) ??
      currentCandidate,
    [candidates, currentCandidate, resolveSessionJob]
  );

  const publishJob = useCallback(
    async (sid: string, payload: JobDraftPayload) => {
      if (!payload.title.trim()) {
        toast.error("请填写职位名称");
        return;
      }
      setPanelStatus(sid, "working");
      await wait(600);
      const job = addJob({
        title: payload.title.trim(),
        departmentId: payload.departmentId || departments[0]?.id || "dept-1",
        location: payload.locations.join(" / "),
        workMode: "onsite",
        employment: employmentValue(payload.employment),
        salary: salaryText(payload.salaryMin, payload.salaryMax, payload.months),
        experience: payload.experience,
        education: payload.education,
        headcount: payload.headcount,
        summary: splitLines(payload.responsibilities)[0]?.slice(0, 120) || "由 AI Agent 创建的职位。",
        responsibilities: splitLines(payload.responsibilities),
        requirements: splitLines(payload.requirements),
        skills: payload.skills.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        status: "reviewing",
        ownerId: currentUser.id,
        flowTemplateId: flowTemplates.find((flow) => flow.isDefault)?.id ?? flowTemplates[0]?.id,
        priority: "normal",
      });
      addGeneration({
        type: "jd",
        title: `${job.title} · 职位描述`,
        subtitle: `${job.code} · 待审核`,
        status: "ready",
        jobId: job.id,
      });
      await wait(300);
      append(sid, { kind: "meta", text: "职位已写入职位管理", icon: "check" });
      const issues = findComplianceIssues(job);
      if (issues.length > 0) {
        append(sid, {
          kind: "text",
          role: "assistant",
          text: "职位已经创建，但平台审核发现以下表述风险，需要先修复才能继续发布：",
        });
        append(sid, { kind: "compliance", title: "平台审核未通过", items: issues, fixable: true });
        append(sid, { kind: "actions", items: [{ label: "一键移除风险表述", action: "fix-compliance" }] });
      } else {
        append(sid, {
          kind: "success",
          title: "职位已创建，等待审核",
          subtitle: `${job.title} · ${job.code} · ${job.location}`,
          href: `/jobs/${job.id}`,
          hrefLabel: "打开职位详情",
        });
      }
      updateSession(sid, (session) => ({
        ...session,
        title: job.title,
        jobId: job.id,
        candidateId: "",
        panelStatus: "done",
      }));
      setJobId(job.id);
      setCandidateId("");
      setPanelStatus(sid, "done");
      toast.success("职位已创建");
    },
    [addJob, addGeneration, append, departments, flowTemplates, setPanelStatus, updateSession]
  );

  const updateJobDraft = useCallback(
    async (sid: string, payload: JobDraftPayload) => {
      const session = sessions.find((item) => item.id === sid);
      const job = session ? resolveSessionJob(session) : currentJob;
      if (!job) {
        toast.error("没有找到要更新的职位");
        return;
      }
      setPanelStatus(sid, "working");
      await wait(500);
      updateJob(job.id, {
        title: payload.title.trim(),
        departmentId: payload.departmentId,
        location: payload.locations.join(" / "),
        employment: employmentValue(payload.employment),
        salary: salaryText(payload.salaryMin, payload.salaryMax, payload.months),
        experience: payload.experience,
        education: payload.education,
        headcount: payload.headcount,
        summary: splitLines(payload.responsibilities)[0]?.slice(0, 120) || job.summary,
        responsibilities: splitLines(payload.responsibilities),
        requirements: splitLines(payload.requirements),
        skills: payload.skills.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
      });
      append(sid, { kind: "meta", text: "职位信息已更新并同步到职位管理", icon: "check" });
      updateSession(sid, (current) => ({ ...current, title: payload.title.trim(), jobId: job.id }));
      setPanelStatus(sid, "done");
      toast.success("职位信息已更新");
    },
    [sessions, resolveSessionJob, currentJob, setPanelStatus, updateJob, append, updateSession]
  );

  const saveProfile = useCallback(
    async (sid: string, payload: ProfileDraftPayload) => {
      const session = sessions.find((item) => item.id === sid);
      const job = session ? resolveSessionJob(session) : currentJob;
      if (!job) {
        toast.error("请先选择目标职位");
        return;
      }
      setPanelStatus(sid, "working");
      await wait(600);
      const mustHave = payload.selected.slice(0, 4);
      const niceToHave = payload.selected.slice(4, 8);
      const supplements = (payload.notes ?? []).map((item) => item.text).filter(Boolean).join(" ");
      updateJob(job.id, {
        aiProfile: {
          ...job.aiProfile,
          mustHave: mustHave.length > 0 ? mustHave : job.requirements.slice(0, 3),
          niceToHave: niceToHave.length > 0 ? niceToHave : job.skills.slice(0, 3),
          successProfile: `基于 ${payload.selected.length} 项用工偏好生成：优先验证 ${mustHave[0] ?? job.requirements[0] ?? "核心能力"}，同时关注 ${niceToHave[0] ?? job.skills[0] ?? "团队协作"}。${supplements ? `补充要求：${supplements}` : ""}`,
        },
      });
      addGeneration({
        type: "profile",
        title: `${job.title} · 岗位画像`,
        subtitle: `基于 ${payload.selected.length} 项用工偏好生成`,
        status: "ready",
        jobId: job.id,
      });
      await wait(260);
      append(sid, {
        kind: "success",
        title: "职位画像已写入职位",
        subtitle: `${job.title} · 已更新 ${payload.selected.length} 项偏好`,
        href: `/jobs/${job.id}`,
        hrefLabel: "查看职位画像",
      });
      updateSession(sid, (session) => ({ ...session, jobId: job.id, panelStatus: "done" }));
      setJobId(job.id);
      setPanelStatus(sid, "done");
      toast.success("职位画像已更新");
    },
    [sessions, resolveSessionJob, currentJob, setPanelStatus, updateJob, addGeneration, append, updateSession]
  );

  const confirmRedlines = useCallback(
    (sid: string, items: { id: string; title: string; description: string }[]) => {
      updateSession(sid, (session) => ({
        ...session,
        redlines: items,
        redlinesConfirmed: true,
        panelStatus: "editing",
        messages: session.messages.map((message) =>
          message.kind === "redlines" ? { ...message, items, confirmed: true } : message
        ),
      }));
      append(sid, { kind: "meta", text: `已确认 ${items.length} 项淘汰红线`, icon: "check" });
      toast.success("淘汰红线已确认");
    },
    [updateSession, append]
  );

  const generateReport = useCallback(
    async (sid: string, files: { name: string; size: string }[]) => {
      const session = sessions.find((item) => item.id === sid);
      const job = session ? resolveSessionJob(session) : currentJob;
      if (!job) {
        toast.error("请先选择目标职位");
        return;
      }
      if (!session?.redlinesConfirmed) {
        toast.error("请先确认淘汰红线");
        return;
      }
      setPanelStatus(sid, "working");
      await wait(700);
      const activeCandidates = candidates.filter((candidate) => candidate.stage !== "hired" && candidate.stage !== "archived");
      const ownPool = activeCandidates.filter((candidate) => candidate.jobId === job.id);
      const hasOwnPool = ownPool.length > 0;
      const basePool = (hasOwnPool ? ownPool : activeCandidates.length > 0 ? activeCandidates : candidates)
        .slice()
        .sort((a, b) => b.score - a.score);
      const redlines = session?.redlines ?? [];
      const maxSalary = (value: string) => {
        const nums = (value.match(/\d+/g) ?? []).map(Number);
        return nums.length > 0 ? Math.max(...nums) : 0;
      };
      const jobSalaryMax = maxSalary(job.salary);
      const redlineHits = (candidate: Candidate) => {
        const riskText = candidate.ai.risks.join(" ");
        return redlines.filter((redline) => {
          if (/履历/.test(redline.title)) return /(造假|学历|任职时间|空档)/.test(riskText);
          if (/技能/.test(redline.title)) return candidate.score < 70;
          if (/薪资|地点/.test(redline.title)) {
            return jobSalaryMax > 0 && maxSalary(candidate.expectedSalary) > jobSalaryMax;
          }
          if (/合规|背景/.test(redline.title)) return /(竞业|背景调查|合规)/.test(riskText);
          return false;
        }).length;
      };
      const flagged = basePool.filter((candidate) => redlineHits(candidate) > 0);
      const pool = basePool.filter((candidate) => redlineHits(candidate) === 0);
      const strong = pool.filter((candidate) => candidate.score >= 85);
      const medium = pool.filter((candidate) => candidate.score >= 70 && candidate.score < 85);
      const top = pool.slice(0, 5);
      if (files.length > 0) {
        append(sid, { kind: "upload", files, source: "tool" });
      }
      if (top.length > 0) {
        append(sid, {
          kind: "candidates",
          title: `${job.title} · 推荐结果`,
          note: [
            files.length > 0
              ? `已结合 ${files.length} 份文件与职位候选人库解析 · 共 ${pool.length} 人`
              : hasOwnPool
                ? `已基于职位候选人库解析 · 共 ${pool.length} 人`
                : `当前职位暂无在招候选人，已从人才库匹配 ${pool.length} 人`,
            redlines.length > 0
              ? `已按 ${redlines.length} 项淘汰红线筛选${flagged.length > 0 ? ` · ${flagged.length} 人触发红线` : ""}`
              : "",
          ]
            .filter(Boolean)
            .join(" · "),
          items: top.map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            title: candidate.currentTitle,
            score: candidate.score,
            reason: candidate.ai.headline,
            stage: candidate.stage,
          })),
        });
      } else {
        append(sid, {
          kind: "text",
          role: "assistant",
          text: `已按 ${redlines.length} 项淘汰红线完成筛选，当前职位的候选人均触发红线，暂无符合条件的推荐。建议调整红线或重新寻访候选人。`,
        });
      }
      addGeneration({
        type: "report",
        title: `${job.title} · 推荐报告`,
        subtitle: `${strong.length} 份重点推荐 · ${medium.length} 份待核实`,
        status: "ready",
        jobId: job.id,
        candidateId: strong[0]?.id ?? pool[0]?.id,
      });
      updateSession(sid, (session) => ({
        ...session,
        jobId: job.id,
        panelStatus: "done",
        reportResult: {
          strong: strong.length,
          medium: medium.length,
          total: pool.length,
          redlineCount: flagged.length,
          top: top.map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            score: candidate.score,
            stage: candidate.stage,
            title: candidate.currentTitle,
          })),
        },
      }));
      append(sid, {
        kind: "success",
        title: "推荐报告已生成",
        subtitle: `${strong.length} 份重点推荐 · ${medium.length} 份待核实`,
        href: `/candidates?job=${job.id}`,
        hrefLabel: "查看推荐候选人",
      });
      setPanelStatus(sid, "done");
      setJobId(job.id);
      toast.success("推荐报告已生成");
    },
    [sessions, resolveSessionJob, currentJob, setPanelStatus, candidates, append, addGeneration, updateSession]
  );

  const createInterview = useCallback(
    async (sid: string, payload: InterviewDraftPayload) => {
      const session = sessions.find((item) => item.id === sid);
      const job = session ? resolveSessionJob(session) : currentJob;
      const candidate = candidates.find((item) => item.id === payload.candidateId) ?? resolveSessionCandidate(session ?? activeSession);
      if (!job || !candidate) {
        toast.error("请先选择职位和候选人");
        return;
      }
      setPanelStatus(sid, "working");
      await wait(600);
      const interview = addInterview({
        candidateId: candidate.id,
        jobId: job.id,
        round: payload.round,
        type: payload.type,
        date: payload.date,
        start: payload.start,
        end: payload.end,
        interviewers: [payload.interviewerId || currentUser.id],
        meetingLink: payload.type === "video" ? "https://meeting.chengming.ai/agent-room" : undefined,
        location: payload.type === "onsite" ? "北京市朝阳区望京 SOHO T3 18F" : undefined,
      });
      addGeneration({
        type: "interview",
        title: `${candidate.name} · ${payload.round}面试`,
        subtitle: `${job.title} · ${payload.date} ${payload.start}`,
        status: "ready",
        jobId: job.id,
        candidateId: candidate.id,
      });
      await wait(260);
      append(sid, {
        kind: "success",
        title: "面试已创建并发送邀约",
        subtitle: `${candidate.name} · ${payload.date} ${payload.start}–${payload.end}`,
        href: `/interviews?interview=${interview.id}`,
        hrefLabel: "查看面试安排",
      });
      updateSession(sid, (session) => ({
        ...session,
        jobId: job.id,
        candidateId: candidate.id,
        panelStatus: "done",
      }));
      setPanelStatus(sid, "done");
      setJobId(job.id);
      setCandidateId(candidate.id);
      toast.success("面试已创建");
    },
    [sessions, resolveSessionJob, resolveSessionCandidate, activeSession, candidates, currentJob, setPanelStatus, addInterview, addGeneration, append, updateSession]
  );

  const createOffer = useCallback(
    async (sid: string, payload: OfferDraftPayload) => {
      const session = sessions.find((item) => item.id === sid);
      const job = session ? resolveSessionJob(session) : currentJob;
      const candidate = resolveSessionCandidate(session ?? activeSession);
      if (!job || !candidate) {
        toast.error("请先选择职位和候选人");
        return;
      }
      setPanelStatus(sid, "working");
      await wait(600);
      addOffer({
        candidateId: candidate.id,
        jobId: job.id,
        salary: payload.salary,
        bonus: payload.bonus,
        startDate: payload.startDate,
        deadline: payload.deadline,
        approverId: payload.approverId || employees[0]?.id || "emp-3",
        note: payload.note,
      });
      await wait(260);
      append(sid, {
        kind: "success",
        title: "Offer 已创建，等待审批",
        subtitle: `${candidate.name} · ${job.title} · ${payload.salary}`,
        href: "/offers",
        hrefLabel: "进入 Offer 审批",
      });
      updateSession(sid, (session) => ({
        ...session,
        jobId: job.id,
        candidateId: candidate.id,
        panelStatus: "done",
      }));
      setPanelStatus(sid, "done");
      setJobId(job.id);
      setCandidateId(candidate.id);
      toast.success("Offer 已创建");
    },
    [sessions, resolveSessionJob, resolveSessionCandidate, activeSession, currentJob, employees, setPanelStatus, addOffer, append, updateSession]
  );

  const fixCompliance = useCallback(
    async (sid: string) => {
      const session = sessions.find((item) => item.id === sid);
      const job = session ? resolveSessionJob(session) : currentJob;
      if (!job) return;
      markActionsSpent(sid, "fix-compliance");
      setThinking(sid, true);
      await wait(600);
      const clean = (lines: string[]) => lines.filter((line) => !complianceRules.some((rule) => rule.pattern.test(line)));
      const wasReviewing = job.status === "reviewing";
      updateJob(job.id, {
        summary: complianceRules.some((rule) => rule.pattern.test(job.summary)) ? "负责核心业务模块交付与持续优化。" : job.summary,
        responsibilities: clean(job.responsibilities),
        requirements: clean(job.requirements),
        ...(wasReviewing ? { status: "active" as const } : {}),
      });
      append(sid, {
        kind: "success",
        title: wasReviewing ? "职位已修复并通过审核" : "已移除风险表述",
        subtitle: wasReviewing ? `${job.title} · 已发布至职位管理` : `${job.title} · 职位描述与任职要求已更新`,
        href: `/jobs/${job.id}`,
        hrefLabel: "检查职位内容",
      });
      setThinking(sid, false);
      toast.success("合规内容已修复");
    },
    [sessions, resolveSessionJob, currentJob, markActionsSpent, setThinking, updateJob, append]
  );

  const handleAction = useCallback(
    (action: AgentAction) => {
      if (action === "open-panel") {
        setPanelOpen(true);
        return;
      }
      if (action === "fix-compliance") {
        void fixCompliance(activeId);
      }
    },
    [activeId, fixCompliance]
  );

  const runDeleteConfirm = useCallback(
    async (sid: string) => {
      const session = sessions.find((item) => item.id === sid);
      const title = session?.title ?? "当前任务";
      setThinking(sid, true);
      await wait(420);
      append(sid, {
        kind: "text",
        role: "assistant",
        text: "我理解一下，你是要关闭并删除当前任务吗？关闭后，这个对话会从任务序列中移除，但已写入职位、候选人等数据不会删除。",
      });
      append(sid, { kind: "meta", text: "已询问 1 个问题", icon: "task" });
      updateSession(sid, (current) => ({
        ...current,
        prompt: {
          id: `prompt-${Date.now()}`,
          title: `要关闭并归档「${title}」这个任务吗？`,
          description: "只会移除任务与右侧工作面板，已经写入业务数据的内容会保留。",
          options: [
            { title: "是，关闭并归档任务", description: "保留对话记录，可从历史记录中重新打开", value: "是，关闭并归档任务" },
            { title: "否，继续编辑", description: "保留任务和右侧面板，继续当前工作", value: "否，继续编辑" },
          ],
          customPlaceholder: "例如：先保留任务，只关闭右侧面板",
          action: "delete-task",
          skipLabel: "跳过",
        },
        thinking: false,
      }));
    },
    [sessions, setThinking, append, updateSession]
  );

  const answerPrompt = useCallback(
    (text: string, index: number) => {
      const sid = activeId;
      const session = sessions.find((item) => item.id === sid);
      if (!session?.prompt) return;
      const prompt = session.prompt;
      updateSession(sid, (current) => ({ ...current, prompt: null }));
      append(sid, { kind: "text", role: "user", text });
      if (prompt.action === "select-job") {
        const selectedJob =
          jobs.find((job) => job.id === prompt.options[index]?.value) ??
          jobs.find((job) => job.title === text || job.code === text || text.includes(job.title));
        if (!selectedJob) {
          append(sid, {
            kind: "text",
            role: "assistant",
            text: "没有找到对应的职位，请使用输入框左侧的「上下文」选择职位，或输入更完整的职位名称 / 编号。",
          });
          return;
        }
        const selectedCandidate =
          candidates.find((candidate) => candidate.jobId === selectedJob.id) ??
          candidates.find((candidate) => candidate.id === candidateId);
        setJobId(selectedJob.id);
        setCandidateId(selectedCandidate?.id ?? "");
        updateSession(sid, (current) => ({
          ...current,
          jobId: selectedJob.id,
          candidateId: selectedCandidate?.id ?? "",
          panel: panelForSkill(prompt.skill ?? null) ?? current.panel,
        }));
        if (prompt.skill) {
          void runSkill(sid, prompt.query ?? "", prompt.skill, selectedJob, selectedCandidate, true);
        }
        return;
      }
      if (prompt.action === "delete-task") {
        const affirmative = index === 0 || (index === -1 && /^(是|确认|删除|关闭)/.test(text));
        if (affirmative) {
          append(sid, {
            kind: "text",
            role: "assistant",
            text: "任务已关闭并归档。你可以从对话历史中重新打开，或开始一个新的目标。",
          });
          append(sid, { kind: "divider", label: `已归档任务 · ${session.title}` });
          updateSession(sid, (current) => ({
            ...current,
            panel: null,
            panelStatus: "editing",
            skill: null,
            closedAt: Date.now(),
          }));
          setPanelOpen(false);
          toast.success("任务已归档");
        } else {
          append(sid, {
            kind: "text",
            role: "assistant",
            text: "好的，任务和右侧面板都保留。你可以继续修改，或者告诉我下一步要做什么。",
          });
        }
      } else {
        append(sid, { kind: "text", role: "assistant", text: "收到，我会按你的选择继续处理。" });
      }
    },
    [activeId, sessions, updateSession, append, jobs, candidates, candidateId]
  );

  const skipPrompt = useCallback(() => {
    const sid = activeId;
    updateSession(sid, (session) => ({ ...session, prompt: null }));
    append(sid, { kind: "meta", text: "已跳过此次询问", icon: "check" });
  }, [activeId, updateSession, append]);

  const closePrompt = useCallback(() => {
    updateSession(activeId, (session) => ({ ...session, prompt: null }));
  }, [activeId, updateSession]);

  const runSkill = useCallback(
    async (sid: string, text: string, skill: SkillId | null, job?: Job, candidate?: Candidate, skipClarify = false) => {
      setThinking(sid, true);
      await wait(360);

      if (!skipClarify && (skill === "job-profile" || skill === "recommend-report") && jobs.length > 1) {
        const ordered = [job, ...jobs.filter((item) => item.id !== job?.id)]
          .filter((item): item is Job => Boolean(item))
          .slice(0, 4);
        updateSession(sid, (session) => ({
          ...session,
          prompt: {
            id: `prompt-${Date.now()}`,
            title: skill === "job-profile" ? "您想对哪个职位生成画像？" : "您想对哪个职位生成推荐报告？",
            description: "选择后我会读取该职位的画像、候选人和历史记录，再继续执行。",
            options: [
              ...ordered.map((item) => ({
                title: item.title,
                description: `${item.code} · ${departments.find((department) => department.id === item.departmentId)?.name ?? "未分配部门"}`,
                value: item.id,
              })),
            ],
            customPlaceholder: "输入职位名称或编号，例如：高级产品经理",
            action: "select-job",
            skill,
            query: text,
            skipLabel: "跳过",
          },
          thinking: false,
        }));
        return;
      }

      if (skill) append(sid, { kind: "switch", skill });
      await wait(260);

      if (skill === "job-publish") {
        const role = sessionTitleFromInput(text, "job-publish");
        append(sid, {
          kind: "text",
          role: "assistant",
          text: `已为你准备「${role}」的职位草稿。右侧表单会直接创建一条真实职位记录，提交后可在「职位管理」中继续编辑和发布。`,
        });
        const draftDepartment = /测试|工程师|算法|前端|后端|开发/.test(role)
          ? departments.find((department) => department.name.includes("研发"))?.name
          : departments.find((department) => department.id === job?.departmentId)?.name;
        append(sid, {
          kind: "table",
          title: "职位草稿",
          actionLabel: "打开表单",
          rows: [
            { label: "职位名称", value: role },
            { label: "所属部门", value: draftDepartment ?? "产品与研发" },
            { label: "工作地点", value: job?.location ?? "北京市 · 海淀区" },
            { label: "经验要求", value: job?.experience ?? "3-5 年" },
            { label: "学历要求", value: job?.education ?? "本科" },
            { label: "招聘人数", value: `${job?.headcount ?? 3} 人` },
          ],
        });
        append(sid, { kind: "meta", text: "等待你在右侧确认", icon: "task" });
        setThinking(sid, false);
        return;
      }

      if (skill === "job-profile") {
        const target = job ?? currentJob;
        append(sid, {
          kind: "text",
          role: "assistant",
          text: target
            ? `我会基于「${target.title}」的职责、任职要求与团队信息生成岗位画像。右侧可以调整 D1–D5 维度，提交后会直接写回该职位。`
            : "请先在下方选择一个目标职位，我会基于职位详情生成画像。",
        });
        if (target) {
          append(sid, {
            kind: "table",
            title: "职位解析摘要",
            actionLabel: "打开画像",
            trace: true,
            rows: [
              { label: "职位名称", value: target.title },
              { label: "经验要求", value: target.experience },
              { label: "学历要求", value: target.education },
              { label: "任职要求", value: `${target.requirements.length} 条`, tone: "muted" },
              { label: "核心技能", value: target.skills.join("、") || "待补充", span: 2 },
            ],
          });
          append(sid, {
            kind: "meta",
            text: `已解析 ${target.requirements.length + target.skills.length} 项职位信息`,
            icon: "spark",
          });
        }
        setThinking(sid, false);
        return;
      }

      if (skill === "recommend-report") {
        const target = job ?? currentJob;
        const pool = target ? candidates.filter((item) => item.jobId === target.id && item.stage !== "hired" && item.stage !== "archived") : [];
        if (!target) {
          append(sid, {
            kind: "text",
            role: "assistant",
            text: "请先选择目标职位，我会读取该职位的候选人并生成推荐报告。",
          });
          setThinking(sid, false);
          return;
        }
        const mustHave = target.aiProfile.mustHave.slice(0, 2).join("、") || target.skills.slice(0, 2).join("、") || "职位核心技能";
        const redlines = [
          {
            id: "redline-1",
            title: "履历真实性与职业诚信",
            description: "学历、任职时间或项目贡献存在实质造假；经核实仍无法合理说明的，终止招聘流程。",
          },
          {
            id: "redline-2",
            title: "核心技能与独立交付能力",
            description: `未通过「${mustHave}」的必需评估，或无法独立交付核心任务、解释关键技术决策。`,
          },
          {
            id: "redline-3",
            title: "薪资与工作地点硬性约束",
            description: "期望薪资明显超出岗位预算，或无法接受工作地点、到岗时间与工作形式。",
          },
          {
            id: "redline-4",
            title: "合规与背景风险",
            description: "存在竞业限制、背景调查异常，或无法满足入职合规要求的情况。",
          },
        ];
        append(sid, {
          kind: "text",
          role: "assistant",
          text: `已锁定「${target.title}」。当前职位候选人库中有 ${pool.length} 人。我根据职位画像生成了 ${redlines.length} 项淘汰红线，请先在右侧确认或修改，确认后再基于红线筛选候选人并生成推荐报告。`,
        });
        append(sid, { kind: "table", title: "职位与候选人", trace: true, rows: [
          { label: "职位", value: `${target.title} · ${target.code}` },
          { label: "部门", value: departments.find((department) => department.id === target.departmentId)?.name ?? "—" },
          { label: "候选人", value: `${pool.length} 人`, tone: pool.length > 0 ? "success" : "warning" },
        ]});
        append(sid, { kind: "redlines", title: "淘汰红线", items: redlines });
        updateSession(sid, (session) => ({
          ...session,
          jobId: target.id,
          redlines,
          redlinesConfirmed: false,
          panelStatus: "editing",
        }));
        setThinking(sid, false);
        return;
      }

      if (skill === "interview-plan") {
        const target = job ?? currentJob;
        const person = candidate ?? currentCandidate;
        append(sid, {
          kind: "text",
          role: "assistant",
          text: target && person
            ? `我会为「${person.name}」安排「${target.title}」的面试，并生成结构化问题。右侧确认时间后，会直接创建面试并发送邀约。`
            : "请先选择职位和候选人，我可以生成面试题纲并直接创建面试。",
        });
        const questions = person?.ai.questions?.slice(0, 4) ?? [
          "请介绍一个你主导的复杂项目，以及你的关键决策。",
          "你如何判断需求优先级？",
          "遇到跨团队分歧时，你如何推动达成共识？",
        ];
        append(sid, { kind: "bullets", title: "建议问题", items: questions });
        setThinking(sid, false);
        return;
      }

      if (skill === "offer-draft") {
        const target = job ?? currentJob;
        const person = candidate ?? currentCandidate;
        append(sid, {
          kind: "text",
          role: "assistant",
          text: target && person
            ? `已读取「${person.name}」的期望薪资（${person.expectedSalary}）与「${target.title}」的薪资预算（${target.salary}）。右侧确认条款后，会直接创建 Offer 并进入审批流。`
            : "请先选择职位和候选人，我可以起草 Offer。",
        });
        if (target && person) {
          append(sid, {
            kind: "table",
            title: "Offer 参考",
            trace: true,
            rows: [
              { label: "候选人", value: person.name },
              { label: "期望薪资", value: person.expectedSalary },
              { label: "岗位预算", value: target.salary },
              { label: "当前阶段", value: person.stage, tone: "muted" },
            ],
          });
        }
        setThinking(sid, false);
        return;
      }

      if (skill === "talent-search") {
        const target = job ?? currentJob;
        const keywords = target?.skills ?? [];
        const pool = candidates
          .filter((item) => item.jobId === target?.id || item.skills.some((tag) => keywords.includes(tag)) || keywords.some((tag) => item.currentTitle.includes(tag)))
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);
        const fallback = pool.length > 0 ? pool : candidates.slice().sort((a, b) => b.score - a.score).slice(0, 6);
        append(sid, {
          kind: "text",
          role: "assistant",
          text: `我按「${target?.title ?? "当前职位"}」的技能与方向检索了候选人库，找到 ${fallback.length} 位优先触达对象。`,
        });
        append(sid, {
          kind: "candidates",
          title: "人才寻访结果",
          note: "按匹配度与候选人活跃度排序",
          items: fallback.map((item) => ({
            id: item.id,
            name: item.name,
            title: item.currentTitle,
            score: item.score,
            reason: item.ai.headline,
            stage: item.stage,
          })),
        });
        setThinking(sid, false);
        return;
      }

      if (skill === "recruiting-analytics") {
        const active = jobs.filter((item) => item.status === "active" || item.status === "reviewing").length;
        const screening = candidates.filter((item) => item.stage === "screening").length;
        const interviewing = candidates.filter((item) => item.stage === "interview").length;
        const offerCount = offers.length;
        const avg = candidates.length > 0 ? Math.round(candidates.reduce((sum, item) => sum + item.score, 0) / candidates.length) : 0;
        const upcoming = interviews.filter((item) => item.status === "pending" || item.status === "confirmed").length;
        append(sid, {
          kind: "stats",
          title: "招聘漏斗概览",
          items: [
            { label: "在招职位", value: `${active}`, hint: "含审核中" },
            { label: "候选人", value: `${candidates.length}`, hint: "全库" },
            { label: "初筛中", value: `${screening}`, tone: "warning" },
            { label: "面试中", value: `${interviewing}`, tone: "success" },
            { label: "Offer", value: `${offerCount}` },
            { label: "平均匹配度", value: `${avg}`, tone: avg >= 80 ? "success" : "warning" },
          ],
        });
        append(sid, {
          kind: "text",
          role: "assistant",
          text: `当前有 ${upcoming} 场待进行面试。建议优先处理初筛中的 ${screening} 位候选人，并关注二面后的决策等待时间。`,
        });
        setThinking(sid, false);
        return;
      }

      if (skill === "compliance-check") {
        const target = job ?? currentJob;
        if (!target) {
          append(sid, { kind: "text", role: "assistant", text: "请先选择一个职位，我会检查它的职责、要求和描述。" });
          setThinking(sid, false);
          return;
        }
        const issues = findComplianceIssues(target);
        if (issues.length === 0) {
          append(sid, {
            kind: "success",
            title: "未发现明显合规风险",
            subtitle: `${target.title} · 已检查年龄、性别、婚育、院校与地域表述`,
            href: `/jobs/${target.id}`,
            hrefLabel: "查看职位",
          });
        } else {
          append(sid, {
            kind: "compliance",
            title: "发现需要处理的表述",
            items: issues,
            fixable: true,
          });
          append(sid, { kind: "actions", items: [{ label: "一键移除风险表述", action: "fix-compliance" }] });
        }
        setThinking(sid, false);
        return;
      }

      if (skill === "resume-parse") {
        const person = candidate ?? currentCandidate;
        if (!person) {
          append(sid, { kind: "text", role: "assistant", text: "请先在下方选择一个候选人，我会解析他的履历、技能与风险点。" });
          setThinking(sid, false);
          return;
        }
        append(sid, {
          kind: "candidate-card",
          candidateId: person.id,
          name: person.name,
          title: person.currentTitle,
          company: person.currentCompany,
          years: person.years,
          degree: person.degree,
          school: person.school,
          skills: person.skills,
          highlights: person.ai.highlights,
          risks: person.ai.risks,
        });
        setThinking(sid, false);
        return;
      }

      if (skill === "message-invite") {
        const target = job ?? currentJob;
        const person = candidate ?? currentCandidate;
        const template = templates.find((item) => item.scenario === "面试邀约" && item.channels.includes("email")) ?? templates[0];
        const body = template?.emailBody
          .replaceAll("{{candidate_name}}", person?.name ?? "候选人")
          .replaceAll("{{company}}", "澄明科技")
          .replaceAll("{{job_title}}", target?.title ?? "目标职位")
          .replaceAll("{{round}}", "初试")
          .replaceAll("{{interview_time}}", "待确认")
          .replaceAll("{{interviewer}}", currentUser.name)
          .replaceAll("{{meeting_link}}", "待确认");
        append(sid, {
          kind: "text",
          role: "assistant",
          text: template && person && target
            ? `已使用「${template.name}」生成邀约草稿：\n\n主题：${template.subject.replaceAll("{{company}}", "澄明科技").replaceAll("{{job_title}}", target.title)}\n\n${body}`
            : "请先选择候选人和职位，我会使用消息模板生成邀约。",
        });
        setThinking(sid, false);
        return;
      }

      const target = job ?? currentJob;
      const person = candidate ?? currentCandidate;
      append(sid, {
        kind: "text",
        role: "assistant",
        text: `当前上下文：${target ? `职位「${target.title}」` : "未选择职位"}${person ? `，候选人「${person.name}」` : ""}。你可以让我创建职位、生成画像、筛选候选人、安排面试、起草 Offer 或分析招聘漏斗。`,
      });
      append(sid, {
        kind: "bullets",
        items: [
          "「帮我创建一个高级测试工程师职位」",
          "「为当前职位生成岗位画像」",
          "「分析本周招聘漏斗」",
          "「检查这个职位的合规风险」",
        ],
      });
      setThinking(sid, false);
    },
    [append, setThinking, updateSession, departments, candidates, jobs, offers, interviews, templates, currentJob, currentCandidate]
  );

  const send = useCallback(
    (raw: string, attachments?: { name: string; size: string }[]) => {
      const text = raw.trim();
      if (!text) return;
      if (activeSession?.prompt) {
        answerPrompt(text, -1);
        setInput("");
        return;
      }
      if (activeSession?.thinking) return;

      const sid = activeId;
      const effectiveSkill = selectedSkill ?? inferSkill(text);
      const isDelete = /删除/.test(text) && /(任务|职位|序列)/.test(text) && !/删除字段|删除条件/.test(text);
      const panel = isDelete ? null : panelForSkill(effectiveSkill);
      const clearsPanel = isDelete || (effectiveSkill !== null && panel === null);
      const mentionedJob = [...jobs].sort((a, b) => b.title.length - a.title.length).find((job) => text.includes(job.title));
      const mentionedCandidate = [...candidates].sort((a, b) => b.name.length - a.name.length).find((candidate) => text.includes(candidate.name));
      const effectiveJob =
        mentionedJob ??
        (mentionedCandidate ? jobs.find((job) => job.id === mentionedCandidate.jobId) : undefined) ??
        currentJob ??
        jobs[0];
      const effectiveCandidate =
        mentionedCandidate && (!mentionedJob || mentionedCandidate.jobId === mentionedJob.id)
          ? mentionedCandidate
          : candidates.find((candidate) => candidate.jobId === effectiveJob?.id);

      if (effectiveJob) setJobId(effectiveJob.id);
      setCandidateId(effectiveCandidate?.id ?? "");

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sid) return session;
          const guessedTitle = sessionTitleFromInput(text, effectiveSkill);
          const hasSpecificRole = !!effectiveSkill && guessedTitle !== skillById(effectiveSkill).short && guessedTitle !== "新对话";
          return {
            ...session,
            title: session.messages.length === 0 || hasSpecificRole ? guessedTitle : session.title,
            skill: isDelete ? session.skill : effectiveSkill ?? session.skill,
            jobId: effectiveJob?.id ?? session.jobId,
            candidateId: effectiveCandidate?.id ?? "",
            panel: clearsPanel ? null : panel ?? session.panel,
            panelStatus: panel ? "editing" : clearsPanel ? "editing" : session.panelStatus,
            prompt: null,
            closedAt: undefined,
            messages: [
              ...session.messages,
              { id: mid(), kind: "text", role: "user", text },
              ...(attachments && attachments.length > 0
                ? [{ id: mid(), kind: "upload" as const, files: attachments, source: "user" as const }]
                : []),
            ],
            updatedAt: Date.now(),
          };
        })
      );
      if (panel) setPanelOpen(true);
      else if (clearsPanel) setPanelOpen(false);
      setInput("");
      setSelectedSkill(null);
      if (isDelete) void runDeleteConfirm(sid);
      else void runSkill(sid, text, effectiveSkill, effectiveJob, effectiveCandidate);
    },
    [activeSession, activeId, selectedSkill, answerPrompt, runDeleteConfirm, jobs, candidates, currentJob, currentCandidate, runSkill]
  );

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = panelWidth;
      const onMove = (moveEvent: PointerEvent) => {
        const max = Math.min(680, window.innerWidth - 380);
        setPanelWidth(Math.min(max, Math.max(340, startWidth + (startX - moveEvent.clientX))));
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [panelWidth]
  );

  const handlePickSkill = useCallback((skill: SkillId) => {
    setSelectedSkill(skill);
    setInput("");
    window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".agent-app textarea")?.focus(), 30);
  }, []);

  useEffect(() => {
    if (!hydrated || bootHandledRef.current) return;
    const prompt = new URLSearchParams(window.location.search).get("prompt");
    if (!prompt) return;
    bootHandledRef.current = true;
    window.history.replaceState({}, "", "/ai/agent");
    const active = sessions.find((session) => session.id === activeId);
    if (active && active.messages.length > 0) {
      bootPromptRef.current = prompt;
      newTab();
      return;
    }
    send(prompt);
    // Run only after local history has hydrated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!bootPromptRef.current) return;
    const prompt = bootPromptRef.current;
    bootPromptRef.current = null;
    send(prompt);
    // The new tab is active at this point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const roleFor = (session: AgentSession) => {
    const cleaned = session.title.replace(/职位画像|推荐报告|画像|报告/g, "").trim();
    if (session.panel === "job" && cleaned && !/^(新对话|职位发布)$/.test(cleaned)) return cleaned;
    const job = jobs.find((item) => item.id === session.jobId);
    return job?.title ?? cleaned ?? "目标职位";
  };

  const sessionsWithPanels = openSessions.filter((session) => session.panel);

  if (!activeSession) return null;
  const turns = groupMessageTurns(activeSession.messages);

  return (
    <div className="agent-app flex h-full min-h-0 flex-col">
      <AgentTabBar
        sessions={openSessions}
        allSessions={sessions}
        activeId={activeId}
        panelOpen={panelOpen}
        panelAvailable={!!activeSession.panel}
        onSelect={selectSession}
        onClose={closeTab}
        onNew={newTab}
        onOpenSession={(id) => selectSession(id)}
        onOpenHistoryModal={() => setHistoryOpen(true)}
        onTogglePanel={() => setPanelOpen((value) => !value)}
        onReset={resetChats}
      />

      <div className="flex min-h-0 flex-1">
        <section className="relative flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-[832px] flex-col px-3 pb-2 pt-5 md:px-4">
              {activeSession.messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-14 agent-fade">
                  <h1 className="text-center text-[26px] font-semibold leading-[1.3] tracking-[-0.04em] text-[var(--a-text-1)] md:text-[30px]">
                    有什么我能帮你的吗？
                  </h1>
                  <p className="mt-2 max-w-[420px] text-center text-[13px] leading-[22px] text-[var(--a-text-3)]">
                    我会读取当前职位与候选人上下文，并把结果直接写入职位、候选人、面试或 Offer。
                  </p>
                </div>
              ) : (
                <div className="space-y-5 pt-12">
                  {turns.map((turn, index) =>
                    turn.role === "user" ? (
                      <UserTurn
                        key={`${turn.messages[0].id}-user`}
                        messages={turn.messages}
                        onEdit={(text) => {
                          setInput(text);
                          window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".agent-app textarea")?.focus(), 30);
                        }}
                      />
                    ) : (
                      <AssistantTurn
                        key={`${turn.messages[0].id}-assistant`}
                        messages={turn.messages}
                        onAction={handleAction}
                        onOpenCandidate={setCandidateDrawerId}
                        thinking={!!activeSession.thinking && index === turns.length - 1}
                      />
                    )
                  )}
                  {activeSession.thinking && (turns.length === 0 || turns[turns.length - 1].role === "user") ? (
                    <AssistantThinking />
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <ComposerDock
            value={input}
            onChange={setInput}
            onSend={send}
            selectedSkill={selectedSkill}
            onSelectSkill={handlePickSkill}
            onClearSkill={() => setSelectedSkill(null)}
            thinking={!!activeSession.thinking}
            empty={activeSession.messages.length === 0}
            prompt={activeSession.prompt}
            onAnswerPrompt={answerPrompt}
            onSkipPrompt={skipPrompt}
            onClosePrompt={closePrompt}
            onUseSuggestion={(text) => {
              setInput(text);
              window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".agent-app textarea")?.focus(), 30);
            }}
            jobs={jobs}
            candidates={candidates}
            jobId={currentJob?.id ?? ""}
            candidateId={currentCandidate?.id ?? ""}
            onJobChange={(id) => {
              const nextCandidateId = candidates.find((candidate) => candidate.jobId === id)?.id ?? "";
              setJobId(id);
              setCandidateId(nextCandidateId);
              updateSession(activeId, (session) => ({ ...session, jobId: id, candidateId: nextCandidateId, panelStatus: "editing", reportResult: undefined }));
            }}
            onCandidateChange={(id) => {
              setCandidateId(id);
              const nextJob = jobs.find((job) => job.id === candidates.find((candidate) => candidate.id === id)?.jobId);
              if (nextJob) setJobId(nextJob.id);
              updateSession(activeId, (session) => ({
                ...session,
                candidateId: id,
                jobId: nextJob?.id ?? session.jobId,
              }));
            }}
          />

          <div className="absolute right-3 top-3 z-20">
            <button
              type="button"
              onClick={() => setTasksOpen((value) => !value)}
              aria-label={`查看进行中的任务（${activeTasks.length}）`}
              title="进行中的任务"
              className={cn(
                "flex size-8 items-center justify-center rounded-[10px] border border-line bg-surface text-muted shadow-sm transition-colors hover:text-ink",
                tasksOpen && "text-ink"
              )}
            >
              <Layers3 className="size-4" />
            </button>
            {tasksOpen ? (
              <>
                <button
                  type="button"
                  aria-label="关闭任务列表"
                  className="fixed inset-0 z-[45] cursor-default"
                  onClick={() => setTasksOpen(false)}
                />
                <div className="agent-pop absolute right-0 top-[38px] z-[50] w-[260px] overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
                  <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
                      <Layers3 className="size-3.5" /> 进行中的任务
                      <span className="rounded-full bg-[#f0f2ed] px-1.5 text-[10px] text-muted">{activeTasks.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setTasksOpen(false)}
                      aria-label="关闭"
                      className="flex size-5 items-center justify-center rounded text-muted hover:bg-[#f5f7f2]"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto p-1.5">
                    {activeTasks.length === 0 ? (
                      <div className="px-3 py-8 text-center text-[12px] text-muted">暂无进行中的任务</div>
                    ) : (
                      activeTasks.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => {
                            if (session.id !== activeId) append(session.id, { kind: "divider", label: `您已切换任务 · ${session.title}` });
                            selectSession(session.id);
                            setTasksOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] transition-colors",
                            session.id === activeId ? "bg-pine-soft/60 font-medium text-pine" : "text-ink-soft hover:bg-[#f7f8f4]"
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">{session.title}</span>
                          {session.thinking ? (
                            <span className="size-3 shrink-0 animate-spin rounded-full border border-pine border-r-transparent" />
                          ) : (
                            <span className="text-[10.5px] text-muted">{formatRelativeTime(session.updatedAt)}</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t border-line">
                    <button
                      type="button"
                      onClick={() => {
                        setTasksOpen(false);
                        setHistoryOpen(true);
                      }}
                      className="flex w-full items-center gap-1.5 px-3 py-2.5 text-left text-[11px] text-muted transition-colors hover:bg-[#f5f7f2] hover:text-ink"
                    >
                      <span>历史记录</span>
                      <span className="text-[10px] text-[var(--a-text-4)]">
                        {completedTaskCount > 0 ? `${completedTaskCount} 个已完成任务` : "查看全部任务"}
                      </span>
                      <ArrowUpRight className="ml-auto size-3" />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {activeSession.panel && panelOpen ? (
          <button
            type="button"
            aria-label="关闭可视化面板"
            className="fixed inset-0 z-30 bg-black/25 min-[900px]:hidden"
            onClick={() => setPanelOpen(false)}
          />
        ) : null}
        {activeSession.panel && panelOpen ? (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="拖动调整工作面板宽度"
            onPointerDown={startResize}
            onDoubleClick={() => setPanelWidth(400)}
            className="group relative hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-transparent min-[900px]:flex"
          >
            <span className="h-16 w-[3px] rounded-full bg-line-strong transition-colors group-hover:bg-pine/45" />
          </div>
        ) : null}
        {sessionsWithPanels.map((session) => {
          const visible = session.id === activeId && panelOpen;
          const job = resolveSessionJob(session);
          const candidate = resolveSessionCandidate(session);
          return (
            <div
              key={`${session.id}-${session.panel}-${job?.id ?? "none"}${
                session.panel === "interview" || session.panel === "offer" ? `-${candidate?.id ?? "none"}` : ""
              }`}
              style={{ width: panelWidth, maxWidth: "calc(100vw - 20px)" }}
              className={cn(
                "fixed bottom-0 right-0 top-[106px] z-40 overflow-hidden bg-surface shadow-pop min-[900px]:static min-[900px]:z-auto min-[900px]:h-full min-[900px]:shrink-0 min-[900px]:shadow-none",
                visible ? "flex" : "hidden"
              )}
            >
              <VisualPanel
                kind={session.panel!}
                status={session.panelStatus}
                warning={session.auditWarning}
                sessionKey={`${session.id}-${session.panel}`}
                role={roleFor(session)}
                job={job}
                candidate={candidate}
                departments={departments}
                employees={employees}
                reportResult={session.reportResult}
                redlines={session.redlines}
                redlinesConfirmed={session.redlinesConfirmed}
                onPublishJob={(payload) => void publishJob(session.id, payload)}
                onUpdateJob={(payload) => void updateJobDraft(session.id, payload)}
                onSubmitProfile={(payload) => void saveProfile(session.id, payload)}
                onStartParse={(files) => void generateReport(session.id, files)}
                onCreateInterview={(payload) => void createInterview(session.id, payload)}
                onCreateOffer={(payload) => void createOffer(session.id, payload)}
                onConfirmRedlines={(items) => confirmRedlines(session.id, items)}
              />
            </div>
          );
        })}
      </div>

      <HistoryModal open={historyOpen} sessions={sessions} onClose={() => setHistoryOpen(false)} onOpenSession={selectSession} />
      <CandidateDrawer
        candidateId={candidateDrawerId}
        onClose={() => setCandidateDrawerId(null)}
        onNavigate={(id) => setCandidateDrawerId(id)}
      />

      <div className="sr-only" aria-live="polite">
        当前对话：{activeSession.title}，技能：{skillLabel(activeSession.skill)}，{activeSession.thinking ? "Agent 正在回复" : "输入框已就绪"}
      </div>
    </div>
  );
}
