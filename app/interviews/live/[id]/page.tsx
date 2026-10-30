"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AudioLines,
  Camera,
  CameraOff,
  Check,
  ChevronRight,
  Circle,
  FileText,
  HelpCircle,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { ScoreRing } from "@/components/ui/misc";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const questions = [
  "请用 2 分钟介绍你最近负责的一个前端项目，重点说说你解决的难点。",
  "如果让你设计一个高密度数据表格，你会如何考虑性能与交互？",
  "描述一次你与产品经理意见不一致的经历，你如何推动达成一致？",
  "你如何理解设计系统？在团队中你会如何推进组件复用？",
  "过去一年你主动学习的一项能力是什么？它如何影响了你的工作？",
  "关于团队或岗位，你有什么想了解的？",
];

const transcriptSeed = [
  { speaker: "小聘", time: "00:12", text: "你好江屿，欢迎参加澄明科技的前端工程师初试。今天大约 20 分钟，我会围绕项目、工程能力和协作方式提 6 个问题。" },
  { speaker: "江屿", time: "00:28", text: "好的，没问题。" },
  { speaker: "小聘", time: "00:35", text: "我们先从项目开始。请用 2 分钟介绍你最近负责的一个前端项目，重点说说你解决的难点。" },
  { speaker: "江屿", time: "00:52", text: "最近一年我在做 AI 对话产品的前端。比较难的是流式消息的渲染和高频状态更新，之前会出现输入卡顿和滚动抖动。" },
  { speaker: "江屿", time: "01:18", text: "我最后把消息列表做了分片渲染，把流式增量写到独立 store，减少整页重渲染；同时用 ResizeObserver 修正滚动位置，输入延迟从 180ms 降到了 40ms 左右。" },
];

