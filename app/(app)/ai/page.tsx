"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  FileText,
  Loader2,
  Mic,
  Play,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  UserRound,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, ScoreRing, SectionTitle } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadarChart, Donut } from "@/components/charts";
import { useApp } from "@/lib/store";
import { aiToolDefinitions } from "@/lib/data";
import { cn, scoreTone } from "@/lib/utils";
import type { Candidate, Job } from "@/lib/types";

type Mode = "jd" | "profile" | "report" | "interview";

const toolIcons: Record<Mode, React.ReactNode> = {
  jd: <FileText />,
  profile: <Target />,
  report: <BarChart3 />,
  interview: <AudioLines />,
};

const steps = ["读取岗位与团队信息", "检索相似岗位与人才样本", "生成结构化内容", "校准语气与合规表达"];

function JdDocument({ job }: { job: Job }) {
  return (
    <div className="space-y-5 text-[13.5px] leading-6 text-ink-soft">
      <div>
        <h4 className="text-[16px] font-semibold tracking-[-0.02em] text-ink">{job.title}</h4>
        <p className="mt-1 text-[13px] text-muted">{job.location} · {job.employment === "fulltime" ? "全职" : "实习"} · {job.salary}</p>
      </div>
      <p>{job.summary}</p>
      <div>
        <h5 className="mb-2 text-[13px] font-semibold tracking-[0.02em] text-ink">你将会负责</h5>
        <ul className="space-y-1.5">
          {job.responsibilities.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-2.5 size-1 shrink-0 rounded-full bg-pine/50" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="mb-2 text-[13px] font-semibold tracking-[0.02em] text-ink">我们希望你</h5>
        <ul className="space-y-1.5">
          {job.requirements.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-2.5 size-1 shrink-0 rounded-full bg-pine/50" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="mb-2 text-[13px] font-semibold tracking-[0.02em] text-ink">关于团队</h5>
        <p>{job.aiProfile.teamStyle}</p>
      </div>
      <div className="rounded-xl bg-[#f6f8f3] p-3.5">
        <div className="text-[12.5px] font-medium text-pine">AI 生成提示</div>
        <p className="mt-1 text-[12.5px] leading-5 text-muted">
          这份 JD 避免了「抗压能力强」等空泛表述，更强调可验证的经验与团队工作方式。发布前建议补充团队介绍与汇报关系。
        </p>
      </div>
    </div>
  );
}

function ProfileDocument({ job }: { job: Job }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">{job.title} · 岗位画像</h4>
          <p className="mt-1 text-[12.5px] text-muted">基于团队目标、岗位职责与高绩效样本生成</p>
        </div>
        <Badge tone="pine" dot>已校准</Badge>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-line bg-[#fcfdf9] py-4">
        <RadarChart data={job.aiProfile.radar} size={230} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[12.5px] font-medium text-pine">必备条件</div>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-5 text-ink-soft">
            {job.aiProfile.mustHave.map((m) => (
              <li key={m} className="flex gap-2"><Check className="mt-0.5 size-3 shrink-0 text-pine" />{m}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[12.5px] font-medium text-[#8a6a24]">加分项</div>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-5 text-ink-soft">
            {job.aiProfile.niceToHave.map((m) => (
              <li key={m} className="flex gap-2"><Plus className="mt-0.5 size-3 shrink-0 text-[#b1802f]" />{m}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-xl border border-line p-3.5">
        <div className="text-[12.5px] font-medium text-muted">成功画像</div>
        <p className="mt-1.5 text-[13px] leading-5 text-ink-soft">{job.aiProfile.successProfile}</p>
      </div>
      <div className="rounded-xl bg-pine p-3.5 text-white">
        <div className="text-[12.5px] font-medium text-[#bcd7c9]">面试评估重点</div>
        <p className="mt-1.5 text-[13px] leading-5 text-[#e2eee6]">优先验证候选人的业务抽象能力与 AI 产品判断；对「完整负责产品线」的经历进行深挖，避免只看公司光环。</p>
      </div>
    </div>
  );
}

function ReportDocument({ candidate, job }: { candidate: Candidate; job: Job }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-xl border border-line bg-[#fcfdf9] p-4">
        <ScoreRing score={candidate.score} size={62} stroke={4} />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">{candidate.name} · 推荐报告</div>
          <div className="mt-1 text-[12.5px] text-muted">{job.title} · 来自 {candidate.source} · {candidate.years} 年经验</div>
          <div className={cn("mt-1.5 text-[12.5px] font-medium", scoreTone(candidate.score).text)}>{candidate.ai.headline}</div>
        </div>
      </div>
      <p className="text-[13px] leading-6 text-ink-soft">{candidate.ai.fit}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[12.5px] font-medium text-pine">匹配亮点</div>
          <ul className="mt-2 space-y-1.5">
            {candidate.ai.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-[13px] leading-5 text-ink-soft"><Check className="mt-0.5 size-3 shrink-0 text-pine" />{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[12.5px] font-medium text-signal">待验证风险</div>
          <ul className="mt-2 space-y-1.5">
            {candidate.ai.risks.map((h) => (
              <li key={h} className="flex gap-2 text-[13px] leading-5 text-ink-soft"><span className="mt-2 size-1 shrink-0 rounded-full bg-signal" />{h}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <div className="text-[12.5px] font-medium text-muted">建议面试问题</div>
        <div className="mt-2 space-y-2">
          {candidate.ai.questions.slice(0, 3).map((q, i) => (
            <div key={q} className="flex gap-2.5 rounded-lg bg-[#f6f8f3] px-3 py-2.5 text-[12.5px] leading-5 text-ink-soft">
              <span className="num text-pine">{String(i + 1).padStart(2, "0")}</span>
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InterviewDocument({ job, candidate }: { job: Job; candidate: Candidate }) {
  const questions = [
    { tag: "项目深挖", q: "请挑一个你主导的复杂项目，说明目标、你的关键决策，以及最终结果。" },
    { tag: "专业判断", q: "如果候选人画像与业务需求出现冲突，你会如何判断优先级？" },
    { tag: "协作方式", q: "描述一次你与研发或设计意见不一致的经历，你如何推动达成共识？" },
    { tag: "AI 理解", q: "你认为大模型在招聘场景里最不应该被用来做什么？为什么？" },
    { tag: "成长动机", q: "过去一年你主动学习的一项能力是什么？它如何改变了你的工作？" },
    { tag: "反问环节", q: "关于团队、岗位或业务，你有什么想了解的？" },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-pine p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[12.5px] text-[#a9c3b5]">数字人面试 · 初试</div>
            <div className="mt-1 text-[14px] font-semibold">{candidate.name} · {job.title}</div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-2 py-1 text-[12px] text-[#cfe0d5]">
            <span className="pulse-dot size-1 rounded-full bg-[#7fd2a8]" /> 20 分钟
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[12px] text-[#b7cbbf]">
          <span>结构化问题 6 道</span>
          <span>自动追问 2 次</span>
          <span>生成评分与纪要</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {questions.map((item, i) => (
          <div key={item.q} className="rounded-xl border border-line p-3">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#eef2ea] px-1.5 py-0.5 text-[12px] text-pine">{item.tag}</span>
              <span className="num text-[12px] text-muted">Q{i + 1}</span>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-ink-soft">{item.q}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-[#f6f8f3] p-3.5 text-[12.5px] leading-5 text-muted">
        数字人面试将自动记录回答、生成能力评分与风险提示。候选人可在面试结束后 24 小时内查看结果。所有录音与转写保留 180 天。
      </div>
    </div>
  );
}

export default function AiCenterPage() {
  const { jobs, candidates, generations, addGeneration } = useApp();
  const [studioOpen, setStudioOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("jd");
  const [prompt, setPrompt] = useState("");
  const [studioJobId, setStudioJobId] = useState(jobs[0].id);
  const [studioCandidateId, setStudioCandidateId] = useState(candidates[0].id);
  const [generating, setGenerating] = useState(false);
  const [doneStep, setDoneStep] = useState(0);
  const [result, setResult] = useState(false);
  const studioJob = jobs.find((j) => j.id === studioJobId) ?? jobs[0];
  const studioCandidate = candidates.find((c) => c.id === studioCandidateId) ?? candidates[0];

  const openStudio = (nextMode: Mode, preset?: string, jobId?: string, candidateId?: string) => {
    const targetJobId = jobId ?? studioJobId;
    setMode(nextMode);
    setPrompt(preset ?? "");
    setResult(false);
    setGenerating(false);
    setDoneStep(0);
    if (jobId) setStudioJobId(jobId);
    if (candidateId) {
      setStudioCandidateId(candidateId);
    } else if (nextMode === "report" || nextMode === "interview") {
      const scoped = candidates.find((c) => c.jobId === targetJobId);
      if (scoped) setStudioCandidateId(scoped.id);
    }
    setStudioOpen(true);
  };

  const run = async () => {
    setGenerating(true);
    setResult(false);
    setDoneStep(0);
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 520));
      setDoneStep(i + 1);
    }
    setGenerating(false);
    setResult(true);
  };

  const saveGeneration = () => {
    addGeneration({
      type: mode,
      title:
        mode === "jd"
          ? `${studioJob.title} · 职位描述`
          : mode === "profile"
            ? `${studioJob.title} · 岗位画像`
            : mode === "report"
              ? `${studioCandidate.name} · 推荐报告`
              : `${studioCandidate.name} · 数字人面试题纲`,
      subtitle:
        mode === "report" ? `${studioJob.title} · 匹配度 ${studioCandidate.score}%` : mode === "jd" ? "AI 生成 · 待发布" : "AI 生成 · 已校准",
      status: "ready",
      jobId: studioJob.id,
      candidateId: mode === "report" || mode === "interview" ? studioCandidate.id : undefined,
    });
    toast.success("已保存到 AI 工作台");
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(
        mode === "report"
          ? `${studioCandidate.name} · 推荐报告\n匹配度 ${studioCandidate.score}%\n${studioCandidate.ai.fit}`
          : mode === "profile"
            ? `${studioJob.title} · 岗位画像\n${studioJob.aiProfile.mustHave.join("；")}`
            : mode === "jd"
              ? `${studioJob.title}\n${studioJob.summary}\n\n职责：\n${studioJob.responsibilities.join("\n")}`
              : `${studioCandidate.name} · 数字人面试题纲`
      );
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败，请手动选择文本");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="小聘 · 招聘智能体"
        title="AI 中心"
        description="把重复的招聘工作交给 AI，把判断留给人。所有生成内容可追溯、可编辑，并在发布前由你确认。"
        actions={
          <>
            <Button variant="secondary" onClick={() => openStudio("report", "为周予安生成高级产品经理岗位的推荐报告")}>
              <FileText /> 生成推荐报告
            </Button>
            <Button onClick={() => openStudio("jd", "帮我为「高级产品经理」写一份有吸引力的 JD")}>
              <Sparkles /> 新建 AI 任务
            </Button>
          </>
        }
      />

      <section className="ai-orbit noise relative overflow-hidden rounded-[22px] p-6 text-white md:p-8">
        <div className="signal-grid absolute inset-0 opacity-50" />
        <div className="absolute -right-20 -top-24 size-[360px] rounded-full bg-[#4f8c72]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 hidden h-full w-[46%] items-center justify-center md:flex">
          <div className="relative flex size-[230px] items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-[38px] rounded-full border border-white/10" />
            <div className="absolute inset-[76px] rounded-full border border-dashed border-white/12" />
            <div className="absolute left-1/2 top-1/2 size-[126px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1b5a49]/60 blur-2xl" />
            <div className="relative flex size-[92px] items-center justify-center rounded-full border border-white/15 bg-white/8 backdrop-blur-sm">
              <Sparkles className="size-8 text-[#f2b3a1]" />
              <span className="absolute inset-0 rounded-full border border-white/15 animate-drift" />
            </div>
            <span className="absolute right-2 top-7 rounded-md border border-white/10 bg-white/8 px-2 py-1 text-[12px] text-[#cfe0d5]">JD 生成</span>
            <span className="absolute bottom-7 left-1 rounded-md border border-white/10 bg-white/8 px-2 py-1 text-[12px] text-[#cfe0d5]">人岗匹配</span>
            <span className="absolute -bottom-1 right-10 rounded-md border border-white/10 bg-white/8 px-2 py-1 text-[12px] text-[#cfe0d5]">数字人面试</span>
          </div>
        </div>
        <div className="relative z-10 max-w-[640px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[12px] text-[#cfe0d5]">
              <span className="size-1.5 rounded-full bg-[#7fd2a8]" /> 已连接招聘数据
            </span>
            <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[12px] text-[#9cb8a9]">Wanlian Reasoner</span>
          </div>
          <h2 className="mt-5 max-w-[560px] text-balance text-[26px] font-semibold leading-[1.3] tracking-[-0.035em] md:text-[30px]">
            把招聘里重复的部分，
            <br />
            交给小聘。
          </h2>
          <p className="mt-3 max-w-[520px] text-[13.5px] leading-6 text-[#b7cbbf]">
            写 JD、生成岗位画像、分析候选人、设计面试题纲——从一句话开始，小聘会读取当前职位与候选人上下文，给出可编辑的结果。
          </p>
          <div className="mt-6 rounded-2xl border border-white/12 bg-[#05251f]/55 p-3 backdrop-blur-md">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：为高级产品经理写一份 JD，突出 AI 产品与团队自治…"
              className="h-[64px] w-full resize-none bg-transparent px-1 text-[13.5px] leading-6 text-white outline-none placeholder:text-[#7d9a8c]"
            />
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  ["jd", "写 JD"],
                  ["profile", "岗位画像"],
                  ["report", "推荐报告"],
                  ["interview", "数字人面试"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setMode(key as Mode)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[12px] transition-colors",
                      mode === key ? "bg-white text-pine" : "border border-white/12 text-[#a9c3b5] hover:bg-white/8 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                className="bg-[#f2f4ef] text-pine hover:bg-white"
                onClick={() => openStudio(mode, prompt || undefined)}
              >
                <Wand2 /> 开始生成
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#8fae9f]">
            <button onClick={() => openStudio("jd", "帮我为「高级产品经理」写一份有吸引力的 JD")} className="hover:text-white">写一份高级产品经理 JD</button>
            <button onClick={() => openStudio("report", "为周予安生成推荐报告")} className="hover:text-white">生成周予安的推荐报告</button>
            <button onClick={() => openStudio("interview", "为前端工程师设计一场数字人初试")} className="hover:text-white">设计数字人面试</button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {aiToolDefinitions.map((tool, idx) => (
          <button
            key={tool.key}
            onClick={() => openStudio(tool.key, tool.prompt)}
            className="surface group relative overflow-hidden p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
          >
            <div className={cn("mb-5 flex h-[92px] items-center justify-center overflow-hidden rounded-xl border border-line/70", idx === 0 ? "bg-[#eef4ee]" : idx === 1 ? "bg-[#eef2f5]" : idx === 2 ? "bg-[#f8f1e3]" : "bg-pine-deep")}>
              {idx === 0 ? (
                <div className="w-[73%] rounded-lg border border-[#d7e4da] bg-white p-2.5 shadow-sm">
                  <div className="h-1.5 w-1/3 rounded-full bg-pine/30" />
                  <div className="mt-2 h-1 w-full rounded-full bg-[#e7ece5]" />
                  <div className="mt-1 h-1 w-4/5 rounded-full bg-[#e7ece5]" />
                  <div className="mt-2.5 flex gap-1.5">
                    <span className="h-4 w-9 rounded bg-pine/10" />
                    <span className="h-4 w-12 rounded bg-[#e7ece5]" />
                  </div>
                </div>
              ) : idx === 1 ? (
                <div className="relative size-[76px]">
                  <div className="absolute inset-0 rounded-full border border-[#d8e2e8]" />
                  <div className="absolute inset-[13px] rounded-full border border-[#d8e2e8]" />
                  <svg viewBox="0 0 76 76" className="absolute inset-0">
                    <polygon points="38,9 66,29 56,62 20,62 10,29" fill="rgba(47,111,143,.1)" stroke="#2f6f8f" strokeWidth="1.2" />
                    <polygon points="38,20 55,32 49,52 27,52 21,32" fill="rgba(47,111,143,.14)" stroke="#2f6f8f" strokeWidth="1" />
                  </svg>
                </div>
              ) : idx === 2 ? (
                <div className="w-[75%]">
                  <div className="flex items-center justify-between">
                    <span className="h-1.5 w-12 rounded-full bg-[#d9b466]/50" />
                    <span className="num text-[14px] font-semibold text-[#8a6a24]">92</span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {[80, 95, 65, 88].map((w, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="h-1 w-5 rounded-full bg-[#e8dcc2]" />
                        <span className="h-1.5 rounded-full bg-[#c69a48]/40" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <AudioLines className="size-5 text-[#f2b3a1]" />
                  </div>
                  <div className="mt-2 flex items-end gap-[2px]">
                    {[4, 9, 6, 13, 8, 15, 7, 11, 5].map((h, i) => (
                      <span key={i} className="w-[2px] rounded-full bg-[#7fd2a8]/70" style={{ height: h }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[12.5px] text-muted">{tool.eyebrow}</div>
                <div className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-ink">{tool.name}</div>
              </div>
              <span className="flex size-7 items-center justify-center rounded-full border border-line text-muted transition-all group-hover:border-pine group-hover:bg-pine group-hover:text-white">
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-[12.5px] leading-5 text-muted">{tool.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-[12px] text-muted">{tool.stat}</span>
              <span className="text-[12px] font-medium text-pine">开始</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 xl:gap-5">
        <section className="surface col-span-12 overflow-hidden xl:col-span-7">
          <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
            <SectionTitle title="最近生成" description="你可以继续编辑、保存或发送给团队" icon={<Zap />} />
            <button className="text-[13px] font-medium text-pine hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-line">
            {generations.slice(0, 5).map((g) => {
              const job = jobs.find((j) => j.id === g.jobId);
              const candidate = candidates.find((c) => c.id === g.candidateId);
              const modeKey = g.type as Mode;
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    openStudio(modeKey, undefined, g.jobId, g.candidateId);
                    setResult(true);
                    setDoneStep(steps.length);
                  }}
                  className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#fafbf8]"
                >
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-3.5", g.type === "jd" ? "bg-pine-soft text-pine" : g.type === "profile" ? "bg-[#e8eef5] text-[#2f5c80]" : g.type === "report" ? "bg-amber-soft text-[#8a6a24]" : "bg-[#f0ece7] text-[#7b5338]")}>
                    {toolIcons[g.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-ink group-hover:text-pine">{g.title}</div>
                    <div className="mt-0.5 truncate text-[12px] text-muted">
                      {g.subtitle}
                      {candidate ? ` · ${candidate.name}` : job ? ` · ${job.departmentId === "dept-14" ? "数据智能组" : "产品设计部"}` : ""}
                    </div>
                  </div>
                  <span className="hidden text-[12px] text-muted sm:block">{g.createdAt}</span>
                  <Badge tone={g.status === "ready" ? "pine" : "neutral"}>{g.status === "ready" ? "已生成" : "草稿"}</Badge>
                  <ChevronRight className="size-3.5 text-[#b3bdb5] transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
          <div className="border-t border-line px-5 py-3 text-[12.5px] text-muted">
            所有生成内容均记录操作人与时间，可在「企业设置 · 审计日志」中查看。
          </div>
        </section>

        <div className="col-span-12 space-y-4 xl:col-span-5">
          <section className="surface p-5">
            <SectionTitle title="AI 使用概览" description="近 30 天 · 你的团队" icon={<BarChart3 />} />
            <div className="mt-4 flex items-center gap-5">
              <Donut value={68} size={104} stroke={9} label="68%" sublabel="周活跃使用率" />
              <div className="grid flex-1 grid-cols-2 gap-3">
                {[
                  ["生成次数", "1,284"],
                  ["内容采纳率", "92%"],
                  ["平均评分", "4.8"],
                  ["节省工时", "76h"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="num text-[16px] font-semibold text-ink">{value}</div>
                    <div className="mt-0.5 text-[12px] text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f7f8f4] px-3.5 py-2.5">
              <span className="text-[12.5px] text-muted">最常使用</span>
              <span className="text-[12.5px] font-medium text-ink">JD 生成 · 28 次</span>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[18px] bg-pine-deep p-5 text-white">
            <div className="signal-grid absolute inset-0 opacity-40" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12.5px] text-[#b7cbbf]">
                  <span className="pulse-dot size-1.5 rounded-full bg-[#7fd2a8]" /> 正在面试
                </div>
                <span className="rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[12px] text-[#9cb8a9]">数字人</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="relative flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/8">
                  <UserRound className="size-5 text-[#f2b3a1]" />
                  <span className="absolute inset-0 rounded-full border border-[#7fd2a8]/40 animate-ping opacity-30" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium">江屿 · 前端工程师</div>
                  <div className="mt-0.5 text-[12px] text-[#9cb8a9]">数字人初试 · 第 4 / 6 题</div>
                </div>
                <div className="flex items-end gap-[2px]">
                  {[5, 10, 6, 14, 8, 16, 7, 12].map((h, i) => (
                    <span key={i} className="w-[2px] rounded-full bg-[#7fd2a8]/70" style={{ height: h }} />
                  ))}
                </div>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[66%] rounded-full bg-[#7fd2a8]" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] text-[#9cb8a9]">预计 6 分钟后结束</span>
                <Link href="/interviews/live/int-2" className="flex items-center gap-1 text-[12.5px] font-medium text-[#f0b09d] hover:text-white">
                  进入监控 <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={studioOpen} onOpenChange={setStudioOpen}>
        <DialogContent size="xl" className="p-0">
          <DialogHeader
            title="小聘 · AI 工作台"
            description="读取当前招聘上下文，生成可编辑、可追溯的内容。"
            icon={<Sparkles />}
          />
          <div className="grid max-h-[calc(92vh-84px)] grid-cols-1 overflow-y-auto md:grid-cols-[340px_1fr] md:overflow-hidden">
            <div className="border-b border-line bg-[#fafbf8] p-5 md:border-b-0 md:border-r">
              <div className="text-[12.5px] font-medium text-muted">任务类型</div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {([
                  ["jd", "写 JD", FileText],
                  ["profile", "岗位画像", Target],
                  ["report", "推荐报告", BarChart3],
                  ["interview", "数字人面试", AudioLines],
                ] as const).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    onClick={() => { setMode(key); setResult(false); setDoneStep(0); }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                      mode === key ? "border-pine bg-pine text-white" : "border-line bg-white text-muted hover:border-line-strong hover:text-ink"
                    )}
                  >
                    <Icon className="size-3.5" /> {label}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <Field label="目标职位">
                  <Select value={studioJobId} onValueChange={setStudioJobId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                {mode === "report" || mode === "interview" ? (
                  <Field label="候选人">
                    <Select value={studioCandidateId} onValueChange={setStudioCandidateId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.currentTitle}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}
                <Field label="补充说明" hint="可选">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：更强调团队自治与 AI 产品经验"
                    className="min-h-[92px] bg-white text-[13px]"
                  />
                </Field>
              </div>

              <Button className="mt-5 w-full" onClick={run} disabled={generating}>
                {generating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {generating ? "正在生成…" : result ? "重新生成" : "开始生成"}
              </Button>
              <p className="mt-3 text-[12px] leading-4 text-muted">生成内容由 AI 辅助完成，请在使用前人工确认。</p>
            </div>

            <DialogBody className="bg-white p-5 md:max-h-[calc(92vh-84px)]">
              {!generating && !result ? (
                <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-line bg-[#fafbf8]">
                    <Sparkles className="size-6 text-[#c0cbc2]" />
                  </div>
                  <p className="mt-3 text-[13.5px] font-medium text-ink">生成结果会出现在这里</p>
                  <p className="mt-1 max-w-[260px] text-[12.5px] leading-5 text-muted">小聘会先读取职位、团队与候选人上下文，再生成结构化内容。</p>
                </div>
              ) : null}

              {generating ? (
                <div className="flex h-full min-h-[380px] flex-col justify-center px-2">
                  <div className="mx-auto w-full max-w-[360px]">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-pine">
                      <Loader2 className="size-3.5 animate-spin" /> 小聘正在工作
                    </div>
                    <div className="mt-5 space-y-3">
                      {steps.map((s, i) => (
                        <div key={s} className="flex items-center gap-3 text-[13px]">
                          <span className={cn("flex size-5 items-center justify-center rounded-full border", i < doneStep ? "border-pine bg-pine text-white" : i === doneStep ? "border-pine/40 text-pine" : "border-line text-muted")}>
                            {i < doneStep ? <Check className="size-3" /> : i === doneStep ? <Loader2 className="size-2.5 animate-spin" /> : <span className="text-[11.5px]">{i + 1}</span>}
                          </span>
                          <span className={i <= doneStep ? "text-ink-soft" : "text-muted"}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-[#eef1ec]">
                      <div className="h-full rounded-full bg-pine transition-all duration-500" style={{ width: `${(doneStep / steps.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ) : null}

              {result && !generating ? (
                <div className="animate-fade">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="pine" dot>生成完成 · {mode === "jd" ? "JD" : mode === "profile" ? "岗位画像" : mode === "report" ? "推荐报告" : "面试题纲"}</Badge>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={copyResult}><Copy /> 复制</Button>
                      <Button variant="secondary" size="sm" onClick={saveGeneration}><Check /> 保存</Button>
                    </div>
                  </div>
                  {mode === "jd" ? <JdDocument job={studioJob} /> : null}
                  {mode === "profile" ? <ProfileDocument job={studioJob} /> : null}
                  {mode === "report" ? <ReportDocument candidate={studioCandidate} job={studioJob} /> : null}
                  {mode === "interview" ? <InterviewDocument job={studioJob} candidate={studioCandidate} /> : null}
                </div>
              ) : null}
            </DialogBody>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
