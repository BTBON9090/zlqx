"use client";

import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/toggle";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const stepDefs = [
  { n: 1, title: "基本信息", desc: "职位、部门与用人信息" },
  { n: 2, title: "岗位要求", desc: "职责、能力与筛选标准" },
  { n: 3, title: "流程与发布", desc: "面试流程、AI 设置与确认" },
];

export default function NewJobPage() {
  const router = useRouter();
  const { departments, employees, addJob } = useApp();
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
  const [priority, setPriority] = useState<"high" | "normal">("normal");
  const [summary, setSummary] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [skills, setSkills] = useState<string[]>(["B 端产品", "AI 产品", "数据分析"]);
  const [skillDraft, setSkillDraft] = useState("");
  const [aiScreen, setAiScreen] = useState(true);
  const [digitalInterview, setDigitalInterview] = useState(true);
  const [autoMessage, setAutoMessage] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const dept = departments.find((d) => d.id === departmentId);
  const owner = employees.find((e) => e.id === ownerId);
  const responsibilities = responsibilitiesText.split("\n").map((s) => s.trim()).filter(Boolean);
  const requirements = requirementsText.split("\n").map((s) => s.trim()).filter(Boolean);

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
      priority,
    });
    toast.success("职位草稿已保存");
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <Link href="/jobs" className="flex items-center gap-1 transition-colors hover:text-pine"><ArrowLeft className="size-3" /> 职位管理</Link>
        <ChevronRight className="size-3" />
        <span className="text-ink">新建职位</span>
      </div>

      <PageHeader
        kicker="发布新职位"
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
              <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", step === s.n ? "bg-white/15 text-white" : step > s.n ? "bg-pine text-white" : "bg-[#eef0ec] text-muted")}>
                {step > s.n ? <Check className="size-3" /> : s.n}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11.5px] font-medium">{s.title}</span>
                <span className={cn("mt-0.5 hidden truncate text-[9.5px] sm:block", step === s.n ? "text-white/65" : "text-muted")}>{s.desc}</span>
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
                <Field label="职位名称" required error={errors.title} className="sm:col-span-2">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：高级产品经理" className="h-11 text-[14px]" />
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
                      <button key={k} onClick={() => setWorkMode(k)} className={cn("flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors", workMode === k ? "bg-white text-pine shadow-sm" : "text-muted hover:text-ink")}>{label}</button>
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
                  <Input type="number" min={1} max={99} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} />
                </Field>
                <Field label="薪资范围" required error={errors.salary}>
                  <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="例如：30–45K · 14薪" />
                </Field>
                <Field label="经验要求">
                  <Input value={experience} onChange={(e) => setExperience(e.target.value)} />
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
                  <Select value={ownerId} onValueChange={setOwnerId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {employees.filter((e) => ["emp-1", "emp-2", "emp-3", "emp-4"].includes(e.id)).map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="优先级">
                  <div className="flex rounded-[10px] border border-line bg-[#f7f8f4] p-1">
                    {([["normal", "常规"], ["high", "急招"]] as const).map(([k, label]) => (
                      <button key={k} onClick={() => setPriority(k)} className={cn("flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors", priority === k ? "bg-white text-pine shadow-sm" : "text-muted hover:text-ink")}>{label}</button>
                    ))}
                  </div>
                </Field>
                <Field label="职位简介" hint="一句话说明这个岗位的价值" className="sm:col-span-2">
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="例如：负责企业级 AI 招聘产品的规划与落地…" className="min-h-[100px]" />
                </Field>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                <span className="flex items-center gap-1.5 text-[10px] text-muted"><CircleAlert className="size-3" /> 带 * 为必填项</span>
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
                <Field label="工作职责" hint="每行一条，建议 4–6 条">
                  <Textarea value={responsibilitiesText} onChange={(e) => setResponsibilitiesText(e.target.value)} placeholder={"负责…\n协同…\n推动…"} className="min-h-[140px]" />
                </Field>
                <Field label="任职要求" hint="每行一条，区分硬性要求与加分项">
                  <Textarea value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} placeholder={"5 年以上相关经验…\n熟悉…\n具备…"} className="min-h-[140px]" />
                </Field>
                <Field label="关键技能标签" hint="按 Enter 添加">
                  <div className="flex flex-wrap gap-1.5 rounded-[10px] border border-line bg-surface p-2">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-md bg-pine-soft px-2 py-1 text-[10.5px] text-pine">
                        {s}
                        <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} aria-label={`移除${s}`} className="text-pine/60 hover:text-pine"><X className="size-3" /></button>
                      </span>
                    ))}
                    <input
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      placeholder={skills.length ? "添加技能…" : "例如：B 端产品、AI 产品…"}
                      className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[12px] outline-none placeholder:text-[#9ba69f]"
                    />
                  </div>
                </Field>
                <div className="rounded-xl border border-line bg-[#fafbf8] p-4">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-ink"><Sparkles className="size-3.5 text-signal" /> AI 校准建议</div>
                  <p className="mt-1.5 text-[10.5px] leading-5 text-muted">
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
                <SectionTitle title="招聘流程" description="职位发布后，候选人将按这个流程推进。" icon={<Users />} />
                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  {["简历筛选", "初试", "复试", "终面", "Offer"].map((s, i) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className={cn("rounded-lg border px-3 py-2 text-[10.5px] font-medium", i === 0 ? "border-pine bg-pine-soft text-pine" : "border-line bg-[#fafbf8] text-ink-soft")}>
                        <span className="mr-1.5 num text-[9px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                        {s}
                      </div>
                      {i < 4 ? <ChevronRight className="size-3 text-[#b9c3ba]" /> : null}
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3 border-t border-line pt-4">
                  {[
                    { checked: aiScreen, set: setAiScreen, title: "AI 简历初筛", desc: "自动解析简历并给出岗位匹配度，低于 60 分进入待定区。" },
                    { checked: digitalInterview, set: setDigitalInterview, title: "数字人初试", desc: "候选人可在 7×24 小时内完成 20 分钟结构化初试，自动生成纪要。" },
                    { checked: autoMessage, set: setAutoMessage, title: "自动发送消息", desc: "推进阶段时，自动使用对应模板向候选人发送邮件与短信。" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start justify-between gap-4 rounded-xl border border-line p-3.5">
                      <div>
                        <div className="text-[11.5px] font-medium text-ink">{item.title}</div>
                        <div className="mt-0.5 text-[10px] leading-5 text-muted">{item.desc}</div>
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
                      <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-[11px]"><span className="text-muted">{k}</span><span className="font-medium text-ink">{v}</span></div>
                    ))}
                  </div>
                  <div className="space-y-0.5 divide-y divide-line">
                    {[["薪资范围", salary], ["经验要求", experience], ["招聘人数", `${headcount} 人`], ["负责人", owner?.name ?? "—"]].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-[11px]"><span className="text-muted">{k}</span><span className="font-medium text-ink">{v}</span></div>
                    ))}
                  </div>
                </div>
                {summary ? <p className="mt-4 rounded-xl bg-[#fafbf8] p-3.5 text-[10.5px] leading-5 text-muted">{summary}</p> : null}
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
                  <span className="text-[11px] font-medium text-ink">职位预览</span>
                  <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", priority === "high" ? "bg-signal-soft text-signal" : "bg-pine-soft text-pine")}>{priority === "high" ? "急招" : "常规"}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine"><BriefcaseBusiness className="size-4" /></div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-ink">{title || "未命名职位"}</div>
                    <div className="mt-1 text-[9.5px] text-muted">{dept?.name ?? "选择部门"} · {location || "工作地点"}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">薪资</div><div className="mt-1 font-medium text-ink">{salary || "—"}</div></div>
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">招聘人数</div><div className="mt-1 font-medium text-ink">{headcount} 人</div></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {skills.slice(0, 4).map((s) => <span key={s} className="rounded bg-[#eef1ec] px-1.5 py-1 text-[9px] text-ink-soft">{s}</span>)}
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[9.5px] text-muted"><span>信息完整度</span><span className="num font-medium text-pine">{completeness}%</span></div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef1ec]"><div className="h-full rounded-full bg-pine transition-all duration-500" style={{ width: `${completeness}%` }} /></div>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] bg-pine-deep p-4 text-white">
              <div className="flex items-center gap-2 text-[11px] font-medium"><Sparkles className="size-3.5 text-[#f2b3a1]" /> 小聘建议</div>
              <p className="mt-2 text-[10.5px] leading-5 text-[#a9c3b5]">
                这个职位发布后，预计每周可收到 12–18 份简历。AI 会优先推送匹配度 80 分以上的候选人。
              </p>
              <button onClick={generateJd} className="mt-3 flex items-center gap-1 text-[10px] font-medium text-[#f0b09d] hover:text-white">
                让 AI 补齐 JD <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="flex items-start gap-2 px-1 text-[9.5px] leading-5 text-muted">
              <CircleAlert className="mt-0.5 size-3 shrink-0" />
              发布即表示你确认职位信息真实有效，并同意遵守平台招聘规范。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
