"use client";

import { Check, Copy, MoreHorizontal, Settings2, Workflow, X as XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { countInterviewRounds, flowStepMeta, hasAiStep } from "@/lib/flow";
import { cn } from "@/lib/utils";
import type { FlowTemplate } from "@/lib/types";

export function FlowTemplateCard({
  template,
  view,
  onEdit,
  onToggleAi,
  onCopy,
  onSetDefault,
  onDelete,
}: {
  template: FlowTemplate;
  view: "list" | "grid";
  onEdit: () => void;
  onToggleAi: () => void;
  onCopy: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const grid = view === "grid";
  const visibleSteps = grid ? template.steps.slice(0, 5) : template.steps;
  const hiddenCount = template.steps.length - visibleSteps.length;

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><button className="flex size-7 items-center justify-center rounded-lg border border-line text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}><Settings2 /> 编辑流程</DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}><Copy /> 复制模板</DropdownMenuItem>
        <DropdownMenuItem onClick={onSetDefault}><Check /> 设为默认</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger onClick={onDelete}><XIcon /> 删除模板</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const steps = (
    <div className={cn("flex flex-wrap items-center gap-1.5", grid && "mt-3")}>
      {visibleSteps.map((step, index) => (
        <div key={`${template.id}-${step.id}`} className="flex items-center gap-1.5">
          <span className={cn("rounded-md border px-2 py-1 text-[11.5px] font-medium", flowStepMeta[step.type].chipClass)}>{step.name}</span>
          {index < visibleSteps.length - 1 ? <span className="h-px w-2 bg-[#d3dbd4]" /> : null}
        </div>
      ))}
      {hiddenCount > 0 ? <span className="rounded-md border border-line bg-[#fafbf8] px-1.5 py-1 text-[11px] text-muted">+{hiddenCount}</span> : null}
    </div>
  );

  if (grid) {
    return (
      <div className="surface flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine"><Workflow className="size-4" /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="truncate text-[14px] font-semibold text-ink">{template.name}</h3>
                {template.isDefault ? <Badge tone="pine" dot>默认</Badge> : null}
                {!template.enabled ? <Badge tone="neutral">已停用</Badge> : null}
              </div>
              <div className="mt-1 text-[11.5px] text-muted">{countInterviewRounds(template)} 轮面试 · {template.linkedJobs} 个职位</div>
            </div>
          </div>
          {menu}
        </div>
        <p className="mt-2.5 line-clamp-2 min-h-[40px] text-[12px] leading-5 text-muted">{template.description}</p>
        {steps}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <label className="flex items-center gap-1.5 text-[11.5px] text-muted">数字人初试 <Switch checked={hasAiStep(template)} onCheckedChange={onToggleAi} /></label>
          <span className="text-[11px] text-muted">更新 {template.updatedAt.slice(5)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine"><Workflow className="size-4.5" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-semibold text-ink">{template.name}</h3>
              {template.isDefault ? <Badge tone="pine" dot>默认流程</Badge> : null}
              {!template.enabled ? <Badge tone="neutral">已停用</Badge> : null}
            </div>
            <p className="mt-1.5 max-w-[520px] text-[12.5px] leading-5 text-muted">{template.description}</p>
            {steps}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4 lg:flex-col lg:items-end">
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <span>{countInterviewRounds(template)} 轮面试</span><span className="size-0.5 rounded-full bg-muted" /><span>{template.linkedJobs} 个职位</span><span className="size-0.5 rounded-full bg-muted" /><span>更新 {template.updatedAt.slice(5)}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[12px] text-muted">数字人初试 <Switch checked={hasAiStep(template)} onCheckedChange={onToggleAi} /></label>
            {menu}
          </div>
        </div>
      </div>
    </div>
  );
}
