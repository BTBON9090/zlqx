"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Target,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Field, Input, Label, Textarea } from "@/components/ui/input";
import { ComboInput, NumberStepper } from "@/components/ui/number-stepper";
import { JobTitlePicker } from "@/components/jobs/job-title-picker";
import { AiTextarea } from "@/components/jobs/ai-textarea";
import { MultiPicker } from "@/components/ui/multi-picker";
import { useConfirm } from "@/components/ui/confirm";
import { PersonSelect } from "@/components/ui/person-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/toggle";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { countInterviewRounds, flowStepMeta, flowTemplateToStages, hasAiStep } from "@/lib/flow";

const stepDefs = [
  { n: 1, title: "基本信息", desc: "职位、部门与用人信息" },
  { n: 2, title: "岗位要求", desc: "职责、能力与筛选标准" },
  { n: 3, title: "流程与发布", desc: "面试流程、AI 设置与确认" },
];

export default function NewJobPage() {
  const router = useRouter();
  const { departments, employees, flowTemplates, addJob } = useApp();
  const confirm = useConfirm();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("dept-11");
  const [location, setLocation] = useState("北京 · 朝阳");
  const [workMode, setWorkMode] = useState<"onsite" | "hybrid" | "remote">("hybrid");
  const [employment, setEmployment] = useState<"fulltime" | "intern" | "contract">("fulltime");
  const [headcount, setHeadcount] = useState(1);
  const [salary, setSalary] = useState("30–45K · 14薪");
  const [experience, setExperience] = useState("3–5 年");
  const [education, setEducation] = useState("本科及以上");
  const [ownerId, setOwnerId] = useState("emp-1");
  const [assistantIds, setAssistantIds] = useState<string[]>([]);
  const [flowTemplateId, setFlowTemplateId] = useState("");
  const [priority, setPriority] = useState<"high" | "normal">("normal");
  const [summary, setSummary] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [skills, setSkills] = useState<string[]>(["B 端产品", "AI 产品", "数据分析"]);
  const [skillDraft, setSkillDraft] = useState("");
  const [aiScreen, setAiScreen] = useState(true);
  const [autoMessage, setAutoMessage] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const dept = departments.find((d) => d.id === departmentId);
  const owner = employees.find((e) => e.id === ownerId);
  const selectedFlow = flowTemplates.find((flow) => flow.id === flowTemplateId) ?? flowTemplates.find((flow) => flow.enabled) ?? flowTemplates[0];
  const availableFlows = flowTemplates.filter((flow) => flow.enabled).length ? flowTemplates.filter((flow) => flow.enabled) : flowTemplates;

  useEffect(() => {
    if (flowTemplateId) return;
    const preferred = flowTemplates.find((flow) => flow.isDefault && flow.enabled) ?? flowTemplates.find((flow) => flow.enabled) ?? flowTemplates[0];
    if (preferred) setFlowTemplateId(preferred.id);
  }, [flowTemplates, flowTemplateId]);
  const responsibilities = responsibilitiesText.split("\n").map((s) => s.trim()).filter(Boolean);
  const requirements = requirementsText.split("\n").map((s) => s.trim()).filter(Boolean);

  const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateSummaryText = async () => {
    await pause(650);
    const role = title.trim() || "该岗位";
    return `负责${role}的核心业务规划与落地，围绕${dept?.name ?? "团队"}的业务目标，推动从需求洞察到结果复盘的完整闭环，持续提升候选人体验与招聘效率。`;
  };

  const generateResponsibilitiesText = async () => {
    await pause(750);
    const role = title.trim() || "该岗位";
    return [
      `负责${role}相关业务目标的拆解、规划与落地，制定清晰的阶段计划`,
      "深入理解候选人、面试官与业务团队的真实需求，持续优化流程与体验",
      "协同产品、算法、设计与研发团队推进关键项目，确保交付质量与节奏",
      "建立数据指标体系，通过复盘持续提升转化效率与业务结果",
    ].join("\n");
  };

  const generateRequirementsText = async () => {
    await pause(750);
    const skillText = skills.slice(0, 2).join("、");
    return [
      `${experience || "相关领域"}以上经验${skillText ? `，有${skillText}经验优先` : ""}`,
      "具备从问题定义到方案落地的完整能力，能在复杂场景中做出判断",
      "良好的跨团队沟通与推动能力，能够协同多方达成目标",
      "对 AI 与数字化工具保持敏感，愿意持续学习和迭代工作方式",
    ].join("\n");
  };

  const polishDraft = async (text: string) => {
    await pause(700);
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length <= 1) {
      return `${text.replace(/[。.!！]+$/, "")}，并通过持续复盘与跨团队协同，把想法稳定转化为可衡量的业务结果。`;
    }
    return lines.map((line, index) => {
      const polished = line.replace(/^负责/, index % 2 === 0 ? "主导" : "负责");
      return /[。.!！；;]$/.test(polished) ? polished : `${polished}。`;
    }).join("\n");
  };

  const completeness = useMemo(() => {
    let n = 0;
    if (title) n += 15;
    if (departmentId) n += 10;
    if (location) n += 10;
    if (summary) n += 20;
    if (responsibilities.length >= 2) n += 15;
    if (requirements.length >= 2) n += 15;
    if (skills.length >= 2) n += 15;
    return n;
  }, [title, departmentId, location, summary, responsibilities.length, requirements.length, skills.length]);

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "请填写职位名称";
    if (!location.trim()) next.location = "请填写工作地点";
    if (!salary.trim()) next.salary = "请填写薪资范围";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const generateJd = async () => {
    if (summary.trim() || responsibilitiesText.trim() || requirementsText.trim()) {
      const ok = await confirm({
        title: "用 AI 重新补齐整页内容？",
        description: "职位简介、工作职责与任职要求都会被重新生成，当前已填写的内容将被覆盖。只想优化表达时，请使用各字段旁的「润色」。",
        confirmText: "覆盖并生成",
        tone: "danger",
      });
      if (!ok) return;
    }
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    if (!title) setTitle("高级产品经理");
    setSummary("负责企业级 AI 招聘产品的规划与落地，从候选人洞察到面试协同，构建 HR 真正愿意每天使用的产品体验。");
    setResponsibilitiesText(
      "负责 AI 招聘产品线的中长期规划、版本节奏与商业化路径\n深入 HR、面试官与候选人三类角色，建立高质量的需求判断机制\n协同算法、设计、研发推进 AI 能力在产品中的可控落地\n以数据验证产品价值，持续优化激活、留存与招聘效率指标"
    );
    setRequirementsText(
      "5 年以上 B 端产品经验，有 HR SaaS、协同工具或 AI 产品经历优先\n具备复杂业务抽象能力，能把模糊问题拆解为可验证的产品假设\n对 AI 能力边界有判断，理解 LLM 在招聘场景的应用与风险\n优秀的跨团队沟通与推动能力，能在不确定环境中拿到结果"
    );
    setSkills(["B 端产品", "HR SaaS", "AI 产品", "用户研究", "数据分析"]);
    setAiLoading(false);
    toast.success("AI 已补齐 JD 草稿，可继续修改");
  };

  const addSkill = () => {
    const v = skillDraft.trim();
    if (!v) return;
    if (!skills.includes(v)) setSkills((prev) => [...prev, v]);
    setSkillDraft("");
  };

  const publish = async () => {
    if (!title.trim()) {
      setErrors({ title: "请填写职位名称" });
      setStep(1);
      toast.error("请先补全职位名称");
      return;
    }
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 500));
    const job = addJob({
      title,
      departmentId,
      location,
      workMode,
      employment,
      salary,
      experience,
      education,
      headcount,
      summary: summary || `我们正在寻找一位${title}，加入${dept?.name ?? "团队"}，一起构建更好的 AI 招聘体验。`,
      responsibilities: responsibilities.length ? responsibilities : ["负责岗位核心业务目标的规划与落地", "与跨职能团队协作推进项目"],
      requirements: requirements.length ? requirements : ["具备相关岗位经验", "良好的沟通与协作能力"],
      skills,
      status: "active",
      ownerId,
      assistantIds,
      flowTemplateId: selectedFlow?.id,
      stages: selectedFlow ? flowTemplateToStages(selectedFlow) : undefined,
      priority,
    });
    setPublishing(false);
    toast.success("职位已发布，开始接收候选人");
    router.push(`/jobs/${job.id}`);
  };

  const saveDraft = () => {
    if (!title.trim()) {
      setErrors({ title: "请填写职位名称" });
      setStep(1);
      toast.error("请先填写职位名称");
      return;
    }
    const job = addJob({
      title,
      departmentId,
      location,
      workMode,
      employment,
      salary,
      experience,
      education,
      headcount,
      summary,
      responsibilities,
      requirements,
      skills,
      status: "draft",
      ownerId,
      assistantIds,
      flowTemplateId: selectedFlow?.id,
      stages: selectedFlow ? flowTemplateToStages(selectedFlow) : undefined,
      priority,
    });
    toast.success("职位草稿已保存");
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link href="/jobs" className="flex items-center gap-1 transition-colors hover:text-pine"><ArrowLeft className="size-3" /> 职位管理</Link>
        <ChevronRight className="size-3" />
        <span className="text-ink">新建职位</span>
      </div>

      <PageHeader
        title="把用人需求，变成一个清晰的招聘信号。"
        description="填写职位信息后，AI 会帮助你校准岗位画像，并自动生成职位描述草稿。"
        actions={
          <Button variant="secondary" onClick={saveDraft}><FileText /> 保存草稿</Button>
        }
      />

      <div className="surface flex flex-wrap items-center gap-2 p-2 sm:p-3">
        {stepDefs.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center">
            <button
              onClick={() => { if (s.n < step || validateStep1()) setStep(s.n); }}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                step === s.n ? "bg-pine text-white" : step > s.n ? "text-pine hover:bg-pine-soft/50" : "text-muted"
              )}
            >
              <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold", step === s.n ? "bg-white/15 text-white" : step > s.n ? "bg-pine text-white" : "bg-[#eef0ec] text-muted")}>
                {step > s.n ? <Check className="size-3" /> : s.n}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{s.title}</span>
                <span className={cn("mt-0.5 hidden truncate text-[12px] sm:block", step === s.n ? "text-white/65" : "text-muted")}>{s.desc}</span>
              </span>
            </button>
            {i < stepDefs.length - 1 ? <ChevronRight className="mx-1 hidden size-3.5 shrink-0 text-[#c3ccc4] sm:block" /> : null}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          {step === 1 ? (
            <div className="surface p-5 md:p-6">
              <SectionTitle title="基本信息" description="这些信息会展示在职位卡片与候选人投递页。" icon={<BriefcaseBusiness />} />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="职位名称" required error={errors.title} hint="支持从标准职位库搜索选择，也可手动输入" className="sm:col-span-2">
                  <JobTitlePicker value={title} onChange={(e) => { setTitle(e); if (errors.title) setErrors((prev) => ({ ...prev, title: "" })); }} invalid={!!errors.title} />
                </Field>
                <Field label="所属部门" required>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.filter((d) => d.parentId).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="工作地点" required error={errors.location}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="pl-9" />
                  </div>
                </Field>
                <Field label="办公方式">
                  <div className="flex rounded-[10px] border border-line bg-[#f7f8f4] p-1">
                    {([["onsite", "坐班"], ["hybrid", "混合"], ["remote", "远程"]] as const).map(([k, label]) => (
                      <button key={k} onClick={() => setWorkMode(k)} className={cn("flex-1 rounded-md py-1.5 text-[13px] font-medium transition-colors", workMode === k ? "bg-white text-pine shadow-sm" : "text-muted hover:text-ink")}>{label}</button>
                    ))}
                  </div>
                </Field>
                <Field label="用工类型">
                  <Select value={employment} onValueChange={(v) => setEmployment(v as typeof employment)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">全职</SelectItem>
                      <SelectItem value="intern">实习</SelectItem>
                      <SelectItem value="contract">合同制</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="招聘人数">
                  <NumberStepper value={headcount} onChange={setHeadcount} />
                </Field>
                <Field label="薪资范围" required error={errors.salary}>
                  <Select value={salary} onValueChange={setSalary}>
                    <SelectTrigger><SelectValue placeholder="选择薪资范围" /></SelectTrigger>
                    <SelectContent>
                      {["8–12K · 13薪", "10–15K · 13薪", "12–18K · 13薪", "15–20K · 14薪", "18–25K · 14薪", "20–30K · 14薪", "25–35K · 14薪", "30–45K · 14薪", "35–50K · 14薪", "40–55K · 15薪", "45–65K · 16薪", "50–70K · 16薪", "60–80K · 16薪", "80K以上 · 面议"].map((range) => <SelectItem key={range} value={range}>{range}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="经验要求" hint="可选择或直接输入">
                  <ComboInput value={experience} onChange={setExperience} options={["应届 / 1 年以内", "1–3 年", "3–5 年", "5–8 年", "8–10 年", "10 年以上"]} placeholder="选择或输入经验要求" />
                </Field>
                <Field label="学历要求">
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="不限">不限</SelectItem>
                      <SelectItem value="大专及以上">大专及以上</SelectItem>
                      <SelectItem value="本科及以上">本科及以上</SelectItem>
                      <SelectItem value="硕士及以上">硕士及以上</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="招聘负责人">
                  <PersonSelect employees={employees.filter((e) => e.status === "active")} departments={departments} value={ownerId} onChange={setOwnerId} placeholder="搜索并选择负责人" />
                </Field>
                <Field label="协助人" hint="可多选">
                  <MultiPicker
                    items={employees.filter((e) => e.status === "active").map((e) => ({ id: e.id, name: e.name, description: [e.email, departments.find((d) => d.id === e.departmentId)?.name].filter(Boolean).join(" · ") }))}
                    value={assistantIds}
                    onChange={setAssistantIds}
                    placeholder="搜索并添加协助人"
                    searchPlaceholder="搜索姓名、邮箱或部门"
                    maxVisible={2}
                  />
                </Field>
                <Field label="优先级">
                  <div className="flex rounded-[10px] border border-line bg-[#f7f8f4] p-1">
                    {([["normal", "常规"], ["high", "急招"]] as const).map(([k, label]) => (
                      <button key={k} onClick={() => setPriority(k)} className={cn("flex-1 rounded-md py-1.5 text-[13px] font-medium transition-colors", priority === k ? "bg-white text-pine shadow-sm" : "text-muted hover:text-ink")}>{label}</button>
                    ))}
                  </div>
                </Field>
                <div className="sm:col-span-2">
                  <AiTextarea
                    label="职位简介"
                    hint="一句话说明这个岗位的价值"
                    value={summary}
                    onChange={setSummary}
                    placeholder="例如：负责企业级 AI 招聘产品的规划与落地…"
                    minHeight="min-h-[100px]"
                    generate={generateSummaryText}
                    polish={polishDraft}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                <span className="flex items-center gap-1.5 text-[12.5px] text-muted"><CircleAlert className="size-3" /> 带 * 为必填项</span>
                <Button onClick={next}>下一步 <ArrowRight /></Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="surface p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionTitle title="岗位要求" description="写得越具体，AI 的人岗匹配与面试题纲越准确。" icon={<Target />} />
                <Button variant="soft" size="sm" onClick={generateJd} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="animate-spin" /> : <Wand2 />} AI 帮我写
                </Button>
              </div>
              <div className="mt-6 space-y-5">
                <AiTextarea
                  label="工作职责"
                  hint="每行一条，建议 4–6 条"
                  value={responsibilitiesText}
                  onChange={setResponsibilitiesText}
                  placeholder={"负责…\n协同…\n推动…"}
                  minHeight="min-h-[140px]"
                  generate={generateResponsibilitiesText}
                  polish={polishDraft}
                />
                <AiTextarea
                  label="任职要求"
                  hint="每行一条，区分硬性要求与加分项"
                  value={requirementsText}
                  onChange={setRequirementsText}
                  placeholder={"5 年以上相关经验…\n熟悉…\n具备…"}
                  minHeight="min-h-[140px]"
                  generate={generateRequirementsText}
                  polish={polishDraft}
                />
                <Field label="关键技能标签" hint="按 Enter 添加">
                  <div className="flex flex-wrap gap-1.5 rounded-[10px] border border-line bg-surface p-2">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center whitespace-nowrap gap-1 rounded-md bg-pine-soft px-2 py-1 text-[12.5px] text-pine">
                        {s}
                        <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} aria-label={`移除${s}`} className="text-pine/60 hover:text-pine"><X className="size-3" /></button>
                      </span>
                    ))}
                    <input
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      placeholder={skills.length ? "添加技能…" : "例如：B 端产品、AI 产品…"}
                      className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[13.5px] outline-none placeholder:text-[#9ba69f]"
                    />
                  </div>
                </Field>
                <div className="rounded-xl border border-line bg-[#fafbf8] p-4">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-ink"><Sparkles className="size-3.5 text-signal" /> AI 校准建议</div>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-muted">
                    建议补充「跨团队推动」的具体场景，并明确是否接受管理岗转一线。你的要求越具体，后续筛选与面试越省时间。
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft /> 上一步</Button>
                <Button onClick={next}>下一步 <ArrowRight /></Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="surface p-5 md:p-6">
                <SectionTitle title="面试流程" description="选择一个面试流程模板，职位发布后候选人将按该流程推进。Offer 审批流程不在此选择。" icon={<Users />} />
                <div className="mt-5">
                  <Field label="面试流程模板" required hint="Offer 审批流程在发放 Offer 时独立应用">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableFlows.map((flow) => {
                        const selected = selectedFlow?.id === flow.id;
                        return (
                          <button
                            key={flow.id}
                            type="button"
                            onClick={() => setFlowTemplateId(flow.id)}
                            className={cn(
                              "rounded-xl border p-3 text-left transition-colors",
                              selected ? "border-pine bg-pine-soft/35" : "border-line bg-surface hover:border-line-strong hover:bg-[#fafbf8]"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={cn("text-[13px] font-medium", selected ? "text-pine" : "text-ink")}>{flow.name}</span>
                                  {flow.isDefault ? <span className="rounded bg-pine-soft px-1.5 py-0.5 text-[10.5px] font-medium text-pine">默认</span> : null}
                                </div>
                                <div className="mt-1 text-[11.5px] text-muted">{countInterviewRounds(flow)} 轮面试 · {flow.steps.length} 个环节{hasAiStep(flow) ? " · 含数字人初试" : ""}</div>
                              </div>
                              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-pine bg-pine text-white" : "border-line bg-white text-transparent")}><Check className="size-3" /></span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  {selectedFlow ? (
                    <div className="mt-3 rounded-xl border border-line bg-[#fafbf8] p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink"><Users className="size-3.5 text-pine" /> {selectedFlow.name}</div>
                        <span className="text-[11.5px] text-muted">{countInterviewRounds(selectedFlow)} 轮面试 · {selectedFlow.steps.length} 个环节</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {selectedFlow.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-1.5">
                            <span className={cn("rounded-md border px-2 py-1 text-[11.5px] font-medium", flowStepMeta[step.type].chipClass)}>{step.name}</span>
                            {index < selectedFlow.steps.length - 1 ? <ChevronRight className="size-3 text-[#b9c3ba]" /> : null}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[11.5px] leading-5 text-muted">{selectedFlow.description}</p>
                    </div>
                  ) : null}
                </div>
                <div className="mt-5 space-y-3 border-t border-line pt-4">
                  {[
                    { checked: aiScreen, set: setAiScreen, title: "AI 简历初筛", desc: "自动解析简历并给出岗位匹配度，低于 60 分进入待定区。" },
                    { checked: autoMessage, set: setAutoMessage, title: "自动发送消息", desc: "推进阶段时，自动使用对应模板向候选人发送邮件与短信。" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start justify-between gap-4 rounded-xl border border-line p-3.5">
                      <div>
                        <div className="text-[13px] font-medium text-ink">{item.title}</div>
                        <div className="mt-0.5 text-[12.5px] leading-5 text-muted">{item.desc}</div>
                      </div>
                      <Switch checked={item.checked} onCheckedChange={item.set} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface p-5 md:p-6">
                <SectionTitle title="确认发布" description="发布前，再检查一次职位信息。" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-0.5 divide-y divide-line">
                    {[["职位名称", title || "未填写"], ["所属部门", dept?.name ?? "—"], ["工作地点", location], ["用工类型", employment === "fulltime" ? "全职" : employment === "intern" ? "实习" : "合同制"]].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-[13px]"><span className="text-muted">{k}</span><span className="font-medium text-ink">{v}</span></div>
                    ))}
                  </div>
                  <div className="space-y-0.5 divide-y divide-line">
                    {[["薪资范围", salary], ["经验要求", experience], ["招聘人数", `${headcount} 人`], ["负责人", owner?.name ?? "—"], ["面试流程模板", selectedFlow?.name ?? "—"]].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-[13px]"><span className="text-muted">{k}</span><span className="font-medium text-ink">{v}</span></div>
                    ))}
                  </div>
                </div>
                {summary ? <p className="mt-4 rounded-xl bg-[#fafbf8] p-3.5 text-[12.5px] leading-5 text-muted">{summary}</p> : null}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                  <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft /> 上一步</Button>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={saveDraft}>保存草稿</Button>
                    <Button onClick={publish} disabled={publishing}>
                      {publishing ? <Loader2 className="animate-spin" /> : <Check />}
                      {publishing ? "发布中…" : "发布职位"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="sticky top-[84px] space-y-4">
            <div className="surface overflow-hidden">
              <div className="border-b border-line bg-[#fafbf8] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink">职位预览</span>
                  <span className={cn("rounded px-1.5 py-0.5 text-[12px] font-medium", priority === "high" ? "bg-signal-soft text-signal" : "bg-pine-soft text-pine")}>{priority === "high" ? "急招" : "常规"}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine"><BriefcaseBusiness className="size-4" /></div>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-ink">{title || "未命名职位"}</div>
                    <div className="mt-1 text-[12px] text-muted">{dept?.name ?? "选择部门"} · {location || "工作地点"}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[12.5px]">
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">薪资</div><div className="mt-1 font-medium text-ink">{salary || "—"}</div></div>
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">招聘人数</div><div className="mt-1 font-medium text-ink">{headcount} 人</div></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {skills.slice(0, 4).map((s) => <span key={s} className="rounded bg-[#eef1ec] px-1.5 py-1 text-[12px] text-ink-soft">{s}</span>)}
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted"><span>信息完整度</span><span className="num font-medium text-pine">{completeness}%</span></div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef1ec]"><div className="h-full rounded-full bg-pine transition-all duration-500" style={{ width: `${completeness}%` }} /></div>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] bg-pine-deep p-4 text-white">
              <div className="flex items-center gap-2 text-[13px] font-medium"><Sparkles className="size-3.5 theme-accent-text" /> 小聘建议</div>
              <p className="mt-2 text-[12.5px] leading-5 text-white/65">
                这个职位发布后，预计每周可收到 12–18 份简历。AI 会优先推送匹配度 80 分以上的候选人。
              </p>
              <button onClick={generateJd} className="mt-3 flex items-center gap-1 text-[12.5px] font-medium theme-accent-text hover:text-white">
                让 AI 补齐 JD <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="flex items-start gap-2 px-1 text-[12px] leading-5 text-muted">
              <CircleAlert className="mt-0.5 size-3 shrink-0" />
              发布即表示你确认职位信息真实有效，并同意遵守平台招聘规范。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
