export type SkillId =
  | "job-publish"
  | "job-profile"
  | "recommend-report"
  | "resume-parse"
  | "interview-plan"
  | "offer-draft"
  | "talent-search"
  | "recruiting-analytics"
  | "message-invite"
  | "compliance-check";

export type PanelKind = "job" | "profile" | "report" | "interview" | "offer" | null;
export type PanelStatus = "editing" | "working" | "done";

export type AgentAction =
  | "continue"
  | "next"
  | "submit-review"
  | "submit-profile"
  | "start-parse"
  | "view-report"
  | "fix-sensitive"
  | "fix-compliance"
  | "generate"
  | "open-panel"
  | "open-job";

export type MessageRole = "user" | "assistant";

export interface TableCell {
  label: string;
  value: string;
  span?: 1 | 2 | 3;
  tone?: "default" | "warning" | "success" | "muted";
}

export interface ActivityStep {
  label: string;
  state: "done" | "running" | "pending" | "warn";
}

export type AgentMessage =
  | { id: string; kind: "text"; role: MessageRole; text: string }
  | { id: string; kind: "meta"; text: string; icon?: "clock" | "check" | "alert" | "spark" | "task"; detail?: string }
  | { id: string; kind: "switch"; skill: SkillId }
  | { id: string; kind: "bullets"; title?: string; items: string[] }
  | {
      id: string;
      kind: "table";
      title?: string;
      rows: TableCell[];
      actionLabel?: string;
      variant?: "grid" | "list";
      trace?: boolean;
    }
  | { id: string; kind: "activity"; title: string; steps: ActivityStep[]; open?: boolean }
  | {
      id: string;
      kind: "actions";
      items: { label: string; action: AgentAction; variant?: "primary" | "ghost"; spent?: boolean }[];
    }
  | { id: string; kind: "success"; title: string; subtitle?: string; href?: string; hrefLabel?: string }
  | {
      id: string;
      kind: "candidates";
      title?: string;
      note?: string;
      items: {
        id: string;
        name: string;
        title: string;
        score: number;
        reason: string;
        stage: string;
      }[];
    }
  | {
      id: string;
      kind: "stats";
      title?: string;
      items: { label: string; value: string; hint?: string; tone?: "default" | "success" | "warning" }[];
    }
  | {
      id: string;
      kind: "compliance";
      title?: string;
      items: { rule: string; excerpt: string; severity: "high" | "medium" }[];
      fixable?: boolean;
    }
  | {
      id: string;
      kind: "redlines";
      title: string;
      items: { id: string; title: string; description: string }[];
      confirmed?: boolean;
    }
  | {
      id: string;
      kind: "candidate-card";
      candidateId: string;
      name: string;
      title: string;
      company: string;
      years: number;
      degree: string;
      school: string;
      skills: string[];
      highlights: string[];
      risks: string[];
    }
  | { id: string; kind: "upload"; files: { name: string; size: string }[]; source?: "user" | "tool" }
  | { id: string; kind: "divider"; label: string }
  | { id: string; kind: "pending"; label: string };

export interface PromptOption {
  title: string;
  description?: string;
  value?: string;
}

export interface AgentPrompt {
  id: string;
  title: string;
  description?: string;
  options: PromptOption[];
  customPlaceholder: string;
  skipLabel?: string;
  action: "delete-task" | "select-job" | "fix-sensitive" | "generic";
  skill?: SkillId;
  query?: string;
  taskLabel?: string;
}

export interface JobDraftPayload {
  title: string;
  departmentId: string;
  locations: string[];
  employment: "全职" | "实习" | "兼职" | "合同制";
  headcount: number;
  salaryMin: string;
  salaryMax: string;
  months: string;
  responsibilities: string;
  requirements: string;
  benefits: string[];
  experience: string;
  education: string;
  skills: string;
}

export interface ProfileDraftPayload {
  selected: string[];
  notes?: { group: string; text: string }[];
}

export interface InterviewDraftPayload {
  candidateId: string;
  date: string;
  start: string;
  end: string;
  interviewerId: string;
  round: string;
  type: "video" | "onsite";
}

export interface OfferDraftPayload {
  salary: string;
  bonus: string;
  startDate: string;
  deadline: string;
  approverId: string;
  note?: string;
}

export interface AgentSession {
  id: string;
  title: string;
  skill: SkillId | null;
  messages: AgentMessage[];
  panel: PanelKind;
  panelStatus: PanelStatus;
  prompt: AgentPrompt | null;
  createdAt: number;
  updatedAt: number;
  openInTab: boolean;
  closedAt?: number;
  thinking?: boolean;
  auditWarning?: boolean;
  jobId?: string;
  candidateId?: string;
  artifactId?: string;
  reportResult?: {
    strong: number;
    medium: number;
    total: number;
    redlineCount?: number;
    top?: { id: string; name: string; score: number; stage: string; title: string }[];
  };
  redlines?: { id: string; title: string; description: string }[];
  redlinesConfirmed?: boolean;
}

export interface SkillDefinition {
  id: SkillId;
  name: string;
  short: string;
  description: string;
  prompt: string;
  category: "招聘流程" | "人才洞察" | "沟通协作" | "数据与合规";
  icon: string;
  tint: string;
  color: string;
}
