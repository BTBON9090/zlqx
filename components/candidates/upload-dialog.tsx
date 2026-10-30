"use client";

import { useRef, useState } from "react";
import { Check, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  name: string;
  size: number;
}

const samples: UploadFile[] = [
  { id: "s1", name: "陈一川_高级产品经理_8年.pdf", size: 312 * 1024 },
  { id: "s2", name: "周然_前端工程师_5年.pdf", size: 268 * 1024 },
  { id: "s3", name: "苏牧_数据分析师_6年.docx", size: 194 * 1024 },
];

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadResumeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { jobs, addCandidate } = useApp();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [jobId, setJobId] = useState(jobs[0].id);
  const [phase, setPhase] = useState<"idle" | "parsing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFiles([]);
    setPhase("idle");
    setProgress(0);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).slice(0, 8).map((f, i) => ({ id: `f-${Date.now()}-${i}`, name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...next].slice(0, 8));
    setPhase("idle");
    setProgress(0);
  };

  const start = async () => {
    if (files.length === 0) {
      toast.error("请先选择简历文件");
      return;
    }
    setPhase("parsing");
    setProgress(0);
    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 130));
      setProgress(i * 10);
    }
    setPhase("done");
    toast.success(`${files.length} 份简历解析完成`);
  };

  const confirm = () => {
    files.forEach((f, i) => {
      const base = f.name.replace(/\.[^.]+$/, "");
      const name = base.split(/[_\-—]/)[0] || `候选人 ${i + 1}`;
      addCandidate({
        name,
        jobId,
        source: "简历上传",
        score: [86, 82, 77][i % 3],
        tags: ["批量导入", i % 2 === 0 ? "待筛选" : "AI 已解析"],
        summary: "通过批量上传导入，AI 已完成简历结构化解析，等待招聘团队确认。",
      });
    });
    toast.success(`已导入 ${files.length} 位候选人`);
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="p-0">
        <DialogHeader title="上传简历" description="支持 PDF、Word、图片格式，单份不超过 20MB。AI 会自动解析并去重。" icon={<Upload />} />
        <DialogBody className="space-y-4">
          <Field label="导入到职位">
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{jobs.filter((j) => j.status === "active").map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
            </Select>
          </Field>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            className={cn("relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-9 text-center transition-colors", dragging ? "border-pine bg-pine-soft/40" : "border-line bg-[#fafbf8]")}
          >
            <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <div className="flex size-11 items-center justify-center rounded-xl border border-line bg-white text-pine shadow-sm"><Upload className="size-5" /></div>
            <p className="mt-3 text-[13.5px] font-medium text-ink">拖拽简历到这里，或 <button onClick={() => inputRef.current?.click()} className="text-pine underline underline-offset-2">选择文件</button></p>
            <p className="mt-1 text-[12.5px] text-muted">最多 8 份 · PDF / DOCX / JPG / PNG · 单个文件 ≤ 20MB</p>
            <button onClick={() => { setFiles(samples); setPhase("idle"); setProgress(0); }} className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-amber-deep hover:underline"><Sparkles className="size-3" /> 使用示例简历体验</button>
          </div>

          {files.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center justify-between border-b border-line bg-[#fafbf8] px-3 py-2 text-[12.5px] text-muted">
                <span>已选择 {files.length} 份简历</span>
                <button onClick={() => { setFiles([]); setPhase("idle"); }} className="hover:text-ink">清空</button>
              </div>
              <div className="max-h-[220px] overflow-y-auto">
                {files.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2.5 border-b border-line/70 px-3 py-2.5 last:border-0">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-signal-soft text-signal"><FileText className="size-3.5" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium text-ink">{f.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted">{formatSize(f.size)}</div>
                    </div>
                    {phase === "parsing" ? (
                      <span className="flex items-center gap-1 text-[12px] text-pine"><Loader2 className="size-3 animate-spin" /> 解析中</span>
                    ) : phase === "done" ? (
                      <span className="flex items-center gap-1 text-[12px] text-pine"><Check className="size-3" /> 已解析</span>
                    ) : (
                      <button onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))} aria-label="移除" className="text-muted hover:text-ink"><X className="size-3.5" /></button>
                    )}
                    {phase === "done" ? <span className="num text-[12.5px] font-semibold text-pine">{[86, 82, 77][i % 3]}</span> : null}
                  </div>
                ))}
              </div>
              {phase === "parsing" ? (
                <div className="border-t border-line px-3 py-2.5">
                  <div className="mb-1.5 flex justify-between text-[12px] text-muted"><span>AI 正在解析简历结构…</span><span>{progress}%</span></div>
                  <Progress value={progress} className="h-1" />
                </div>
              ) : null}
            </div>
          ) : null}

          {phase === "done" ? (
            <div className="rounded-xl bg-pine-soft/50 p-3.5">
              <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-pine"><Check className="size-3.5" /> 解析完成</div>
              <p className="mt-1 text-[12px] leading-5 text-ink-soft">已提取姓名、联系方式、教育背景、工作经历与技能标签。系统检测到 1 份重复简历，将自动跳过。</p>
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => handleClose(false)}>取消</Button>
          {phase === "done" ? (
            <Button onClick={confirm}><Check /> 确认导入</Button>
          ) : (
            <Button onClick={start} disabled={phase === "parsing" || files.length === 0}>
              {phase === "parsing" ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {phase === "parsing" ? "正在解析…" : "开始 AI 解析"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
