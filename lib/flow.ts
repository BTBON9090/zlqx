import type { FlowStep, FlowStepType, FlowTemplate, JobStage } from "./types";
import { uid } from "./utils";

export const flowStepMeta: Record<
  FlowStepType,
  { label: string; description: string; triggerClass: string; chipClass: string; dotClass: string }
> = {
  screen: {
    label: "简历筛选",
    description: "自动解析简历并按岗位匹配度排序",
    triggerClass: "border-line bg-[#f3f5f1] text-ink-soft",
    chipClass: "border-line bg-[#fafbf8] text-muted",
    dotClass: "bg-[#98a29a]",
  },
  ai: {
    label: "数字人面试",
    description: "AI 智能初筛 · 自动生成纪要与评分",
    triggerClass: "border-info/20 bg-info-soft text-info-ink",
    chipClass: "border-info/15 bg-info-soft/60 text-info-ink",
    dotClass: "bg-info-ink",
  },
  business: {
    label: "业务面试",
    description: "用人部门与直属上级参与评估",
    triggerClass: "border-pine/20 bg-pine-soft text-pine",
    chipClass: "border-pine/15 bg-pine-soft/55 text-pine",
    dotClass: "bg-pine",
  },
  cross: {
    label: "交叉面试",
    description: "跨团队验证专业能力与协作方式",
    triggerClass: "border-amber/25 bg-amber-soft text-amber-deep",
    chipClass: "border-amber/20 bg-amber-soft/60 text-amber-deep",
    dotClass: "bg-amber",
  },
  hr: {
    label: "人力面试",
    description: "动机、稳定性、文化匹配与薪资预期",
    triggerClass: "border-success/20 bg-[#e9f4ea] text-success",
    chipClass: "border-success/15 bg-[#eef7ef] text-success",
    dotClass: "bg-success",
  },
  offer: {
    label: "Offer 审批",
    description: "发起薪资方案并进入审批链",
    triggerClass: "border-amber/25 bg-amber-soft/60 text-amber-deep",
    chipClass: "border-amber/20 bg-amber-soft/55 text-amber-deep",
    dotClass: "bg-amber-deep",
  },
};

export const flowStepTypes = Object.keys(flowStepMeta) as FlowStepType[];

export function newFlowStep(type: FlowStepType = "business"): FlowStep {
  return { id: uid("step"), type, name: flowStepMeta[type].label };
}

export const initialFlowTemplates: FlowTemplate[] = [
  {
    id: "flow-1",
    name: "标准招聘流程",
    description: "适用于大多数全职岗位：简历筛选 → 数字人初试 → 业务面试 → 终面 → Offer。",
    enabled: true,
    isDefault: true,
    linkedJobs: 7,
    updatedAt: "2026-10-28",
    steps: [
      { id: "fs-1-1", type: "screen", name: "简历筛选" },
      { id: "fs-1-2", type: "ai", name: "数字人初试" },
      { id: "fs-1-3", type: "business", name: "业务面试", departmentId: "dept-11", interviewerId: "emp-3" },
      { id: "fs-1-4", type: "business", name: "终面", departmentId: "dept-1", interviewerId: "emp-1" },
      { id: "fs-1-5", type: "offer", name: "Offer 审批" },
    ],
  },
  {
    id: "flow-2",
    name: "产品与设计流程",
    description: "增加作品集评审与交叉面试，适合产品、设计类岗位。",
    enabled: true,
    linkedJobs: 2,
    updatedAt: "2026-10-26",
    steps: [
      { id: "fs-2-1", type: "screen", name: "简历筛选" },
      { id: "fs-2-2", type: "screen", name: "作品集评审" },
      { id: "fs-2-3", type: "ai", name: "数字人初试" },
      { id: "fs-2-4", type: "cross", name: "交叉面试", departmentId: "dept-1", interviewerId: "emp-3" },
      { id: "fs-2-5", type: "business", name: "业务终面", departmentId: "dept-11", interviewerId: "emp-9" },
      { id: "fs-2-6", type: "offer", name: "Offer 审批" },
    ],
  },
  {
    id: "flow-3",
    name: "技术岗位流程",
    description: "技术初筛 + 两轮技术面 + 交叉面，重点验证工程能力。",
    enabled: true,
    linkedJobs: 3,
    updatedAt: "2026-10-24",
    steps: [
      { id: "fs-3-1", type: "screen", name: "简历筛选" },
      { id: "fs-3-2", type: "ai", name: "数字人初试" },
      { id: "fs-3-3", type: "business", name: "技术一面", departmentId: "dept-1", interviewerId: "emp-8" },
      { id: "fs-3-4", type: "business", name: "技术二面", departmentId: "dept-1", interviewerId: "emp-7" },
      { id: "fs-3-5", type: "cross", name: "交叉面", departmentId: "dept-1", interviewerId: "emp-3" },
      { id: "fs-3-6", type: "offer", name: "Offer 审批" },
    ],
  },
  {
    id: "flow-4",
    name: "实习生快速流程",
    description: "一轮业务面 + 人力面，适合实习与校招岗位。",
    enabled: false,
    linkedJobs: 0,
    updatedAt: "2026-10-18",
    steps: [
      { id: "fs-4-1", type: "screen", name: "简历筛选" },
      { id: "fs-4-2", type: "business", name: "业务面试", departmentId: "dept-3", interviewerId: "emp-11" },
      { id: "fs-4-3", type: "hr", name: "人力面试", departmentId: "dept-4", interviewerId: "emp-1" },
      { id: "fs-4-4", type: "offer", name: "Offer 审批" },
    ],
  },
];

export function countInterviewRounds(template: FlowTemplate) {
  return template.steps.filter((step) => step.type !== "screen" && step.type !== "offer").length;
}

export function hasAiStep(template: FlowTemplate) {
  return template.steps.some((step) => step.type === "ai");
}

export function flowTemplateToStages(template: FlowTemplate): JobStage[] {
  return template.steps.map((step, index) => {
    const base = {
      key: `${step.type}-${index + 1}-${step.id}`,
      name: step.name,
      type: step.type === "screen" ? ("screen" as const) : step.type === "offer" ? ("offer" as const) : ("interview" as const),
    };
    return step.type === "ai" ? { ...base, aiEnabled: true } : base;
  });
}
