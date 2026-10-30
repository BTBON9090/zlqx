"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  GitBranch,
  MoreHorizontal,
  Plus,
  Rocket,
  Settings2,
  Sparkles,
  Timer,
  Users,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  steps: { name: string; type: "screen" | "interview" | "offer"; ai?: boolean }[];
  aiEnabled: boolean;
  rounds: number;
  linkedJobs: number;
  default?: boolean;
  updatedAt: string;
}

const initialFlows: FlowTemplate[] = [
  {
    id: "flow-1",
    name: "标准招聘流程",
    description: "适用于大多数全职岗位：简历筛选 → 初试 → 复试 → 终面 → Offer。",
    steps: [
      { name: "简历筛选", type: "screen" },
      { name: "初试", type: "interview", ai: true },
      { name: "复试", type: "interview" },
      { name: "终面", type: "interview" },
      { name: "Offer", type: "offer" },
    ],
    aiEnabled: true,
    rounds: 3,
    linkedJobs: 7,
    default: true,
    updatedAt: "2026-10-28",
  },
  {
    id: "flow-2",
    name: "产品与设计流程",
    description: "增加作品集评审与交叉面试，适合产品、设计类岗位。",
    steps: [
      { name: "简历筛选", type: "screen" },
      { name: "作品集评审", type: "screen" },
      { name: "初试", type: "interview", ai: true },
      { name: "交叉面试", type: "interview" },
      { name: "终面", type: "interview" },
      { name: "Offer", type: "offer" },
    ],
    aiEnabled: true,
    rounds: 4,
    linkedJobs: 2,
    updatedAt: "2026-10-26",
  },
  {
    id: "flow-3",
    name: "技术岗位流程",
    description: "技术初筛 + 两轮技术面 + 交叉面，重点验证工程能力。",
    steps: [
      { name: "简历筛选", type: "screen" },
      { name: "技术初筛", type: "interview", ai: true },
      { name: "技术一面", type: "interview" },
      { name: "技术二面", type: "interview" },
      { name: "交叉面", type: "interview" },
      { name: "Offer", type: "offer" },
    ],
    aiEnabled: true,
    rounds: 4,
    linkedJobs: 3,
    updatedAt: "2026-10-24",
  },
  {
    id: "flow-4",
    name: "实习生快速流程",
    description: "一轮业务面 + HR 面，适合实习与校招岗位。",
    steps: [
      { name: "简历筛选", type: "screen" },
      { name: "业务面", type: "interview" },
      { name: "HR 面", type: "interview" },
      { name: "Offer", type: "offer" },
    ],
    aiEnabled: false,
    rounds: 2,
    linkedJobs: 0,
    updatedAt: "2026-10-18",
  },
];

const offerFlows = [
  { id: "of-1", name: "标准 Offer 审批", description: "适用于大多数岗位，HRBP → 部门负责人 → 财务 → CEO。", steps: ["HRBP 发起", "部门负责人", "财务审批", "CEO 审批"], avg: "1.2 天", pending: 1, active: true },
  { id: "of-2", name: "高管特批流程", description: "适用于总监及以上岗位，增加 CEO 与董事会审批。", steps: ["HRBP 发起", "部门负责人", "财务审批", "CEO 审批", "董事会"], avg: "3.8 天", pending: 0, active: true },
];

const jobTemplates = [
  { title: "高级产品经理", dept: "产品设计部", skills: ["B 端产品", "AI 产品", "数据分析"], use: 8 },
  { title: "前端工程师", dept: "前端研发组", skills: ["React", "TypeScript", "设计系统"], use: 6 },
  { title: "大模型算法工程师", dept: "数据智能组", skills: ["LLM", "RAG", "PyTorch"], use: 4 },
  { title: "客户成功经理", dept: "客户成功", skills: ["客户成功", "HR SaaS", "项目管理"], use: 5 },
];

