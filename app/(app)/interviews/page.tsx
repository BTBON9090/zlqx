"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Copy,
  FileText,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { SearchInput, Field, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleInterviewDialog } from "@/components/interviews/schedule-dialog";
import { useApp } from "@/lib/store";
import { cn, formatDateWithWeek, interviewTypeMeta } from "@/lib/utils";
import type { Interview, InterviewType } from "@/lib/types";

const statusMeta: Record<string, { label: string; tone: string; dot: string }> = {
  pending: { label: "待确认", tone: "bg-amber-soft text-[#7a5412]", dot: "bg-amber" },
  confirmed: { label: "已确认", tone: "bg-pine-soft text-pine", dot: "bg-pine" },
  done: { label: "已完成", tone: "bg-[#eef1ec] text-muted", dot: "bg-[#9aa69e]" },
  cancelled: { label: "已取消", tone: "bg-signal-soft text-signal", dot: "bg-signal" },
};

const typeIcons: Record<InterviewType, React.ReactNode> = {
  video: <Video />,
  onsite: <MapPin />,
  phone: <Phone />,
  ai: <AudioLines />,
};

function FeedbackDialog({
  interview,
  open,
  onOpenChange,
}: {
  interview: Interview | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { submitFeedback } = useApp();
  const [rating, setRating] = useState(4);
  const [recommendation, setRecommendation] = useState<NonNullable<Interview["feedback"]>["recommendation"]>("yes");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setRating(4);
      setRecommendation("yes");
      setNote("");
    }
  }, [open]);

  if (!interview) return null;
  const submit = () => {
    if (!note.trim()) {
      toast.error("请填写面试评价");
      return;
    }
    submitFeedback(interview.id, {
      rating,
      recommendation,
      note,
      submittedAt: "2026-10-30 11:20",
      submittedBy: "emp-1",
    });
    toast.success("面试反馈已提交");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="填写面试反馈" description={`${interview.round} · ${interview.date} ${interview.start}`} icon={<MessageSquare />} />
        <DialogBody className="space-y-5">
          <div>
            <div className="mb-2 text-[11.5px] font-medium text-ink">面试评分</div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} 星`} className="transition-transform hover:scale-110">
                  <Star className={cn("size-7", n <= rating ? "fill-amber text-amber" : "text-[#d8dfd7]")} />
                </button>
              ))}
              <span className="ml-2 text-[11px] text-muted">{rating} / 5</span>
            </div>
          </div>
          <div>
            <div className="mb-2 text-[11.5px] font-medium text-ink">推荐结论</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([["strong_yes", "强烈推荐"], ["yes", "推荐"], ["neutral", "待定"], ["no", "不推荐"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setRecommendation(k)} className={cn("rounded-lg border px-3 py-2 text-[10.5px] font-medium transition-colors", recommendation === k ? "border-pine bg-pine text-white" : "border-line bg-white text-muted hover:border-line-strong hover:text-ink")}>{l}</button>
              ))}
            </div>
          </div>
          <Field label="面试评价" required hint="建议包含具体案例与判断依据">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：候选人对 B 端产品有完整的方法论，案例讲得清楚。对 AI 产品边界的判断略浅，建议下一轮重点追问。" className="min-h-[120px]" />
          </Field>
          {interview.type === "ai" ? (
            <div className="rounded-xl bg-pine-soft/50 p-3.5 text-[10px] leading-5 text-ink-soft">
              <div className="flex items-center gap-1.5 font-medium text-pine"><Sparkles className="size-3" /> 数字人面试记录已生成</div>
              <p className="mt-1">系统已记录候选人的 6 道回答，并生成能力评分与风险提示。你可以在面试详情中查看完整纪要。</p>
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}><Check /> 提交反馈</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({
  interview,
  open,
  onOpenChange,
}: {
  interview: Interview | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { updateInterview } = useApp();
  const [date, setDate] = useState(interview?.date ?? "2026-11-02");
  const [start, setStart] = useState(interview?.start ?? "14:00");
  useEffect(() => { if (open && interview) { setDate(interview.date); setStart(interview.start); } }, [open, interview]);
  if (!interview) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" className="p-0">
        <DialogHeader title="改期面试" description="候选人会收到新的面试邀约。" icon={<RotateCcw />} />
        <DialogBody className="space-y-4">
          <Field label="新的面试日期" required><input type="date" min="2026-10-30" value={date} onChange={(e) => setDate(e.target.value)} className="flex h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-[13px] outline-none focus:border-pine/60" /></Field>
          <Field label="开始时间" required><input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="flex h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-[13px] outline-none focus:border-pine/60" /></Field>
          <label className="flex items-center gap-2 text-[10.5px] text-muted"><input type="checkbox" defaultChecked className="accent-[#0c4539]" /> 自动发送改期通知给候选人与面试官</label>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => { updateInterview(interview.id, { date, start, status: "pending" }); toast.success("面试已改期，通知已发送"); onOpenChange(false); }}><Check /> 确认改期</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InterviewDetailSheet({
  interviewId,
  onClose,
  onFeedback,
  onReschedule,
}: {
  interviewId: string | null;
  onClose: () => void;
  onFeedback: (i: Interview) => void;
  onReschedule: (i: Interview) => void;
}) {
  const { interviews, candidates, jobs, employees, updateInterview } = useApp();
  const interview = interviews.find((i) => i.id === interviewId);
  const candidate = candidates.find((c) => c.id === interview?.candidateId);
  const job = jobs.find((j) => j.id === interview?.jobId);
  const [tab, setTab] = useState("overview");
  useEffect(() => { if (interviewId) setTab("overview"); }, [interviewId]);
  if (!interview || !candidate) return <Sheet open={false} onOpenChange={onClose}><div /></Sheet>;
  const type = interviewTypeMeta[interview.type];
  const status = statusMeta[interview.status];
  const names = interview.interviewers.map((id) => (id.startsWith("AI") ? id : employees.find((e) => e.id === id)?.name ?? id));

  return (
    <Sheet open={!!interviewId} onOpenChange={(v) => !v && onClose()} width="640px">
      <div className="flex h-full flex-col bg-paper">
        <div className="border-b border-line bg-surface px-6 pb-0 pt-6">
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded px-2 py-1 text-[10px] font-medium", type.tone)}>{type.label}</span>
              <span className={cn("inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium", status.tone)}><span className={cn("size-1.5 rounded-full", status.dot)} />{status.label}</span>
              <span className="text-[10px] text-muted">{interview.round}</span>
            </div>
            <h2 className="mt-3 text-[21px] font-semibold tracking-[-0.03em] text-ink">{candidate.name} · {interview.round}</h2>
            <div className="mt-1.5 text-[11px] text-muted">{job?.title} · {formatDateWithWeek(interview.date)} · {interview.start}–{interview.end}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {interview.type === "ai" ? <Button size="sm" asChild><Link href={`/interviews/live/${interview.id}`}><AudioLines /> 进入面试间</Link></Button> : interview.type === "video" ? <Button size="sm" onClick={() => toast.success("正在打开会议链接…")}><Video /> 进入会议</Button> : <Button size="sm" onClick={() => toast.success("已签到")}><Check /> 候选人已签到</Button>}
              <Button size="sm" variant="secondary" onClick={() => onFeedback(interview)}><MessageSquare /> 填写反馈</Button>
              <Button size="sm" variant="secondary" onClick={() => onReschedule(interview)}><RotateCcw /> 改期</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button className="flex size-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-4" /></button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => toast.success("提醒已发送")}><BellIcon /> 发送提醒</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("会议链接已复制")}><Copy /> 复制会议链接</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem danger onClick={() => { updateInterview(interview.id, { status: "cancelled" }); toast.success("面试已取消"); onClose(); }}><X /> 取消面试</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="border-b-0">
                <TabsTrigger value="overview">面试信息</TabsTrigger>
                <TabsTrigger value="prep">面试准备</TabsTrigger>
                <TabsTrigger value="feedback">反馈与纪要</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {tab === "overview" ? (
            <div className="space-y-4">
              <div className="surface p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={candidate.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink">{candidate.name}</div>
                    <div className="mt-0.5 text-[10px] text-muted">{candidate.currentCompany} · {candidate.currentTitle} · {candidate.years} 年</div>
                  </div>
                  <Button size="sm" variant="ghost" asChild><Link href={`/candidates?candidate=${candidate.id}`}>查看简历 <ArrowUpRight /></Link></Button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[10.5px]">
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">匹配度</div><div className="num mt-1 text-[15px] font-semibold text-pine">{candidate.score}</div></div>
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">招聘来源</div><div className="mt-1 font-medium text-ink">{candidate.source}</div></div>
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">期望薪资</div><div className="mt-1 font-medium text-ink">{candidate.expectedSalary}</div></div>
                  <div className="rounded-lg bg-[#f7f8f4] p-2.5"><div className="text-muted">到岗时间</div><div className="mt-1 font-medium text-ink">{candidate.availability}</div></div>
                </div>
              </div>

              <div className="surface p-5">
                <SectionTitle title="面试信息" icon={<CalendarClock />} />
                <div className="mt-3 divide-y divide-line text-[10.5px]">
                  {[
                    ["时间", `${formatDateWithWeek(interview.date)} · ${interview.start}–${interview.end}`],
                    ["形式", type.label],
                    ["轮次", interview.round],
                    ["面试官", names.join("、")],
                    ["会议链接", interview.meetingLink ?? "—"],
                    ["地点", interview.location ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-4 py-2.5"><span className="shrink-0 text-muted">{k}</span><span className="text-right font-medium leading-5 text-ink">{v}</span></div>
                  ))}
                </div>
              </div>

              {interview.type === "ai" ? (
                <div className="rounded-[16px] bg-pine-deep p-5 text-white">
                  <div className="flex items-center gap-2 text-[10.5px] font-medium"><AudioLines className="size-3.5 text-[#f2b3a1]" /> 数字人面试</div>
                  <p className="mt-2 text-[10.5px] leading-5 text-[#b7cbbf]">{interview.aiSummary ?? "数字人将按结构化题纲完成面试，并在结束后生成评分与纪要。"}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[9px]">
                    <span className="rounded bg-white/8 px-2 py-1.5 text-center">6 道问题</span>
                    <span className="rounded bg-white/8 px-2 py-1.5 text-center">20 分钟</span>
                    <span className="rounded bg-white/8 px-2 py-1.5 text-center">自动纪要</span>
                  </div>
                </div>
              ) : null}

              <div className="surface p-5">
                <SectionTitle title="面试官" icon={<UsersIcon />} />
                <div className="mt-3 space-y-2">
                  {interview.interviewers.map((id) => {
                    const e = employees.find((x) => x.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2.5 rounded-lg bg-[#fafbf8] px-3 py-2">
                        <Avatar name={e?.name ?? id} size={26} />
                        <div className="flex-1"><div className="text-[10.5px] font-medium text-ink">{e?.name ?? id}</div><div className="text-[8.5px] text-muted">{e?.title ?? "AI 数字人面试官"}</div></div>
                        <span className="text-[8.5px] text-pine">已确认</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {tab === "prep" ? (
            <div className="space-y-4">
              <div className="rounded-[16px] bg-pine-deep p-5 text-white">
                <div className="flex items-center gap-1.5 text-[10px] text-[#a9c3b5]"><Sparkles className="size-3 text-[#f2b3a1]" /> 小聘的面试准备</div>
                <p className="mt-2 text-[10.5px] leading-5 text-[#b7cbbf]">已结合候选人简历、岗位画像与初试反馈，整理出本次面试的验证重点。</p>
              </div>
              <div className="surface p-5">
                <SectionTitle title="建议追问" description="优先验证简历中的模糊点" icon={<Sparkles />} />
                <div className="mt-3 space-y-2">
                  {candidate.ai.questions.map((q, i) => (
                    <div key={q} className="flex gap-3 rounded-lg bg-[#fafbf8] px-3 py-2.5 text-[10.5px] leading-5 text-ink-soft">
                      <span className="num text-[9px] font-medium text-pine">{String(i + 1).padStart(2, "0")}</span>{q}
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface p-5">
                <SectionTitle title="候选人风险提示" icon={<CircleAlert />} />
                <ul className="mt-3 space-y-2">
                  {candidate.ai.risks.map((r) => <li key={r} className="flex gap-2 text-[10.5px] leading-5 text-ink-soft"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-signal" />{r}</li>)}
                  {candidate.ai.risks.length === 0 ? <li className="text-[10.5px] text-muted">暂无显著风险</li> : null}
                </ul>
              </div>
              <div className="surface p-5">
                <SectionTitle title="岗位画像重点" description={job?.title} icon={<TargetIcon />} />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job?.aiProfile.mustHave.map((m) => <span key={m} className="rounded-md border border-line bg-[#fafbf8] px-2 py-1 text-[9.5px] text-ink-soft">{m}</span>)}
                </div>
              </div>
            </div>
          ) : null}

          {tab === "feedback" ? (
            <div className="space-y-4">
              {interview.feedback ? (
                <div className="surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <SectionTitle title="面试反馈" description={`由 ${employees.find((e) => e.id === interview.feedback?.submittedBy)?.name} 提交`} icon={<MessageSquare />} />
                    <div className="flex items-center gap-0.5">{Array.from({ length: interview.feedback.rating }).map((_, i) => <Star key={i} className="size-3 fill-amber text-amber" />)}</div>
                  </div>
                  <div className="mt-3">
                    <Badge tone={interview.feedback.recommendation === "strong_yes" ? "pine" : interview.feedback.recommendation === "no" ? "signal" : "amber"}>
                      {interview.feedback.recommendation === "strong_yes" ? "强烈推荐" : interview.feedback.recommendation === "yes" ? "推荐" : interview.feedback.recommendation === "neutral" ? "待定" : "不推荐"}
                    </Badge>
                    <p className="mt-2 text-[10.5px] leading-6 text-ink-soft">{interview.feedback.note}</p>
                    <div className="mt-2 text-[9px] text-muted">{interview.feedback.submittedAt}</div>
                  </div>
                  <Button size="sm" variant="secondary" className="mt-4" onClick={() => onFeedback(interview)}><RotateCcw /> 修改反馈</Button>
                </div>
              ) : (
                <div className="surface py-14 text-center">
                  <MessageSquare className="mx-auto size-6 text-muted" />
                  <div className="mt-3 text-[12px] font-medium text-ink">还没有面试反馈</div>
                  <p className="mt-1 text-[10px] text-muted">面试结束后 24 小时内提交反馈，帮助团队更快决策。</p>
                  <Button size="sm" className="mt-4" onClick={() => onFeedback(interview)}><MessageSquare /> 填写反馈</Button>
                </div>
              )}
              {interview.type === "ai" ? (
                <div className="surface p-5">
                  <SectionTitle title="数字人面试纪要" description="AI 自动生成 · 需人工确认" icon={<AudioLines />} />
                  <div className="mt-3 rounded-xl bg-[#fafbf8] p-4 text-[10.5px] leading-6 text-ink-soft">
                    <p>候选人整体表达清晰，能结构化地拆解问题。对项目结果的描述具体，但在追问「为什么」时，部分回答停留在执行层。</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[["表达清晰度", "86"], ["专业匹配", "82"], ["动机稳定性", "78"]].map(([k, v]) => <div key={k} className="rounded-lg bg-white px-2.5 py-2"><div className="text-[8.5px] text-muted">{k}</div><div className="num mt-1 text-[13px] font-semibold text-pine">{v}</div></div>)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}

function BellIcon() {
  return <span className="size-3.5">🔔</span>;
}
function UsersIcon() {
  return <span className="size-3.5">👥</span>;
}
function TargetIcon() {
  return <span className="size-3.5">◎</span>;
}

function InterviewsContent() {
  const searchParams = useSearchParams();
  const { interviews, candidates, jobs, employees, updateInterview } = useApp();
  const [range, setRange] = useState("today");
  const [query, setQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<Interview | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Interview | null>(null);

  useEffect(() => {
    const id = searchParams.get("interview");
    if (id) setDetailId(id);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return interviews
      .filter((i) => {
        if (range === "today" && i.date !== "2026-10-30") return false;
        if (range === "tomorrow" && i.date !== "2026-10-31") return false;
        if (range === "week" && (i.date < "2026-10-30" || i.date > "2026-11-05")) return false;
        if (jobFilter !== "all" && i.jobId !== jobFilter) return false;
        if (typeFilter !== "all" && i.type !== typeFilter) return false;
        if (statusFilter !== "all" && i.status !== statusFilter) return false;
        if (query.trim()) {
          const c = candidates.find((x) => x.id === i.candidateId);
          const j = jobs.find((x) => x.id === i.jobId);
          return `${c?.name}${j?.title}${i.round}`.toLowerCase().includes(query.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => {
        if (range === "all") {
          const aFuture = a.date >= "2026-10-30" ? 0 : 1;
          const bFuture = b.date >= "2026-10-30" ? 0 : 1;
          if (aFuture !== bFuture) return aFuture - bFuture;
          if (aFuture === 0) return `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`);
          return `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`);
        }
        return `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`);
      });
  }, [interviews, range, jobFilter, typeFilter, statusFilter, query, candidates, jobs]);

  const todayCount = interviews.filter((i) => i.date === "2026-10-30" && i.status !== "cancelled").length;
  const pendingCount = interviews.filter((i) => i.status === "pending").length;
  const needFeedback = interviews.filter((i) => i.date < "2026-10-30" && !i.feedback && i.status !== "cancelled").length;

  const ranges = [
    { key: "today", label: "今天", count: todayCount },
    { key: "tomorrow", label: "明天", count: interviews.filter((i) => i.date === "2026-10-31" && i.status !== "cancelled").length },
    { key: "week", label: "本周", count: interviews.filter((i) => i.date >= "2026-10-30" && i.date <= "2026-11-05" && i.status !== "cancelled").length },
    { key: "all", label: "全部", count: interviews.length },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="招聘业务"
        title="面试安排"
        description="把每一场面试安排清楚：时间、面试官、候选人和反馈，都在一个视图里。"
        actions={
          <>
            <Button variant="secondary" onClick={() => setCalendarOpen(true)}><CalendarDays /> 日历视图</Button>
            <Button onClick={() => setCreateOpen(true)}><Plus /> 新建面试</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["今日面试", todayCount, "场", "下一场 10:00", "pine"],
          ["待确认", pendingCount, "场", "需要提醒候选人", "amber"],
          ["待反馈", needFeedback, "场", "面试官尚未提交", "signal"],
          ["本周总计", ranges[2].count, "场", "含数字人面试 2 场", "blue"],
        ].map(([label, value, suffix, note, tone]) => (
          <div key={String(label)} className="surface flex items-center justify-between gap-3 p-4">
            <div>
              <div className="text-[10.5px] text-muted">{label}</div>
              <div className="mt-1 flex items-baseline gap-1"><span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span><span className="text-[10px] text-muted">{suffix}</span></div>
              <div className="mt-1 text-[9px] text-muted">{note}</div>
            </div>
            <span className={cn("flex size-9 items-center justify-center rounded-xl", tone === "pine" ? "bg-pine-soft text-pine" : tone === "amber" ? "bg-amber-soft text-[#8a6a24]" : tone === "signal" ? "bg-signal-soft text-signal" : "bg-[#e8eef5] text-[#2f5c80]")}>
              <CalendarClock className="size-4" />
            </span>
          </div>
        ))}
      </div>

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pt-2">
          <div className="flex flex-wrap gap-1">
            {ranges.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)} className={cn("relative flex items-baseline gap-1.5 px-3 pb-2.5 pt-1.5 text-[11.5px] font-medium transition-colors", range === r.key ? "text-pine" : "text-muted hover:text-ink")}>
                {r.label}<span className={cn("num text-[11px]", range === r.key ? "text-pine" : "text-[#a6b1a8]")}>{r.count}</span>
                {range === r.key ? <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-pine" /> : null}
              </button>
            ))}
          </div>
          <span className="hidden items-center gap-1 pb-2 text-[9.5px] text-muted md:flex"><span className="size-1.5 rounded-full bg-[#6fae8c]" /> 与面试官日历已同步</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#fcfcf9] px-4 py-3">
          <SearchInput placeholder="搜索候选人、职位" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-[220px]" />
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="全部职位" /></SelectTrigger>
            <SelectContent><SelectItem value="all">全部职位</SelectItem>{jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[136px]"><SelectValue placeholder="全部形式" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部形式</SelectItem>
              <SelectItem value="video">视频面试</SelectItem>
              <SelectItem value="onsite">现场面试</SelectItem>
              <SelectItem value="phone">电话面试</SelectItem>
              <SelectItem value="ai">数字人面试</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="全部状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待确认</SelectItem>
              <SelectItem value="confirmed">已确认</SelectItem>
              <SelectItem value="done">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-[10px] text-muted">共 <span className="num font-medium text-ink">{filtered.length}</span> 场</span>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-[#fafbf8] text-[10px] text-muted">
                <th className="w-[112px] py-2.5 pl-5 font-medium">时间</th>
                <th className="min-w-[180px] py-2.5 pr-4 font-medium">候选人</th>
                <th className="min-w-[160px] py-2.5 pr-4 font-medium">应聘职位</th>
                <th className="w-[150px] py-2.5 pr-4 font-medium">轮次 / 形式</th>
                <th className="w-[150px] py-2.5 pr-4 font-medium">面试官</th>
                <th className="w-[88px] py-2.5 pr-4 font-medium">状态</th>
                <th className="w-[100px] py-2.5 pr-4 font-medium">反馈</th>
                <th className="w-[150px] px-4 py-2.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((iv) => {
                const c = candidates.find((x) => x.id === iv.candidateId);
                const job = jobs.find((j) => j.id === iv.jobId);
                const names = iv.interviewers.map((id) => (id.startsWith("AI") ? "AI 数字人" : employees.find((e) => e.id === id)?.name ?? id));
                const type = interviewTypeMeta[iv.type];
                const st = statusMeta[iv.status];
                return (
                  <tr key={iv.id} className="group cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-[#fafbf8]" onClick={() => setDetailId(iv.id)}>
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex w-[52px] shrink-0 flex-col items-center rounded-lg py-1.5", iv.date === "2026-10-30" ? "bg-pine text-white" : "bg-[#f2f5ef] text-ink")}>
                          <span className="num text-[12.5px] font-semibold">{iv.start}</span>
                          <span className={cn("mt-0.5 text-[8px]", iv.date === "2026-10-30" ? "text-white/70" : "text-muted")}>{iv.date.slice(5)}</span>
                        </div>
                        <div className="text-[9px] text-muted">{iv.end} 结束</div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c?.name ?? "候选人"} size={30} />
                        <div className="min-w-0"><div className="truncate text-[11.5px] font-medium text-ink group-hover:text-pine">{c?.name}</div><div className="mt-0.5 truncate text-[9px] text-muted">{c?.currentTitle}</div></div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4"><div className="text-[10.5px] text-ink-soft">{job?.title}</div><div className="mt-0.5 text-[9px] text-muted">{job?.location}</div></td>
                    <td className="py-3.5 pr-4">
                      <div className="text-[10px] font-medium text-ink">{iv.round}</div>
                      <span className={cn("mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8.5px]", type.tone)}><span className="[&_svg]:size-2.5">{typeIcons[iv.type]}</span>{type.label}</span>
                    </td>
                    <td className="py-3.5 pr-4"><div className="flex items-center gap-1.5"><AvatarGroup names={names} size={22} max={2} /><span className="max-w-[70px] truncate text-[9px] text-muted">{names[0]}</span></div></td>
                    <td className="py-3.5 pr-4"><span className={cn("inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[9px] font-medium", st.tone)}><span className={cn("size-1.5 rounded-full", st.dot)} />{st.label}</span></td>
                    <td className="py-3.5 pr-4">
                      {iv.feedback ? (
                        <div className="flex items-center gap-0.5">{Array.from({ length: iv.feedback.rating }).map((_, i) => <Star key={i} className="size-2.5 fill-amber text-amber" />)}</div>
                      ) : iv.status === "done" ? <span className="text-[9px] text-signal">待提交</span> : <span className="text-[9px] text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {iv.status === "done" ? (
                          <Button size="sm" variant="secondary" className="h-7 px-2 text-[10px]" onClick={() => setFeedbackTarget(iv)}>填写反馈</Button>
                        ) : (
                          <Button size="sm" variant="soft" className="h-7 px-2 text-[10px]" onClick={() => setDetailId(iv.id)}>{iv.type === "ai" ? "查看" : "进入"}</Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><button className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setRescheduleTarget(iv)}><RotateCcw /> 改期</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("提醒已发送给候选人与面试官")}><BellIcon /> 发送提醒</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("会议链接已复制")}><Copy /> 复制会议链接</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem danger onClick={() => { updateInterview(iv.id, { status: "cancelled" }); toast.success("面试已取消"); }}><X /> 取消面试</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line md:hidden">
          {filtered.map((iv) => {
            const c = candidates.find((x) => x.id === iv.candidateId);
            const job = jobs.find((j) => j.id === iv.jobId);
            const names = iv.interviewers.map((id) => (id.startsWith("AI") ? "AI 数字人" : employees.find((e) => e.id === id)?.name ?? id));
            const type = interviewTypeMeta[iv.type];
            const st = statusMeta[iv.status];
            return (
              <button key={iv.id} onClick={() => setDetailId(iv.id)} className="block w-full p-4 text-left transition-colors active:bg-[#fafbf8]">
                <div className="flex items-start gap-3">
                  <div className={cn("flex w-[54px] shrink-0 flex-col items-center rounded-lg py-2", iv.date === "2026-10-30" ? "bg-pine text-white" : "bg-[#f2f5ef] text-ink")}>
                    <span className="num text-[13px] font-semibold">{iv.start}</span>
                    <span className={cn("mt-0.5 text-[8px]", iv.date === "2026-10-30" ? "text-white/70" : "text-muted")}>{iv.date.slice(5)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5"><span className="truncate text-[12.5px] font-semibold text-ink">{c?.name}</span><span className={cn("rounded px-1.5 py-0.5 text-[8px]", type.tone)}>{type.label}</span></div>
                    <div className="mt-0.5 truncate text-[9.5px] text-muted">{job?.title} · {iv.round}</div>
                    <div className="mt-1.5 flex items-center gap-1.5"><AvatarGroup names={names} size={18} max={3} /><span className="truncate text-[8.5px] text-muted">{names.join("、")}</span></div>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-[8.5px] font-medium", st.tone)}><span className={cn("size-1.5 rounded-full", st.dot)} />{st.label}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-line/70 pt-2 text-[8.5px] text-muted"><span>{iv.start}–{iv.end}</span><span>{iv.feedback ? "已提交反馈" : iv.status === "done" ? "待填写反馈" : "查看面试详情"}</span></div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? <EmptyState icon={<CalendarClock />} title="没有找到面试安排" description="调整筛选条件，或新建一场面试。" action={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus /> 新建面试</Button>} /> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="text-[10px] text-muted">显示 {filtered.length} 场面试</span>
          <div className="flex items-center gap-1 text-[10px] text-muted"><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec] disabled:opacity-30" disabled>‹</button><span className="flex size-7 items-center justify-center rounded-md bg-pine text-white">1</span><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">2</button><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">›</button></div>
        </div>
      </div>

      <ScheduleInterviewDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(id) => setDetailId(id)} />

      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent size="xl" className="max-w-[1180px] p-0">
          <DialogHeader title="本周面试日历" description="10月30日 – 11月5日 · 共 9 场面试" icon={<CalendarDays />} />
          <DialogBody className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                ["2026-10-30", "周五", "今天"],
                ["2026-10-31", "周六", "明天"],
                ["2026-11-01", "周日", ""],
                ["2026-11-02", "周一", ""],
                ["2026-11-03", "周二", ""],
                ["2026-11-04", "周三", ""],
                ["2026-11-05", "周四", ""],
              ].map(([date, week, tag]) => {
                const dayInterviews = interviews.filter((i) => i.date === date && i.status !== "cancelled").sort((a, b) => a.start.localeCompare(b.start));
                return (
                  <div key={date} className={cn("min-w-[148px] flex-1 rounded-xl border p-2.5", date === "2026-10-30" ? "border-pine/25 bg-pine-soft/25" : "border-line bg-[#fcfcf9]")}>
                    <div className="mb-2 flex items-center justify-between px-0.5">
                      <div><span className="num text-[11px] font-semibold text-ink">{date.slice(5).replace("-", "/")}</span><span className="ml-1 text-[8.5px] text-muted">{week}</span></div>
                      {tag ? <span className="rounded bg-pine px-1 py-0.5 text-[7.5px] text-white">{tag}</span> : <span className="num text-[8.5px] text-muted">{dayInterviews.length}</span>}
                    </div>
                    <div className="space-y-1.5">
                      {dayInterviews.map((iv) => {
                        const c = candidates.find((x) => x.id === iv.candidateId);
                        const type = interviewTypeMeta[iv.type];
                        return (
                          <button key={iv.id} onClick={() => { setDetailId(iv.id); setCalendarOpen(false); }} className="w-full rounded-lg border border-line bg-white p-2 text-left transition-all hover:border-pine/30 hover:shadow-sm">
                            <div className="flex items-center justify-between gap-1"><span className="num text-[9px] font-semibold text-ink">{iv.start}</span><span className={cn("rounded px-1 py-0.5 text-[7px]", type.tone)}>{type.label.slice(0, 2)}</span></div>
                            <div className="mt-1 truncate text-[9.5px] font-medium text-ink">{c?.name}</div>
                            <div className="mt-0.5 truncate text-[7.5px] text-muted">{iv.round} · {jobs.find((j) => j.id === iv.jobId)?.title}</div>
                          </button>
                        );
                      })}
                      {dayInterviews.length === 0 ? <div className="flex h-[72px] items-center justify-center rounded-lg border border-dashed border-line text-[8px] text-muted">无安排</div> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-[8.5px] text-muted"><span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#4d7ea8]" /> 视频</span><span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#b1802f]" /> 现场</span><span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-pine" /> 数字人</span><span className="ml-auto">点击面试卡片查看详情</span></div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <InterviewDetailSheet interviewId={detailId} onClose={() => setDetailId(null)} onFeedback={(i) => setFeedbackTarget(i)} onReschedule={(i) => setRescheduleTarget(i)} />
      <FeedbackDialog interview={feedbackTarget} open={!!feedbackTarget} onOpenChange={(v) => !v && setFeedbackTarget(null)} />
      <RescheduleDialog interview={rescheduleTarget} open={!!rescheduleTarget} onOpenChange={(v) => !v && setRescheduleTarget(null)} />
    </div>
  );
}

export default function InterviewsPage() {
  return (
    <Suspense fallback={<div className="surface h-[400px] animate-pulse" />}>
      <InterviewsContent />
    </Suspense>
  );
}
