"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";

export function AiTextarea({
  label,
  hint,
  value,
  onChange,
  placeholder,
  minHeight = "min-h-[120px]",
  generate,
  polish,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  generate: () => Promise<string>;
  polish: (value: string) => Promise<string>;
  required?: boolean;
}) {
  const confirm = useConfirm();
  const [loading, setLoading] = useState<"fill" | "polish" | null>(null);
  const [polished, setPolished] = useState<string | null>(null);

  const fill = async () => {
    if (value.trim()) {
      const ok = await confirm({
        title: "用 AI 重新填入这段内容？",
        description: "AI 会重新生成完整草稿，当前已经填写的内容将被覆盖。若只是想优化表达，请使用「润色」。",
        confirmText: "覆盖并填入",
        tone: "danger",
      });
      if (!ok) return;
    }
    setLoading("fill");
    const next = await generate();
    onChange(next);
    setLoading(null);
    toast.success("AI 已填入草稿，可继续修改");
  };

  const askPolish = async () => {
    if (!value.trim()) {
      toast.info("请先填写一些内容，再使用 AI 润色");
      return;
    }
    setLoading("polish");
    const next = await polish(value);
    setLoading(null);
    setPolished(next);
  };

  return (
    <>
      <Field
        label={label}
        required={required}
        hint={hint}
        action={
          <div className="flex shrink-0 items-center gap-0.5">
            <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 whitespace-nowrap px-1.5 text-[11.5px]" onClick={fill} disabled={loading !== null} aria-label="AI 填入">
              {loading === "fill" ? <Loader2 className="animate-spin" /> : <Sparkles />} <span className="hidden sm:inline">AI 填入</span>
            </Button>
            <span className="h-3 w-px bg-line" />
            <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 whitespace-nowrap px-1.5 text-[11.5px]" onClick={askPolish} disabled={loading !== null} aria-label="AI 润色">
              {loading === "polish" ? <Loader2 className="animate-spin" /> : <Wand2 />} <span className="hidden sm:inline">润色</span>
            </Button>
          </div>
        }
      >
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={minHeight} />
      </Field>

      <Dialog open={polished !== null} onOpenChange={(open) => { if (!open) setPolished(null); }}>
        <DialogContent size="lg" className="p-0">
          <DialogHeader
            title="AI 润色预览"
            description="润色只优化表达和结构，不会改变你填写的事实与要求。确认后才会替换原文。"
            icon={<Wand2 />}
          />
          <DialogBody className="space-y-4">
            <div>
              <div className="mb-2 text-[12px] font-medium text-muted">原文</div>
              <div className="max-h-[180px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-[#fafbf8] p-3.5 text-[12.5px] leading-6 text-ink-soft">{value}</div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-pine"><Sparkles className="size-3" /> 润色后</div>
              <div className="max-h-[220px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-pine/20 bg-pine-soft/35 p-3.5 text-[12.5px] leading-6 text-ink">{polished}</div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPolished(null)}>保留原文</Button>
            <Button onClick={() => { if (polished !== null) onChange(polished); setPolished(null); toast.success("已应用润色内容"); }}><Check /> 应用润色</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
