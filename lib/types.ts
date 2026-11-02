export type JobStatus = "draft" | "reviewing" | "active" | "closed" | "paused";
export type CandidateStage = "screening" | "interview" | "offer" | "hired" | "archived";
export type InterviewType = "video" | "onsite" | "phone" | "ai";
export type InterviewStatus = "pending" | "confirmed" | "done" | "cancelled";
export type OfferStatus = "draft" | "approving" | "sent" | "accepted" | "declined";
export type NotificationStatus = "delivered" | "read" | "failed" | "queued";
export type EmployeeStatus = "active" | "invited" | "disabled";

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  headId?: string;
  color?: string;
}

export interface JobStage {
  key: string;
  name: string;
  type: "screen" | "interview" | "offer";
  aiEnabled?: boolean;
}

export interface Job {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  location: string;
  workMode: "onsite" | "hybrid" | "remote";
  employment: "fulltime" | "intern" | "contract";
  status: JobStatus;
  ownerId: string;
  assistantIds?: string[];
  createdAt: string;
  updatedAt: string;
  headcount: number;
  hired: number;
  salary: string;
  experience: string;
  education: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  stages: JobStage[];
  candidateCount: number;
  newThisWeek: number;
  priority: "high" | "normal";
  aiProfile: {
    radar: { label: string; value: number }[];
    mustHave: string[];
    niceToHave: string[];
    teamStyle: string;
    successProfile: string;
  };
}

export interface ExperienceItem {
  company: string;
  title: string;
  period: string;
  summary?: string;
}

export interface Candidate {
  id: string;
  name: string;
  gender: "男" | "女";
  age: number;
  years: number;
  degree: string;
  school: string;
  major: string;
  currentCompany: string;
  currentTitle: string;
  location: string;
  email: string;
  phone: string;
  source: string;
  jobId: string;
  stage: CandidateStage;
  score: number;
  tags: string[];
  summary: string;
  experience: ExperienceItem[];
  education: { school: string; degree: string; major: string; period: string }[];
  skills: string[];
  expectedSalary: string;
  availability: string;
  appliedAt: string;
  ownerId: string;
  timeline: { id: string; at: string; title: string; note?: string; tone?: "default" | "success" | "warning" }[];
  interviewIds: string[];
  ai: {
    headline: string;
    highlights: string[];
    risks: string[];
    fit: string;
    questions: string[];
  };
  note?: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  round: string;
  type: InterviewType;
  date: string;
  start: string;
  end: string;
  interviewers: string[];
  status: InterviewStatus;
  meetingLink?: string;
  location?: string;
  feedback?: {
    rating: number;
    recommendation: "strong_yes" | "yes" | "neutral" | "no";
    note: string;
    submittedAt: string;
    submittedBy: string;
  };
  aiSummary?: string;
}

export interface Offer {
  id: string;
  candidateId: string;
  jobId: string;
  status: OfferStatus;
  salary: string;
  bonus: string;
  startDate: string;
  deadline: string;
  approverId: string;
  createdAt: string;
  note?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentIds?: string[];
  title: string;
  roleIds: string[];
  status: EmployeeStatus;
  joinedAt: string;
  lastActive: string;
  managerId?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  system?: boolean;
  color: string;
  memberIds: string[];
  permissions: Record<string, string[]>;
  dataScope: "all" | "dept" | "self" | "custom";
  dataScopeDepartments?: string[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  code: string;
  scenario: string;
  audience: string;
  channels: ("email" | "sms" | "inapp")[];
  enabled: boolean;
  updatedAt: string;
  creator: string;
  subject: string;
  emailBody: string;
  smsBody: string;
  variables: string[];
}

export interface NotificationRecord {
  id: string;
  recipient: string;
  recipientEmail: string;
  scenario: string;
  jobId: string;
  templateId: string;
  channel: "email" | "sms" | "inapp";
  status: NotificationStatus;
  sentAt: string;
  operator: string;
  error?: string;
}

export interface AiGeneration {
  id: string;
  type: "jd" | "profile" | "report" | "interview";
  title: string;
  subtitle: string;
  createdAt: string;
  status: "ready" | "draft";
  jobId?: string;
  candidateId?: string;
}

export interface Task {
  id: string;
  title: string;
  due: string;
  done: boolean;
  tone: "signal" | "amber" | "pine";
}

export interface AppSettings {
  company: {
    name: string;
    shortName: string;
    industry: string;
    size: string;
    stage: string;
    address: string;
    code: string;
    website: string;
    intro: string;
    verified: boolean;
    businessVerified: boolean;
    recruitAuthorized: boolean;
  };
  recruit: {
    senderName: string;
    senderEmail: string;
    defaultDuration: number;
    autoArchiveDays: number;
    aiScreening: boolean;
    requireFeedback: boolean;
    offerApproval: boolean;
  };
  upload: {
    maxSize: number;
    formats: string[];
    retentionDays: number;
    used: number;
    quota: number;
  };
}
