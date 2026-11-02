"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BriefcaseBusiness,
  Calendar,
  CalendarClock,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Send,
  Sparkles,
  Star,
  Target,
  UserRound,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleInterviewDialog } from "@/components/interviews/schedule-dialog";
import { useApp } from "@/lib/store";
import { useConfirm } from "@/components/ui/confirm";
import { candidateStageMeta, cn, formatDateWithWeek, getMatchThresholds, interviewStatusMeta, interviewTypeMeta, matchSuggestion, scoreTone } from "@/lib/utils";
import { InfoTip } from "@/components/ui/info-tip";
import type { Candidate, CandidateStage, Job } from "@/lib/types";

const recommendationLabels: Record<string, string> = {
  strong_yes: "强烈推荐",
  yes: "推荐",
  neutral: "待定",
  no: "不推荐",
};

function OfferCreateDialog({
  open,
  onOpenChange,
  candidate,
  job,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  candidate: Candidate;
  job?: Job;
}) {
  const { addOffer, employees } = useApp();
  const [salary, setSalary] = useState(candidate.expectedSalary.replace("–", "-") + " · 14薪");
  const [bonus, setBonus] = useState("年度绩效奖金 0–3 个月");
  const [startDate, setStartDate] = useState("2026-11-23");
  const [deadline, setDeadline] = useState("2026-11-10");
  const [approverId, setApproverId] = useState("emp-3");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSalary(candidate.expectedSalary.replace("–", "-") + " · 14薪");
      setBonus("年度绩效奖金 0–3 个月");
      setStartDate("2026-11-23");
      setDeadline("2026-11-10");
      setApproverId("emp-3");
      setNote("");
    }
  }, [open, candidate]);

  const submit = () => {
    if (!salary.trim()) {
      toast.error("请填写薪资方案");
      return;
    }
    addOffer({
      candidateId: candidate.id,
      jobId: candidate.jobId,
      salary,
      bonus,
      startDate,
      deadline,
      approverId,
      note,
    });
    toast.success("Offer 已创建，等待审批");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="创建 Offer" description={`${candidate.name} · ${job?.title ?? "应聘职位"}`} icon={<FileText />} />
        <DialogBody className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-[#f7f8f4] px-3 py-2.5 text-[12.5px] text-muted">
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[12px] text-pine">1</span>
            招聘负责人
            <ArrowRight className="size-3" />
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[12px] text-pine">2</span>
            部门负责人
            <ArrowRight className="size-3" />
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[12px] text-pine">3</span>
            财务审批
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="薪资方案" required className="sm:col-span-2">
              <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="例如：30K · 14薪" />
            </Field>
            <Field label="奖金 / 补贴" className="sm:col-span-2">
              <Input value={bonus} onChange={(e) => setBonus(e.target.value)} />
            </Field>
            <Field label="入职日期" required>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="Offer 有效期" required>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
            <Field label="审批人" className="sm:col-span-2">
              <Select value={approverId} onValueChange={setApproverId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => ["emp-3", "emp-5", "emp-4"].includes(e.id)).map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="备注" className="sm:col-span-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：候选人已口头接受，希望 11 月 23 日入职。" className="min-h-[64px]" />
            </Field>
          </div>
          <div className="rounded-xl border border-line bg-[#fcfdf9] p-3 text-[12px] leading-5 text-muted">
            Offer 创建后将进入审批流。审批通过后可发送给候选人，并自动同步至候选人流程与消息记录。
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}><Check /> 创建并提交审批</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MessageDialog({
  open,
  onOpenChange,
  candidate,
  job,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  candidate: Candidate;
  job?: Job;
}) {
  const { templates } = useApp();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const template = templates.find((t) => t.id === templateId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="发送消息" description={`${candidate.name} · ${job?.title ?? "候选人"}`} icon={<Send />} />
        <DialogBody className="space-y-4">
          <Field label="消息模板">
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{templates.filter((t) => t.enabled).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="rounded-xl border border-line bg-[#fafbf8] p-4">
            <div className="text-[13px] font-medium text-ink">{template?.subject}</div>
            <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-5 text-muted">
              {template?.emailBody.replace(/\{\{candidate_name\}\}/g, candidate.name).replace(/\{\{job_title\}\}/g, job?.title ?? "").replace(/\{\{company\}\}/g, "澄明科技")}
            </p>
          </div>
          <Field label="补充说明" hint="可选">
            <Textarea placeholder="添加一段只对这位候选人可见的话…" className="min-h-[64px]" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => { toast.success("消息已发送给候选人"); onOpenChange(false); }}><Send /> 发送</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CandidateDrawer({ candidateId, onClose, onNavigate }: { candidateId: string | null; onClose: () => void; onNavigate?: (id: string) => void }) {
  const { candidates, jobs, departments, employees, interviews, notifications, advanceCandidate, addGeneration } = useApp();
  const confirm = useConfirm();
  const candidate = candidates.find((c) => c.id === candidateId);
  const [tab, setTab] = useState("resume");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (candidateId) setTab("resume");
  }, [candidateId]);

  const job = jobs.find((j) => j.id === candidate?.jobId);
  const dept = departments.find((d) => d.id === job?.departmentId);
  const owner = employees.find((e) => e.id === candidate?.ownerId);
  const candidateInterviews = interviews.filter((i) => i.candidateId === candidateId).sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`));
  const candidateNotifications = notifications.filter((n) => n.recipient === candidate?.name);

  const aiDimensions = useMemo(() => {
    if (!candidate || !job) return [];
    return job.aiProfile.radar.map((r, i) => {
      const offsets = [4, 2, -3, 1, -5];
      return { label: r.label, value: Math.max(58, Math.min(99, candidate.score + offsets[i])) };
    });
  }, [candidate, job]);

  const scoreParts = useMemo(() => {
    if (!candidate) return [];
    const parts = [
      { label: "技能匹配", weight: 35, offset: 4 },
      { label: "经验年限", weight: 25, offset: 2 },
      { label: "行业背景", weight: 20, offset: -3 },
      { label: "稳定性", weight: 10, offset: 1 },
      { label: "地点匹配", weight: 10, offset: -5 },
    ];
    return parts.map((part) => ({ ...part, value: Math.max(55, Math.min(99, candidate.score + part.offset)) }));
  }, [candidate]);

  if (!candidate) {
    return <Sheet open={false} onOpenChange={onClose} title="候选人详情"><div /></Sheet>;
  }

  const stage = candidateStageMeta[candidate.stage];
  const tone = scoreTone(candidate.score);
  const matchThresholds = getMatchThresholds(job);
  const suggestion = matchSuggestion(candidate.score, matchThresholds);

  const advance = (next: CandidateStage) => {
    advanceCandidate(candidate.id, next, "通过候选人详情页操作");
    toast.success(`已推进至${candidateStageMeta[next].label}`);
  };

  const regenerate = async () => {
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    addGeneration({
      type: "report",
      title: `${candidate.name} · 推荐报告`,
      subtitle: `${job?.title} · 匹配度 ${candidate.score}%`,
      status: "ready",
      jobId: candidate.jobId,
      candidateId: candidate.id,
    });
    setRegenerating(false);
    toast.success("已重新生成推荐报告");
  };

  return (
    <>
      <Sheet open={!!candidateId} onOpenChange={(v) => !v && onClose()} width="820px" title="候选人详情" onPrevious={onNavigate && candidates.findIndex((c) => c.id === candidate.id) > 0 ? () => onNavigate(candidates[candidates.findIndex((c) => c.id === candidate.id) - 1].id) : undefined} onNext={onNavigate && candidates.findIndex((c) => c.id === candidate.id) < candidates.length - 1 ? () => onNavigate(candidates[candidates.findIndex((c) => c.id === candidate.id) + 1].id) : undefined}>
        <div className="flex h-full flex-col bg-paper">
          <div className="border-b border-line bg-surface px-5 pb-0 pt-5 md:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
              <div className="flex min-w-0 items-start gap-3.5">
                <Avatar name={candidate.name} size={52} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-ink">{candidate.name}</h2>
                    <span className="text-[12.5px] text-muted">{candidate.gender} · {candidate.age} 岁 · {candidate.years} 年经验</span>
                    <span className={cn("inline-flex h-[21px] items-center gap-1.5 rounded-md px-2 text-[12px] font-medium", stage.tone)}>
                      <span className={cn("size-1.5 rounded-full", stage.dot)} /> {stage.label}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
                    <span>{candidate.currentCompany} · {candidate.currentTitle}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {candidate.location}</span>
                    <span className="flex items-center gap-1"><BriefcaseBusiness className="size-3" /> {candidate.degree} · {candidate.school}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {candidate.tags.map((t) => <span key={t} className="rounded bg-[#eef1ec] px-1.5 py-0.5 text-[12px] text-ink-soft">{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-[12px] text-muted">岗位匹配度 <InfoTip text="由 AI 根据岗位画像与简历计算：技能 35%、经验 25%、行业 20%、稳定性 10%、地点 10%。" /></div>
                  <div className={cn("num mt-0.5 text-[24px] font-semibold leading-none", tone.text)}>{candidate.score}<span className="text-[13px] text-muted">/100</span></div>
                  <div className={cn("mt-1 text-[10.5px] font-medium", suggestion.tone)}>{suggestion.label} · ≥{matchThresholds.pass}</div>
                </div>
                <div className="flex gap-1">
                  <a href={`tel:${candidate.phone.replace(/\s/g, "")}`} aria-label="拨打电话" className="flex size-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-pine/30 hover:text-pine"><Phone className="size-3.5" /></a>
                  <a href={`mailto:${candidate.email}`} aria-label="发送邮件" className="flex size-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-pine/30 hover:text-pine"><Mail className="size-3.5" /></a>
                  <button onClick={() => { navigator.clipboard?.writeText(`${candidate.name} ${candidate.phone} ${candidate.email}`); toast.success("联系方式已复制"); }} aria-label="复制联系方式" className="flex size-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-pine/30 hover:text-pine"><Copy className="size-3.5" /></button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setScheduleOpen(true)}><CalendarClock /> 安排面试</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm"><ArrowUpRight /> 推进流程 <ChevronDown /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>推进到</DropdownMenuLabel>
                  {(["screening", "interview", "offer", "hired", "archived"] as CandidateStage[]).filter((s) => s !== candidate.stage).map((s) => (
                    <DropdownMenuItem key={s} onClick={() => advance(s)}>
                      <span className={cn("size-1.5 rounded-full", candidateStageMeta[s].dot)} /> 推进至{candidateStageMeta[s].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="secondary" onClick={() => setOfferOpen(true)}><FileText /> 创建 Offer</Button>
              <Button size="sm" variant="ghost" onClick={() => setMessageOpen(true)}><Send /> 发送消息</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-4" /></button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => toast.success("已加入人才库")}><Archive /> 加入人才库</DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => { const ok = await confirm({ title: "归档该候选人？", description: `确定归档「${candidate.name}」吗？归档后可在已归档中找回。`, confirmText: "归档", tone: "danger" }); if (!ok) return; advanceCandidate(candidate.id, "archived", "手动归档"); toast.success("候选人已归档"); }}><Archive /> 归档候选人</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.info("已通知负责人跟进")}><UserRound /> 通知负责人</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {candidate.stage === "offer" ? <Badge tone="amber" dot>Offer 进行中</Badge> : null}
            </div>
            <div className="mt-3">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="border-b-0">
                  <TabsTrigger value="resume">简历</TabsTrigger>
                  <TabsTrigger value="ai">AI 评估</TabsTrigger>
                  <TabsTrigger value="interviews">面试 <span className="rounded bg-[#eef1ec] px-1.5 py-0.5 text-[12px] text-muted">{candidateInterviews.length}</span></TabsTrigger>
                  <TabsTrigger value="messages">沟通记录</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "resume" ? (
              <div className="grid gap-4 p-5 md:p-6 lg:grid-cols-[1fr_248px]">
                <div className="space-y-4">
                  <section className="surface p-5">
                    <div className="mb-4 flex items-center gap-2"><FileText className="size-3.5 text-pine" /><h3 className="text-[13.5px] font-semibold text-ink">基本信息</h3></div>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                      {[
                        ["姓名", candidate.name], ["性别", candidate.gender], ["年龄", `${candidate.age} 岁`],
                        ["最高学历", candidate.degree], ["毕业院校", candidate.school], ["专业", candidate.major],
                        ["工作年限", `${candidate.years} 年`], ["所在城市", candidate.location], ["期望薪资", candidate.expectedSalary],
                        ["到岗时间", candidate.availability], ["来源", candidate.source], ["投递时间", candidate.appliedAt],
                      ].map(([k, v]) => (
                        <div key={k}><div className="text-[12px] text-muted">{k}</div><div className="mt-1 text-[13px] font-medium leading-5 text-ink">{v}</div></div>
                      ))}
                    </div>
                  </section>

                  <section className="surface p-5">
                    <div className="mb-3 flex items-center gap-2"><Target className="size-3.5 text-pine" /><h3 className="text-[13.5px] font-semibold text-ink">个人优势</h3></div>
                    <p className="text-[13px] leading-6 text-ink-soft">{candidate.summary}</p>
                  </section>

                  <section className="surface p-5">
                    <div className="mb-4 flex items-center gap-2"><BriefcaseBusiness className="size-3.5 text-pine" /><h3 className="text-[13.5px] font-semibold text-ink">工作经历</h3></div>
                    <div className="space-y-0">
                      {candidate.experience.map((e, i) => (
                        <div key={`${e.company}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
                          <div className="flex flex-col items-center">
                            <span className={cn("mt-1 size-2 rounded-full border-2 border-white ring-1", i === 0 ? "bg-pine ring-pine" : "bg-[#c9d3ca] ring-[#c9d3ca]")} />
                            {i < candidate.experience.length - 1 ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <div className="text-[13px] font-medium text-ink">{e.company} · {e.title}</div>
                              <div className="text-[12px] text-muted">{e.period}</div>
                            </div>
                            {e.summary ? <p className="mt-1 text-[12.5px] leading-5 text-muted">{e.summary}</p> : null}
                          </div>
                        </div>
                      ))}
                      {candidate.experience.length === 0 ? <div className="text-[12.5px] text-muted">暂无工作经历</div> : null}
                    </div>
                  </section>

                  <section className="surface p-5">
                    <div className="mb-4 flex items-center gap-2"><Calendar className="size-3.5 text-pine" /><h3 className="text-[13.5px] font-semibold text-ink">教育经历</h3></div>
                    {candidate.education.map((e) => (
                      <div key={e.school} className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="text-[13px] font-medium text-ink">{e.school} · {e.major}</div>
                        <div className="text-[12px] text-muted">{e.degree} · {e.period}</div>
                      </div>
                    ))}
                  </section>

                  <section className="surface p-5">
                    <div className="mb-3 flex items-center gap-2"><Sparkles className="size-3.5 text-pine" /><h3 className="text-[13.5px] font-semibold text-ink">技能标签</h3></div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.map((s) => <span key={s} className="rounded-md border border-line bg-[#fafbf8] px-2 py-1 text-[12.5px] text-ink-soft">{s}</span>)}
                    </div>
                  </section>

                  <section className="surface p-5">
                    <div className="mb-3 flex items-center gap-2"><FileText className="size-3.5 text-pine" /><h3 className="text-[13.5px] font-semibold text-ink">附件简历</h3></div>
                    <div className="space-y-2">
                      {[["简历_原始版本.pdf", "PDF · 284 KB"], ["作品集_2026.pdf", "PDF · 4.2 MB"]].map(([name, meta]) => (
                        <div key={name} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-signal-soft text-signal"><FileText className="size-3.5" /></span>
                          <div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-medium text-ink">{name}</div><div className="mt-0.5 text-[12px] text-muted">{meta}</div></div>
                          <button onClick={() => toast.success("开始下载附件")} aria-label="下载" className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink"><Download className="size-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="space-y-4">
                  <div className="surface p-4">
                    <div className="text-[12px] text-muted">应聘职位</div>
                    <Link href={`/jobs/${job?.id}`} className="mt-1.5 block text-[13.5px] font-semibold leading-5 text-ink hover:text-pine">{job?.title}</Link>
                    <div className="mt-1 text-[12px] text-muted">{dept?.name} · {job?.location}</div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f7f8f4] px-2.5 py-2">
                      <div className="flex-1 text-[12px] text-muted">匹配度</div>
                      <div className={cn("num text-[14px] font-semibold", tone.text)}>{candidate.score}</div>
                      <span className={cn("text-[10.5px]", suggestion.tone)}>{suggestion.label}</span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[12px]">
                      <div className="flex justify-between gap-2"><span className="text-muted">负责人</span><span className="font-medium text-ink">{owner?.name}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-muted">招聘来源</span><span className="font-medium text-ink">{candidate.source}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-muted">投递时间</span><span className="font-medium text-ink">{candidate.appliedAt}</span></div>
                    </div>
                  </div>

                  <div className="surface p-4">
                    <div className="text-[12px] text-muted">当前流程</div>
                    <div className="mt-3 space-y-0">
                      {job?.stages.map((s, i) => {
                        const active = (candidate.stage === "screening" && i === 0) || (candidate.stage === "interview" && i >= 1 && i <= 3) || (candidate.stage === "offer" && i === 4) || candidate.stage === "hired";
                        return (
                          <div key={s.key} className="flex gap-2.5 pb-3 last:pb-0">
                            <div className="flex flex-col items-center">
                              <span className={cn("size-2 rounded-full", active ? "bg-pine" : "bg-[#d6ded6]")} />
                              {i < job.stages.length - 1 ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
                            </div>
                            <div className="-mt-0.5 flex-1">
                              <div className={cn("text-[12.5px] font-medium", active ? "text-ink" : "text-muted")}>{s.name}</div>
                              {s.type === "interview" && s.aiEnabled ? <div className="mt-0.5 text-[11.5px] text-muted">含数字人初试</div> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[16px] bg-pine-deep p-4 text-white">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium"><Sparkles className="size-3 theme-accent-text" /> 小聘建议</div>
                    <p className="mt-2 text-[12px] leading-5 text-white/65">{candidate.ai.fit.slice(0, 110)}…</p>
                    <button onClick={() => setTab("ai")} className="mt-2.5 flex items-center gap-1 text-[12px] font-medium theme-accent-text hover:text-white">查看完整评估 <ArrowRight className="size-3" /></button>
                  </div>

                  <div className="surface p-4">
                    <div className="text-[12px] text-muted">最近动态</div>
                    <div className="mt-2.5 space-y-2.5">
                      {candidate.timeline.slice(-3).reverse().map((t) => (
                        <div key={t.id} className="flex gap-2">
                          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", t.tone === "success" ? "bg-pine" : t.tone === "warning" ? "bg-amber" : "bg-[#b8c3ba]")} />
                          <div className="min-w-0"><div className="text-[12px] leading-4 text-ink-soft">{t.title}</div><div className="mt-0.5 text-[11.5px] text-muted">{t.at}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            ) : null}

            {tab === "ai" ? (
              <div className="space-y-4 p-5 md:p-6">
                <div className="relative overflow-hidden rounded-[18px] bg-pine-deep p-5 text-white">
                  <div className="signal-grid absolute inset-0 opacity-40" />
                  <div className="relative flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[12.5px] text-white/65"><Sparkles className="size-3 theme-accent-text" /> AI 推荐报告 · {candidate.score}% 匹配</div>
                      <h3 className="mt-2 max-w-[420px] text-[17px] font-semibold leading-6 tracking-[-0.02em]">{candidate.ai.headline}</h3>
                      <p className="mt-2 max-w-[480px] text-[12.5px] leading-5 text-white/60">{candidate.ai.fit}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="text-white/75 hover:bg-white/10 hover:text-white" onClick={regenerate} disabled={regenerating}>
                        {regenerating ? <span className="size-3 animate-spin rounded-full border border-white/30 border-t-white" /> : <Wand2 />} 重新生成
                      </Button>
                      <Button size="sm" className="bg-[var(--surface)] text-pine hover:bg-white" onClick={() => { addGeneration({ type: "report", title: `${candidate.name} · 推荐报告`, subtitle: `${job?.title} · 匹配度 ${candidate.score}%`, status: "ready", jobId: candidate.jobId, candidateId: candidate.id }); toast.success("已存入 AI 工作台"); }}>
                        <FileText /> 存入报告
                      </Button>
                    </div>
                  </div>
                </div>

                <section className="surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">匹配度构成 <InfoTip text="五项权重加权后得到初始匹配度，AI 会再结合岗位紧急度与团队偏好做小幅校准。" /></div>
                    <span className="num text-[12.5px] font-semibold text-pine">综合 {candidate.score} / 100</span>
                  </div>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {scoreParts.map((part) => (
                      <div key={part.label} className="flex items-center gap-2.5 rounded-lg bg-[#fafbf8] px-3 py-2">
                        <span className="w-[58px] shrink-0 text-[11.5px] text-muted">{part.label}</span>
                        <span className="num w-8 shrink-0 text-[10.5px] text-muted">{part.weight}%</span>
                        <Progress value={part.value} className="h-1.5 flex-1" barClassName={part.value >= 85 ? "bg-pine" : part.value >= 75 ? "bg-[#6b9b82]" : "bg-amber"} />
                        <span className="num w-6 text-right text-[11.5px] font-medium text-ink">{part.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[11.5px] leading-5 text-muted">匹配度来自 AI 简历解析与岗位画像，仅用于排序和辅助判断，不建议作为唯一筛选标准。</p>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="surface p-5">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-pine"><Check className="size-3.5" /> 匹配亮点</div>
                    <ul className="mt-3 space-y-2.5">
                      {candidate.ai.highlights.map((h) => <li key={h} className="flex gap-2 text-[12.5px] leading-5 text-ink-soft"><Check className="mt-0.5 size-3 shrink-0 text-pine" />{h}</li>)}
                    </ul>
                  </section>
                  <section className="surface p-5">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-signal"><CircleAlert className="size-3.5" /> 待验证风险</div>
                    <ul className="mt-3 space-y-2.5">
                      {candidate.ai.risks.map((h) => <li key={h} className="flex gap-2 text-[12.5px] leading-5 text-ink-soft"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-signal" />{h}</li>)}
                      {candidate.ai.risks.length === 0 ? <li className="text-[12.5px] text-muted">暂无显著风险</li> : null}
                    </ul>
                  </section>
                </div>

                <section className="surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-semibold text-ink">岗位维度匹配</div>
                    <span className="text-[12px] text-muted">基于 {job?.title} 的画像</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {aiDimensions.map((d) => (
                      <div key={d.label} className="flex items-center gap-3">
                        <span className="w-[64px] shrink-0 text-[12.5px] text-muted">{d.label}</span>
                        <Progress value={d.value} className="h-1.5 flex-1" barClassName={d.value >= 85 ? "bg-pine" : d.value >= 75 ? "bg-[#6b9b82]" : "bg-amber"} />
                        <span className="num w-6 text-right text-[12.5px] font-medium text-ink">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="surface p-5">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-ink"><MessageSquare className="size-3.5 text-pine" /> 建议面试问题</div>
                  <div className="mt-3 space-y-2">
                    {candidate.ai.questions.map((q, i) => (
                      <div key={q} className="flex gap-3 rounded-lg bg-[#fafbf8] px-3 py-2.5 text-[12.5px] leading-5 text-ink-soft">
                        <span className="num shrink-0 text-[12px] font-medium text-pine">{String(i + 1).padStart(2, "0")}</span>{q}
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex items-start gap-2 rounded-xl bg-[#fafbf8] p-3.5 text-[12px] leading-5 text-muted">
                  <CircleAlert className="mt-0.5 size-3 shrink-0" />
                  AI 评估基于简历、面试记录与岗位画像生成，仅供辅助判断，最终录用决定由招聘团队做出。
                </div>
              </div>
            ) : null}

            {tab === "interviews" ? (
              <div className="space-y-4 p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><div className="text-[13.5px] font-semibold text-ink">面试记录</div><div className="mt-1 text-[12.5px] text-muted">共 {candidateInterviews.length} 场面试 · 状态随确认、进行与反馈自动流转</div></div>
                  <Button size="sm" onClick={() => setScheduleOpen(true)}><Plus /> 安排面试</Button>
                </div>
                <details className="rounded-xl border border-line bg-[#fafbf8] px-3.5 py-2.5">
                  <summary className="cursor-pointer text-[12px] font-medium text-muted">查看面试状态说明</summary>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {Object.values(interviewStatusMeta).map((status) => (
                      <div key={status.label} className="flex items-start gap-2">
                        <span className={cn("mt-0.5 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium", status.tone)}><span className={cn("size-1 rounded-full", status.dot)} />{status.label}</span>
                        <span className="text-[11px] leading-4 text-muted">{status.description}</span>
                      </div>
                    ))}
                  </div>
                </details>
                {candidateInterviews.map((iv) => {
                  const type = interviewTypeMeta[iv.type];
                  const status = interviewStatusMeta[iv.status];
                  const names = iv.interviewers.map((id) => (id.startsWith("AI") ? id : employees.find((e) => e.id === id)?.name ?? id));
                  return (
                    <div key={iv.id} className="surface overflow-hidden">
                      <div className="flex flex-wrap items-center gap-3 p-4">
                        <div className="flex w-[58px] shrink-0 flex-col items-center rounded-lg bg-[#f7f8f4] py-2">
                          <span className="num text-[14px] font-semibold text-ink">{iv.start}</span>
                          <span className="mt-0.5 text-[11.5px] text-muted">{iv.date.slice(5)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[13px] font-medium text-ink">{iv.round}</span>
                            <span className={cn("rounded px-1.5 py-0.5 text-[11.5px]", type.tone)}>{type.label}</span>
                            <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium", status.tone)}>
                              <span className={cn("size-1.5 rounded-full", status.dot)} />{status.label}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                            <span className="flex items-center gap-1"><CalendarClock className="size-3" /> {formatDateWithWeek(iv.date)} · {iv.start}–{iv.end}</span>
                            <span>{names.join("、")}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" asChild><Link href={`/interviews?interview=${iv.id}`}>查看详情</Link></Button>
                      </div>
                      {iv.feedback ? (
                        <div className="border-t border-line bg-[#fafbf8] px-4 py-3">
                          <div className="flex items-center gap-2 text-[12px]">
                            <span className="flex items-center gap-0.5 text-amber">{Array.from({ length: iv.feedback.rating }).map((_, i) => <Star key={i} className="size-2.5 fill-current" />)}</span>
                            <span className="font-medium text-ink">{recommendationLabels[iv.feedback.recommendation]}</span>
                            <span className="text-muted">· {employees.find((e) => e.id === iv.feedback?.submittedBy)?.name} · {iv.feedback.submittedAt}</span>
                          </div>
                          <p className="mt-1.5 text-[12.5px] leading-5 text-ink-soft">{iv.feedback.note}</p>
                        </div>
                      ) : null}
                      {iv.aiSummary ? (
                        <div className="flex items-start gap-2 border-t border-line bg-pine-soft/30 px-4 py-3">
                          <Sparkles className="mt-0.5 size-3 text-pine" />
                          <p className="text-[12px] leading-5 text-ink-soft">{iv.aiSummary}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {candidateInterviews.length === 0 ? (
                  <div className="surface py-14 text-center">
                    <CalendarClock className="mx-auto size-6 text-muted" />
                    <div className="mt-3 text-[13px] font-medium text-ink">还没有面试安排</div>
                    <p className="mt-1 text-[12.5px] text-muted">为这位候选人安排一场面试，开始推进流程。</p>
                    <Button size="sm" className="mt-4" onClick={() => setScheduleOpen(true)}><Plus /> 安排面试</Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {tab === "messages" ? (
              <div className="space-y-4 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div><div className="text-[13.5px] font-semibold text-ink">沟通记录</div><div className="mt-1 text-[12.5px] text-muted">消息与流程动态</div></div>
                  <Button size="sm" onClick={() => setMessageOpen(true)}><Send /> 发送消息</Button>
                </div>
                <div className="surface overflow-hidden">
                  <div className="border-b border-line px-4 py-3 text-[12.5px] font-medium text-muted">消息记录</div>
                  {candidateNotifications.map((n) => (
                    <div key={n.id} className="flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0">
                      <span className={cn("flex size-7 items-center justify-center rounded-lg", n.channel === "email" ? "bg-info-soft text-info-ink" : "bg-amber-soft text-amber-deep")}>
                        {n.channel === "email" ? <Mail className="size-3.5" /> : <MessageSquare className="size-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] text-ink">{n.scenario} · {n.channel === "email" ? "邮件" : "短信"}</div>
                        <div className="mt-0.5 text-[12px] text-muted">{n.sentAt} · {n.operator}</div>
                      </div>
                      <span className={cn("rounded px-1.5 py-0.5 text-[11.5px]", n.status === "failed" ? "bg-signal-soft text-signal" : n.status === "read" ? "bg-pine-soft text-pine" : "bg-[#eef1ec] text-muted")}>
                        {n.status === "failed" ? "失败" : n.status === "read" ? "已读" : "已送达"}
                      </span>
                    </div>
                  ))}
                  {candidateNotifications.length === 0 ? <div className="px-4 py-8 text-center text-[12.5px] text-muted">暂无消息记录</div> : null}
                </div>
                <div className="surface overflow-hidden">
                  <div className="border-b border-line px-4 py-3 text-[12.5px] font-medium text-muted">流程动态</div>
                  <div className="p-4">
                    {candidate.timeline.slice().reverse().map((t) => (
                      <div key={t.id} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                          <span className={cn("mt-1 size-2 rounded-full", t.tone === "success" ? "bg-pine" : t.tone === "warning" ? "bg-amber" : "bg-[#b8c3ba]")} />
                          <span className="mt-1 w-px flex-1 bg-line" />
                        </div>
                        <div className="-mt-0.5 flex-1 pb-1">
                          <div className="text-[12.5px] font-medium text-ink">{t.title}</div>
                          <div className="mt-0.5 text-[12px] text-muted">{t.at}{t.note ? ` · ${t.note}` : ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Sheet>

      <ScheduleInterviewDialog open={scheduleOpen} onOpenChange={setScheduleOpen} defaultCandidateId={candidate.id} defaultJobId={candidate.jobId} />
      <OfferCreateDialog open={offerOpen} onOpenChange={setOfferOpen} candidate={candidate} job={job} />
      <MessageDialog open={messageOpen} onOpenChange={setMessageOpen} candidate={candidate} job={job} />
    </>
  );
}
