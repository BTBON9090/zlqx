"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheckBig,
  FileText,
  FileUp,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTip } from "@/components/ui/info-tip";
import type { Candidate, Department, Employee, Job } from "@/lib/types";
import type {
  InterviewDraftPayload,
  JobDraftPayload,
  OfferDraftPayload,
  PanelKind,
  PanelStatus,
  ProfileDraftPayload,
} from "./types";

const inputClass =
  "h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-[13.5px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-line-strong focus:ring-4 focus:ring-[#e9ede6]";

const textareaClass =
  "w-full resize-y rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[13.5px] leading-6 text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-line-strong focus:ring-4 focus:ring-[#e9ede6]";

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-[13.5px] font-semibold text-ink", className)}>
      <span className="h-3 w-[3px] rounded-full bg-[var(--a-text-1)]" />
      {children}
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-0.5 text-[13px] font-medium text-ink-soft">
      {children}
      {required ? <span className="text-[var(--a-red)]">*</span> : null}
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className={cn("h-10 text-[13.5px]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VisualPanel({
  kind,
  status,
  warning,
  sessionKey,
  role,
  job,
  candidate,
  departments,
  employees,
  reportResult,
  redlines,
  redlinesConfirmed,
  onPublishJob,
  onUpdateJob,
  onSubmitProfile,
  onStartParse,
  onCreateInterview,
  onCreateOffer,
  onConfirmRedlines,
}: {
  kind: Exclude<PanelKind, null>;
  status: PanelStatus;
  warning?: boolean;
  sessionKey: string;
  role: string;
  job?: Job;
  candidate?: Candidate;
  departments: Department[];
  employees: Employee[];
  reportResult?: {
    strong: number;
    medium: number;
    total: number;
    redlineCount?: number;
    top?: { id: string; name: string; score: number; stage: string; title: string }[];
  };
  redlines?: { id: string; title: string; description: string }[];
  redlinesConfirmed?: boolean;
  onPublishJob: (payload: JobDraftPayload) => void;
  onUpdateJob: (payload: JobDraftPayload) => void;
  onSubmitProfile: (payload: ProfileDraftPayload) => void;
  onStartParse: (files: { name: string; size: string }[]) => void;
  onCreateInterview: (payload: InterviewDraftPayload) => void;
  onCreateOffer: (payload: OfferDraftPayload) => void;
  onConfirmRedlines: (items: { id: string; title: string; description: string }[]) => void;
}) {
  const title =
    kind === "job"
      ? `创建职位 · ${role}`
      : kind === "profile"
        ? `职位画像 · ${role}`
        : kind === "report"
          ? `推荐报告 · ${role}`
          : kind === "interview"
            ? `安排面试 · ${candidate?.name ?? "候选人"}`
            : `Offer 起草 · ${candidate?.name ?? "候选人"}`;

  return (
    <aside aria-label="Agent 工作面板" className="flex h-full w-full flex-col overflow-hidden border-l border-line bg-surface">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-4">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            status === "working"
              ? "bg-amber shadow-[0_0_0_3px_rgba(183,121,31,.12)]"
              : status === "done" || warning
                ? "bg-[var(--success)] shadow-[0_0_0_3px_rgba(74,79,75,.12)]"
                : "bg-pine shadow-[0_0_0_3px_rgba(21,22,23,.1)]"
          )}
        />
        <h2 className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">{title}</h2>
      </div>

      {kind === "job" ? (
        <JobPublishPanel
          key={sessionKey}
          role={role}
          job={job}
          departments={departments}
          status={status}
          onPublish={onPublishJob}
          onUpdate={onUpdateJob}
        />
      ) : null}
      {kind === "profile" ? (
        <ProfilePanel key={sessionKey} status={status} job={job} onSubmit={onSubmitProfile} />
      ) : null}
      {kind === "report" ? (
        <ReportPanel
          key={sessionKey}
          status={status}
          job={job}
          reportResult={reportResult}
          redlines={redlines}
          redlinesConfirmed={redlinesConfirmed}
          onStartParse={onStartParse}
          onConfirmRedlines={onConfirmRedlines}
        />
      ) : null}
      {kind === "interview" ? (
        <InterviewPanel
          key={sessionKey}
          status={status}
          job={job}
          candidate={candidate}
          employees={employees}
          onCreate={onCreateInterview}
        />
      ) : null}
      {kind === "offer" ? (
        <OfferPanel
          key={sessionKey}
          status={status}
          job={job}
          candidate={candidate}
          employees={employees}
          onCreate={onCreateOffer}
        />
      ) : null}
    </aside>
  );
}

function PanelFooter({
  children,
  note,
}: {
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="shrink-0 border-t border-[var(--a-border-1)] bg-white px-4 py-3">
      {note ? <p className="mb-2 text-center text-[10px] text-[var(--a-text-4)]">{note}</p> : null}
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Button type="button" className="w-full" onClick={onClick} disabled={disabled || loading}>
      {loading ? <Loader2 className="animate-spin" /> : <Check />}
      {children}
    </Button>
  );
}

