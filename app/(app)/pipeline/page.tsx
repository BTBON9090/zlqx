"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  FileCheck2,
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
  Timer,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "@/components/ui/misc";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { useApp } from "@/lib/store";
import { FlowTemplateDialog } from "@/components/pipeline/flow-template-dialog";
import { countInterviewRounds, flowStepMeta, hasAiStep, newFlowStep } from "@/lib/flow";
import type { FlowTemplate } from "@/lib/types";
import { useConfirm } from "@/components/ui/confirm";
import { cn, uid } from "@/lib/utils";

const initialOfferFlows = [
  { id: "of-1", name: "标准 Offer 审批", description: "适用于大多数岗位，HRBP → 部门负责人 → 财务 → CEO。", steps: ["HRBP 发起", "部门负责人", "财务审批", "CEO 审批"], avg: "1.2 天", pending: 1, active: true },
  { id: "of-2", name: "高管特批流程", description: "适用于总监及以上岗位，增加 CEO 与董事会审批。", steps: ["HRBP 发起", "部门负责人", "财务审批", "CEO 审批", "董事会"], avg: "3.8 天", pending: 0, active: true },
];



type OfferFlow = (typeof initialOfferFlows)[number];

export default function PipelinePage() {
  const { jobs, departments, employees, flowTemplates, addFlowTemplate, updateFlowTemplate, deleteFlowTemplate, setDefaultFlowTemplate } = useApp();
  const confirm = useConfirm();
  const [offerFlows, setOfferFlows] = useState(initialOfferFlows);
  const [flowDialogOpen, setFlowDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<FlowTemplate | null>(null);
  const [editOffer, setEditOffer] = useState<OfferFlow | null>(null);
  const [editOfferSteps, setEditOfferSteps] = useState<string[]>([]);
  const [newOfferOpen, setNewOfferOpen] = useState(false);
  const [newOfferName, setNewOfferName] = useState("");
  const [newOfferDesc, setNewOfferDesc] = useState("");
  const toggleAi = (flow: FlowTemplate) => {
    if (hasAiStep(flow)) {
      updateFlowTemplate(flow.id, { steps: flow.steps.filter((step) => step.type !== "ai") });
      return;
    }
    const next = [...flow.steps];
    const offerIndex = next.findIndex((step) => step.type === "offer");
    next.splice(offerIndex === -1 ? next.length : offerIndex, 0, newFlowStep("ai"));
    updateFlowTemplate(flow.id, { steps: next });
  };

  const openCreateFlow = () => {
    setEditingFlow(null);
    setFlowDialogOpen(true);
  };

  const saveFlow = (input: { name: string; description: string; steps: FlowTemplate["steps"]; enabled: boolean }) => {
    if (editingFlow) {
      updateFlowTemplate(editingFlow.id, input);
      toast.success("流程模板已更新");
    } else {
      addFlowTemplate(input);
      toast.success("流程模板已创建");
    }
    setFlowDialogOpen(false);
    setEditingFlow(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="招聘配置"
        description="统一配置面试流程与 Offer 审批链。新建职位时选择面试流程模板，发放 Offer 时自动套用审批流程。"
        actions={<Button onClick={openCreateFlow}><Plus /> 新建面试流程</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="流程模板" value={flowTemplates.length} suffix="个" icon={Workflow} tone="pine" tip="已创建的招聘流程模板，覆盖全部在招职位" />
        <MetricCard label="数字人面试" value={flowTemplates.filter(hasAiStep).length} suffix="个" icon={Bot} tone="blue" tip="已开启 AI 初试的流程模板数量" />
        <MetricCard label="在招职位" value={jobs.filter((j) => j.status === "active").length} suffix="个" icon={BriefcaseBusiness} tone="amber" tip="当前招聘中的职位，均使用流程模板" />
        <MetricCard label="Offer 审批" value={1} suffix="个" icon={FileCheck2} tone="signal" tip="等待审批的 Offer，平均 1.2 天完成" />
      </div>

      <Tabs defaultValue="interview">
        <TabsList>
          <TabsTrigger value="interview">面试流程</TabsTrigger>
          <TabsTrigger value="offer">Offer 审批</TabsTrigger>
        </TabsList>

        <TabsContent value="interview" className="mt-4 space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-line bg-[#fafbf8] px-3.5 py-3 text-[12px] leading-5 text-muted">
            <Workflow className="mt-0.5 size-3.5 shrink-0 text-pine" />
            <span>这里配置的是<strong className="font-medium text-ink">面试推进流程</strong>。新建职位时只需选择一个面试流程模板；Offer 审批流程在发放 Offer 时独立应用，不会出现在职位创建表单中。</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-[12.5px] text-muted">共 {flowTemplates.length} 个流程模板 · 默认流程会自动应用到新职位</p>
            <button onClick={openCreateFlow} className="flex items-center gap-1 text-[12.5px] font-medium text-pine hover:underline"><Plus className="size-3" /> 新建模板</button>
          </div>
          {flowTemplates.map((flow) => (
            <div key={flow.id} className="surface overflow-hidden">
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine"><Workflow className="size-4.5" /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-ink">{flow.name}</h3>
                      {flow.isDefault ? <Badge tone="pine" dot>默认流程</Badge> : null}
                      {!flow.enabled ? <Badge tone="neutral">已停用</Badge> : null}
                    </div>
                    <p className="mt-1.5 max-w-[520px] text-[12.5px] leading-5 text-muted">{flow.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {flow.steps.map((s, i) => (
                        <div key={`${flow.id}-${s.id}`} className="flex items-center gap-1.5">
                          <span className={cn("rounded-md border px-2 py-1 text-[12px] font-medium", flowStepMeta[s.type].chipClass)}>
                            {s.name}
                          </span>
                          {i < flow.steps.length - 1 ? <ChevronRight className="size-2.5 text-[#b9c3ba]" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-4 lg:flex-col lg:items-end">
                  <div className="flex items-center gap-2 text-[12.5px] text-muted">
                    <span>{countInterviewRounds(flow)} 轮面试</span><span className="size-0.5 rounded-full bg-muted" /><span>{flow.linkedJobs} 个职位</span><span className="size-0.5 rounded-full bg-muted" /><span>更新 {flow.updatedAt.slice(5)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[12px] text-muted">数字人初试 <Switch checked={hasAiStep(flow)} onCheckedChange={() => toggleAi(flow)} /></label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><button className="flex size-7 items-center justify-center rounded-lg border border-line text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => { setEditingFlow(flow); setFlowDialogOpen(true); }}><Settings2 /> 编辑流程</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { addFlowTemplate({ name: `${flow.name} 副本`, description: flow.description, enabled: flow.enabled, steps: flow.steps.map((step) => ({ ...step, id: uid("step") })) }); toast.success("流程模板已复制"); }}><Copy /> 复制模板</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDefaultFlowTemplate(flow.id); toast.success("已设为默认流程"); }}><Check /> 设为默认</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem danger onClick={async () => { const ok = await confirm({ title: "删除该流程模板？", description: `删除「${flow.name}」不会影响已经使用该流程的在途候选人，但新职位将无法再选择它。`, confirmText: "删除模板", tone: "danger" }); if (!ok) return; deleteFlowTemplate(flow.id); toast.success("流程模板已删除"); }}><XIcon /> 删除模板</DropdownMenuItem>
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
            <p className="text-[12.5px] text-muted">Offer 审批流程与候选人 Offer 状态实时联动 · 创建 Offer 时自动匹配，不需要在职位表单中选择</p>
            <Link href="/offers" className="flex items-center gap-1 text-[12.5px] font-medium text-pine hover:underline">查看 Offer 管理 <ArrowUpRight className="size-3" /></Link>
          </div>
          {offerFlows.map((flow) => (
            <div key={flow.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-soft text-amber-deep"><Rocket className="size-4.5" /></div>
                  <div>
                    <div className="flex items-center gap-2"><h3 className="text-[14px] font-semibold text-ink">{flow.name}</h3><Badge tone="pine" dot>启用中</Badge></div>
                    <p className="mt-1 text-[12.5px] text-muted">{flow.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-[12.5px] text-muted">
                  <span className="flex items-center gap-1"><Timer className="size-3" /> 平均 {flow.avg}</span>
                  <span className="flex items-center gap-1"><CircleDot className="size-3" /> {flow.pending} 个待审批</span>
                  <Button variant="ghost" size="sm" onClick={() => { setEditOffer(flow); setEditOfferSteps(flow.steps); }}><Settings2 /> 配置</Button>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-0 sm:flex-row sm:items-center">
                {flow.steps.map((s, i) => (
                  <div key={`${flow.id}-${s}`} className="flex flex-1 items-center">
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-[#fcfcf9] px-2.5 py-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-pine-soft text-[11.5px] font-semibold text-pine">{i + 1}</span>
                      <span className="text-[12px] font-medium text-ink-soft">{s}</span>
                    </div>
                    {i < flow.steps.length - 1 ? <ArrowRight className="mx-1 size-3 text-[#b9c3ba]" /> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-line bg-[#fafbf8] p-5 text-center">
            <p className="text-[12.5px] text-muted">需要不同的审批链？可以按岗位、部门或薪资区间配置条件审批。</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => { setNewOfferName(""); setNewOfferDesc(""); setNewOfferOpen(true); }}><Plus /> 新建审批流程</Button>
          </div>
        </TabsContent>

      </Tabs>

      <FlowTemplateDialog
        open={flowDialogOpen}
        onOpenChange={(open) => { setFlowDialogOpen(open); if (!open) setEditingFlow(null); }}
        template={editingFlow}
        departments={departments}
        employees={employees}
        onSave={saveFlow}
      />

      <Dialog open={!!editOffer} onOpenChange={(v) => !v && setEditOffer(null)}>
        <DialogContent size="md" className="p-0">
          <DialogHeader title="配置 Offer 审批流" description="调整审批节点顺序，保存后对新 Offer 生效。" icon={<Rocket />} />
          <DialogBody className="space-y-3">
            {editOfferSteps.map((step, index) => (
              <div key={`${step}-${index}`} className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-pine-soft text-[11.5px] font-semibold text-pine">{index + 1}</span>
                <Input value={step} onChange={(e) => setEditOfferSteps((prev) => prev.map((v, i) => i === index ? e.target.value : v))} className="h-9" />
                <button onClick={async () => { const ok = await confirm({ title: "删除该审批节点？", description: `确认删除「${step}」节点吗？删除后审批链会立即更新。`, confirmText: "删除节点", tone: "danger" }); if (!ok) return; setEditOfferSteps((prev) => prev.filter((_, i) => i !== index)); }} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-signal-soft hover:text-danger" aria-label="删除审批节点"><XIcon /></button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setEditOfferSteps((prev) => [...prev, "新的审批节点"])}><Plus /> 添加审批节点</Button>
            <div className="rounded-xl bg-[#fafbf8] p-3 text-[12px] leading-5 text-muted">审批顺序会影响 Offer 发放速度，建议保留财务审批节点。</div>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setEditOffer(null)}>取消</Button><Button onClick={() => { if (!editOffer) return; setOfferFlows((prev) => prev.map((f) => f.id === editOffer.id ? { ...f, steps: editOfferSteps } : f)); setEditOffer(null); toast.success("审批流已更新"); }}><Check /> 保存配置</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newOfferOpen} onOpenChange={setNewOfferOpen}>
        <DialogContent size="sm" className="p-0">
          <DialogHeader title="新建审批流程" description="适用于特殊岗位或高管审批。" icon={<Rocket />} />
          <DialogBody className="space-y-4">
            <Field label="流程名称" required><Input value={newOfferName} onChange={(e) => setNewOfferName(e.target.value)} placeholder="例如：海外岗位审批" /></Field>
            <Field label="流程说明"><Textarea value={newOfferDesc} onChange={(e) => setNewOfferDesc(e.target.value)} className="min-h-[72px]" placeholder="说明适用的岗位范围…" /></Field>
            <Field label="默认审批节点"><div className="flex flex-wrap gap-1.5">{["HRBP 发起", "部门负责人", "财务审批", "CEO 审批"].map((s) => <span key={s} className="rounded-md border border-line bg-[#fafbf8] px-2 py-1 text-[12px] text-ink-soft">{s}</span>)}</div></Field>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setNewOfferOpen(false)}>取消</Button><Button onClick={() => { if (!newOfferName.trim()) { toast.error("流程名称不能为空"); return; } setOfferFlows((prev) => [...prev, { id: `of-${Date.now()}`, name: newOfferName, description: newOfferDesc || "自定义审批流程。", steps: ["HRBP 发起", "部门负责人", "财务审批"], avg: "—", pending: 0, active: true }]); setNewOfferOpen(false); toast.success("审批流程已创建"); }}><Check /> 创建流程</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function XIcon() {
  return <span className="text-[13px]">✕</span>;
}
