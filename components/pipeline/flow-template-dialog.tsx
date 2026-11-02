"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, GripVertical, Plus, Trash2, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PersonSelect } from "@/components/ui/person-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/toggle";
import { flowStepMeta, flowStepTypes, newFlowStep } from "@/lib/flow";
import { cn } from "@/lib/utils";
import type { Department, Employee, FlowStep, FlowStepType, FlowTemplate } from "@/lib/types";

function defaultSteps(): FlowStep[] {
  return [
    newFlowStep("screen"),
    newFlowStep("ai"),
    newFlowStep("business"),
    newFlowStep("offer"),
  ];
}

export function FlowTemplateDialog({
  open,
  onOpenChange,
  template,
  departments,
  employees,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: FlowTemplate | null;
  departments: Department[];
  employees: Employee[];
  onSave: (input: { name: string; description: string; steps: FlowStep[]; enabled: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<FlowStep[]>(defaultSteps);
  const [enabled, setEnabled] = useState(true);
  const [nameError, setNameError] = useState("");
  const dragIndex = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setSteps(template ? template.steps.map((step) => ({ ...step })) : defaultSteps());
    setEnabled(template?.enabled ?? true);
    setNameError("");
  }, [open, template]);

  const updateStep = (id: string, patch: Partial<FlowStep>) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, ...patch } : step)));
  };

  const changeType = (step: FlowStep, type: FlowStepType) => {
    const interviewLike = type === "business" || type === "cross" || type === "hr";
    updateStep(step.id, {
      type,
      name: flowStepMeta[type].label,
      departmentId: interviewLike ? step.departmentId : undefined,
      interviewerId: interviewLike ? step.interviewerId : undefined,
    });
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const dropAt = (index: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
    if (from === null || from === index) return;
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(index, 0, item);
      return next;
    });
  };

  const save = () => {
    if (!name.trim()) {
      setNameError("请填写模板名称");
      return;
    }
    if (steps.length === 0) {
      toast.error("请至少保留一个招聘环节");
      return;
    }
    onSave({ name: name.trim(), description: description.trim() || "自定义招聘流程。", steps, enabled });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="p-0">
        <DialogHeader
          title={template ? "编辑面试流程模板" : "新建面试流程模板"}
          description="按顺序配置面试环节、参与部门与面试官，保存后可在新建职位时直接选择。"
          icon={<Workflow />}
        />
        <DialogBody className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="模板名称" required error={nameError}>
              <Input value={name} onChange={(event) => { setName(event.target.value); if (nameError) setNameError(""); }} placeholder="例如：销售岗位快速流程" />
            </Field>
            <Field label="模板描述">
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="说明这个模板适用于哪些岗位…" className="min-h-[42px]" />
            </Field>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">招聘环节</h3>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted"><GripVertical className="size-3 text-[#a8b2a9]" /> 按住左侧拖动手柄排序，每个环节可单独配置类型、部门与面试官。</p>
              </div>
              <span className="text-[11.5px] text-muted">共 {steps.length} 个环节</span>
            </div>

            <div className="mt-3 space-y-2">
              {steps.map((step, index) => {
                const meta = flowStepMeta[step.type];
                const interviewLike = step.type === "business" || step.type === "cross" || step.type === "hr";
                return (
                  <div
                    key={step.id}
                    onDragOver={(event) => { event.preventDefault(); setDragOverIndex(index); }}
                    onDragLeave={() => setDragOverIndex((prev) => prev === index ? null : prev)}
                    onDrop={() => dropAt(index)}
                    className={cn(
                      "flex flex-col gap-2 rounded-xl border bg-[#fcfcf9] p-2.5 transition-all duration-150 md:flex-row md:items-center",
                      draggingIndex === index ? "scale-[0.995] border-dashed border-pine/40 opacity-55 shadow-sm" : "border-line",
                      dragOverIndex === index && draggingIndex !== index ? "border-pine/60 bg-pine-soft/20 ring-2 ring-pine/15" : ""
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        draggable
                        onDragStart={() => { dragIndex.current = index; setDraggingIndex(index); }}
                        onDragEnd={() => { dragIndex.current = null; setDraggingIndex(null); setDragOverIndex(null); }}
                        className="flex size-7 cursor-grab items-center justify-center rounded-md text-[#b1bbb2] transition-colors hover:bg-white hover:text-pine active:cursor-grabbing"
                        title="拖动排序"
                      >
                        <GripVertical className="size-4" />
                      </span>
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eef1ec] text-[11.5px] font-semibold text-muted">{index + 1}</span>
                    </div>

                    <Select value={step.type} onValueChange={(value) => changeType(step, value as FlowStepType)}>
                      <SelectTrigger className={cn("h-9 w-full shrink-0 whitespace-nowrap border font-medium md:w-[146px]", meta.triggerClass)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {flowStepTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            <span className="flex items-center gap-2"><span className={cn("size-1.5 rounded-full", flowStepMeta[type].dotClass)} />{flowStepMeta[type].label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {interviewLike ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <Select value={step.departmentId ?? "none"} onValueChange={(value) => updateStep(step.id, { departmentId: value === "none" ? undefined : value })}>
                            <SelectTrigger className="h-9 w-full"><SelectValue placeholder="选择参与部门" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">不指定部门</SelectItem>
                              {departments.filter((department) => department.parentId).map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-0 flex-1">
                          <PersonSelect
                            employees={employees.filter((employee) => employee.status === "active")}
                            departments={departments}
                            value={step.interviewerId ?? ""}
                            onChange={(value) => updateStep(step.id, { interviewerId: value || undefined })}
                            placeholder="选择面试官（选填）"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-[11.5px] leading-5 text-muted">
                        <span className={cn("size-1.5 shrink-0 rounded-full", meta.dotClass)} />
                        {meta.description}
                      </div>
                    )}

                    <div className="flex shrink-0 items-center justify-end gap-0.5 border-t border-line pt-1.5 md:border-t-0 md:pt-0">
                      <button type="button" aria-label="上移" disabled={index === 0} onClick={() => move(index, -1)} className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                      <button type="button" aria-label="下移" disabled={index === steps.length - 1} onClick={() => move(index, 1)} className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                      <button type="button" aria-label="删除环节" disabled={steps.length <= 1} onClick={() => setSteps((prev) => prev.filter((item) => item.id !== step.id))} className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-signal-soft hover:text-danger disabled:pointer-events-none disabled:opacity-30"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSteps((prev) => [...prev, newFlowStep("business")])}
              className="mt-2 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-pine/30 text-[12.5px] font-medium text-pine transition-colors hover:bg-pine-soft/35"
            >
              <Plus className="size-3.5" /> 新增面试轮次
            </button>
          </div>
        </DialogBody>
        <DialogFooter className="flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[12.5px] text-muted">
            <Switch checked={enabled} onCheckedChange={setEnabled} /> 启用当前模板
          </label>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={save}><Check /> 保存模板</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
