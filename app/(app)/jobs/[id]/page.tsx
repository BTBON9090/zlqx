"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  LayoutDashboard,
  GitBranch,
  MapPin,
  MoreHorizontal,
  Plus,
  Share2,
  Sparkles,
  Target,
  Users,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, ScoreRing } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Switch } from "@/components/ui/toggle";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonSelect } from "@/components/ui/person-select";
import { RadarChart } from "@/components/charts";
import { useApp } from "@/lib/store";
import { candidateStageMeta, cn, jobStatusMeta, scoreTone } from "@/lib/utils";
import type { CandidateStage, Job } from "@/lib/types";

const stageOrder: CandidateStage[] = ["screening", "interview", "offer", "hired"];

function EditJobDialog({
  job,
  open,
  onOpenChange,
}: {
  job: Job;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { departments, employees, updateJob } = useApp();
  const [title, setTitle] = useState(job.title);
  const [departmentId, setDepartmentId] = useState(job.departmentId);
  const [location, setLocation] = useState(job.location);
  const [salary, setSalary] = useState(job.salary);
  const [headcount, setHeadcount] = useState(job.headcount);
  const [ownerId, setOwnerId] = useState(job.ownerId);
  const [status, setStatus] = useState(job.status);
  const [priority, setPriority] = useState(job.priority);
  const [summary, setSummary] = useState(job.summary);

  useEffect(() => {
    if (open) {
      setTitle(job.title);
      setDepartmentId(job.departmentId);
      setLocation(job.location);
      setSalary(job.salary);
      setHeadcount(job.headcount);
      setOwnerId(job.ownerId);
      setStatus(job.status);
      setPriority(job.priority);
      setSummary(job.summary);
    }
  }, [open, job]);

  const save = () => {
    if (!title.trim()) {
      toast.error("职位名称不能为空");
      return;
    }
    updateJob(job.id, { title, departmentId, location, salary, headcount, ownerId, status, priority, summary });
    toast.success("职位信息已更新");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0">
        <DialogHeader title="编辑职位" description="修改会同步到职位详情、候选人流程与招聘看板。" icon={<Edit3 />} />
        <DialogBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="职位名称" required className="sm:col-span-2"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="所属部门"><Select value={departmentId} onValueChange={setDepartmentId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{departments.filter((d) => d.parentId).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="工作地点"><Input value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
            <Field label="薪资范围"><Input value={salary} onChange={(e) => setSalary(e.target.value)} /></Field>
            <Field label="招聘人数"><Input type="number" min={1} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} /></Field>
            <Field label="负责人"><PersonSelect employees={employees.filter((e) => e.status === "active")} departments={departments} value={ownerId} onChange={setOwnerId} placeholder="搜索并选择负责人" /></Field>
            <Field label="职位状态"><Select value={status} onValueChange={(v) => setStatus(v as Job["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">招聘中</SelectItem><SelectItem value="paused">已暂停</SelectItem><SelectItem value="reviewing">审核中</SelectItem><SelectItem value="draft">未开始</SelectItem><SelectItem value="closed">已结束</SelectItem></SelectContent></Select></Field>
            <Field label="优先级"><div className="flex rounded-[10px] border border-line bg-[#f7f8f4] p-1">{[["normal", "常规"], ["high", "急招"]].map(([k, l]) => <button key={k} onClick={() => setPriority(k as Job["priority"])} className={cn("flex-1 rounded-md py-1.5 text-[13px] font-medium transition-colors", priority === k ? "bg-white text-pine shadow-sm" : "text-muted hover:text-ink")}>{l}</button>)}</div></Field>
            <Field label="职位简介" className="sm:col-span-2"><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[80px]" /></Field>
          </div>
        </DialogBody>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={save}><Check /> 保存修改</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { jobs, candidates, departments, employees, interviews } = useApp();
  const job = jobs.find((j) => j.id === id);
  const [tab, setTab] = useState("overview");
  const [aiOn, setAiOn] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("edit=1")) setEditOpen(true);
  }, []);

  const jobCandidates = useMemo(() => candidates.filter((c) => c.jobId === id).sort((a, b) => b.score - a.score), [candidates, id]);
  const dept = departments.find((d) => d.id === job?.departmentId);
  const owner = employees.find((e) => e.id === job?.ownerId);
  const jobInterviews = interviews.filter((i) => i.jobId === id);

  if (!job) {
    return (
      <div className="surface flex flex-col items-center justify-center py-24 text-center">
        <BriefcaseBusiness className="size-8 text-muted" />
        <h1 className="mt-4 text-[18px] font-semibold text-ink">职位不存在或已被删除</h1>
        <p className="mt-1 text-[13.5px] text-muted">它可能已经被合并到其他职位，或者你没有查看权限。</p>
        <Button className="mt-5" onClick={() => router.push("/jobs")}>返回职位管理</Button>
      </div>
    );
  }

  const status = jobStatusMeta[job.status];
  const stageCounts = stageOrder.map((s) => ({ stage: s, count: jobCandidates.filter((c) => c.stage === s).length }));
  const activities = jobCandidates
    .flatMap((c) => c.timeline.map((t) => ({ ...t, candidateName: c.name, candidateId: c.id })))
    .slice(-8)
    .reverse();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <Link href="/jobs" className="flex items-center gap-1 transition-colors hover:text-pine"><ArrowLeft className="size-3" /> 职位管理</Link>
        <ChevronRight className="size-3" />
        <span className="text-ink">{job.title}</span>
      </div>

      <div className="surface overflow-hidden">
        <div className="relative p-5 md:p-6">
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-pine-soft text-pine">
                <BriefcaseBusiness className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[23px] font-semibold tracking-[-0.03em] text-ink">{job.title}</h1>
                  <span className={cn("inline-flex h-[22px] items-center whitespace-nowrap gap-1.5 rounded-md px-2 text-[12.5px] font-medium", status.tone)}>
                    <span className={cn("size-1.5 rounded-full", status.dot)} /> {status.label}
                  </span>
                  {job.priority === "high" ? <Badge tone="signal">急招</Badge> : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted">
                  <span className="flex items-center gap-1"><BriefcaseBusiness className="size-3" /> {dept?.name}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {job.location}</span>
                  <span>{job.code}</span>
                  <span>更新于 {job.updatedAt}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {job.skills.slice(0, 5).map((s) => <span key={s} className="rounded bg-[#eef1ec] px-2 py-1 text-[12px] text-ink-soft">{s}</span>)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast.success("分享链接已复制")}><Share2 /> 分享</Button>
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}><Edit3 /> 编辑</Button>
              <Button size="sm" asChild><Link href={`/candidates?add=1&job=${job.id}`}><Plus /> 添加候选人</Link></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button className="flex size-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-4" /></button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => toast.success("职位已复制")}><Copy /> 复制职位</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("已导出职位数据")}><FileText /> 导出数据</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("招聘流程可在「招聘流程」中修改")}><GitBranch /> 调整流程</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-2 border-t border-line pt-5 sm:grid-cols-4">
            {[
              ["收到简历", job.candidateCount, "本周 +" + job.newThisWeek],
              ["进入面试", stageCounts.find((s) => s.stage === "interview")?.count ?? 0, "面试中"],
              ["Offer", stageCounts.find((s) => s.stage === "offer")?.count ?? 0, "待入职"],
              ["已入职", job.hired, `目标 ${job.headcount} 人`],
            ].map(([label, value, note]) => (
              <div key={String(label)} className="border-l border-line pl-4 first:border-l-0 first:pl-0">
                <div className="text-[12.5px] text-muted">{label}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="num text-[22px] font-semibold tracking-[-0.04em] text-ink">{value}</span>
                  <span className="text-[12px] text-muted">{note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="border-t border-line px-4 py-3 md:px-6">
            <TabsList className="h-auto w-fit max-w-full gap-1 rounded-xl border-b-0 bg-[#f1f4ef] p-1">
              {[
                { value: "overview", label: "概览", icon: LayoutDashboard },
                { value: "candidates", label: "候选人", icon: Users, count: jobCandidates.length },
                { value: "profile", label: "AI 岗位画像", icon: Sparkles },
                { value: "flow", label: "招聘流程", icon: GitBranch },
                { value: "activity", label: "动态", icon: Clock3 },
              ].map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="h-8 gap-1.5 rounded-lg border-b-0 px-3 text-[12.5px] data-[state=active]:border-transparent data-[state=active]:bg-white data-[state=active]:text-pine data-[state=active]:shadow-sm">
                  <item.icon className="size-3.5" />
                  {item.label}
                  {item.count !== undefined ? <span className="rounded-full bg-[#eef1ec] px-1.5 py-0.5 text-[10px] text-muted">{item.count}</span> : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-5 md:p-6">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 space-y-5 xl:col-span-8">
                <section>
                  <SectionTitle title="职位简介" icon={<FileText />} />
                  <p className="mt-3 text-[13.5px] leading-7 text-ink-soft">{job.summary}</p>
                </section>
                <section className="border-t border-line pt-5">
                  <SectionTitle title="工作职责" icon={<Target />} />
                  <ul className="mt-3 space-y-2">
                    {job.responsibilities.map((r) => (
                      <li key={r} className="flex gap-2.5 text-[13.5px] leading-6 text-ink-soft">
                        <span className="mt-2.5 size-1 shrink-0 rounded-full bg-pine/50" />{r}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="border-t border-line pt-5">
                  <SectionTitle title="任职要求" icon={<Check />} />
                  <ul className="mt-3 space-y-2">
                    {job.requirements.map((r) => (
                      <li key={r} className="flex gap-2.5 text-[13.5px] leading-6 text-ink-soft">
                        <Check className="mt-1 size-3.5 shrink-0 text-pine" />{r}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="border-t border-line pt-5">
                  <SectionTitle title="最近动态" icon={<Clock3 />} action={<button onClick={() => setTab("activity")} className="text-[12.5px] font-medium text-pine hover:underline">查看全部</button>} />
                  <div className="mt-3 space-y-0">
                    {activities.slice(0, 4).map((a) => (
                      <div key={`${a.candidateId}-${a.id}`} className="flex gap-3 border-b border-line/60 py-2.5 last:border-0">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pine/40" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] text-ink-soft"><span className="font-medium text-ink">{a.candidateName}</span> · {a.title}</div>
                          <div className="mt-0.5 text-[12px] text-muted">{a.at}{a.note ? ` · ${a.note}` : ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="col-span-12 space-y-4 xl:col-span-4">
                <div className="rounded-[18px] border border-line bg-[#fcfdf9] p-5">
                  <div className="flex items-start justify-between gap-2">
                    <SectionTitle title="AI 岗位画像" description="从团队目标与高绩效样本生成" icon={<Sparkles />} />
                    <Badge tone="pine" dot>已校准</Badge>
                  </div>
                  <div className="mt-3 flex justify-center"><RadarChart data={job.aiProfile.radar} size={220} /></div>
                  <div className="mt-3 space-y-2">
                    {job.aiProfile.radar.slice(0, 3).map((r) => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="w-[60px] shrink-0 text-[12px] text-muted">{r.label}</span>
                        <Progress value={r.value} className="h-1 flex-1" />
                        <span className="num w-5 text-right text-[12px] text-ink-soft">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setTab("profile")}>查看完整画像 <ArrowRight /></Button>
                </div>

                <div className="surface p-5">
                  <SectionTitle title="招聘团队" />
                  <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-[#f7f8f4] p-3">
                    <Avatar name={owner?.name ?? "负责人"} size={32} />
                    <div className="min-w-0 flex-1"><div className="text-[13px] font-medium text-ink">{owner?.name} · 招聘负责人</div><div className="mt-0.5 text-[12px] text-muted">负责职位与候选人推进</div></div>
                    <span className="size-1.5 rounded-full bg-success" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-[#f7f8f4] p-3">
                    <AvatarGroup names={["陈墨", "林岚", "赵珩"]} size={26} />
                    <div className="min-w-0 flex-1"><div className="text-[13px] font-medium text-ink">3 位面试官</div><div className="mt-0.5 text-[12px] text-muted">陈墨 · 林岚 · 赵珩</div></div>
                  </div>
                </div>

                <div className="surface p-5">
                  <SectionTitle title="职位信息" />
                  <div className="mt-2 divide-y divide-line text-[12.5px]">
                    {[
                      ["职位编号", job.code],
                      ["所属部门", dept?.name ?? "—"],
                      ["办公方式", job.workMode === "hybrid" ? "混合办公" : job.workMode === "remote" ? "远程" : "坐班"],
                      ["薪资范围", job.salary],
                      ["经验要求", job.experience],
                      ["学历要求", job.education],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 py-2"><span className="text-muted">{k}</span><span className="font-medium text-ink">{v}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <SectionTitle title="候选人流程" description="按阶段查看候选人，点击卡片进入详情。" icon={<Users />} />
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" asChild><Link href={`/candidates?job=${job.id}`}>查看列表</Link></Button>
                <Button size="sm" asChild><Link href={`/candidates?add=1&job=${job.id}`}><Plus /> 添加候选人</Link></Button>
              </div>
            </div>
            <div className="grid gap-3 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
              {stageOrder.map((stage) => {
                const meta = candidateStageMeta[stage];
                const list = jobCandidates.filter((c) => c.stage === stage);
                return (
                  <div key={stage} className="rounded-xl border border-line bg-[#fafbf8] p-2.5">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft"><span className={cn("size-1.5 rounded-full", meta.dot)} />{meta.label}</span>
                      <span className="num text-[12.5px] text-muted">{list.length}</span>
                    </div>
                    <div className="space-y-2">
                      {list.map((c) => (
                        <Link key={c.id} href={`/candidates?candidate=${c.id}`} className="block rounded-lg border border-line bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <Avatar name={c.name} size={26} />
                              <div className="min-w-0"><div className="truncate text-[13px] font-medium text-ink">{c.name}</div><div className="mt-0.5 truncate text-[12px] text-muted">{c.currentTitle}</div></div>
                            </div>
                            <span className={cn("num text-[13px] font-semibold", scoreTone(c.score).text)}>{c.score}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {c.tags.slice(0, 2).map((t) => <span key={t} className="rounded bg-[#f1f4ee] px-1.5 py-0.5 text-[11.5px] text-muted">{t}</span>)}
                          </div>
                          <div className="mt-2.5 flex items-center justify-between border-t border-line/70 pt-2 text-[11.5px] text-muted">
                            <span>{c.source}</span><span>{c.years} 年 · {c.degree}</span>
                          </div>
                        </Link>
                      ))}
                      {list.length === 0 ? <div className="rounded-lg border border-dashed border-line py-8 text-center text-[12px] text-muted">暂无候选人</div> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="p-5 md:p-6">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 xl:col-span-5">
                <div className="rounded-[18px] border border-line bg-[#fcfdf9] p-5">
                  <div className="flex items-start justify-between gap-2">
                    <SectionTitle title="胜任力雷达" description="5 个维度，满分 100" icon={<Target />} />
                    <Button size="sm" variant="soft" onClick={() => toast.success("已根据最新岗位信息重新校准画像")}><Wand2 /> 重新校准</Button>
                  </div>
                  <div className="mt-4 flex justify-center"><RadarChart data={job.aiProfile.radar} size={300} /></div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {job.aiProfile.radar.map((r) => (
                      <div key={r.label} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-2 text-[12.5px]">
                        <span className="text-muted">{r.label}</span><span className="num font-semibold text-ink">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-12 space-y-4 xl:col-span-7">
                <div className="surface p-5">
                  <SectionTitle title="必备条件" description="AI 将从简历中逐项验证" icon={<Check />} />
                  <div className="mt-3 space-y-2">
                    {job.aiProfile.mustHave.map((m, i) => (
                      <div key={m} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                        <span className="flex size-5 items-center justify-center rounded-full bg-pine-soft text-[12px] font-semibold text-pine">{i + 1}</span>
                        <span className="flex-1 text-[13px] text-ink-soft">{m}</span>
                        <span className="text-[12px] text-muted">必填</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="surface p-5">
                  <SectionTitle title="加分项" description="不是硬门槛，但会提升匹配度" icon={<Plus />} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.aiProfile.niceToHave.map((m) => <span key={m} className="rounded-lg border border-line bg-[#fafbf8] px-2.5 py-1.5 text-[12.5px] text-ink-soft">{m}</span>)}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="surface p-5"><SectionTitle title="团队风格" /><p className="mt-2 text-[13px] leading-6 text-ink-soft">{job.aiProfile.teamStyle}</p></div>
                  <div className="surface p-5"><SectionTitle title="成功画像" /><p className="mt-2 text-[13px] leading-6 text-ink-soft">{job.aiProfile.successProfile}</p></div>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-signal-soft/55 p-4">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-signal" />
                  <p className="text-[12.5px] leading-5 text-danger">AI 建议：在面试中增加一道「AI 产品失败复盘」问题，用于验证候选人对大模型能力边界的理解，而不只是成功经验。</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flow" className="p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionTitle title="招聘流程" description="候选人从投递到入职的完整路径。" icon={<GitBranch />} />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] text-muted"><span>数字人初试</span><Switch checked={aiOn} onCheckedChange={setAiOn} /></div>
                <Button variant="secondary" size="sm" asChild><Link href="/pipeline">编辑流程</Link></Button>
              </div>
            </div>
            <div className="mt-6 rounded-[18px] border border-line bg-[#fafbf8] p-5 md:p-7">
              <div className="flex flex-col gap-0 md:flex-row md:items-center">
                {job.stages.map((s, i) => (
                  <div key={s.key} className="flex flex-1 items-start gap-3 md:flex-col md:items-center md:text-center">
                    <div className="flex flex-col items-center md:w-full md:flex-row">
                      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[13px] font-semibold", i === 0 ? "border-pine text-pine" : "border-[#cbd5cb] text-muted")}>{i + 1}</div>
                      {i < job.stages.length - 1 ? <div className="my-1 h-6 w-px bg-[#d7dfd7] md:my-0 md:ml-2 md:h-px md:w-full" /> : null}
                    </div>
                    <div className="pb-4 md:pb-0 md:pt-3">
                      <div className="text-[13px] font-medium text-ink">{s.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted">{s.type === "screen" ? "AI 简历筛选" : s.type === "offer" ? "Offer 审批与发放" : s.aiEnabled && aiOn ? "数字人 + 人工" : "人工面试"}</div>
                      {s.type === "interview" && s.aiEnabled && aiOn ? <span className="mt-1 inline-flex rounded bg-pine-soft px-1.5 py-0.5 text-[11.5px] text-pine">AI 初筛</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                ["流程覆盖", `${job.candidateCount} 位候选人`, "当前进行中 " + jobCandidates.length + " 位"],
                ["待安排面试", `${jobCandidates.filter((c) => c.stage === "interview").length} 位`, "建议 48 小时内完成排期"],
                ["待反馈", `${jobInterviews.filter((i) => i.status === "done" && !i.feedback).length} 场`, "面试官需在 24 小时内提交"],
              ].map(([t, v, n]) => (
                <div key={t} className="surface p-4"><div className="text-[12.5px] text-muted">{t}</div><div className="mt-1 text-[14px] font-semibold text-ink">{v}</div><div className="mt-1 text-[12px] text-muted">{n}</div></div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="p-5 md:p-6">
            <SectionTitle title="职位动态" description="所有与该职位相关的操作记录。" icon={<Clock3 />} />
            <div className="mt-5 space-y-0">
              {activities.map((a) => (
                <div key={`${a.candidateId}-${a.id}`} className="flex gap-3 border-b border-line/70 py-3 last:border-0">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pine/40" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-ink-soft"><Link href={`/candidates?candidate=${a.candidateId}`} className="font-medium text-ink hover:text-pine">{a.candidateName}</Link> · {a.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted">{a.at}{a.note ? ` · ${a.note}` : ""}</div>
                  </div>
                </div>
              ))}
              {activities.length === 0 ? <div className="py-10 text-center text-[13px] text-muted">暂无动态</div> : null}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex items-center justify-between px-1 text-[12.5px] text-muted">
        <span>职位健康度会随简历流速、面试转化与反馈时效变化。</span>
        <Link href="/ai" className="flex items-center gap-1 font-medium text-pine hover:underline">让 AI 分析这个职位 <ArrowUpRight className="size-3" /></Link>
      </div>
      <EditJobDialog job={job} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