export default function PipelinePage() {
  const { jobs } = useApp();
  const [flows, setFlows] = useState(initialFlows);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [rounds, setRounds] = useState(3);
  const [digital, setDigital] = useState(true);

  const toggleFlow = (id: string) => {
    setFlows((prev) => prev.map((f) => (f.id === id ? { ...f, aiEnabled: !f.aiEnabled } : f)));
  };

  const createFlow = () => {
    if (!name.trim()) {
      toast.error("请填写流程名称");
      return;
    }
    const newFlow: FlowTemplate = {
      id: `flow-${Date.now()}`,
      name,
      description: desc || "自定义招聘流程。",
      steps: [
        { name: "简历筛选", type: "screen" },
        ...Array.from({ length: rounds }, (_, i) => ({ name: i === 0 ? "初试" : i === rounds - 1 ? "终面" : `第 ${i + 1} 轮面试`, type: "interview" as const, ai: i === 0 && digital })),
        { name: "Offer", type: "offer" },
      ],
      aiEnabled: digital,
      rounds,
      linkedJobs: 0,
      updatedAt: "2026-10-30",
    };
    setFlows((prev) => [...prev, newFlow]);
    setCreateOpen(false);
    setName("");
    setDesc("");
    toast.success("流程模板已创建");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="招聘业务"
        title="招聘流程"
        description="把招聘变成可复用的流程：面试轮次、数字人初试、Offer 审批与职位模板。"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus /> 新建流程模板</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["流程模板", flows.length, "个", "覆盖全部在招职位", "pine"],
          ["数字人面试", flows.filter((f) => f.aiEnabled).length, "个", "已开启 AI 初试", "blue"],
          ["在招职位", jobs.filter((j) => j.status === "active").length, "个", "使用流程模板", "amber"],
          ["Offer 待审批", 1, "个", "平均 1.2 天完成", "signal"],
        ].map(([label, value, suffix, note, tone]) => (
          <div key={String(label)} className="surface p-4">
            <div className="text-[10.5px] text-muted">{label}</div>
            <div className="mt-1 flex items-baseline gap-1"><span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span><span className="text-[10px] text-muted">{suffix}</span></div>
            <div className="mt-1 flex items-center gap-1.5 text-[9px] text-muted"><span className={cn("size-1.5 rounded-full", tone === "pine" ? "bg-pine" : tone === "blue" ? "bg-[#4d7ea8]" : tone === "amber" ? "bg-amber" : "bg-signal")} />{note}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="interview">
        <TabsList>
          <TabsTrigger value="interview">面试流程</TabsTrigger>
          <TabsTrigger value="offer">Offer 流程</TabsTrigger>
          <TabsTrigger value="templates">职位模板</TabsTrigger>
        </TabsList>

        <TabsContent value="interview" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-[10.5px] text-muted">共 {flows.length} 个流程模板 · 默认流程会自动应用到新职位</p>
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1 text-[10.5px] font-medium text-pine hover:underline"><Plus className="size-3" /> 新建模板</button>
          </div>
          {flows.map((flow) => (
            <div key={flow.id} className="surface overflow-hidden">
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine"><Workflow className="size-4.5" /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[13.5px] font-semibold text-ink">{flow.name}</h3>
                      {flow.default ? <Badge tone="pine" dot>默认流程</Badge> : null}
                      {flow.aiEnabled ? <Badge tone="blue"><Sparkles className="size-2.5" /> 数字人初试</Badge> : null}
                    </div>
                    <p className="mt-1.5 max-w-[520px] text-[10.5px] leading-5 text-muted">{flow.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {flow.steps.map((s, i) => (
                        <div key={`${flow.id}-${s.name}`} className="flex items-center gap-1.5">
                          <span className={cn("rounded-md border px-2 py-1 text-[9px] font-medium", s.type === "screen" ? "border-line bg-[#fafbf8] text-muted" : s.type === "offer" ? "border-amber/20 bg-amber-soft/60 text-[#8a6a24]" : "border-pine/15 bg-pine-soft/50 text-pine")}>
                            {s.name}
                            {s.ai ? <span className="ml-1 text-[7.5px] text-pine/70">AI</span> : null}
                          </span>
                          {i < flow.steps.length - 1 ? <ChevronRight className="size-2.5 text-[#b9c3ba]" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-4 lg:flex-col lg:items-end">
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <span>{flow.rounds} 轮面试</span><span className="size-0.5 rounded-full bg-muted" /><span>{flow.linkedJobs} 个职位</span><span className="size-0.5 rounded-full bg-muted" /><span>更新 {flow.updatedAt.slice(5)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[9.5px] text-muted">数字人初试 <Switch checked={flow.aiEnabled} onCheckedChange={() => toggleFlow(flow.id)} /></label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><button className="flex size-7 items-center justify-center rounded-lg border border-line text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => toast.info("流程编辑即将开放")}><Settings2 /> 编辑流程</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("流程模板已复制")}><Copy /> 复制模板</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setFlows((prev) => prev.map((f) => ({ ...f, default: f.id === flow.id }))); toast.success("已设为默认流程"); }}><Check /> 设为默认</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem danger onClick={() => { setFlows((prev) => prev.filter((f) => f.id !== flow.id)); toast.success("流程模板已删除"); }}><XIcon /> 删除模板</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="offer" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-[10.5px] text-muted">Offer 审批流程与候选人 Offer 状态实时联动</p>
            <Link href="/offers" className="flex items-center gap-1 text-[10.5px] font-medium text-pine hover:underline">查看 Offer 管理 <ArrowUpRight className="size-3" /></Link>
          </div>
          {offerFlows.map((flow) => (
            <div key={flow.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-soft text-[#8a6a24]"><Rocket className="size-4.5" /></div>
                  <div>
                    <div className="flex items-center gap-2"><h3 className="text-[13.5px] font-semibold text-ink">{flow.name}</h3><Badge tone="pine" dot>启用中</Badge></div>
                    <p className="mt-1 text-[10.5px] text-muted">{flow.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-[10px] text-muted">
                  <span className="flex items-center gap-1"><Timer className="size-3" /> 平均 {flow.avg}</span>
                  <span className="flex items-center gap-1"><CircleDot className="size-3" /> {flow.pending} 个待审批</span>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("审批流编辑即将开放")}><Settings2 /> 配置</Button>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-0 sm:flex-row sm:items-center">
                {flow.steps.map((s, i) => (
                  <div key={`${flow.id}-${s}`} className="flex flex-1 items-center">
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-[#fcfcf9] px-2.5 py-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-pine-soft text-[8.5px] font-semibold text-pine">{i + 1}</span>
                      <span className="text-[9.5px] font-medium text-ink-soft">{s}</span>
                    </div>
                    {i < flow.steps.length - 1 ? <ArrowRight className="mx-1 size-3 text-[#b9c3ba]" /> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-line bg-[#fafbf8] p-5 text-center">
            <p className="text-[10.5px] text-muted">需要不同的审批链？可以按岗位、部门或薪资区间配置条件审批。</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => toast.info("条件审批配置即将开放")}><Plus /> 新建审批流程</Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {jobTemplates.map((t) => (
              <div key={t.title} className="surface group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-muted">{t.dept}</div>
                    <h3 className="mt-1 text-[14px] font-semibold text-ink">{t.title}</h3>
                  </div>
                  <span className="rounded bg-[#f0f3ee] px-1.5 py-0.5 text-[9px] text-muted">已用 {t.use} 次</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.skills.map((s) => <span key={s} className="rounded-md border border-line bg-[#fafbf8] px-2 py-1 text-[9.5px] text-ink-soft">{s}</span>)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[9.5px] text-muted">包含职位描述与筛选标准</span>
                  <Button variant="ghost" size="sm" asChild><Link href={`/jobs/new?template=${encodeURIComponent(t.title)}`}>使用模板 <ArrowUpRight /></Link></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="md" className="p-0">
          <DialogHeader title="新建流程模板" description="定义面试轮次与数字人初试设置。" icon={<Workflow />} />
          <DialogBody className="space-y-4">
            <Field label="流程名称" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：销售岗位快速流程" /></Field>
            <Field label="流程说明"><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="说明这个流程适用于哪些岗位…" className="min-h-[72px]" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="面试轮次">
                <Select value={String(rounds)} onValueChange={(v) => setRounds(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n} 轮</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="数字人初试">
                <div className="flex h-10 items-center justify-between rounded-[10px] border border-line px-3"><span className="text-[10.5px] text-muted">首轮使用数字人</span><Switch checked={digital} onCheckedChange={setDigital} /></div>
              </Field>
            </div>
            <div className="rounded-xl bg-[#fafbf8] p-3.5 text-[9.5px] leading-5 text-muted">新建流程后，可将其设为默认流程，或在发布职位时选择。数字人初试可随时在流程中开启或关闭。</div>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setCreateOpen(false)}>取消</Button><Button onClick={createFlow}><Check /> 创建流程</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function XIcon() {
  return <span className="text-[11px]">✕</span>;
}
