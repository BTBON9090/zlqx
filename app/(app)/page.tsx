"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Plus,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { PageHeader, SectionTitle, Sparkline, Stat } from "@/components/ui/misc";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/toggle";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { candidateStageMeta, cn, formatTimeRange, interviewTypeMeta, scoreTone } from "@/lib/utils";
import { toast } from "sonner";

const funnel = [
  { label: "收到简历", value: 148, width: 100, note: "本周 +28" },
  { label: "筛选通过", value: 62, width: 76, note: "42%" },
  { label: "进入面试", value: 31, width: 56, note: "50%" },
  { label: "发出 Offer", value: 6, width: 32, note: "19%" },
  { label: "成功入职", value: 3, width: 20, note: "50%" },
];

function SignalOrb() {
  return (
    <div className="pointer-events-none absolute -right-6 -top-8 hidden h-[300px] w-[300px] opacity-90 md:block">
      <svg viewBox="0 0 300 300" fill="none" aria-hidden>
        <circle cx="170" cy="140" r="54" stroke="white" strokeOpacity=".14" />
        <circle cx="170" cy="140" r="88" stroke="white" strokeOpacity=".1" />
        <circle cx="170" cy="140" r="122" stroke="white" strokeOpacity=".07" />
        <circle cx="170" cy="140" r="150" stroke="white" strokeOpacity=".05" strokeDasharray="2 6" />
        <path d="M170 140 L250 78" stroke="white" strokeOpacity=".14" />
        <path d="M170 140 L110 202" stroke="white" strokeOpacity=".1" />
        <path d="M170 140 L242 188" stroke="white" strokeOpacity=".08" />
        <circle cx="170" cy="140" r="33" fill="white" fillOpacity=".06" />
        <circle cx="170" cy="140" r="6" fill="#f2f4ef" />
        <circle cx="250" cy="78" r="4.5" fill="#df4f2c" />
        <circle cx="250" cy="78" r="10" stroke="#df4f2c" strokeOpacity=".35" />
        <circle cx="110" cy="202" r="3.5" fill="#9bd0b4" />
        <circle cx="242" cy="188" r="3" fill="#f2f4ef" fillOpacity=".8" />
        <circle cx="92" cy="92" r="2.5" fill="#f2f4ef" fillOpacity=".5" />
      </svg>
      <div className="absolute right-[38px] top-[48px] rounded-md border border-white/10 bg-white/6 px-2 py-1 text-[9px] tracking-wide text-white/70 backdrop-blur-sm">
        决策窗口 · 2
      </div>
      <div className="absolute bottom-[54px] left-[42px] rounded-md border border-white/10 bg-white/6 px-2 py-1 text-[9px] tracking-wide text-white/70 backdrop-blur-sm">
        审批阻塞 · 1
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { interviews, candidates, jobs, tasks, toggleTask, employees } = useApp();

  const todayInterviews = interviews
    .filter((i) => i.date === "2026-10-30" && i.status !== "cancelled")
    .sort((a, b) => a.start.localeCompare(b.start));
  const latest = [...candidates].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)).slice(0, 5);
  const activeJobs = jobs.filter((j) => j.status === "active");
  const displayJobs = activeJobs.slice(0, 4);
  const openTasks = tasks.filter((t) => !t.done).length;

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="10月30日 · 周五"
        title="早上好，林岚"
        description="今天有 5 场面试，2 位候选人进入决策窗口。招聘业务授权还需要你确认。"
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link href="/candidates?upload=1">
                <Upload /> 上传简历
              </Link>
            </Button>
            <Button asChild>
              <Link href="/jobs/new">
                <Plus /> 发布职位
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4 xl:gap-5">
        <section className="col-span-12 xl:col-span-8">
          <div className="ai-orbit noise relative overflow-hidden rounded-[20px] p-6 text-white md:p-7">
            <div className="signal-grid absolute inset-0 opacity-55" />
            <div className="absolute -left-16 -top-24 size-[280px] rounded-full bg-[#4f8c72]/20 blur-3xl" />
            <SignalOrb />
            <div className="relative z-10 max-w-[560px]">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-md border border-white/15 bg-white/8">
                  <Sparkles className="size-3 text-[#f2b3a1]" />
                </span>
                <span className="text-[11px] font-medium tracking-[0.02em] text-[#cfe0d5]">AI 今日招聘简报</span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[9px] text-[#a9c3b5]">
                  <span className="pulse-dot inline-block size-1 rounded-full bg-[#7fd2a8]" />
                  08:12 更新
                </span>
              </div>
              <h2 className="mt-5 max-w-[480px] text-balance text-[24px] font-semibold leading-[1.35] tracking-[-0.03em] md:text-[27px]">
                今天的招聘信号已经收敛。
                <br />
                <span className="text-white/72">把注意力放在两个决策窗口。</span>
              </h2>
              <p className="mt-3 max-w-[510px] text-[12px] leading-6 text-[#b7cbbf]">
                高级产品经理岗位的简历质量高于近 30 天均值，但裴然的 Offer 已在财务审批停留 1 天；周予安将在 10:00 进入二面，这是本周最值得关注的一场面试。
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="bg-[#f2f4ef] text-pine hover:bg-white"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-copilot"))}
                >
                  <Sparkles /> 生成行动清单
                </Button>
                <Button size="sm" variant="ghost" className="text-[#d5e4da] hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/candidates?candidate=cand-1">
                    查看周予安 <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-4">
                {[
                  ["决策窗口", "2", "候选人待推进"],
                  ["审批阻塞", "1", "Offer 待处理"],
                  ["新增简历", "6", "今日进入"],
                ].map(([label, value, note]) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <span className="num text-[20px] font-semibold leading-none">{value}</span>
                    <span className="text-[10px] text-[#a9c3b5]">
                      {label} <span className="text-[#7d9a8c]">· {note}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="surface col-span-12 flex flex-col p-5 xl:col-span-4">
          <SectionTitle
            title="招聘漏斗"
            description="近 30 天 · 全公司"
            action={
              <Link href="/candidates" className="flex items-center gap-1 text-[11px] font-medium text-pine hover:underline">
                查看候选人 <ArrowUpRight className="size-3" />
              </Link>
            }
          />
          <div className="mt-5 flex-1 space-y-3">
            {funnel.map((f, i) => (
              <div key={f.label} className="group">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-muted">{f.label}</span>
                  <span className="num font-medium text-ink">
                    {f.value}
                    <span className="ml-1.5 text-[9.5px] font-normal text-muted">{f.note}</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f2ed]">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", i === 0 ? "bg-pine" : i === 1 ? "bg-[#3f7460]" : i === 2 ? "bg-[#6b9b82]" : i === 3 ? "bg-[#a8c4ad]" : "bg-[#d6a58f]")}
                    style={{ width: `${f.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f7f8f4] px-3.5 py-3">
            <div>
              <div className="text-[10px] text-muted">整体转化率</div>
              <div className="mt-0.5 num text-[17px] font-semibold text-pine">2.0%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted">较上月</div>
              <div className="mt-0.5 text-[11px] font-medium text-pine">+0.4 pt</div>
            </div>
            <Sparkline data={[3, 4, 3, 5, 4, 6, 7, 6, 8]} width={76} height={26} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label="在招职位" value={activeJobs.length} suffix="个" change="+2" spark={[4, 4, 5, 5, 6, 6, 7]} />
        <Stat label="待处理简历" value={26} suffix="份" change="+18%" spark={[8, 12, 10, 16, 14, 21, 26]} tone="blue" />
        <Stat label="本周面试" value={12} suffix="场" change="+3" spark={[4, 6, 5, 8, 7, 9, 12]} tone="amber" />
        <Stat label="Offer 接受率" value="86" suffix="%" change="+6pt" spark={[72, 75, 74, 80, 78, 84, 86]} tone="signal" />
      </div>

      <div className="grid grid-cols-12 gap-4 xl:gap-5">
        <section className="surface col-span-12 overflow-hidden xl:col-span-7">
          <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
            <SectionTitle
              title="今日面试"
              description={`${todayInterviews.length} 场 · 下一场 ${todayInterviews[0]?.start ?? "—"} 开始`}
              icon={<CalendarClock />}
            />
            <Link href="/interviews" className="flex items-center gap-1 text-[11px] font-medium text-pine hover:underline">
              全部安排 <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="px-2 pb-2">
            {todayInterviews.map((iv, idx) => {
              const candidate = candidates.find((c) => c.id === iv.candidateId);
              const job = jobs.find((j) => j.id === iv.jobId);
              const interviewerNames = iv.interviewers.map((id) => (id.startsWith("AI") ? id : employees.find((e) => e.id === id)?.name ?? "面试官"));
              const type = interviewTypeMeta[iv.type];
              const isNext = idx === 0;
              return (
                <Link
                  key={iv.id}
                  href={`/interviews?interview=${iv.id}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[#f6f7f3]",
                    isNext && "bg-[#f7f8f4]"
                  )}
                >
                  <div className="w-[62px] shrink-0">
                    <div className="num text-[12.5px] font-semibold text-ink">{iv.start}</div>
                    <div className="mt-0.5 text-[9.5px] text-muted">{iv.end} 结束</div>
                  </div>
                  <span className={cn("h-8 w-px shrink-0", isNext ? "bg-signal" : "bg-line")} />
                  <Avatar name={candidate?.name ?? "候选人"} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-medium text-ink">{candidate?.name}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", type.tone)}>{type.label}</span>
                    </div>
                    <div className="mt-1 truncate text-[10.5px] text-muted">
                      {job?.title} · {iv.round}
                    </div>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <AvatarGroup names={interviewerNames} size={22} max={2} />
                    <span className="text-[9.5px] text-muted">{interviewerNames[0]}</span>
                  </div>
                  <span
                    className={cn(
                      "ml-1 hidden h-[22px] items-center rounded-md px-2 text-[10px] font-medium md:inline-flex",
                      iv.status === "confirmed" ? "bg-pine-soft text-pine" : "bg-amber-soft text-[#7a5412]"
                    )}
                  >
                    {iv.status === "confirmed" ? "已确认" : "待确认"}
                  </span>
                  <ChevronRight className="size-3.5 text-[#b3bdb5] transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <span className="flex items-center gap-1.5 text-[10.5px] text-muted">
              <Clock3 className="size-3" /> 下一场 10:00 · 周予安 · 二面
            </span>
            <Link href="/interviews" className="text-[10.5px] font-medium text-pine hover:underline">
              查看全部
            </Link>
          </div>
        </section>

        <section className="surface col-span-12 flex flex-col p-5 xl:col-span-5">
          <SectionTitle
            title="今日待办"
            description={`${openTasks} 项未完成 · 按优先级排序`}
            icon={<Check />}
            action={<Badge tone="signal">{openTasks}</Badge>}
          />
          <div className="mt-3 divide-y divide-line">
            {tasks.map((task) => (
              <label key={task.id} className="group flex cursor-pointer items-start gap-3 py-3">
                <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[12px] leading-5 transition-colors", task.done ? "text-muted line-through" : "text-ink group-hover:text-pine")}>
                    {task.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
                    <span className={cn("size-1.5 rounded-full", task.tone === "signal" ? "bg-signal" : task.tone === "amber" ? "bg-amber" : "bg-pine")} />
                    {task.due}
                  </span>
                </span>
                {task.id === "task-2" ? <span className="rounded bg-amber-soft px-1.5 py-0.5 text-[9px] font-medium text-[#7a5412]">审批</span> : null}
              </label>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-line pt-3.5">
            <button
              onClick={() => toast.success("已将剩余待办整理为今日清单")}
              className="text-[11px] font-medium text-pine hover:underline"
            >
              生成今日清单
            </button>
            <Link href="/interviews" className="flex items-center gap-1 text-[10.5px] text-muted hover:text-ink">
              查看全部 <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-12 gap-4 xl:gap-5">
        <section className="surface col-span-12 overflow-hidden xl:col-span-7">
          <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
            <SectionTitle title="最新候选人" description="AI 已完成结构化解析与岗位匹配" icon={<Users />} />
            <Link href="/candidates" className="flex items-center gap-1 text-[11px] font-medium text-pine hover:underline">
              查看全部 <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line bg-[#fafbf8] text-[10px] font-medium text-muted">
                  <th className="px-5 py-2 font-medium">候选人</th>
                  <th className="py-2 font-medium">应聘职位</th>
                  <th className="py-2 font-medium">阶段</th>
                  <th className="py-2 text-right font-medium">匹配度</th>
                  <th className="px-5 py-2 text-right font-medium">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((c) => {
                  const job = jobs.find((j) => j.id === c.jobId);
                  const stage = candidateStageMeta[c.stage];
                  return (
                    <tr key={c.id} className="group border-b border-line/70 last:border-0 hover:bg-[#fafbf8]">
                      <td className="px-5 py-3">
                        <Link href={`/candidates?candidate=${c.id}`} className="flex items-center gap-2.5">
                          <Avatar name={c.name} size={30} />
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-medium text-ink group-hover:text-pine">{c.name}</span>
                            <span className="mt-0.5 block truncate text-[9.5px] text-muted">{c.currentCompany} · {c.years} 年</span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 text-[11px] text-ink-soft">{job?.title}</td>
                      <td className="py-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px]", stage.tone)}>
                          <span className={cn("size-1.5 rounded-full", stage.dot)} />
                          {stage.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={cn("num text-[13px] font-semibold", scoreTone(c.score).text)}>{c.score}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-[10px] text-muted">{c.appliedAt.slice(5)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface col-span-12 p-5 xl:col-span-5">
          <SectionTitle
            title="职位健康度"
            description="结合简历流速、面试转化与招聘周期"
            action={
              <Link href="/jobs" className="flex items-center gap-1 text-[11px] font-medium text-pine hover:underline">
                全部职位 <ArrowUpRight className="size-3" />
              </Link>
            }
          />
          <div className="mt-4 space-y-3.5">
            {displayJobs.map((job) => {
              const health = Math.min(96, 58 + job.newThisWeek * 4 + Math.round((job.hired / job.headcount) * 20));
              return (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-xl border border-line bg-[#fcfcf9] p-3.5 transition-colors hover:border-line-strong hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-medium text-ink">{job.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-[9.5px] text-muted">
                        <span>{job.location}</span>
                        <span className="size-0.5 rounded-full bg-muted" />
                        <span>本周 +{job.newThisWeek}</span>
                      </div>
                    </div>
                    <span className={cn("num text-[13px] font-semibold", health >= 85 ? "text-pine" : "text-[#8a6a24]")}>{health}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={job.hired} max={job.headcount} className="h-1 flex-1" barClassName={health >= 85 ? "bg-pine" : "bg-amber"} />
                    <span className="shrink-0 text-[9.5px] text-muted">已入职 {job.hired}/{job.headcount}</span>
                    <span className="shrink-0 text-[9.5px] text-muted">· {job.candidateCount} 份</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-signal-soft/55 px-3.5 py-3">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-signal" />
            <p className="text-[10.5px] leading-5 text-[#8a4a35]">
              解决方案顾问的面试转化低于同类岗位 12%，建议让 AI 重新校准岗位画像。
            </p>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 text-[10px] text-muted">
        <span>数据更新于 2026-10-30 08:12 · 仅展示你有权限查看的招聘数据</span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#6fae8c]" /> 所有服务运行正常
        </span>
      </div>
    </div>
  );
}
