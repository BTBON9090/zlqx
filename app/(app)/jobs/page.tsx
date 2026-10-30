"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Copy,
  Edit3,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { cn, jobStatusMeta } from "@/lib/utils";
import type { JobStatus } from "@/lib/types";

const tabs: { key: JobStatus | "all"; label: string }[] = [
  { key: "all", label: "全部职位" },
  { key: "draft", label: "未开始" },
  { key: "active", label: "招聘中" },
  { key: "reviewing", label: "审核中" },
  { key: "closed", label: "已结束" },
];

export default function JobsPage() {
  const router = useRouter();
  const { jobs, employees, departments, updateJob } = useApp();
  const [tab, setTab] = useState<JobStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [owner, setOwner] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (tab !== "all" && j.status !== tab) return false;
      if (dept !== "all" && j.departmentId !== dept && !departments.some((d) => d.id === dept && d.parentId === j.departmentId)) return false;
      if (owner !== "all" && j.ownerId !== owner) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return `${j.title}${j.code}${j.location}`.toLowerCase().includes(q);
      }
      return true;
    });
  }, [jobs, tab, dept, owner, query, departments]);

  const allSelected = filtered.length > 0 && filtered.every((j) => selected.includes(j.id));

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="招聘业务"
        title="职位管理"
        description="从需求到入职，管理每一个在招职位的节奏、候选人与健康度。"
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link href="/candidates?upload=1"><Upload /> 导入简历</Link>
            </Button>
            <Button asChild>
              <Link href="/jobs/new"><Plus /> 新建职位</Link>
            </Button>
          </>
        }
      />

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 pt-3">
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => {
              const count = t.key === "all" ? jobs.length : jobs.filter((j) => j.status === t.key).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative flex items-baseline gap-2 px-3 pb-3 pt-2 text-[13.5px] font-medium transition-colors",
                    tab === t.key ? "text-pine" : "text-muted hover:text-ink"
                  )}
                >
                  {t.label}
                  <span className={cn("num text-[14px] font-semibold", tab === t.key ? "text-pine" : "text-[#a6b1a8]")}>{count}</span>
                  {tab === t.key ? <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-pine" /> : null}
                </button>
              );
            })}
          </div>
          <div className="hidden items-center gap-1.5 pb-2 text-[12.5px] text-muted md:flex">
            <Sparkles className="size-3 text-signal" />
            2 个职位超过 21 天未更新，建议重新校准画像
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#fcfcf9] px-4 py-3">
          <SearchInput placeholder="搜索职位名称或编号" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-[230px]" />
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="全部部门" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部门</SelectItem>
              {departments.filter((d) => !d.parentId).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="w-[145px]"><SelectValue placeholder="全部负责人" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部负责人</SelectItem>
              {employees.filter((e) => ["emp-1", "emp-2", "emp-3", "emp-4"].includes(e.id)).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="text-muted" onClick={() => { setDept("all"); setOwner("all"); setQuery(""); setTab("all"); }}>
            <Filter /> 重置
          </Button>
          <div className="ml-auto hidden items-center gap-1.5 text-[12.5px] text-muted lg:flex">
            共 <span className="num font-medium text-ink">{filtered.length}</span> 个职位
          </div>
        </div>

        {selected.length > 0 ? (
          <div className="flex items-center gap-3 border-b border-line bg-pine-soft/60 px-5 py-2.5 text-[13px]">
            <span className="font-medium text-pine">已选择 {selected.length} 个职位</span>
            <button className="text-pine hover:underline" onClick={() => toast.success("已批量刷新职位状态")}>刷新状态</button>
            <button className="text-pine hover:underline" onClick={() => toast.success("已导出职位清单")}>导出</button>
            <button className="ml-auto text-muted hover:text-ink" onClick={() => setSelected([])}>取消选择</button>
          </div>
        ) : null}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-[#fafbf8] text-[12.5px] text-muted">
                <th className="w-[42px] px-4 py-2.5">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => setSelected(v ? filtered.map((j) => j.id) : [])}
                    aria-label="全选"
                  />
                </th>
                <th className="min-w-[240px] py-2.5 pr-4 font-medium">职位名称</th>
                <th className="min-w-[150px] py-2.5 pr-4 font-medium">部门 · 地点</th>
                <th className="w-[92px] py-2.5 pr-4 font-medium">状态</th>
                <th className="w-[82px] py-2.5 pr-4 font-medium">负责人</th>
                <th className="w-[108px] py-2.5 pr-4 font-medium">候选人</th>
                <th className="w-[170px] py-2.5 pr-4 font-medium">招聘进度</th>
                <th className="w-[94px] py-2.5 pr-4 font-medium">更新</th>
                <th className="w-[92px] px-4 py-2.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => {
                const deptObj = departments.find((d) => d.id === job.departmentId);
                const ownerObj = employees.find((e) => e.id === job.ownerId);
                const status = jobStatusMeta[job.status];
                return (
                  <tr
                    key={job.id}
                    className="group cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-[#fafbf8]"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(job.id)} onCheckedChange={(v) => setSelected((prev) => v ? [...prev, job.id] : prev.filter((id) => id !== job.id))} aria-label={`选择${job.title}`} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", job.priority === "high" ? "bg-signal-soft text-signal" : "bg-[#eef1ec] text-muted")}>
                          <BriefcaseBusiness className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[13.5px] font-medium text-ink group-hover:text-pine">{job.title}</span>
                            {job.priority === "high" ? <span className="rounded bg-signal-soft px-1.5 py-0.5 text-[11.5px] font-medium text-signal">急招</span> : null}
                          </div>
                          <div className="mt-0.5 text-[12px] text-muted">{job.code} · {job.experience} · {job.education}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="text-[13px] text-ink-soft">{deptObj?.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted">{job.location}</div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={cn("inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-[12.5px] font-medium", status.tone)}>
                        <span className={cn("size-1.5 rounded-full", status.dot)} /> {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={ownerObj?.name ?? "负责人"} size={22} />
                        <span className="text-[12.5px] text-ink-soft">{ownerObj?.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1 text-[13px]">
                        <Users className="size-3 text-muted" />
                        <span className="num font-medium text-ink">{job.candidateCount}</span>
                        <span className="text-[12px] text-muted">份</span>
                      </div>
                      <div className="mt-0.5 text-[12px] text-muted">本周 +{job.newThisWeek}</div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <Progress value={job.hired} max={job.headcount} className="h-1 w-[92px]" />
                        <span className="num text-[12.5px] text-muted">{job.hired}/{job.headcount}</span>
                      </div>
                      <div className="mt-1 text-[12px] text-muted">已入职 {job.hired} 人</div>
                    </td>
                    <td className="py-3.5 pr-4 text-[12.5px] text-muted">{job.updatedAt.slice(5)}</td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/jobs/${job.id}`)}>查看</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多操作">
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toast.success("已复制职位：" + job.title)}>
                              <Copy /> 复制职位
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}?edit=1`)}>
                              <Edit3 /> 编辑职位
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                updateJob(job.id, { status: job.status === "active" ? "paused" : "active" });
                                toast.success(job.status === "active" ? "职位已暂停" : "职位已恢复招聘");
                              }}
                            >
                              {job.status === "active" ? <Pause /> : <Play />}
                              {job.status === "active" ? "暂停招聘" : "恢复招聘"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem danger onClick={() => { updateJob(job.id, { status: "closed" }); toast.success("职位已结束"); }}>
                              <Trash2 /> 结束招聘
                            </DropdownMenuItem>
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
          {filtered.map((job) => {
            const deptObj = departments.find((d) => d.id === job.departmentId);
            const ownerObj = employees.find((e) => e.id === job.ownerId);
            const status = jobStatusMeta[job.status];
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block p-4 transition-colors active:bg-[#fafbf8]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-semibold text-ink">{job.title}</span>
                      {job.priority === "high" ? <span className="shrink-0 rounded bg-signal-soft px-1.5 py-0.5 text-[11.5px] font-medium text-signal">急招</span> : null}
                    </div>
                    <div className="mt-1 text-[12px] text-muted">{job.code} · {deptObj?.name} · {job.location}</div>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium", status.tone)}><span className={cn("size-1.5 rounded-full", status.dot)} />{status.label}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1.5"><Avatar name={ownerObj?.name ?? "负责人"} size={20} /><span className="text-[12px] text-muted">{ownerObj?.name}</span></div>
                  <span className="text-[12px] text-muted">·</span>
                  <span className="text-[12px] text-muted">{job.candidateCount} 份简历</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Progress value={job.hired} max={job.headcount} className="h-1 w-14" />
                    <span className="num text-[12px] text-muted">{job.hired}/{job.headcount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness />}
            title="没有找到符合条件的职位"
            description="尝试调整筛选条件，或创建一个新职位。"
            action={<Button size="sm" onClick={() => router.push("/jobs/new")}><Plus /> 新建职位</Button>}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
          <span className="text-[12.5px] text-muted">显示 {filtered.length} / {jobs.length} 个职位</span>
          <div className="flex items-center gap-1 text-[12.5px] text-muted">
            <button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec] disabled:opacity-30" disabled>‹</button>
            <span className="flex size-7 items-center justify-center rounded-md bg-pine text-white">1</span>
            <button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">2</button>
            <button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">›</button>
            <span className="ml-2">20 条 / 页</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[12.5px] text-muted">
        <span>职位状态变更会同步到候选人流程与消息模板。</span>
        <Link href="/pipeline" className="flex items-center gap-1 font-medium text-pine hover:underline">
          管理招聘流程 <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