export default function LiveInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { interviews, candidates, jobs, employees, updateInterview } = useApp();
  const interview = interviews.find((i) => i.id === id);
  const candidate = candidates.find((c) => c.id === interview?.candidateId);
  const job = jobs.find((j) => j.id === interview?.jobId);
  const [seconds, setSeconds] = useState(402);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(3);
  const [endOpen, setEndOpen] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!interview || !candidate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-pine-deep text-white">
        <AudioLines className="size-8 text-white/40" />
        <h1 className="mt-4 text-[18px] font-semibold">面试间不存在</h1>
        <Button className="mt-5" asChild><Link href="/interviews">返回面试安排</Link></Button>
      </div>
    );
  }

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const interviewerNames = interview.interviewers.map((eid) => employees.find((e) => e.id === eid)?.name ?? "AI 数字人");

  const endInterview = () => {
    updateInterview(interview.id, { status: "done", aiSummary: "数字人面试已完成。候选人整体表达清晰，项目经验与岗位匹配度较高，建议进入下一轮技术面。" });
    setEndOpen(false);
    toast.success("面试已结束，正在生成纪要");
    router.push(`/interviews?interview=${interview.id}`);
  };

  return (
    <div className="min-h-screen bg-pine-deep text-white">
      <header className="flex h-[64px] items-center gap-3 border-b border-white/8 px-4 md:px-6">
        <BrandMark size={28} />
        <div className="hidden items-center gap-2 text-[13px] sm:flex">
          <span className="font-medium text-[var(--rail-text)]">数字人面试间</span>
          <span className="text-white/20">/</span>
          <span className="text-white/55">{candidate.name} · {job?.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border theme-accent-border-25 theme-accent-bg-10 px-2.5 py-1 text-[12px] theme-accent-text">
            <span className="pulse-dot size-1.5 rounded-full theme-accent-bg" /> LIVE
          </span>
          <span className="num hidden text-[13.5px] text-white/60 sm:block">{timer}</span>
          <Link href="/interviews" className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[12.5px] text-white/60 transition-colors hover:bg-white/8 hover:text-white">
            <ArrowLeft className="size-3" /> 返回
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-4 p-4 md:p-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(145deg,#17191c,#0b0c0e)]">
              <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_25%,rgba(102,178,145,.16),transparent_65%)]" />
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-black/20 px-2 py-1 text-[12px] text-white/80 backdrop-blur-sm">
                <span className="size-1.5 rounded-full theme-accent-bg" /> 候选人画面 · 720p
              </div>
              <div className="flex h-full flex-col items-center justify-center">
                <div className="relative flex size-24 items-center justify-center rounded-full border border-white/10 bg-[var(--rail-active)]">
                  <Avatar name={candidate.name} size={72} />
                  <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-[#0b0c0e] theme-accent-bg text-[#0b0c0e]"><Mic className="size-2.5" /></span>
                </div>
                <div className="mt-4 text-[14px] font-medium">{candidate.name}</div>
                <div className="mt-1 text-[12px] text-white/45">{candidate.currentTitle} · {candidate.location}</div>
                <div className="mt-5 flex items-end gap-[3px]">
                  {[5, 11, 7, 16, 10, 18, 8, 13, 6, 15, 9].map((h, i) => (
                    <span key={i} className={cn("w-[2px] rounded-full theme-accent-bg-70", !muted && "animate-pulse")} style={{ height: h, animationDelay: `${i * 90}ms` }} />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[12px] text-white/60">
                <span className="flex items-center gap-1"><Wifi className="size-3 theme-accent-text" /> 网络良好</span>
                <span className="size-0.5 rounded-full bg-white/20" />
                <span>{cameraOn ? "摄像头开启" : "摄像头关闭"}</span>
              </div>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-signal/20 bg-[linear-gradient(145deg,#15171a,#0a0b0d)]">
              <div className="signal-grid absolute inset-0 opacity-45" />
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-white/6 px-2 py-1 text-[12px] text-white/80 backdrop-blur-sm">
                <Sparkles className="size-2.5 theme-accent-text" /> 小聘 · AI 面试官
              </div>
              <div className="flex h-full flex-col items-center justify-center px-8">
                <div className="relative flex size-[86px] items-center justify-center rounded-full border border-white/15 bg-white/6">
                  <div className="absolute inset-0 rounded-full border theme-accent-border-30 animate-drift" />
                  <div className="absolute inset-[-14px] rounded-full border border-dashed border-white/10" />
                  <AudioLines className="size-7 theme-accent-text" />
                </div>
                <div className="mt-5 max-w-[320px] text-center text-[13px] leading-5 text-white/75">
                  {questions[questionIndex]}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-white/45"><Volume2 className="size-3" /> 正在提问 · 问题 {questionIndex + 1}/{questions.length}</div>
              </div>
              <div className="absolute bottom-0 left-0 flex h-8 w-full items-center justify-center gap-[3px] border-t border-white/8 bg-black/10">
                {[6, 12, 8, 17, 10, 20, 9, 14, 7, 16, 11, 19, 8, 13, 6].map((h, i) => (
                  <span key={i} className="w-[2px] rounded-full theme-accent-bg-45 animate-pulse" style={{ height: h, animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/8 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
              <div className="flex items-center gap-2 text-[13px] font-medium"><FileText className="size-3.5 text-white/55" /> 实时转写</div>
              <span className="flex items-center gap-1.5 text-[12px] text-white/45"><span className="pulse-dot size-1.5 rounded-full theme-accent-bg" /> 自动转写中</span>
            </div>
            <div className="max-h-[280px] space-y-4 overflow-y-auto px-5 py-4">
              {transcriptSeed.map((line, i) => (
                <div key={i} className={cn("flex gap-3", line.speaker === "江屿" && "flex-row-reverse")}>
                  <div className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg text-[11.5px] font-semibold", line.speaker === "小聘" ? "theme-accent-bg text-[#0b0c0e]" : "theme-accent-bg text-[#0b0c0e]")}>{line.speaker.slice(-1)}</div>
                  <div className={cn("max-w-[78%]", line.speaker === "江屿" && "text-right")}>
                    <div className="mb-1 flex items-center gap-2 text-[11.5px] text-white/40"><span>{line.speaker}</span><span>{line.time}</span></div>
                    <div className={cn("rounded-xl px-3 py-2 text-[12.5px] leading-5", line.speaker === "小聘" ? "rounded-tl-sm border border-white/8 bg-white/[0.04] text-white/75" : "rounded-tr-sm bg-[var(--rail-active)] text-white/80")}>{line.text}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg theme-accent-bg text-[11.5px] font-semibold text-[#0b0c0e]">屿</div>
                <div className="flex items-center gap-1 rounded-xl rounded-tl-sm bg-[var(--rail-active)] px-3 py-3">
                  <span className="size-1.5 animate-bounce rounded-full theme-accent-bg-70" />
                  <span className="size-1.5 animate-bounce rounded-full theme-accent-bg-70" style={{ animationDelay: "100ms" }} />
                  <span className="size-1.5 animate-bounce rounded-full theme-accent-bg-70" style={{ animationDelay: "200ms" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 rounded-[18px] border border-white/8 bg-white/[0.03] p-3">
            <button onClick={() => setMuted((v) => !v)} aria-label={muted ? "取消静音" : "静音"} className={cn("flex size-10 items-center justify-center rounded-full border transition-colors", muted ? "border-signal/40 bg-signal/15 theme-accent-text" : "border-white/12 text-white/80 hover:bg-white/8")}>{muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}</button>
            <button onClick={() => setCameraOn((v) => !v)} aria-label={cameraOn ? "关闭摄像头" : "打开摄像头"} className="flex size-10 items-center justify-center rounded-full border border-white/12 text-white/80 transition-colors hover:bg-white/8">{cameraOn ? <Camera className="size-4" /> : <CameraOff className="size-4" />}</button>
            <button onClick={() => setQuestionIndex((i) => (i + 1) % questions.length)} className="flex h-10 items-center gap-1.5 rounded-full border border-white/12 px-4 text-[12.5px] text-white/80 transition-colors hover:bg-white/8"><ChevronRight className="size-3.5" /> 下一题</button>
            <button onClick={() => toast.success("已为面试官标记关注点")} className="flex h-10 items-center gap-1.5 rounded-full border border-white/12 px-4 text-[12.5px] text-white/80 transition-colors hover:bg-white/8"><Star className="size-3.5" /> 标记</button>
            <button onClick={() => setEndOpen(true)} className="flex h-10 items-center gap-1.5 rounded-full bg-signal px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-signal/90"><PhoneOff className="size-3.5" /> 结束面试</button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-white/55">面试进度</span>
              <span className="num text-[13px] text-white">{questionIndex + 1} / {questions.length}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full theme-accent-bg transition-all duration-500" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
            <div className="mt-4 space-y-1.5">
              {questions.map((q, i) => (
                <button key={q} onClick={() => setQuestionIndex(i)} className={cn("flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] leading-4 transition-colors", i === questionIndex ? "theme-accent-bg-10 text-white/75" : i < questionIndex ? "text-white/45" : "text-white/35 hover:bg-white/4")}>
                  <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-[11.5px]", i === questionIndex ? "theme-accent-border theme-accent-text" : i < questionIndex ? "theme-accent-border-40 theme-accent-bg-15 theme-accent-text" : "border-white/10 text-white/35")}>{i < questionIndex ? <Check className="size-2.5" /> : i + 1}</span>
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between"><span className="text-[12.5px] text-white/55">实时评分</span><ScoreRing score={84} size={42} stroke={3} /></div>
            <div className="mt-3 space-y-2.5">
              {[["表达清晰度", 86], ["项目深度", 82], ["协作意识", 80], ["学习潜力", 88]].map(([label, v]) => (
                <div key={String(label)} className="flex items-center gap-2">
                  <span className="w-[64px] shrink-0 text-[11.5px] text-white/45">{label}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full theme-accent-bg" style={{ width: `${v}%` }} /></div>
                  <span className="num w-5 text-right text-[11.5px] text-white/80">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] leading-4 text-white/40">评分由 AI 实时生成，面试结束后需人工确认。</p>
          </div>

          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between"><span className="text-[12.5px] text-white/55">面试官备注</span><button onClick={() => toast.success("备注已保存")} className="text-[12px] theme-accent-text hover:text-white">保存</button></div>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="记录观察到的细节，面试结束后会同步到反馈…" className="mt-3 min-h-[88px] border-white/10 bg-white/[0.04] text-[12.5px] text-white placeholder:text-white/35 focus:theme-accent-border-40" />
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-[11.5px] leading-4 text-white/40">
            <HelpCircle className="mt-0.5 size-3 shrink-0" />
            面试全程录音录像，文件将加密保存 180 天。候选人已同意录制。
          </div>
        </aside>
      </main>

      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent size="sm" className="p-0">
          <DialogHeader title="结束面试？" description="结束后将停止录音，并自动生成面试纪要与评分。" icon={<PhoneOff />} />
          <DialogBody>
            <div className="rounded-xl bg-[#fafbf8] p-4 text-[12.5px] leading-5 text-muted">
              本次面试已进行 {timer}，完成 {questionIndex + 1} / {questions.length} 个问题。结束后候选人会收到完成提示，面试官可在 24 小时内修改反馈。
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEndOpen(false)}>继续面试</Button>
            <Button variant="danger" onClick={endInterview}><PhoneOff /> 结束并生成纪要</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
