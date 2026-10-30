"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  aiGenerations as seedGenerations,
  candidates as seedCandidates,
  departments as seedDepartments,
  employees as seedEmployees,
  interviews as seedInterviews,
  jobs as seedJobs,
  messageTemplates as seedTemplates,
  notifications as seedNotifications,
  offers as seedOffers,
  roles as seedRoles,
  settings as seedSettings,
  tasks as seedTasks,
  permissionModules,
} from "./data";
import type {
  AiGeneration,
  AppSettings,
  Candidate,
  CandidateStage,
  Department,
  Employee,
  Interview,
  InterviewType,
  Job,
  MessageTemplate,
  NotificationRecord,
  Offer,
  OfferStatus,
  Role,
  Task,
} from "./types";
import { nowStamp, uid } from "./utils";

const STORAGE_KEY = "zhipin-qianxun-v1";

interface AppState {
  jobs: Job[];
  candidates: Candidate[];
  interviews: Interview[];
  offers: Offer[];
  employees: Employee[];
  departments: Department[];
  roles: Role[];
  templates: MessageTemplate[];
  notifications: NotificationRecord[];
  tasks: Task[];
  generations: AiGeneration[];
  settings: AppSettings;
}

const initialState: AppState = {
  jobs: seedJobs,
  candidates: seedCandidates,
  interviews: seedInterviews,
  offers: seedOffers,
  employees: seedEmployees,
  departments: seedDepartments,
  roles: seedRoles,
  templates: seedTemplates,
  notifications: seedNotifications,
  tasks: seedTasks,
  generations: seedGenerations,
  settings: seedSettings,
};

