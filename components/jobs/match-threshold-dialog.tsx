"use client";

import { useEffect, useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field } from "@/components/ui/input";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Job } from "@/lib/types";

export type MatchThresholds = NonNullable<Job["matchThresholds"]>;

const presets: { key: Exclude<MatchThresholds["preset"], "custom">; label: string; pass: number; reject: number }[] = [
  { key: "strict", label: "严格", pass: 90, reject: 70 },
  { key: "medium", label: "适中", pass: 85, reject: 65 },
  { key: "loose", label: "宽松", pass: 75, reject: 50 },
];

export function MatchThresholdDialog({
  open,
  onOpenChange,
  jobs,
  initialJobId,
  lockJob = false,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: Job[];
  initialJobId?: string;
  lockJob?: boolean;
  onSave: (jobId: string, thresholds: MatchThresholds) => void;
}) {
  const [jobId, setJobId] = useState(initialJobId ?? jobs[0]?.id ?? "");
  const [pass, setPass] = useState(85);
  const [reject, setReject] = useState(65);
  const [preset, setPreset] = useState<MatchThresholds["preset"]>("medium");

  useEffect(() => {
    if (!open) return;
    const id = initialJobId ?? jobs[0]?.id ?? "";
    setJobId(id);
    const job = jobs.find((item) => item.id === id);
    const thresholds = job?.matchThresholds ?? { pass: 85, reject: 65, preset: "medium" as const };
    setPass(thresholds.pass);
    setReject(thresholds.reject);
    setPreset(thresholds.preset);
  }, [open, initialJobId, jobs]);

  const selectedJob = jobs.find((job) => job.id === jobId);

  const save = () => {
    if (!jobId) {
      toast.error("请选择职位");
      return;
    }
    if (pass <= reject) {
      toast.error("通过阈值必须高于淘汰阈值");
      return;
    }
    onSave(jobId, { pass, reject, preset });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader
          title="匹配分阈值设定"
          description={`${selectedJob?.title ?? "职位"}：设定通过阈值与淘汰阈值，自动标记候选人的初筛建议。`}
          icon={<SlidersHorizontal />}
        />
        <DialogBody className="space-y-5">
          {!lockJob && jobs.length > 1 ? (
            <Field label="适用职位">
              <Select
                value={jobId}
                onValueChange={(value) => {
                  setJobId(value);
                  const job = jobs.find((item) => item.id === value);
                  const thresholds = job?.matchThresholds ?? { pass: 85, reject: 65, preset: "medium" as const };
                  setPass(thresholds.pass);
                  setReject(thresholds.reject);
                  setPreset(thresholds.preset);
                }}
              >
                <SelectTrigger><SelectValue placeholder="选择职位" /></SelectTrigger>
                <SelectContent>{jobs.map((job) => <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          ) : null}

          <div>
            <div className="mb-2 text-[13px] font-medium text-ink">快速预设</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {presets.map((item) => {
                const active = preset === item.key && pass === item.pass && reject === item.reject;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => { setPass(item.pass); setReject(item.reject); setPreset(item.key); }}
                    className={`rounded-xl border p-2.5 text-left transition-colors ${active ? "border-pine bg-pine-soft/50" : "border-line hover:bg-[#fafbf8]"}`}
                  >
                    <div className={`text-[12.5px] font-medium ${active ? "text-pine" : "text-ink"}`}>{item.label}</div>
                    <div className="mt-1 text-[10.5px] leading-4 text-muted">通过 ≥{item.pass}<br />淘汰 &lt;{item.reject}</div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPreset("custom")}
                className={`rounded-xl border p-2.5 text-left transition-colors ${preset === "custom" ? "border-pine bg-pine-soft/50" : "border-line hover:bg-[#fafbf8]"}`}
              >
                <div className={`text-[12.5px] font-medium ${preset === "custom" ? "text-pine" : "text-ink"}`}>自定义</div>
                <div className="mt-1 text-[10.5px] leading-4 text-muted">手动调整<br />阈值</div>
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-medium text-ink">调整阈值（0–100）</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
                <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink"><span className="h-4 w-0.5 rounded-full bg-success" /> 建议通过阈值</div>
                <p className="mt-1 text-[11px] leading-4 text-muted">达到此分数，标记为建议通过</p>
                <NumberStepper value={pass} onChange={(value) => { setPass(value); setPreset("custom"); }} min={1} max={100} className="mt-2.5" ariaLabel="建议通过阈值" />
              </div>
              <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
                <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink"><span className="h-4 w-0.5 rounded-full bg-signal" /> 建议淘汰阈值</div>
                <p className="mt-1 text-[11px] leading-4 text-muted">低于此分数，标记为建议淘汰</p>
                <NumberStepper value={reject} onChange={(value) => { setReject(value); setPreset("custom"); }} min={0} max={99} className="mt-2.5" ariaLabel="建议淘汰阈值" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#fafbf8] px-3.5 py-3 text-[12px] leading-5 text-muted">
            候选人列表会根据该阈值显示「建议通过 / 待定 / 建议淘汰」，最终决定仍由招聘团队确认。
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={save}><Check /> 保存设定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