function JobPublishPanel({
  role,
  job,
  departments,
  status,
  onPublish,
  onUpdate,
}: {
  role: string;
  job?: Job;
  departments: Department[];
  status: PanelStatus;
  onPublish: (payload: JobDraftPayload) => void;
  onUpdate: (payload: JobDraftPayload) => void;
}) {
  const created = status === "done";
  const seeded = created ? job : undefined;
  const defaultTitle = seeded?.title ?? role;
  const [company] = useState("澄明科技（北京）有限公司 · 人工智能 · 企业服务");
  const suggestedDepartment = /测试|工程师|算法|前端|后端|开发/.test(role)
    ? departments.find((department) => department.name.includes("研发"))?.id
    : undefined;
  const [departmentId, setDepartmentId] = useState(suggestedDepartment ?? job?.departmentId ?? departments[0]?.id ?? "dept-1");
  const [employment, setEmployment] = useState(job?.employment === "intern" ? "实习" : job?.employment === "contract" ? "合同制" : "全职");
  const [headcount, setHeadcount] = useState(job?.headcount ?? 3);
  const [title, setTitle] = useState(defaultTitle);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [responsibilities, setResponsibilities] = useState(() => {
    if (seeded?.responsibilities.length) return seeded.responsibilities.join("\n");
    if (/设计/.test(role)) {
      return "1. 负责招聘产品核心流程的体验设计与视觉规范建设；\n2. 与产品、研发协作推进方案落地，持续打磨关键交互；\n3. 参与设计评审，沉淀可复用的组件与设计模式。";
    }
    if (/产品经理/.test(role)) {
      return "1. 负责 AI 招聘产品的需求分析与产品规划；\n2. 深入客户场景，推动关键能力从 0 到 1 落地；\n3. 协同设计、研发与交付团队，持续验证产品价值。";
    }
    return "1. 负责核心招聘产品的测试策略设计与质量保障；\n2. 推动自动化测试体系与持续集成建设；\n3. 参与需求评审，识别质量风险并推动闭环。";
  });
  const [requirements, setRequirements] = useState(() => {
    if (seeded?.requirements.length) return seeded.requirements.join("\n");
    if (/设计/.test(role)) {
      return "1. 3 年以上 B 端产品设计经验；\n2. 具备完整的交互与视觉作品集；\n3. 熟悉设计系统与组件化协作方式。";
    }
    if (/产品经理/.test(role)) {
      return "1. 5 年以上 B 端产品经验，有 AI 产品落地案例；\n2. 具备较强的业务抽象与跨团队推动能力；\n3. 有 HR SaaS 或招聘行业经验优先。";
    }
    return "1. 5 年以上软件测试经验，3 年以上测试开发经验；\n2. 熟悉自动化测试框架与性能测试；\n3. 有 B 端 SaaS 产品经验优先。";
  });
  const [polishing, setPolishing] = useState(false);
  const [locations, setLocations] = useState<string[]>(() => {
    if (seeded?.location) return seeded.location.split(/\s*\/\s*/).filter(Boolean).slice(0, 3);
    return ["北京市 · 海淀区"];
  });
  const salaryRange = seeded?.salary.match(/(\d+)\s*[kK]?\s*[-–]\s*(\d+)\s*[kK]?/);
  const salaryMonths = seeded?.salary.match(/(\d+)\s*薪/);
  const [salaryMin, setSalaryMin] = useState(salaryRange ? `${salaryRange[1]}k` : "25k");
  const [salaryMax, setSalaryMax] = useState(salaryRange ? `${salaryRange[2]}k` : "40k");
  const [months, setMonths] = useState(salaryMonths ? `${salaryMonths[1]}薪` : "14薪");
  const [benefits, setBenefits] = useState<string[]>([
    "五险一金",
    "定期体检",
    "带薪年假",
    "年终奖",
    "餐饮补贴",
    "节日福利",
    "股票期权",
    "周末双休",
  ]);
  const [experience, setExperience] = useState(job?.experience ?? "3-5 年");
  const [education, setEducation] = useState(job?.education ?? "本科");
  const defaultSkills = seeded?.skills?.length
    ? seeded.skills.join("、")
    : /测试/.test(role)
    ? "自动化测试、性能测试、质量保障"
    : /设计/.test(role)
      ? "交互设计、视觉设计、设计系统"
      : /产品经理/.test(role)
        ? "B端产品、AI产品、用户研究"
        : (job?.skills?.length ? job.skills : ["招聘", "AI", "B端"]).join("、");
  const [skills, setSkills] = useState(defaultSkills);

  const benefitOptions = ["五险一金", "定期体检", "带薪年假", "年终奖", "餐饮补贴", "节日福利", "股票期权", "免费班车", "周末双休"];
  const libraryTitles = ["高级软件测试工程师", "测试开发工程师", "质量保障工程师", "前端开发工程师", "高级产品经理"];

  useEffect(() => {
    if (status !== "done" || !job) return;
    setTitle(job.title);
    setDepartmentId(job.departmentId);
    setEmployment(job.employment === "intern" ? "实习" : job.employment === "contract" ? "合同制" : "全职");
    setHeadcount(job.headcount);
    setResponsibilities(job.responsibilities.join("\n"));
    setRequirements(job.requirements.join("\n"));
    setSkills(job.skills.join("、"));
    setExperience(job.experience);
    setEducation(job.education);
    setLocations(job.location.split(/\s*\/\s*/).filter(Boolean).slice(0, 3));
    const range = job.salary.match(/(\d+)\s*[kK]?\s*[-–]\s*(\d+)\s*[kK]?/);
    if (range) {
      setSalaryMin(`${range[1]}k`);
      setSalaryMax(`${range[2]}k`);
    }
    const monthsMatch = job.salary.match(/(\d+)\s*薪/);
    if (monthsMatch) setMonths(`${monthsMatch[1]}薪`);
    // Only resync when a newly created job replaces the draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, job?.id]);

  const polish = () => {
    if (polishing) return;
    setPolishing(true);
    window.setTimeout(() => {
      setResponsibilities(
        /设计/.test(role)
          ? "1. 负责招聘产品核心链路的体验策略与设计规范建设，建立可度量的体验指标；\n2. 主导关键流程的交互与视觉方案，持续降低使用成本；\n3. 深入业务与用户研究，提前识别体验风险并推动跨团队落地。"
          : /产品经理/.test(role)
            ? "1. 负责 AI 招聘产品的规划与需求定义，建立可度量的产品指标；\n2. 主导关键能力从 0 到 1 的落地，持续验证客户价值；\n3. 深入客户场景与行业趋势，协同设计、研发与交付团队推动闭环。"
            : "1. 负责招聘核心链路的测试策略设计与全流程质量保障，建立可度量的质量指标；\n2. 主导自动化测试平台与持续集成体系建设，持续降低回归成本；\n3. 深入需求评审与技术方案，提前识别质量风险并推动跨团队闭环。"
      );
      setPolishing(false);
      toast.success("已使用 AI 润色职位职责");
    }, 850);
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {created ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#cfe5d6] bg-[#eef6f0] px-3 py-2.5">
            <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
            <div>
              <div className="text-[12px] font-medium text-ink">职位已创建并写入职位管理</div>
              <div className="mt-0.5 text-[11px] text-muted">下方内容仍可修改，保存后会同步到职位详情。</div>
            </div>
          </div>
        ) : null}

        <SectionTitle>基础信息</SectionTitle>
        <div className="mt-3 space-y-4">
          <div>
            <Label>公司名称</Label>
            <div className="flex h-10 items-center rounded-[10px] border border-line bg-[#f7f8f4] px-3 text-[13.5px] text-ink-soft">
              <span className="truncate">{company}</span>
            </div>
          </div>

          <div>
            <Label required>所属部门</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="h-10 text-[13.5px]" aria-label="所属部门">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[1fr_128px] gap-3">
            <div>
              <Label required>用工性质</Label>
              <SelectBox value={employment} onChange={setEmployment} options={["全职", "实习", "兼职", "合同制"]} ariaLabel="用工性质" />
            </div>
            <div>
              <Label required>招聘人数</Label>
              <div className="flex h-10 items-center overflow-hidden rounded-[10px] border border-line bg-surface">
                <button
                  type="button"
                  onClick={() => setHeadcount((value) => Math.max(1, value - 1))}
                  className="flex h-full w-10 shrink-0 items-center justify-center text-[15px] text-muted hover:bg-[#f5f7f2] hover:text-ink"
                  aria-label="减少招聘人数"
                >
                  −
                </button>
                <input
                  value={headcount}
                  onChange={(event) => setHeadcount(Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1))}
                  className="min-w-0 flex-1 bg-transparent text-center text-[13.5px] text-ink outline-none"
                  aria-label="招聘人数"
                />
                <button
                  type="button"
                  onClick={() => setHeadcount((value) => Math.min(999, value + 1))}
                  className="flex h-full w-10 shrink-0 items-center justify-center text-[15px] text-muted hover:bg-[#f5f7f2] hover:text-ink"
                  aria-label="增加招聘人数"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <Label required>职位名称</Label>
            <div>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setLibraryOpen((value) => !value)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-pine/25 bg-surface px-2.5 text-[12px] font-medium text-pine"
                >
                  <Sparkles className="size-3" /> 标准职位库 <ChevronDown className="size-2.5" />
                </button>
                {libraryOpen ? (
                  <div className="agent-pop absolute left-0 top-[34px] z-30 w-[190px] overflow-hidden rounded-[7px] border border-[var(--a-border-2)] bg-white p-1 agent-shadow-pop">
                    {libraryTitles.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setTitle(item);
                          setLibraryOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-[5px] px-2 py-1.5 text-left text-[11.5px] text-[var(--a-text-2)] hover:bg-[var(--a-fill-1)]"
                      >
                        {item}
                        {title === item ? <Check className="size-3 text-[var(--a-primary)]" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="relative mt-2">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value.slice(0, 50))}
                  placeholder="请输入职位名称（如高级前端开发工程师）"
                  className={cn(inputClass, "pr-10")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] text-muted">
                  {title.length}/50
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-[18px] text-muted">支持从标准职位库选择或手动输入</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label required>职位职责</Label>
              <button
                type="button"
                onClick={polish}
                disabled={polishing}
                className="mb-2 flex items-center gap-1 text-[11.5px] font-medium text-info-ink hover:underline disabled:opacity-60"
              >
                {polishing ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                {polishing ? "润色中" : "润色"}
              </button>
            </div>
            <textarea
              value={responsibilities}
              onChange={(event) => setResponsibilities(event.target.value)}
              className={cn(textareaClass, "min-h-[96px]")}
              placeholder="请详细列出该职位日常工作职责、工作业务模块及考核交付目标..."
            />
          </div>

          <div>
            <Label>任职要求 <span className="text-[10px] text-[var(--a-text-4)]">（选填）</span></Label>
            <textarea
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              className={cn(textareaClass, "min-h-[88px]")}
              placeholder="请详细说明候选人所需的专业背景、工作经验、技术能力与综合素质要求..."
            />
          </div>

          <div>
            <Label>技能标签</Label>
            <input
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              className={inputClass}
              placeholder="用「、」或逗号分隔，例如：自动化测试、性能测试、质量保障"
            />
          </div>
        </div>

        <div className="my-5 h-px bg-line" />

        <SectionTitle>工作地点</SectionTitle>
        <div className="mt-3 space-y-2">
          {locations.map((item, index) => (
            <div key={index} className="relative">
              <input
                value={item}
                onChange={(event) =>
                  setLocations((items) => items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))
                }
                className={cn(inputClass, locations.length > 1 && "pr-10")}
                placeholder={index === 0 ? "例如：北京市 · 海淀区" : "例如：上海市 · 徐汇区"}
                aria-label={`工作地点 ${index + 1}`}
              />
              {locations.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setLocations((items) => items.filter((_, currentIndex) => currentIndex !== index))}
                  aria-label={`删除工作地点 ${index + 1}`}
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-[#eef0ec] hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          ))}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={() => setLocations((items) => (items.length >= 3 ? items : [...items, ""]))}
              disabled={locations.length >= 3}
              className="flex items-center gap-1 text-[11.5px] font-medium text-pine transition-colors hover:text-pine-deep disabled:cursor-not-allowed disabled:text-muted"
            >
              <Plus className="size-3.5" /> 添加工作地点
            </button>
            <span className="text-[10.5px] text-muted">最多 3 个 · 已添加 {locations.length}/3</span>
          </div>
          <p className="text-[10.5px] leading-[17px] text-muted">候选人会看到全部工作地点；多个地点发布后会以「 / 」合并展示。</p>
        </div>

        <div className="my-5 h-px bg-line" />

        <SectionTitle>薪资与福利</SectionTitle>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <Label required>薪资下限</Label>
            <SelectBox value={salaryMin} onChange={setSalaryMin} options={["15k", "20k", "25k", "30k", "35k"]} ariaLabel="薪资下限" />
          </div>
          <div>
            <Label required>薪资上限</Label>
            <SelectBox value={salaryMax} onChange={setSalaryMax} options={["30k", "35k", "40k", "45k", "50k"]} ariaLabel="薪资上限" />
          </div>
          <div>
            <Label required>发薪月数</Label>
            <SelectBox value={months} onChange={setMonths} options={["12薪", "13薪", "14薪", "15薪", "16薪"]} ariaLabel="发薪月数" />
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-2 text-[12px] text-ink-soft">选择福利待遇（可多选）</div>
          <div className="flex flex-wrap gap-1.5">
            {benefitOptions.map((benefit) => {
              const active = benefits.includes(benefit);
              return (
                <button
                  key={benefit}
                  type="button"
                  onClick={() =>
                    setBenefits((items) => (active ? items.filter((item) => item !== benefit) : [...items, benefit]))
                  }
                  className={cn(
                    "flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] transition-colors",
                    active
                      ? "border-pine/25 bg-pine-soft text-pine"
                      : "border-line bg-surface text-ink-soft hover:bg-[#f7f8f4]"
                  )}
                >
                  {active ? <Check className="size-2.5" /> : null}
                  {benefit}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-[18px] text-muted">
            已选：{benefits.length} 项 <span className="text-[var(--a-text-2)]">{benefits.join("、") || "未选择"}</span>
          </p>
        </div>

        <div className="my-5 h-px bg-line" />

        <SectionTitle>任职门槛</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label required>经验要求</Label>
            <SelectBox value={experience} onChange={setExperience} options={["不限", "1-3 年", "3-5 年", "5-10 年", "10 年以上"]} ariaLabel="经验要求" />
          </div>
          <div>
            <Label required>学历要求</Label>
            <SelectBox value={education} onChange={setEducation} options={["不限", "大专", "本科", "硕士", "博士"]} ariaLabel="学历要求" />
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-lg bg-[#f7f8f4] px-3 py-2.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted" />
          <p className="text-[11px] leading-[18px] text-muted">
            发布前将自动检查城市风险、招聘敏感词、用工条款与最低工资。所有检查结果会在对话中同步。
          </p>
        </div>
      </div>

      <PanelFooter>
        <PrimaryButton
          onClick={() => {
            const cleaned = locations.map((item) => item.trim()).filter(Boolean);
            if (cleaned.length === 0) {
              toast.error("请至少填写一个工作地点");
              return;
            }
            if (!title.trim()) {
              toast.error("请填写职位名称");
              return;
            }
            const payload: JobDraftPayload = {
              title,
              departmentId,
              locations: cleaned,
              employment: employment as JobDraftPayload["employment"],
              headcount,
              salaryMin,
              salaryMax,
              months,
              responsibilities,
              requirements,
              benefits,
              experience,
              education,
              skills,
            };
            if (created) onUpdate(payload);
            else onPublish(payload);
          }}
          loading={status === "working"}
        >
          {status === "working" ? (created ? "正在保存..." : "正在创建职位...") : created ? "保存修改" : "创建职位"}
        </PrimaryButton>
      </PanelFooter>
    </>
  );
}

type ProfileOption = { label: string; recommended?: boolean };
type ProfileSection = { id: string; title: string; options: ProfileOption[]; description: string; freeText?: boolean };

const profileTabs: { key: string; label: string; sections: ProfileSection[] }[] = [
  {
    key: "D1",
    label: "履历背景",
    sections: [
      {
        id: "years",
        title: "从业年限",
        options: [{ label: "1–3 年" }, { label: "3–5 年", recommended: true }, { label: "5–8 年" }, { label: "8 年以上" }],
        description: "根据职位责任与交付复杂度选择经验区间。结合项目成果评估成熟度；能力突出者可不以年限作为硬性门槛。",
      },
      {
        id: "degree",
        title: "最高学历",
        options: [{ label: "大专及以上" }, { label: "本科及以上", recommended: true }, { label: "硕士优先" }],
        description: "按职位实际需求设定学历门槛或优先条件。结合专业背景与实践成果判断，能力突出者可适当放宽学历要求。",
      },
      {
        id: "school",
        title: "院校背景",
        options: [{ label: "985 优先" }, { label: "211 优先" }, { label: "双一流优先" }, { label: "不限院校", recommended: true }],
        description: "院校背景可作为人才筛选的参考，按职位需要选择优先范围；同时关注专业实力与实际表现，不唯学校标签。",
      },
      {
        id: "major",
        title: "专业背景",
        options: [{ label: "计算机软件", recommended: true }, { label: "电子信息", recommended: true }, { label: "数学/统计" }, { label: "理工科" }, { label: "不限专业" }],
        description: "依据职位所需知识基础选择相关专业。结合技术实践与项目成果评估匹配度；跨专业候选人也可通过能力验证。",
      },
      {
        id: "company-size",
        title: "上家公司规模",
        options: [{ label: "50 人以下" }, { label: "50–200 人" }, { label: "200–1000 人", recommended: true }, { label: "1000 人以上" }, { label: "不限规模" }],
        description: "结合团队阶段选择适配的公司规模背景，重点评估职责范围、交付方式与适应能力，不将大公司经历作为唯一标准。",
      },
      {
        id: "industry",
        title: "行业背景",
        options: [{ label: "互联网/科技", recommended: true }, { label: "企业服务", recommended: true }, { label: "金融科技" }, { label: "智能制造" }, { label: "相关行业" }],
        description: "按业务场景选择相关行业经历，关注领域知识、客户需求与经验迁移能力；相近行业候选人可结合学习成本评估。",
      },
      {
        id: "tenure",
        title: "跳槽频率",
        options: [{ label: "单段 3 年以上" }, { label: "单段 2 年以上" }, { label: "近 3 年 ≤ 2 次", recommended: true }, { label: "近 3 年 ≤ 3 次" }],
        description: "结合任期时长与近年变动次数评估稳定性。了解每次离职原因、组织调整因素与项目周期，避免单一标签判断。",
      },
    ],
  },
  {
    key: "D2",
    label: "专业胜任力",
    sections: [
      {
        id: "tech-depth",
        title: "核心技术栈深度",
        options: [{ label: "核心技术精通", recommended: true }, { label: "多技术栈熟练" }, { label: "独立开发" }, { label: "具备基础实践" }, { label: "潜力优先培养" }],
        description: "根据职位所需技术深度选择要求。通过实际代码、项目细节与技术评审验证；培养型岗位可更重视基础与潜力。",
      },
      {
        id: "project-scale",
        title: "项目经验规模",
        options: [{ label: "独立负责模块", recommended: true }, { label: "主导完整项目", recommended: true }, { label: "负责大型系统" }, { label: "高并发实战" }, { label: "从零搭建经验" }],
        description: "按项目体量与责任范围选择经验要求。核实候选人的实际贡献、技术难点及交付结果，避免仅凭项目名称判断。",
      },
      {
        id: "problem-solving",
        title: "问题解决与决策",
        options: [{ label: "独立排查故障", recommended: true }, { label: "复杂问题定位" }, { label: "技术选型决策" }, { label: "系统性优化" }, { label: "风险预判能力" }],
        description: "结合典型故障与技术取舍案例评估分析能力。按岗位定位关注定位、决策、优化或风险预判，核实思路与实际效果。",
      },
      {
        id: "learning",
        title: "学习成长性",
        options: [{ label: "持续学习新技术", recommended: true }, { label: "快速补齐短板" }, { label: "跨领域迁移" }, { label: "主动分享沉淀" }, { label: "实践验证新知" }],
        description: "通过近期学习与实践案例评估成长性。关注补齐短板、迁移知识和沉淀分享的过程，判断能否适应职位变化。",
      },
      {
        id: "business",
        title: "业务理解深度",
        options: [{ label: "理解功能逻辑" }, { label: "熟悉业务流程", recommended: true }, { label: "关注经营指标" }, { label: "识别客户需求" }, { label: "参与业务决策" }],
        description: "根据职位参与业务的深度选择评估重点。核实对流程、客户需求与经营指标的理解，以及技术方案对业务的价值。",
      },
    ],
  },
  {
    key: "D3",
    label: "通用素质",
    sections: [
      {
        id: "quality",
        freeText: true,
        title: "综合素质重点",
        options: [{ label: "结构化思考", recommended: true }, { label: "主动承担责任" }, { label: "结果导向" }, { label: "快速学习" }, { label: "抗压与韧性", recommended: true }],
        description: "结合职位场景选择重点素质。通过行为案例评估思考方式、责任担当与结果意识，关注持续表现而非自我评价。",
      },
      {
        id: "communication",
        freeText: true,
        title: "沟通与表达风格",
        options: [{ label: "逻辑清晰简洁", recommended: true }, { label: "善于倾听澄清" }, { label: "书面表达准确" }, { label: "面向业务沟通" }, { label: "高效推动共识" }],
        description: "按协作对象与工作场景选择沟通重点。通过需求澄清、方案说明与分歧讨论案例，评估表达准确性与共识推进能力。",
      },
      {
        id: "teamwork",
        freeText: true,
        title: "团队协作角色定位",
        options: [{ label: "独立模块交付", recommended: true }, { label: "团队共同交付" }, { label: "项目统筹推进" }, { label: "带教新人" }, { label: "跨团队协作" }],
        description: "依据团队分工选择角色定位。核实独立交付、协同推进、带教或管理经历，明确实际承担的责任与团队贡献。",
      },
      {
        id: "cross-team",
        freeText: true,
        title: "跨部门协作经验",
        options: [{ label: "研发团队协作", recommended: true }, { label: "产品研发协作" }, { label: "运营市场协同" }, { label: "客户商务对接" }, { label: "多部门决策" }],
        description: "根据职位参与协作的范围选择经验要求。了解跨团队目标对齐、资源协调与推进过程，关注解决实际问题的能力。",
      },
    ],
  },
  {
    key: "D4",
    label: "组织协作",
    sections: [
      {
        id: "conflict",
        title: "反馈与冲突处理",
        options: [{ label: "接受反馈调整", recommended: true }, { label: "主动提出改进" }, { label: "事实驱动讨论" }, { label: "协商解决分歧" }, { label: "及时升级风险" }],
        description: "通过反馈与冲突案例评估协作成熟度。关注事实依据、调整行动与风险升级方式，判断能否在分歧中保持有效合作。",
      },
      {
        id: "influence",
        title: "组织影响力",
        options: [{ label: "推动项目落地", recommended: true }, { label: "影响关键决策" }, { label: "沉淀方法规范" }, { label: "培养团队成员" }],
        description: "依据岗位层级评估影响力范围。核实推动项目、影响决策、沉淀规范或培养他人的具体案例与实际结果。",
      },
      {
        id: "culture",
        title: "文化适配",
        options: [{ label: "开放透明", recommended: true }, { label: "务实高效" }, { label: "长期主义" }, { label: "客户导向" }],
        description: "结合团队工作方式选择文化适配重点。通过真实协作场景判断价值观一致性，避免仅凭主观印象。",
      },
    ],
  },
  {
    key: "D5",
    label: "薪资与意愿",
    sections: [
      {
        id: "salary",
        title: "薪酬预期与求职意愿",
        options: [{ label: "预算内优先", recommended: true }, { label: "合理涨幅可谈" }, { label: "认可长期激励" }, { label: "看重成长空间" }, { label: "到岗时间匹配" }],
        description: "结合薪酬预算与候选人诉求选择匹配条件。沟通涨幅、长期激励与成长机会，并确认求职动机与到岗时间。",
      },
      {
        id: "availability",
        title: "到岗时间",
        options: [{ label: "2 周内", recommended: true }, { label: "1 个月内" }, { label: "1–2 个月" }, { label: "可协商" }],
        description: "依据业务紧急程度选择到岗时间。确认离职流程、竞业限制与入职材料准备情况，预留合理缓冲。",
      },
      {
        id: "motivation",
        title: "稳定性与动机",
        options: [{ label: "职业方向一致", recommended: true }, { label: "认可业务方向" }, { label: "成长诉求明确" }, { label: "地点通勤可接受" }],
        description: "通过求职动机与职业规划判断长期稳定性。核实对业务、成长与工作地点的真实诉求，减少入职后的预期偏差。",
      },
    ],
  },
];

function defaultProfileSelection() {
  const selected = new Set<string>();
  profileTabs.forEach((tab) =>
    tab.sections.forEach((section) =>
      section.options.forEach((option) => {
        if (option.recommended) selected.add(`${section.id}:${option.label}`);
      })
    )
  );
  return selected;
}

type ProfileError = { title: string; message: string };

function parseYearRange(label: string) {
  const numbers = (label.match(/\d+/g) ?? []).map(Number);
  if (numbers.length === 0) return null;
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

function degreeRank(label: string) {
  if (/博士/.test(label)) return 4;
  if (/硕士/.test(label)) return 3;
  if (/本科/.test(label)) return 2;
  if (/大专/.test(label)) return 1;
  return 0;
}

const noteTemplates: Record<string, string> = {
  D1: "重点关注履历真实性与稳定性：核实关键项目的起止时间、个人贡献与离职原因，不把频繁变动简单等同于不稳定。",
  D2: "重点验证专业胜任力：通过真实项目细节判断技术深度、独立交付与问题解决能力，并关注学习迁移与业务理解。",
  D3: "重点观察结构化表达、主动担当与抗压表现：请候选人用具体行为案例说明当时的判断、行动与结果，避免只听取自我评价。",
  D4: "关注跨团队协作中的目标对齐与冲突处理：核实其如何推动分歧收敛、如何影响关键决策，以及沉淀了哪些可复用方法。",
  D5: "确认薪酬预期、到岗时间与真实求职动机：提前沟通涨幅、长期激励、地点通勤与离职流程，减少入职后的预期偏差。",
};

const noteComplianceRules = [
  { pattern: /(限男|限女|仅限男|仅限女|男性优先|女性优先)/, rule: "性别限制" },
  { pattern: /(年龄|岁数|\d{2}\s*岁)/, rule: "年龄限制" },
  { pattern: /(婚育|已婚|未婚|生育|备孕)/, rule: "婚育状况" },
  { pattern: /(籍贯|本地户口|限本地|本地人)/, rule: "地域或籍贯限制" },
  { pattern: /(民族|宗教)/, rule: "民族或宗教信仰限制" },
];

function ProfilePanel({ status, job, onSubmit }: { status: PanelStatus; job?: Job; onSubmit: (payload: ProfileDraftPayload) => void }) {
  const [selected, setSelected] = useState<Set<string>>(defaultProfileSelection);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, ProfileError>>({});
  const [activeGroup, setActiveGroup] = useState(profileTabs[0].key);
  const [polishing, setPolishing] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalSelected = selected.size;

  const toggle = (sectionId: string, label: string) => {
    const key = `${sectionId}:${label}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setErrors((prev) => {
      if (!prev[sectionId]) return prev;
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  };

  const selectMany = (sectionId: string) => {
    return [...selected]
      .filter((key) => key.startsWith(`${sectionId}:`))
      .map((key) => key.slice(sectionId.length + 1));
  };

  const jumpTo = (groupKey: string) => {
    setActiveGroup(groupKey);
    document.getElementById(`profile-group-${groupKey}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const offset = container.getBoundingClientRect().top + 24;
    let current = profileTabs[0].key;
    for (const group of profileTabs) {
      const element = document.getElementById(`profile-group-${group.key}`);
      if (element && element.getBoundingClientRect().top <= offset) current = group.key;
    }
    setActiveGroup(current);
  };

  const polishNote = (key: string, templateKey = key) => {
    if (polishing) return;
    setPolishing(key);
    const current = notes[key]?.trim() ?? "";
    window.setTimeout(() => {
      const polished = current
        ? `${current.replace(/\s*\n+\s*/g, "；").replace(/[；;。]+$/g, "")}。`
        : noteTemplates[templateKey] ?? "";
      setNotes((prev) => ({ ...prev, [key]: polished }));
      setErrors((prev) => {
        if (!prev[`note-${key}`]) return prev;
        const next = { ...prev };
        delete next[`note-${key}`];
        return next;
      });
      setPolishing(null);
      toast.success(current ? "已润色补充要求" : "已生成补充要求草稿");
    }, 700);
  };

  const validate = () => {
    const next: Record<string, ProfileError> = {};
    const school = selectMany("school");
    if (school.includes("不限院校") && school.length > 1) {
      next.school = { title: "院校背景存在冲突", message: "「不限院校」不能与具体院校偏好同时选择，请保留其中一种。" };
    }
    const majors = selectMany("major");
    if (majors.includes("不限专业") && majors.length > 1) {
      next.major = { title: "专业背景存在冲突", message: "「不限专业」不能与具体专业同时选择，请保留其中一种。" };
    }
    const sizes = selectMany("company-size");
    if (sizes.includes("不限规模") && sizes.length > 1) {
      next["company-size"] = { title: "公司规模存在冲突", message: "「不限规模」不能与具体规模同时选择，请保留其中一种。" };
    }
    if (school.some((item) => /985|211|双一流/.test(item))) {
      const complianceMessage =
        "将 985 / 211 / 双一流 作为优先条件，可能构成就业歧视。建议改为「不限院校」，在面试中用作品、项目与能力验证替代院校标签。";
      next.school = next.school
        ? {
            title: "院校背景存在冲突与合规风险",
            message: `${next.school.message} ${complianceMessage}`,
          }
        : { title: "院校限制存在合规风险", message: complianceMessage };
    }

    const yearRanges = selectMany("years").map(parseYearRange).filter((item): item is { min: number; max: number } => Boolean(item));
    const jobYears = job ? parseYearRange(job.experience) : null;
    if (jobYears && yearRanges.length > 0 && !yearRanges.some((range) => range.max >= jobYears.min && range.min <= jobYears.max)) {
      next.years = {
        title: "与职位经验要求冲突",
        message: `职位要求「${job?.experience}」，当前选择与职位门槛没有交集。请调整经验区间，或先更新职位要求。`,
      };
    }

    const degrees = selectMany("degree");
    const jobDegree = job ? degreeRank(job.education) : 0;
    if (jobDegree > 0 && degrees.length > 0) {
      const selectedMax = Math.max(...degrees.map(degreeRank));
      if (selectedMax > 0 && selectedMax < jobDegree) {
        next.degree = {
          title: "画像学历低于职位要求",
          message: `职位要求「${job?.education}」，当前画像上限低于职位门槛。请提高学历要求，或调整职位门槛。`,
        };
      }
    }

    Object.entries(notes).forEach(([key, value]) => {
      const note = value.trim();
      if (!note) return;
      const hit = noteComplianceRules.find((rule) => rule.pattern.test(note));
      if (hit) {
        next[`note-${key}`] = {
          title: `${hit.rule}存在合规风险`,
          message: "招聘要求中不应出现与岗位无关的性别、年龄、婚育、地域、民族或宗教限制。请删除相关表述，改为与岗位能力直接相关的条件。",
        };
      }
    });

    setErrors(next);
    const keys = Object.keys(next);
    if (keys.length > 0) {
      const first = keys[0];
      const targetId = first.startsWith("note-") ? `profile-note-${first.slice(5)}` : `profile-section-${first}`;
      window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
      toast.error(`有 ${keys.length} 处内容需要调整`);
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({
      selected: [...selected].map((key) => key.split(":").slice(1).join(":")),
      notes: Object.entries(notes)
        .map(([group, text]) => ({ group, text: text.trim() }))
        .filter((item) => item.text),
    });
  };

  return (
    <>
      <div className="shrink-0 border-b border-line">
        <div className="scroll-none flex items-center gap-0 overflow-x-auto px-1.5 py-1.5">
          {profileTabs.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => jumpTo(group.key)}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1 rounded-lg px-1.5 text-[10.5px] transition-colors",
                activeGroup === group.key
                  ? "bg-pine-soft font-medium text-pine"
                  : "text-muted hover:bg-[#f5f7f2] hover:text-ink"
              )}
            >
              <span className="font-medium">{group.key}</span>
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {job ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-[#fafbf8] px-2.5 py-2 text-[11.5px] text-muted">
            <span className="font-medium text-ink">{job.title}</span>
            <span className="text-line-strong">·</span>
            <span>{job.code}</span>
            <span className="ml-auto text-[10.5px]">
              {job.experience} · {job.education}
            </span>
          </div>
        ) : null}

        {status === "done" ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#cfe5d6] bg-[#eef6f0] px-3 py-2.5">
            <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
            <div>
              <div className="text-[12px] font-medium text-ink">职位画像已写回职位</div>
              <div className="mt-0.5 text-[11px] text-muted">已更新推荐偏好与成功画像，可在职位详情中查看。</div>
            </div>
          </div>
        ) : null}

        <div className="space-y-7">
          {profileTabs.map((group) => {
            const groupSelected = [...selected].filter((key) =>
              group.sections.some((section) => key.startsWith(`${section.id}:`))
            ).length;
            return (
              <section key={group.key} id={`profile-group-${group.key}`} className="scroll-mt-2">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-pine-soft text-[10px] font-semibold text-pine">
                    {group.key}
                  </span>
                  <span className="text-[13px] font-semibold text-ink">{group.label}</span>
                  <span className="ml-auto text-[10.5px] text-muted">已选 {groupSelected} 项</span>
                </div>

                <div className="space-y-4">
                  {group.sections.map((section) => (
                    <div key={section.id} id={`profile-section-${section.id}`} className="scroll-mt-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className={cn("size-1.5 rounded-full", errors[section.id] ? "bg-[var(--red)]" : "bg-line-strong")} />
                        <span className={cn("text-[12.5px] font-medium", errors[section.id] ? "text-[var(--red)]" : "text-ink")}>
                          {section.title}
                        </span>
                        <InfoTip icon="question" text={section.description} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {section.options.map((option) => {
                          const active = selected.has(`${section.id}:${option.label}`);
                          return (
                            <button
                              key={option.label}
                              type="button"
                              onClick={() => toggle(section.id, option.label)}
                              aria-pressed={active}
                              className={cn(
                                "flex h-9 items-center gap-1.5 rounded-full border px-3 text-[11.5px] transition-all",
                                active
                                  ? "border-pine bg-pine font-medium text-white shadow-[0_2px_6px_-3px_rgba(21,22,23,.45)]"
                                  : "border-line bg-white text-ink-soft hover:border-line-strong hover:bg-[#f7f8f4]"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-3.5 items-center justify-center rounded-full border",
                                  active ? "border-white/50 bg-white/15" : "border-line-strong"
                                )}
                              >
                                {active ? <Check className="size-2.5" /> : null}
                              </span>
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                      {errors[section.id] ? (
                        <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#f0c9bd] bg-[#fff6f2] px-2.5 py-2">
                          <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-[var(--red)]" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-medium text-[var(--red)]">{errors[section.id].title}</div>
                            <p className="mt-0.5 text-[10.5px] leading-[17px] text-muted">{errors[section.id].message}</p>
                          </div>
                        </div>
                      ) : null}

                      {section.freeText ? (
                        <div id={`profile-note-${section.id}`} className="mt-2 scroll-mt-4 rounded-lg border border-line bg-surface p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] text-muted">自由描述（可直接修改）</span>
                            <button
                              type="button"
                              onClick={() => polishNote(section.id, group.key)}
                              disabled={Boolean(polishing)}
                              className="flex items-center gap-1 text-[10.5px] font-medium text-pine transition-colors hover:text-pine-deep disabled:opacity-50"
                            >
                              {polishing === section.id ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                              {polishing === section.id ? "润色中" : "AI 润色"}
                            </button>
                          </div>
                          <textarea
                            value={notes[section.id] ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              setNotes((prev) => ({ ...prev, [section.id]: value }));
                              setErrors((prev) => {
                                if (!prev[`note-${section.id}`]) return prev;
                                const next = { ...prev };
                                delete next[`note-${section.id}`];
                                return next;
                              });
                            }}
                            placeholder="补充这道题的具体要求或面试观察点…"
                            className={cn(
                              "mt-1.5 min-h-[46px] w-full resize-y rounded-md border bg-[#fafbf8] px-2 py-1.5 text-[11px] leading-[18px] text-ink outline-none transition-colors placeholder:text-[var(--a-text-4)]",
                              errors[`note-${section.id}`]
                                ? "border-[#e8b4a3] focus:border-[#d98b74]"
                                : "border-line hover:border-line-strong focus:border-line-strong"
                            )}
                          />
                          {errors[`note-${section.id}`] ? (
                            <div className="mt-1.5 flex items-start gap-2 rounded-md border border-[#f0c9bd] bg-[#fff6f2] px-2 py-1.5">
                              <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-[var(--red)]" />
                              <div className="min-w-0">
                                <div className="text-[10.5px] font-medium text-[var(--red)]">{errors[`note-${section.id}`].title}</div>
                                <p className="mt-0.5 text-[10px] leading-[16px] text-muted">{errors[`note-${section.id}`].message}</p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {group.key !== "D3" ? (
                <div id={`profile-note-${group.key}`} className="mt-3 scroll-mt-4 rounded-xl border border-dashed border-line bg-[#fafbf8] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11.5px] font-medium text-ink-soft">
                      补充要求 <span className="font-normal text-muted">（选填）</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => polishNote(group.key)}
                      disabled={Boolean(polishing)}
                      className="flex items-center gap-1 text-[11px] font-medium text-pine transition-colors hover:text-pine-deep disabled:opacity-50"
                    >
                      {polishing === group.key ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                      {polishing === group.key ? "润色中" : "AI 润色"}
                    </button>
                  </div>
                  <textarea
                    value={notes[group.key] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNotes((prev) => ({ ...prev, [group.key]: value }));
                      setErrors((prev) => {
                        if (!prev[`note-${group.key}`]) return prev;
                        const next = { ...prev };
                        delete next[`note-${group.key}`];
                        return next;
                      });
                    }}
                    placeholder={`可直接描述无法用选项覆盖的要求，或点击「AI 润色」生成草稿。`}
                    className={cn(
                      "mt-2 min-h-[62px] w-full resize-y rounded-lg border bg-white px-2.5 py-2 text-[11.5px] leading-[19px] text-ink outline-none transition-colors placeholder:text-[var(--a-text-4)]",
                      errors[`note-${group.key}`]
                        ? "border-[#e8b4a3] focus:border-[#d98b74]"
                        : "border-line hover:border-line-strong focus:border-line-strong"
                    )}
                  />
                  {errors[`note-${group.key}`] ? (
                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#f0c9bd] bg-[#fff6f2] px-2.5 py-2">
                      <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-[var(--red)]" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-[var(--red)]">{errors[`note-${group.key}`].title}</div>
                        <p className="mt-0.5 text-[10.5px] leading-[17px] text-muted">{errors[`note-${group.key}`].message}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>

      <PanelFooter>
        <div className="flex items-center gap-2">
          <span className="mr-auto text-[10.5px] text-muted">共 {totalSelected} 项偏好</span>
          <Button type="button" variant="secondary" className="h-9" onClick={() => { setSelected(defaultProfileSelection()); setNotes({}); setErrors({}); }}>
            <RotateCcw /> 重置
          </Button>
          <Button type="button" className="h-9" onClick={submit} disabled={status === "working"}>
            {status === "working" ? <Loader2 className="animate-spin" /> : <Check />}
            {status === "working" ? "正在写入..." : status === "done" ? "重新保存画像" : "保存职位画像"}
          </Button>
        </div>
      </PanelFooter>
    </>
  );
}

type UploadedFile = { name: string; size: string };

function ReportPanel({
  status,
  job,
  reportResult,
  redlines,
  redlinesConfirmed,
  onStartParse,
  onConfirmRedlines,
}: {
  status: PanelStatus;
  job?: Job;
  reportResult?: {
    strong: number;
    medium: number;
    total: number;
    redlineCount?: number;
    top?: { id: string; name: string; score: number; stage: string; title: string }[];
  };
  redlines?: { id: string; title: string; description: string }[];
  redlinesConfirmed?: boolean;
  onStartParse: (files: UploadedFile[]) => void;
  onConfirmRedlines: (items: { id: string; title: string; description: string }[]) => void;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [draft, setDraft] = useState(redlines ?? []);
  const [editing, setEditing] = useState(!redlinesConfirmed);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(redlines ?? []);
    setEditing(!redlinesConfirmed);
  }, [redlines, redlinesConfirmed]);

  const confirmed = Boolean(redlinesConfirmed) && !editing;

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next = Array.from(list).map((file) => ({
      name: file.name,
      size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setFiles((items) => [...items, ...next]);
  };

  const result = useMemo(
    () => [
      { label: "重点推荐", value: `${reportResult?.strong ?? 0} 人`, tone: "success" as const },
      { label: "待进一步核实", value: `${reportResult?.medium ?? 0} 人`, tone: "warning" as const },
      {
        label: "建议淘汰",
        value: `${Math.max(0, (reportResult?.total ?? 0) - (reportResult?.strong ?? 0) - (reportResult?.medium ?? 0))} 人`,
        tone: "muted" as const,
      },
    ],
    [reportResult]
  );

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
          <div className="text-[12.5px] font-medium text-ink">{job?.title ?? "未选择职位"}</div>
          <p className="mt-1 text-[11px] leading-[18px] text-muted">{job?.summary ?? "请先在对话中选择目标职位。"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10.5px] text-muted">
            <span>{job?.code ?? "—"}</span>
            <span className="text-line-strong">|</span>
            <span>{job?.employment === "intern" ? "实习" : job?.employment === "contract" ? "合同制" : "全职"}</span>
            <span>{job?.experience ?? "—"}</span>
            <span>{job?.education ?? "—"}</span>
            <span>{job?.salary ?? "—"}</span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#efd6cd] bg-[#fff8f5]">
          <div className="flex items-center gap-2 border-b border-[#f4e1da] px-3 py-2.5">
            <ShieldAlert className="size-4 text-[#c2472d]" />
            <span className="text-[12.5px] font-medium text-ink">淘汰红线</span>
            <Badge tone={confirmed ? "pine" : "amber"} className="h-[20px] text-[10.5px]">
              {confirmed ? `已确认 ${draft.length} 项` : `${draft.length} 项待确认`}
            </Badge>
            {confirmed ? (
              <button type="button" onClick={() => setEditing(true)} className="ml-auto flex items-center gap-1 text-[10.5px] text-[#c2472d] hover:underline">
                <Pencil className="size-3" /> 修改
              </button>
            ) : null}
          </div>
          <div className="space-y-2 p-3">
            {draft.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#efd6cd] px-3 py-4 text-center text-[11px] text-muted">
                等待 Agent 根据职位画像生成淘汰红线…
              </div>
            ) : null}
            {draft.map((item, index) =>
              editing ? (
                <div key={item.id} className="rounded-lg border border-[#f4e1da] bg-white p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="num w-5 shrink-0 text-[10.5px] text-[#c2472d]">{String(index + 1).padStart(2, "0")}</span>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((items) => items.map((current) => (current.id === item.id ? { ...current, title: event.target.value } : current)))
                      }
                      className={cn(inputClass, "h-10 text-[13px]")}
                      aria-label={`红线 ${index + 1} 标题`}
                    />
                    <button
                      type="button"
                      onClick={() => setDraft((items) => items.filter((current) => current.id !== item.id))}
                      aria-label={`删除红线 ${index + 1}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-[#fbe9e4] hover:text-danger"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(event) =>
                      setDraft((items) =>
                        items.map((current) => (current.id === item.id ? { ...current, description: event.target.value } : current))
                      )
                    }
                    className={cn(textareaClass, "mt-2 min-h-[64px] text-[12.5px]")}
                    aria-label={`红线 ${index + 1} 描述`}
                  />
                </div>
              ) : (
                <div key={item.id} className="rounded-lg border border-[#f4e1da] bg-white/80 px-2.5 py-2">
                  <div className="text-[11.5px] font-medium text-ink">{index + 1}. {item.title}</div>
                  <p className="mt-0.5 text-[10.5px] leading-[17px] text-muted">{item.description}</p>
                </div>
              )
            )}
            {editing ? (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setDraft((items) => [
                      ...items,
                      { id: `redline-${Date.now()}`, title: "新的淘汰红线", description: "请填写触发这条红线的具体条件。" },
                    ])
                  }
                >
                  <Plus /> 增加红线
                </Button>
                <span className="ml-auto text-[10.5px] text-muted">确认后才会开始解析</span>
              </div>
            ) : null}
          </div>
        </div>

        {status === "working" ? (
          <div className="mt-4 rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center gap-2 text-[11.5px] text-muted">
              <Loader2 className="size-3.5 animate-spin text-pine" />
              正在解析候选人库，生成推荐结果…
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef0ec]">
              <div className="h-full w-2/3 rounded-full bg-pine/60 animate-pulse" />
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-7 text-center transition-colors",
              dragging ? "border-pine bg-pine-soft/40" : "border-line-strong bg-surface"
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-pine-soft text-pine">
              <FileUp className="size-5" />
            </span>
            <p className="mt-2.5 text-[12px] font-medium text-ink">点击上传或将简历拖拽至此</p>
            <p className="mt-1 text-[10.5px] leading-[17px] text-muted">支持 PDF、Word、JPG、PNG · 单个文件不超过 20MB</p>
            <Button type="button" variant="secondary" size="sm" className="mt-2.5" onClick={() => inputRef.current?.click()}>
              选择文件
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
          </div>

          {files.length > 0 ? (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10.5px] text-muted">
                <span>已选择 {files.length} 份简历</span>
                <button type="button" onClick={() => setFiles([])} className="text-pine hover:underline">
                  清空
                </button>
              </div>
              <div className="mt-1.5 space-y-1">
                {files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5">
                    <FileText className="size-3.5 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink-soft">{file.name}</span>
                    <span className="shrink-0 text-[9.5px] text-muted">{file.size}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((items) => items.filter((item) => item !== file))}
                      aria-label={`移除 ${file.name}`}
                      className="flex size-4 items-center justify-center rounded text-muted hover:bg-[#f3f5f0]"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {status === "done" && reportResult ? (
          <div className="mt-4 rounded-xl border border-[#cfe5d6] bg-[#eef6f0] p-3">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
              <CircleCheckBig className="size-4 text-[var(--success)]" /> 推荐报告已生成
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {result.map((item) => (
                <div key={item.label} className="rounded-lg bg-white/70 px-2 py-1.5 text-center">
                  <div
                    className={cn(
                      "text-[14px] font-semibold",
                      item.tone === "success" ? "text-[var(--success)]" : item.tone === "warning" ? "text-amber-deep" : "text-muted"
                    )}
                  >
                    {item.value}
                  </div>
                  <div className="mt-0.5 text-[9.5px] text-muted">{item.label}</div>
                </div>
              ))}
            </div>
            {reportResult.redlineCount ? (
              <div className="mt-2 text-[10.5px] text-amber-deep">
                另有 {reportResult.redlineCount} 人触发淘汰红线，未纳入本次推荐。
              </div>
            ) : null}
            {reportResult.top && reportResult.top.length > 0 ? (
              <div className="mt-2.5 space-y-1">
                {reportResult.top.map((candidate, index) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates?candidate=${candidate.id}`}
                    className="flex items-center gap-2 rounded-lg border border-line bg-white/80 px-2 py-1.5 hover:border-line-strong"
                  >
                    <span className="num w-4 text-[10px] text-muted">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink">{candidate.name}</span>
                    <span className="text-[10px] text-muted">{candidate.score}%</span>
                    <ArrowUpRight className="size-3 text-muted" />
                  </Link>
                ))}
              </div>
            ) : null}
            <Link href={`/candidates?job=${job?.id ?? ""}`} className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-pine hover:underline">
              查看推荐候选人 <ArrowUpRight className="size-3" />
            </Link>
          </div>
        ) : null}
      </div>

      <PanelFooter note="解析会结合当前职位的真实候选人库，上传文件用于补充简历来源。">
        {status === "done" ? (
          <Button asChild className="w-full">
            <Link href={`/candidates?job=${job?.id ?? ""}`}>
              <ArrowUpRight /> 查看推荐候选人
            </Link>
          </Button>
        ) : !confirmed ? (
          <PrimaryButton
            onClick={() => {
              onConfirmRedlines(draft);
              setEditing(false);
            }}
            disabled={draft.length === 0}
          >
            {draft.length === 0 ? "等待生成淘汰红线" : redlinesConfirmed ? "保存红线修改" : "确认淘汰红线"}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => onStartParse(files)} loading={status === "working"}>
            {status === "working" ? "正在解析..." : files.length > 0 ? "开始解析" : "解析当前候选人库"}
          </PrimaryButton>
        )}
      </PanelFooter>
    </>
  );
}

function InterviewPanel({
  status,
  job,
  candidate,
  employees,
  onCreate,
}: {
  status: PanelStatus;
  job?: Job;
  candidate?: Candidate;
  employees: Employee[];
  onCreate: (payload: InterviewDraftPayload) => void;
}) {
  const [date, setDate] = useState("2026-11-05");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("11:00");
  const [round, setRound] = useState("初试");
  const [type, setType] = useState<"video" | "onsite">("video");
  const [interviewerId, setInterviewerId] = useState(employees[0]?.id ?? "emp-3");

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
          <div className="flex items-center gap-2">
            <Avatar name={candidate?.name ?? "候选人"} size={32} />
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-ink">{candidate?.name ?? "未选择候选人"}</div>
              <div className="mt-0.5 truncate text-[11px] text-muted">{candidate?.currentTitle ?? "请选择候选人"} · {job?.title ?? "未选择职位"}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Label required>面试轮次</Label>
            <SelectBox value={round} onChange={setRound} options={["初试", "复试", "终面", "HR 面"]} ariaLabel="面试轮次" />
          </div>
          <div>
            <Label required>面试形式</Label>
            <SelectBox value={type === "video" ? "视频面试" : "现场面试"} onChange={(value) => setType(value === "视频面试" ? "video" : "onsite")} options={["视频面试", "现场面试"]} ariaLabel="面试形式" />
          </div>
        </div>

        <div className="mt-3">
          <Label required>面试日期</Label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label required>开始时间</Label>
            <input type="time" value={start} onChange={(event) => setStart(event.target.value)} className={inputClass} />
          </div>
          <div>
            <Label required>结束时间</Label>
            <input type="time" value={end} onChange={(event) => setEnd(event.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-3">
          <Label required>面试官</Label>
          <Select value={interviewerId} onValueChange={setInterviewerId}>
            <SelectTrigger className="h-10 text-[13.5px]" aria-label="面试官">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} · {employee.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 rounded-xl border border-line p-3">
          <div className="text-[11.5px] font-medium text-ink">建议问题</div>
          <ul className="mt-2 space-y-1.5">
            {(candidate?.ai.questions ?? job?.requirements ?? []).slice(0, 4).map((question) => (
              <li key={question} className="flex gap-2 text-[11px] leading-[18px] text-muted">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-pine/40" />
                {question}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PanelFooter note="创建后会同步生成面试邀约通知。">
        <PrimaryButton
          onClick={() =>
            onCreate({
              candidateId: candidate?.id ?? "",
              date,
              start,
              end,
              interviewerId,
              round,
              type,
            })
          }
          disabled={!candidate || !job || status === "done"}
          loading={status === "working"}
        >
          {status === "done" ? "面试已创建" : status === "working" ? "正在创建..." : "创建面试并发送邀约"}
        </PrimaryButton>
      </PanelFooter>
    </>
  );
}

function OfferPanel({
  status,
  job,
  candidate,
  employees,
  onCreate,
}: {
  status: PanelStatus;
  job?: Job;
  candidate?: Candidate;
  employees: Employee[];
  onCreate: (payload: OfferDraftPayload) => void;
}) {
  const [salary, setSalary] = useState(candidate?.expectedSalary ?? job?.salary ?? "30K · 14薪");
  const [bonus, setBonus] = useState("年度绩效奖金 0–3 个月");
  const [startDate, setStartDate] = useState("2026-11-24");
  const [deadline, setDeadline] = useState("2026-11-10");
  const [approverId, setApproverId] = useState(employees[0]?.id ?? "emp-3");
  const [note, setNote] = useState("");

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
          <div className="flex items-center gap-2">
            <Avatar name={candidate?.name ?? "候选人"} size={32} />
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-ink">{candidate?.name ?? "未选择候选人"}</div>
              <div className="mt-0.5 truncate text-[11px] text-muted">{candidate?.currentTitle ?? "请选择候选人"} · {job?.title ?? "未选择职位"}</div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Label required>薪资方案</Label>
          <input value={salary} onChange={(event) => setSalary(event.target.value)} className={inputClass} placeholder="例如：42K · 14薪" />
        </div>
        <div className="mt-3">
          <Label>奖金 / 长期激励</Label>
          <input value={bonus} onChange={(event) => setBonus(event.target.value)} className={inputClass} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label required>入职日期</Label>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClass} />
          </div>
          <div>
            <Label required>Offer 有效期</Label>
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-3">
          <Label required>审批人</Label>
          <Select value={approverId} onValueChange={setApproverId}>
            <SelectTrigger className="h-10 text-[13.5px]" aria-label="审批人">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} · {employee.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3">
          <Label>备注</Label>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} className={cn(textareaClass, "min-h-[72px]")} placeholder="补充审批关注点..." />
        </div>
      </div>

      <PanelFooter note="创建后会进入 Offer 审批流，并生成发放通知。">
        <PrimaryButton
          onClick={() => onCreate({ salary, bonus, startDate, deadline, approverId, note })}
          disabled={!candidate || !job || status === "done"}
          loading={status === "working"}
        >
          {status === "done" ? "Offer 已创建" : status === "working" ? "正在创建..." : "创建 Offer"}
        </PrimaryButton>
      </PanelFooter>
    </>
  );
}