interface AppActions {
  addJob: (input: {
    title: string;
    departmentId: string;
    location: string;
    workMode: Job["workMode"];
    employment: Job["employment"];
    salary: string;
    experience: string;
    education: string;
    headcount: number;
    summary: string;
    responsibilities: string[];
    requirements: string[];
    skills: string[];
    status: Job["status"];
    ownerId: string;
    priority: Job["priority"];
  }) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  addCandidate: (input: {
    name: string;
    jobId: string;
    source?: string;
    email?: string;
    phone?: string;
    summary?: string;
    stage?: CandidateStage;
    score?: number;
    tags?: string[];
  }) => Candidate;
  updateCandidate: (id: string, patch: Partial<Candidate>) => void;
  advanceCandidate: (id: string, stage: CandidateStage, note?: string) => void;
  addInterview: (input: {
    candidateId: string;
    jobId: string;
    round: string;
    type: InterviewType;
    date: string;
    start: string;
    end: string;
    interviewers: string[];
    location?: string;
    meetingLink?: string;
  }) => Interview;
  updateInterview: (id: string, patch: Partial<Interview>) => void;
  submitFeedback: (
    interviewId: string,
    feedback: NonNullable<Interview["feedback"]>
  ) => void;
  addOffer: (input: {
    candidateId: string;
    jobId: string;
    salary: string;
    bonus: string;
    startDate: string;
    deadline: string;
    approverId: string;
    note?: string;
  }) => Offer;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  addEmployee: (input: {
    name: string;
    email: string;
    phone: string;
    departmentIds: string[];
    title: string;
    roleIds: string[];
  }) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  addDepartment: (name: string, parentId: string | null, headId?: string) => Department;
  updateDepartment: (id: string, patch: Partial<Department>) => void;
  addRole: (input: { name: string; description: string; color: string }) => Role;
  duplicateRole: (roleId: string) => Role | undefined;
  updateRoleMeta: (roleId: string, patch: Partial<Pick<Role, "name" | "description" | "color">>) => void;
  deleteRole: (roleId: string) => void;
  updateRoleScope: (roleId: string, scope: Role["dataScope"], departmentIds?: string[]) => void;
  updateRolePermissions: (roleId: string, permissions: Record<string, string[]>) => void;
  updateRoleMembers: (roleId: string, memberIds: string[]) => void;
  updateTemplate: (id: string, patch: Partial<MessageTemplate>) => void;
  toggleTemplate: (id: string) => void;
  addTemplate: (input: { name: string; scenario: string; audience: string; channels: MessageTemplate["channels"]; subject: string; emailBody: string; smsBody: string }) => MessageTemplate;
  retryNotification: (id: string) => void;
  addGeneration: (input: Omit<AiGeneration, "id" | "createdAt">) => AiGeneration;
  toggleTask: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateCompany: (patch: Partial<AppSettings["company"]>) => void;
  resetDemo: () => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          roles: (parsed.roles ?? prev.roles).map((r) => ({
            ...r,
            dataScope: r.dataScope ?? (r.id === "r5" ? "dept" : r.id === "r4" || r.id === "r7" ? "self" : "all"),
            permissions: r.system
              ? Object.fromEntries(permissionModules.map((module) => [module.key, [...module.actions]]))
              : r.permissions,
          })),
          settings: parsed.settings ?? prev.settings,
        }));
      }
    } catch {
      // A corrupt local snapshot should never block the demo.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in the demo.
    }
  }, [state, hydrated]);

  const addJob = useCallback<AppActions["addJob"]>((input) => {
    const newJob: Job = {
      id: uid("job"),
      code: `J-${1054 + Math.floor(Math.random() * 800)}`,
      title: input.title,
      departmentId: input.departmentId,
      location: input.location,
      workMode: input.workMode,
      employment: input.employment,
      status: input.status,
      ownerId: input.ownerId,
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30",
      headcount: input.headcount,
      hired: 0,
      salary: input.salary,
      experience: input.experience,
      education: input.education,
      summary: input.summary,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      skills: input.skills,
      stages: [
        { key: "screen", name: "简历筛选", type: "screen" },
        { key: "first", name: "初试", type: "interview", aiEnabled: true },
        { key: "second", name: "复试", type: "interview" },
        { key: "final", name: "终面", type: "interview" },
        { key: "offer", name: "Offer", type: "offer" },
      ],
      candidateCount: 0,
      newThisWeek: 0,
      priority: input.priority,
      aiProfile: {
        radar: [
          { label: "业务洞察", value: 82 },
          { label: "专业深度", value: 84 },
          { label: "协作影响", value: 78 },
          { label: "成长潜力", value: 80 },
          { label: "文化契合", value: 82 },
        ],
        mustHave: input.requirements.slice(0, 3),
        niceToHave: input.skills.slice(0, 3),
        teamStyle: "以结果为导向的小团队，强调主动性与高质量协作。",
        successProfile: "入职 6 个月内独立负责核心模块并交付可量化结果。",
      },
    };
    setState((prev) => ({ ...prev, jobs: [newJob, ...prev.jobs] }));
    return newJob;
  }, []);

  const updateJob = useCallback<AppActions["updateJob"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: "2026-10-30" } : j)),
    }));
  }, []);

  const addCandidate = useCallback<AppActions["addCandidate"]>((input) => {
    const job = state.jobs.find((j) => j.id === input.jobId);
    const newCandidate: Candidate = {
      id: uid("cand"),
      name: input.name,
      gender: "女",
      age: 28,
      years: 4,
      degree: "本科",
      school: "待补充",
      major: "待补充",
      currentCompany: "待补充",
      currentTitle: "待补充",
      location: "北京",
      email: input.email ?? "candidate@example.com",
      phone: input.phone ?? "138 0000 0000",
      source: input.source ?? "手动添加",
      jobId: input.jobId,
      stage: input.stage ?? "screening",
      score: input.score ?? 76,
      tags: input.tags ?? ["新简历"],
      summary: input.summary ?? "简历已上传，AI 正在提取关键信息。",
      experience: [],
      education: [],
      skills: [],
      expectedSalary: "面议",
      availability: "待沟通",
      appliedAt: "2026-10-30",
      ownerId: "emp-1",
      timeline: [{ id: uid("tl"), at: nowStamp(), title: "候选人已添加", note: job?.title, tone: "default" }],
      interviewIds: [],
      ai: {
        headline: "简历解析中",
        highlights: ["等待 AI 完成结构化解析"],
        risks: [],
        fit: "AI 将在简历解析完成后给出岗位匹配分析。",
        questions: [],
      },
    };
    setState((prev) => ({
      ...prev,
      candidates: [newCandidate, ...prev.candidates],
      jobs: prev.jobs.map((j) => (j.id === input.jobId ? { ...j, candidateCount: j.candidateCount + 1, newThisWeek: j.newThisWeek + 1 } : j)),
      notifications: [
        {
          id: uid("ntf"),
          recipient: newCandidate.name,
          recipientEmail: newCandidate.email,
          scenario: "简历投递",
          jobId: input.jobId,
          templateId: "tpl-5",
          channel: "email",
          status: "delivered",
          sentAt: "2026-10-30 11:30",
          operator: "林岚",
        },
        ...prev.notifications,
      ],
    }));
    return newCandidate;
  }, [state.jobs]);

  const updateCandidate = useCallback<AppActions["updateCandidate"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const advanceCandidate = useCallback<AppActions["advanceCandidate"]>((id, stage, note) => {
    const candidate = state.candidates.find((c) => c.id === id);
    const stageLabel: Record<CandidateStage, string> = {
      screening: "待筛选",
      interview: "面试中",
      offer: "Offer",
      hired: "已入职",
      archived: "已归档",
    };
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === id
          ? {
              ...c,
              stage,
              timeline: [
                ...c.timeline,
                {
                  id: uid("tl"),
                  at: nowStamp(),
                  title: `推进至${stageLabel[stage]}`,
                  note,
                  tone: stage === "hired" ? "success" : "default",
                },
              ],
            }
          : c
      ),
      jobs:
        stage === "hired" && candidate
          ? prev.jobs.map((j) => (j.id === candidate.jobId ? { ...j, hired: Math.min(j.headcount, j.hired + 1) } : j))
          : prev.jobs,
    }));
  }, [state.candidates]);

  const addInterview = useCallback<AppActions["addInterview"]>((input) => {
    const newInterview: Interview = {
      id: uid("int"),
      candidateId: input.candidateId,
      jobId: input.jobId,
      round: input.round,
      type: input.type,
      date: input.date,
      start: input.start,
      end: input.end,
      interviewers: input.interviewers,
      status: "pending",
      location: input.location,
      meetingLink: input.meetingLink,
    };
    setState((prev) => ({
      ...prev,
      interviews: [newInterview, ...prev.interviews],
      notifications: [
        {
          id: uid("ntf"),
          recipient: prev.candidates.find((c) => c.id === input.candidateId)?.name ?? "候选人",
          recipientEmail: prev.candidates.find((c) => c.id === input.candidateId)?.email ?? "candidate@example.com",
          scenario: "面试邀约",
          jobId: input.jobId,
          templateId: input.type === "onsite" ? "tpl-2" : "tpl-1",
          channel: "email",
          status: "delivered",
          sentAt: "2026-10-30 11:30",
          operator: "林岚",
        },
        ...prev.notifications,
      ],
      candidates: prev.candidates.map((c) =>
        c.id === input.candidateId
          ? {
              ...c,
              stage: c.stage === "screening" ? "interview" : c.stage,
              interviewIds: [...c.interviewIds, newInterview.id],
              timeline: [
                ...c.timeline,
                {
                  id: uid("tl"),
                  at: nowStamp(),
                  title: `安排${input.round}面试`,
                  note: `${input.date} ${input.start} · ${input.type === "ai" ? "数字人面试" : input.type === "video" ? "视频面试" : input.type === "onsite" ? "现场面试" : "电话面试"}`,
                  tone: "default",
                },
              ],
            }
          : c
      ),
    }));
    return newInterview;
  }, []);

  const updateInterview = useCallback<AppActions["updateInterview"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      interviews: prev.interviews.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  }, []);

  const submitFeedback = useCallback<AppActions["submitFeedback"]>((interviewId, feedback) => {
    const interview = state.interviews.find((i) => i.id === interviewId);
    setState((prev) => ({
      ...prev,
      interviews: prev.interviews.map((i) => (i.id === interviewId ? { ...i, feedback, status: "done" } : i)),
      candidates: interview
        ? prev.candidates.map((c) =>
            c.id === interview.candidateId
              ? {
                  ...c,
                  timeline: [
                    ...c.timeline,
                    {
                      id: uid("tl"),
                      at: nowStamp(),
                      title: `${interview.round}面试反馈已提交`,
                      note: `${feedback.rating} 星 · ${feedback.note.slice(0, 32)}${feedback.note.length > 32 ? "…" : ""}`,
                      tone: feedback.recommendation === "no" ? "warning" : "success",
                    },
                  ],
                }
              : c
          )
        : prev.candidates,
    }));
  }, [state.interviews]);

  const addOffer = useCallback<AppActions["addOffer"]>((input) => {
    const newOffer: Offer = {
      id: uid("off"),
      candidateId: input.candidateId,
      jobId: input.jobId,
      status: "draft",
      salary: input.salary,
      bonus: input.bonus,
      startDate: input.startDate,
      deadline: input.deadline,
      approverId: input.approverId,
      createdAt: "2026-10-30",
      note: input.note,
    };
    setState((prev) => ({
      ...prev,
      offers: [newOffer, ...prev.offers],
      notifications: [
        {
          id: uid("ntf"),
          recipient: prev.candidates.find((c) => c.id === input.candidateId)?.name ?? "候选人",
          recipientEmail: prev.candidates.find((c) => c.id === input.candidateId)?.email ?? "candidate@example.com",
          scenario: "Offer",
          jobId: input.jobId,
          templateId: "tpl-4",
          channel: "email",
          status: "queued",
          sentAt: "2026-10-30 11:30",
          operator: "林岚",
        },
        ...prev.notifications,
      ],
      candidates: prev.candidates.map((c) =>
        c.id === input.candidateId
          ? {
              ...c,
              stage: "offer",
              timeline: [
                ...c.timeline,
                { id: uid("tl"), at: nowStamp(), title: "Offer 已创建", note: `${input.salary} · ${input.startDate} 入职`, tone: "default" },
              ],
            }
          : c
      ),
    }));
    return newOffer;
  }, []);

  const updateOffer = useCallback<AppActions["updateOffer"]>((id, patch: Partial<Offer>) => {
    setState((prev) => ({
      ...prev,
      offers: prev.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }, []);

  const addEmployee = useCallback<AppActions["addEmployee"]>((input) => {
    const employee: Employee = {
      id: uid("emp"),
      name: input.name,
      email: input.email,
      phone: input.phone,
      departmentId: input.departmentIds[0],
      departmentIds: input.departmentIds,
      title: input.title,
      roleIds: input.roleIds,
      status: "invited",
      joinedAt: "2026-10-30",
      lastActive: "未登录",
    };
    setState((prev) => ({ ...prev, employees: [employee, ...prev.employees] }));
    return employee;
  }, []);

  const updateEmployee = useCallback<AppActions["updateEmployee"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const addDepartment = useCallback<AppActions["addDepartment"]>((name, parentId, headId) => {
    const dept: Department = { id: uid("dept"), name, parentId, headId, color: "#4b7c66" };
    setState((prev) => ({
      ...prev,
      departments: [...prev.departments, dept],
      employees: headId
        ? prev.employees.map((e) => e.id === headId
          ? {
              ...e,
              departmentIds: Array.from(new Set([...(e.departmentIds ?? []), dept.id])),
              roleIds: Array.from(new Set([...e.roleIds, "r5"])),
            }
          : e)
        : prev.employees,
    }));
    return dept;
  }, []);

  const updateDepartment = useCallback<AppActions["updateDepartment"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      departments: prev.departments.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      employees: patch.headId
        ? prev.employees.map((e) => e.id === patch.headId
          ? {
              ...e,
              departmentIds: Array.from(new Set([...(e.departmentIds ?? []), id])),
              roleIds: Array.from(new Set([...e.roleIds, "r5"])),
            }
          : e)
        : prev.employees,
    }));
  }, []);

  const addRole = useCallback<AppActions["addRole"]>((input) => {
    const role: Role = {
      id: uid("role"),
      name: input.name,
      description: input.description,
      color: input.color,
      memberIds: [],
      dataScope: "self",
      permissions: {
        dashboard: ["view"],
        jobs: ["view"],
        candidates: ["view"],
        interviews: ["view"],
        pipeline: [],
        messages: [],
        ai: [],
        org: [],
        roles: [],
        settings: [],
      },
    };
    setState((prev) => ({ ...prev, roles: [...prev.roles, role] }));
    return role;
  }, []);

  const duplicateRole = useCallback<AppActions["duplicateRole"]>((roleId) => {
    const source = state.roles.find((r) => r.id === roleId);
    if (!source) return undefined;
    const copy: Role = {
      ...source,
      id: uid("role"),
      name: `${source.name} 副本`,
      system: false,
      memberIds: [],
    };
    setState((prev) => ({ ...prev, roles: [...prev.roles, copy] }));
    return copy;
  }, [state.roles]);

  const updateRolePermissions = useCallback<AppActions["updateRolePermissions"]>((roleId, permissions) => {
    setState((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => (r.id === roleId ? { ...r, permissions } : r)),
    }));
  }, []);

  const updateRoleMeta = useCallback<AppActions["updateRoleMeta"]>((roleId, patch) => {
    setState((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => (r.id === roleId ? { ...r, ...patch } : r)),
    }));
  }, []);

  const deleteRole = useCallback<AppActions["deleteRole"]>((roleId) => {
    setState((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.id !== roleId),
      employees: prev.employees.map((e) => ({ ...e, roleIds: e.roleIds.filter((id) => id !== roleId) })),
    }));
  }, []);

  const updateRoleScope = useCallback<AppActions["updateRoleScope"]>((roleId, scope, departmentIds) => {
    setState((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => (r.id === roleId ? { ...r, dataScope: scope, dataScopeDepartments: departmentIds ?? r.dataScopeDepartments } : r)),
    }));
  }, []);

  const updateRoleMembers = useCallback<AppActions["updateRoleMembers"]>((roleId, memberIds) => {
    setState((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => (r.id === roleId ? { ...r, memberIds } : r)),
      employees: prev.employees.map((e) => ({
        ...e,
        roleIds: memberIds.includes(e.id)
          ? Array.from(new Set([...e.roleIds, roleId]))
          : e.roleIds.filter((id) => id !== roleId),
      })),
    }));
  }, []);

  const updateTemplate = useCallback<AppActions["updateTemplate"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: "2026-10-30 11:08" } : t)),
    }));
  }, []);

  const toggleTemplate = useCallback<AppActions["toggleTemplate"]>((id) => {
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === id ? { ...t, enabled: !t.enabled, updatedAt: "2026-10-30 11:08" } : t)),
    }));
  }, []);

  const addTemplate = useCallback<AppActions["addTemplate"]>((input) => {
    const template: MessageTemplate = {
      id: uid("tpl"),
      name: input.name,
      code: `TPL-${Math.floor(1000 + Math.random() * 8999)}`,
      scenario: input.scenario,
      audience: input.audience,
      channels: input.channels,
      enabled: true,
      updatedAt: "2026-10-30 11:08",
      creator: "林岚",
      subject: input.subject,
      emailBody: input.emailBody,
      smsBody: input.smsBody,
      variables: ["candidate_name", "company", "job_title"],
    };
    setState((prev) => ({ ...prev, templates: [template, ...prev.templates] }));
    return template;
  }, []);

  const retryNotification = useCallback<AppActions["retryNotification"]>((id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, status: "delivered", error: undefined, sentAt: "2026-10-30 11:12" } : n
      ),
    }));
  }, []);

  const addGeneration = useCallback<AppActions["addGeneration"]>((input) => {
    const generation: AiGeneration = {
      ...input,
      id: uid("gen"),
      createdAt: "今天 11:20",
    };
    setState((prev) => ({ ...prev, generations: [generation, ...prev.generations] }));
    return generation;
  }, []);

  const toggleTask = useCallback<AppActions["toggleTask"]>((id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }, []);

  const updateSettings = useCallback<AppActions["updateSettings"]>((patch) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...patch,
        company: { ...prev.settings.company, ...(patch.company ?? {}) },
        recruit: { ...prev.settings.recruit, ...(patch.recruit ?? {}) },
        upload: { ...prev.settings.upload, ...(patch.upload ?? {}) },
      },
    }));
  }, []);

  const updateCompany = useCallback<AppActions["updateCompany"]>((patch) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, company: { ...prev.settings.company, ...patch } },
    }));
  }, []);

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addJob,
      updateJob,
      addCandidate,
      updateCandidate,
      advanceCandidate,
      addInterview,
      updateInterview,
      submitFeedback,
      addOffer,
      updateOffer,
      addEmployee,
      updateEmployee,
      addDepartment,
      updateDepartment,
      addRole,
      duplicateRole,
      updateRoleMeta,
      updateRoleScope,
      deleteRole,
      updateRolePermissions,
      updateRoleMembers,
      updateTemplate,
      toggleTemplate,
      addTemplate,
      retryNotification,
      addGeneration,
      toggleTask,
      updateSettings,
      updateCompany,
      resetDemo,
    }),
    [
      state,
      addJob,
      updateJob,
      addCandidate,
      updateCandidate,
      advanceCandidate,
      addInterview,
      updateInterview,
      submitFeedback,
      addOffer,
      updateOffer,
      addEmployee,
      updateEmployee,
      addDepartment,
      updateDepartment,
      addRole,
      duplicateRole,
      updateRoleMeta,
      updateRoleScope,
      deleteRole,
      updateRolePermissions,
      updateRoleMembers,
      updateTemplate,
      toggleTemplate,
      addTemplate,
      retryNotification,
      addGeneration,
      toggleTask,
      updateSettings,
      updateCompany,
      resetDemo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useLookup() {
  const { employees, departments, jobs, candidates } = useApp();
  return {
    employee: (id: string) => employees.find((e) => e.id === id),
    department: (id: string) => departments.find((d) => d.id === id),
    job: (id: string) => jobs.find((j) => j.id === id),
    candidate: (id: string) => candidates.find((c) => c.id === id),
  };
}
