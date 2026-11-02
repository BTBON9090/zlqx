"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Archive,
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Sparkles,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState, ScoreRing } from "@/components/ui/misc";
import { InfoTip } from "@/components/ui/info-tip";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { CandidateDrawer } from "@/components/candidates/candidate-drawer";
import { UploadResumeDialog } from "@/components/candidates/upload-dialog";
import { AddCandidateDialog } from "@/components/candidates/add-dialog";
import { ScheduleInterviewDialog } from "@/components/interviews/schedule-dialog";
import { useApp } from "@/lib/store";
import { useConfirm } from "@/components/ui/confirm";
import { candidateStageMeta, cn, formatRelativeDate, interviewTypeMeta, scoreTone } from "@/lib/utils";
import type { CandidateStage } from "@/lib/types";

const stageTabs: { key: CandidateStage | "all"; label: string }[] = [
  { key: "all", label: "全部候选人" },
  { key: "screening", label: "待筛选" },
  { key: "interview", label: "面试中" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "已入职" },
  { key: "archived", label: "已归档" },
];

function CandidatesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { candidates, jobs, employees, interviews, advanceCandidate, departments } = useApp();
  const confirm = useConfirm();
  const [stage, setStage] = useState<CandidateStage | "all">("all");
  const [query, setQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sort, setSort] = useState("match");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [stickyOffsets, setStickyOffsets] = useState({ stage: 78, filter: 65 });

  useEffect(() => {
    const update = () => {
      const stageHeight = stageRef.current?.offsetHeight ?? 78;
      const filterHeight = filterRef.current?.offsetHeight ?? 65;
      setStickyOffsets((prev) => (prev.stage === stageHeight && prev.filter === filterHeight ? prev : { stage: stageHeight, filter: filterHeight }));
    };
    update();
    const observer = new ResizeObserver(update);
    if (stageRef.current) observer.observe(stageRef.current);
    if (filterRef.current) observer.observe(filterRef.current);
    return () => observer.disconnect();
  }, []);

  const filterStickyTop = 60 + stickyOffsets.stage;
  const headerStickyTop = 60 + stickyOffsets.stage + stickyOffsets.filter;

  const [addOpen, setAddOpen] = useState(false);
  const [scheduleCandidate, setScheduleCandidate] = useState<string | null>(null);

  useEffect(() => {
    const c = searchParams.get("candidate");
    if (c) setSelectedCandidate(c);
    if (searchParams.get("upload")) setUploadOpen(true);
    if (searchParams.get("add")) setAddOpen(true);
    const j = searchParams.get("job");
    if (j) setJobFilter(j);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        if (stage !== "all" && c.stage !== stage) return false;
        if (jobFilter !== "all" && c.jobId !== jobFilter) return false;
        if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          return `${c.name}${c.currentCompany}${c.currentTitle}${c.email}${c.phone}`.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => (sort === "match" ? b.score - a.score : b.appliedAt.localeCompare(a.appliedAt)));
  }, [candidates, stage, jobFilter, sourceFilter, query, sort]);

  const counts = useMemo(
    () =>
      Object.fromEntries(stageTabs.map((t) => [t.key, t.key === "all" ? candidates.length : candidates.filter((c) => c.stage === t.key).length])) as Record<string, number>,
    [candidates]
  );

  const allSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.id));
  const sources = Array.from(new Set(candidates.map((c) => c.source)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="候选人"
        description="所有候选人都在这里：从简历解析、AI 匹配，到面试推进与 Offer 发放。"
        actions={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(true)}><Upload /> 上传简历</Button>
            <Button onClick={() => setAddOpen(true)}><UserPlus /> 添加候选人</Button>
          </>
        }
      />

      <div ref={stageRef} className="surface sticky top-[60px] z-20 grid grid-cols-2 overflow-hidden sm:grid-cols-3 lg:grid-cols-6">
        {stageTabs.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setStage(t.key)}
            className={cn(
              "group relative flex flex-col items-start gap-1 px-4 py-3.5 text-left transition-colors",
              i > 0 && "border-l border-line max-lg:[&:nth-child(4)]:border-l-0",
              stage === t.key ? "bg-pine-soft/55" : "hover:bg-[#fafbf8]"
            )}
          >
            <span className="flex items-baseline gap-1.5">
              <span className={cn("num text-[22px] font-semibold leading-none tracking-[-0.04em]", stage === t.key ? "text-pine" : "text-ink")}>{counts[t.key]}</span>
              {t.key === "screening" && counts[t.key] > 0 ? <span className="rounded bg-amber-soft px-1 py-0.5 text-[11.5px] font-medium text-amber-deep">待处理</span> : null}
            </span>
            <span className={cn("text-[12.5px]", stage === t.key ? "font-medium text-pine" : "text-muted")}>{t.label}</span>
            {stage === t.key ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-pine" /> : null}
          </button>
        ))}
      </div>

      <div className="surface overflow-visible">
        <div ref={filterRef} style={{ top: filterStickyTop }} className="sticky z-20 flex flex-wrap items-center gap-2 rounded-t-[17px] border-b border-line bg-[#fcfcf9] px-4 py-3">
          <SearchInput placeholder="搜索姓名、公司、手机号" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-[240px]" />
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[168px]"><SelectValue placeholder="全部职位" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部职位</SelectItem>
              {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[138px]"><SelectValue placeholder="全部来源" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="match">匹配度优先</SelectItem>
              <SelectItem value="recent">最近投递</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="text-muted" onClick={() => { setQuery(""); setJobFilter("all"); setSourceFilter("all"); setStage("all"); setSort("match"); }}>
            <Filter /> 重置
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1 text-[12.5px] text-muted lg:flex"><Sparkles className="size-3 text-signal" /> AI 已解析全部简历</span>
            <span className="text-[12.5px] text-muted">共 <span className="num font-medium text-ink">{filtered.length}</span> 人</span>
          </div>
        </div>

        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-line bg-pine-soft/60 px-4 py-2.5 text-[13px]">
            <span className="font-medium text-pine">已选择 {selected.length} 位候选人</span>
            <button className="text-pine hover:underline" onClick={() => toast.success("已批量发送面试邀约")}>发送面试邀约</button>
            <button className="text-pine hover:underline" onClick={() => toast.success("已批量发送消息")}>发送消息</button>
            <button
              className="text-pine hover:underline"
              onClick={async () => {
                const ok = await confirm({ title: `归档 ${selected.length} 位候选人？`, description: "归档后候选人会保留在「已归档」中，不再出现在默认流程视图。", confirmText: "批量归档", tone: "danger" });
                if (!ok) return;
                selected.forEach((id) => advanceCandidate(id, "archived", "批量归档"));
                setSelected([]);
                toast.success("已批量归档");
              }}
            >
              归档
            </button>
            <button className="ml-auto text-muted hover:text-ink" onClick={() => setSelected([])}>取消选择</button>
          </div>
        ) : null}

        <div className="hidden overflow-x-auto md:block xl:overflow-visible">
          <table style={{ "--cand-header-top": `${headerStickyTop}px` } as React.CSSProperties} className="w-full min-w-[1040px] border-collapse text-left">
            <thead className="bg-[#fafbf8] xl:[&>tr>th]:sticky xl:[&>tr>th]:top-[var(--cand-header-top)] xl:[&>tr>th]:z-10 xl:[&>tr>th]:bg-[#fafbf8]">
              <tr className="border-b border-line bg-[#fafbf8] text-[12.5px] text-muted">
                <th className="w-[40px] px-4 py-2.5">
                  <Checkbox checked={allSelected} onCheckedChange={(v) => setSelected(v ? filtered.map((c) => c.id) : [])} aria-label="全选" />
                </th>
                <th className="min-w-[240px] py-2.5 pr-4 font-medium">候选人</th>
                <th className="w-[180px] py-2.5 pr-4 font-medium">应聘职位</th>
                <th className="w-[90px] py-2.5 pr-4 font-medium">阶段</th>
                <th className="w-[82px] py-2.5 pr-4 font-medium"><span className="inline-flex items-center gap-1">匹配度 <InfoTip text="由 AI 根据岗位画像与简历计算：技能 35%、经验 25%、行业 20%、稳定性 10%、地点 10%，再结合岗位紧急度微调。可在候选人详情的 AI 评估中查看构成。" /></span></th>
                <th className="w-[142px] py-2.5 pr-4 font-medium">最近面试</th>
                <th className="w-[96px] py-2.5 pr-4 font-medium">负责人</th>
                <th className="w-[84px] py-2.5 pr-4 font-medium">投递</th>
                <th className="w-[120px] px-4 py-2.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const job = jobs.find((j) => j.id === c.jobId);
                const owner = employees.find((e) => e.id === c.ownerId);
                const nextInterview = interviews
                  .filter((i) => i.candidateId === c.id && i.status !== "done" && i.status !== "cancelled")
                  .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
                const stageMeta = candidateStageMeta[c.stage];
                return (
                  <tr key={c.id} className="group cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-[#fafbf8]" onClick={() => setSelectedCandidate(c.id)}>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(c.id)} onCheckedChange={(v) => setSelected((prev) => v ? [...prev, c.id] : prev.filter((id) => id !== c.id))} aria-label={`选择${c.name}`} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size={34} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[13.5px] font-medium text-ink group-hover:text-pine">{c.name}</span>
                            <span className="text-[12px] text-muted">{c.gender} · {c.age} 岁 · {c.years} 年</span>
                            {c.appliedAt === "2026-10-30" ? <span className="rounded bg-signal-soft px-1 py-0.5 text-[11.5px] font-medium text-signal">新</span> : null}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
                            <span className="truncate">{c.currentCompany} · {c.currentTitle}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {c.tags.slice(0, 2).map((t) => <span key={t} className="rounded bg-[#f0f3ee] px-1.5 py-0.5 text-[11.5px] text-muted">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="text-[12.5px] text-ink-soft">{job?.title}</div>
                      <div className="mt-0.5 text-[12px] text-muted">{job ? departments.find((d) => d.id === job.departmentId)?.name : ""}</div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={cn("inline-flex h-[22px] items-center whitespace-nowrap gap-1.5 rounded-md px-2 text-[12px] font-medium", stageMeta.tone)}>
                        <span className={cn("size-1.5 rounded-full", stageMeta.dot)} /> {stageMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4"><ScoreRing score={c.score} size={34} stroke={2.5} /></td>
                    <td className="py-3.5 pr-4">
                      {nextInterview ? (
                        <div>
                          <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                            <span>{formatRelativeDate(nextInterview.date)} {nextInterview.start}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted">
                            <span className={cn("rounded px-1 py-0.5", interviewTypeMeta[nextInterview.type].tone)}>{interviewTypeMeta[nextInterview.type].label}</span>
                            {nextInterview.round}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px] text-muted">暂无安排</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1.5"><Avatar name={owner?.name ?? "负责人"} size={20} /><span className="text-[12px] text-ink-soft">{owner?.name}</span></div>
                    </td>
                    <td className="py-3.5 pr-4 text-[12px] text-muted">{c.appliedAt.slice(5)}</td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="soft" size="sm" className="h-7 gap-1 px-2 text-[12.5px]">推进 <ChevronDown className="size-3" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>推进到</DropdownMenuLabel>
                            {(["screening", "interview", "offer", "hired", "archived"] as CandidateStage[]).filter((s) => s !== c.stage).map((s) => (
                              <DropdownMenuItem key={s} onClick={() => { advanceCandidate(c.id, s, "候选人列表操作"); toast.success(`已推进至${candidateStageMeta[s].label}`); }}>
                                <span className={cn("size-1.5 rounded-full", candidateStageMeta[s].dot)} /> {candidateStageMeta[s].label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setScheduleCandidate(c.id)}><CalendarClock /> 安排面试</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedCandidate(c.id)}><ArrowUpRight /> 查看详情</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setScheduleCandidate(c.id)}><CalendarClock /> 安排面试</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("消息已发送")}><Send /> 发送消息</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => { const ok = await confirm({ title: "归档该候选人？", description: `确定归档「${c.name}」吗？归档后可在已归档中找回。`, confirmText: "归档", tone: "danger" }); if (!ok) return; advanceCandidate(c.id, "archived", "手动归档"); toast.success("已归档"); }}><Archive /> 归档</DropdownMenuItem>
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
          {filtered.map((c) => {
            const job = jobs.find((j) => j.id === c.jobId);
            const nextInterview = interviews
              .filter((i) => i.candidateId === c.id && i.status !== "done" && i.status !== "cancelled")
              .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
            const stageMeta = candidateStageMeta[c.stage];
            return (
              <button key={c.id} onClick={() => setSelectedCandidate(c.id)} className="block w-full p-4 text-left transition-colors active:bg-[#fafbf8]">
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5"><span className="truncate text-[14px] font-semibold text-ink">{c.name}</span><span className="text-[12px] text-muted">{c.gender} · {c.age} 岁 · {c.years} 年</span></div>
                    <div className="mt-0.5 truncate text-[12px] text-muted">{c.currentCompany} · {c.currentTitle}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">{c.tags.slice(0, 2).map((t) => <span key={t} className="rounded bg-[#f0f3ee] px-1.5 py-0.5 text-[11.5px] text-muted">{t}</span>)}</div>
                  </div>
                  <ScoreRing score={c.score} size={36} stroke={2.5} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-2.5">
                  <div className="min-w-0"><div className="truncate text-[12.5px] text-ink-soft">{job?.title}</div><div className="mt-0.5 text-[11.5px] text-muted">{nextInterview ? `${formatRelativeDate(nextInterview.date)} ${nextInterview.start} · ${interviewTypeMeta[nextInterview.type].label}` : "暂无面试安排"}</div></div>
                  <span className={cn("inline-flex shrink-0 items-center whitespace-nowrap gap-1 rounded px-1.5 py-1 text-[11.5px] font-medium", stageMeta.tone)}><span className={cn("size-1.5 rounded-full", stageMeta.dot)} />{stageMeta.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Users />} title="没有找到候选人" description="尝试调整筛选条件，或上传一份新简历。" action={<Button size="sm" onClick={() => setUploadOpen(true)}><Upload /> 上传简历</Button>} />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="text-[12.5px] text-muted">显示 {filtered.length} / {candidates.length} 位候选人</span>
          <div className="flex items-center gap-1 text-[12.5px] text-muted">
            <button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec] disabled:opacity-30" disabled>‹</button>
            <span className="flex size-7 items-center justify-center rounded-md bg-pine text-white">1</span>
            <button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">2</button>
            <button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">3</button>
            <button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">›</button>
            <span className="ml-2">20 条 / 页</span>
          </div>
        </div>
      </div>

      <CandidateDrawer candidateId={selectedCandidate} onClose={() => setSelectedCandidate(null)} onNavigate={setSelectedCandidate} />
      <UploadResumeDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <AddCandidateDialog open={addOpen} onOpenChange={setAddOpen} defaultJobId={jobFilter !== "all" ? jobFilter : undefined} onCreated={(id) => setSelectedCandidate(id)} />
      <ScheduleInterviewDialog open={!!scheduleCandidate} onOpenChange={(v) => !v && setScheduleCandidate(null)} defaultCandidateId={scheduleCandidate ?? undefined} />
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="surface h-[400px] animate-pulse" />}>
      <CandidatesContent />
    </Suspense>
  );
}
