"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AtSign,
  ArrowUp,
  BriefcaseBusiness,
  ChevronRight,
  Compass,
  FileText,
  Loader2,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Candidate, Job } from "@/lib/types";
import { agentSkills, skillById, SkillIcon } from "./data";
import type { AgentPrompt, SkillId } from "./types";

const promptSuggestions: Record<string, string[]> = {
  "job-publish": ["帮我发布一个高级测试工程师职位", "把这个职位同步到招聘平台", "先帮我检查职位合规风险"],
  "job-profile": ["为这个职位生成人才画像", "补充团队协作与学习能力维度", "把画像同步到职位管理"],
  "recommend-report": ["解析 10 份简历并生成推荐报告", "只看匹配度 85 分以上的候选人", "输出候选人风险清单"],
  "resume-parse": ["解析这份简历并提取风险点", "按岗位画像给出匹配度", "生成候选人面试问题"],
  "interview-plan": ["设计一场 30 分钟的数字人初试", "增加项目深挖追问", "输出评分标准"],
};

export function ComposerDock({
  value,
  onChange,
  onSend,
  selectedSkill,
  onSelectSkill,
  onClearSkill,
  thinking,
  empty,
  prompt,
  onAnswerPrompt,
  onSkipPrompt,
  onClosePrompt,
  onUseSuggestion,
  jobs,
  candidates,
  jobId,
  candidateId,
  onJobChange,
  onCandidateChange,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string, attachments?: { name: string; size: string }[]) => void;
  selectedSkill: SkillId | null;
  onSelectSkill: (skill: SkillId) => void;
  onClearSkill: () => void;
  thinking: boolean;
  empty: boolean;
  prompt: AgentPrompt | null;
  onAnswerPrompt: (text: string, index: number) => void;
  onSkipPrompt: () => void;
  onClosePrompt: () => void;
  onUseSuggestion: (text: string) => void;
  jobs: Job[];
  candidates: Candidate[];
  jobId: string;
  candidateId: string;
  onJobChange: (id: string) => void;
  onCandidateChange: (id: string) => void;
}) {
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const [skillQuery, setSkillQuery] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  useEffect(() => {
    if (skillMenuOpen) {
      window.setTimeout(() => menuInputRef.current?.focus(), 30);
    } else {
      setSkillQuery("");
    }
  }, [skillMenuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSkillMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredSkills = useMemo(() => {
    const normalized = skillQuery.trim().toLowerCase();
    if (!normalized) return agentSkills;
    return agentSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(normalized) ||
        skill.description.toLowerCase().includes(normalized) ||
        skill.category.includes(normalized)
    );
  }, [skillQuery]);

  const canSend = Boolean(value.trim() || attachments.length > 0);

  const formatSize = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => ({ name: file.name, size: formatSize(file.size) }));
    if (files.length > 0) setAttachments((items) => [...items, ...files]);
    event.target.value = "";
  };

  const submit = () => {
    const text = value.trim() || (attachments.length > 0 ? "请查看我上传的附件" : "");
    if (!text || thinking) return;
    onSend(text, attachments);
    setAttachments([]);
  };

  const focusTextarea = () => window.setTimeout(() => textareaRef.current?.focus(), 20);
  const selected = selectedSkill ? skillById(selectedSkill) : null;
  const suggestions = selectedSkill ? promptSuggestions[selectedSkill] ?? [] : [];

  return (
    <div className="relative z-20 px-3 pb-4 md:px-4 md:pb-5">
      <div className="mx-auto w-full max-w-[800px]">
        {empty && !prompt ? (
          <div className="mb-3 agent-fade">
            <div className="mb-2 text-[11.5px] font-medium text-[var(--a-text-3)]">为你推荐</div>
            <div className="flex flex-wrap gap-2">
              {agentSkills.slice(0, 3).map((skill) => (
                <Button
                  key={skill.id}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-2 rounded-[10px] px-2.5 text-[12px]"
                  onClick={() => {
                    onSelectSkill(skill.id);
                    focusTextarea();
                  }}
                >
                  <span
                    className="flex size-5 items-center justify-center rounded-[5px]"
                    style={{ background: skill.tint, color: skill.color }}
                  >
                    <SkillIcon id={skill.id} className="size-3.5" />
                  </span>
                  {skill.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {empty && selectedSkill && suggestions.length > 0 && !value.trim() && !prompt ? (
          <div className="mb-2 flex flex-wrap gap-1.5 agent-fade">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 max-w-[280px] gap-1 rounded-[9px] px-2.5 text-[11px] font-normal text-[var(--a-text-3)]"
                onClick={() => {
                  onUseSuggestion(suggestion);
                  focusTextarea();
                }}
              >
                <span className="truncate">{suggestion}</span>
              </Button>
            ))}
          </div>
        ) : null}

        {prompt ? (
          <QuestionCard
            prompt={prompt}
            onAnswer={onAnswerPrompt}
            onSkip={onSkipPrompt}
            onClose={onClosePrompt}
          />
        ) : null}

        <div className="relative">
          {skillMenuOpen ? (
            <>
              <button
                type="button"
                aria-label="关闭技能面板"
                className="fixed inset-0 z-[45] cursor-default"
                onClick={() => setSkillMenuOpen(false)}
              />
              <div className="agent-pop absolute bottom-[calc(100%+8px)] left-0 z-[50] w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
                <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
                  <Search className="size-3.5 text-muted" />
                  <input
                    ref={menuInputRef}
                    value={skillQuery}
                    onChange={(event) => setSkillQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && filteredSkills[0]) {
                        event.preventDefault();
                        onSelectSkill(filteredSkills[0].id);
                        setSkillMenuOpen(false);
                        focusTextarea();
                      }
                      if (event.key === "Escape") setSkillMenuOpen(false);
                    }}
                    aria-label="搜索技能"
                    placeholder="搜索技能，例如「职位发布」"
                    className="min-w-0 flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-[#9ba69f]"
                  />
                  <button
                    type="button"
                    onClick={() => setSkillMenuOpen(false)}
                    aria-label="关闭"
                    className="flex size-6 items-center justify-center rounded-lg text-muted hover:bg-[#f3f5f0]"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="max-h-[330px] overflow-y-auto p-1.5">
                  {filteredSkills.length === 0 ? (
                    <div className="px-3 py-10 text-center text-[12px] text-muted">没有找到匹配的技能</div>
                  ) : (
                    filteredSkills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          onSelectSkill(skill.id);
                          setSkillMenuOpen(false);
                          focusTextarea();
                        }}
                        className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f5f7f2]"
                      >
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: skill.tint, color: skill.color }}
                        >
                          <SkillIcon id={skill.id} className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[12px] font-medium text-ink">{skill.name}</span>
                            <span className="rounded bg-[#f2f4ef] px-1 py-0.5 text-[9.5px] text-muted">{skill.category}</span>
                          </span>
                          <span className="mt-0.5 block truncate text-[10.5px] text-muted">{skill.description}</span>
                        </span>
                        <span className="flex size-5 items-center justify-center rounded-md text-muted opacity-0 transition-opacity group-hover:opacity-100">
                          <ChevronRight className="size-3" />
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-line bg-[#fafbf8] px-3 py-2 text-[10px] text-muted">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3 text-pine" />
                    {agentSkills.length} 个技能已就绪
                  </span>
                  <span>
                    输入 <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-mono">/</kbd> 快速调用
                  </span>
                </div>
              </div>
            </>
          ) : null}

          <div className="rounded-2xl border border-line bg-surface p-2.5 shadow-[0_10px_30px_-24px_rgba(0,0,0,.3)] transition-colors focus-within:border-line-strong">
            {selected ? (
              <div className="mb-1 flex items-center gap-1.5 px-0.5">
                <span
                  className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[10.5px] font-medium"
                  style={{ background: selected.tint, color: selected.color }}
                >
                  <SkillIcon id={selected.id} className="size-3" />
                  {selected.name}
                  <button
                    type="button"
                    onClick={onClearSkill}
                    aria-label="移除技能"
                    className="ml-0.5 flex size-3.5 items-center justify-center rounded hover:bg-black/10"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              </div>
            ) : null}

            {attachments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 px-0.5 pb-1">
                {attachments.map((file) => (
                  <span
                    key={`${file.name}-${file.size}`}
                    className="inline-flex h-6 max-w-[240px] items-center gap-1 rounded-md border border-line bg-[#fafbf8] px-1.5 text-[10.5px] text-muted"
                  >
                    <FileText className="size-3 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      aria-label={`移除 ${file.name}`}
                      onClick={() => setAttachments((items) => items.filter((item) => item !== file))}
                      className="ml-0.5 flex size-3.5 items-center justify-center rounded hover:bg-[#eef0ec]"
                    >
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "/" && !value) {
                  event.preventDefault();
                  setSkillMenuOpen(true);
                  return;
                }
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  submit();
                }
              }}
              aria-label="给 Agent 发送消息"
              placeholder="给 Agent 发送消息…"
              className="max-h-[180px] min-h-[32px] w-full resize-none bg-transparent px-1 py-1.5 text-[13.5px] leading-[22px] text-ink outline-none placeholder:text-[#9ba69f]"
            />

            <div className="mt-1 flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="添加附件或上下文"
                    className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-[#f5f7f2] hover:text-ink"
                  >
                    <Plus className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8} className="w-[210px]">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                    <Paperclip /> 上传附件
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setContextOpen(true)}>
                    <AtSign /> 选择上下文
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSkillMenuOpen(true)}>
                    <Compass /> 调用技能
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover open={contextOpen} onOpenChange={setContextOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="设置上下文"
                    title="设置 Agent 读取的职位与候选人"
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-[9px] px-2 text-[11.5px] text-muted transition-colors hover:bg-[#f5f7f2] hover:text-ink",
                      (jobId || candidateId) && "text-ink-soft"
                    )}
                  >
                    <AtSign className="size-3.5" />
                    <span className="hidden sm:inline">上下文</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={8} className="w-[min(380px,calc(100vw-32px))] p-0">
                  <div className="border-b border-line px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink">当前上下文</div>
                    <p className="mt-1 text-[11.5px] leading-[18px] text-muted">
                      Agent 会读取这里选择的职位和候选人，用于分析、生成与写入数据。
                    </p>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <div className="mb-1.5 text-[12px] font-medium text-ink-soft">职位</div>
                      <Select value={jobId} onValueChange={onJobChange}>
                        <SelectTrigger className="h-10 text-[13px]" aria-label="选择职位上下文">
                          <SelectValue placeholder="选择职位" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title} · {job.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="mb-1.5 text-[12px] font-medium text-ink-soft">候选人</div>
                      <Select value={candidateId} onValueChange={onCandidateChange}>
                        <SelectTrigger className="h-10 text-[13px]" aria-label="选择候选人上下文">
                          <SelectValue placeholder="未选择候选人" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidates.map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.name} · {candidate.currentTitle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-lg bg-[#fafbf8] px-2.5 py-2 text-[10.5px] leading-[17px] text-muted">
                      当前：{jobs.find((job) => job.id === jobId)?.title ?? "未选择职位"}
                      {candidateId
                        ? ` · ${candidates.find((candidate) => candidate.id === candidateId)?.name ?? ""}`
                        : ""}
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" size="sm" onClick={() => setContextOpen(false)}>
                        完成
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <button
                type="button"
                onClick={() => setSkillMenuOpen(true)}
                aria-label="更多技能"
                className="flex h-8 items-center gap-1.5 rounded-[9px] px-2 text-[11.5px] text-muted transition-colors hover:bg-[#f5f7f2] hover:text-ink"
              >
                <Compass className="size-3.5" />
                <span className="hidden sm:inline">更多技能</span>
              </button>

              <div className="ml-auto flex items-center gap-2">
                <span className="hidden text-[10px] text-muted md:block">Enter 发送 · Shift+Enter 换行</span>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend || thinking}
                  aria-label="发送"
                  title={thinking ? "Agent 正在回复" : "发送"}
                  className="flex size-8 items-center justify-center rounded-full bg-pine text-white shadow-sm transition-colors hover:bg-pine-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {thinking ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
                </button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFiles}
          />
        </div>
      </div>
    </div>
  );
}


function QuestionCard({
  prompt,
  onAnswer,
  onSkip,
  onClose,
}: {
  prompt: AgentPrompt;
  onAnswer: (text: string, index: number) => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const [customValue, setCustomValue] = useState("");
  const lastIndex = prompt.options.length - 1;
  const hasCustomOption =
    lastIndex >= 0 && /更好|其他|自定义|方案/.test(prompt.options[lastIndex].title);
  const showCustom = hasCustomOption || prompt.action === "select-job";
  const options = hasCustomOption ? prompt.options.slice(0, -1) : prompt.options;

  const submitCustom = () => {
    const value = customValue.trim();
    if (!value) return;
    onAnswer(value, hasCustomOption ? lastIndex : prompt.options.length);
  };

  return (
    <div className="agent-pop mb-2.5 overflow-hidden rounded-[14px] border border-[var(--a-border-2)] bg-white agent-shadow-pop">
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] text-[var(--a-text-3)]">
            <span className="agent-pulse size-1.5 rounded-full bg-[var(--a-primary)]" />
            正在等待你的回答
          </div>
          <div className="text-[13.5px] font-medium leading-[21px] text-[var(--a-text-1)]">{prompt.title}</div>
          {prompt.description ? <p className="mt-1 text-[11.5px] leading-[18px] text-[var(--a-text-3)]">{prompt.description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭问题"
            className="flex size-6 items-center justify-center rounded-[5px] text-[var(--a-text-3)] transition-colors hover:bg-[var(--a-fill-1)] hover:text-[var(--a-text-1)]"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 px-2">
        {options.map((option, index) => (
          <button
            key={`${option.title}-${index}`}
            type="button"
            onClick={() => onAnswer(option.title, index)}
            className="group flex w-full items-start gap-3 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-[var(--a-fill-1)]"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--a-border-2)] text-[10px] text-[var(--a-text-2)]">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] leading-[19px] text-[var(--a-text-1)]">{option.title}</span>
              {option.description ? (
                <span className="mt-0.5 block text-[10.5px] leading-[17px] text-[var(--a-text-3)]">{option.description}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>

      {showCustom ? (
        <form
          className="mt-1 flex items-center gap-2 px-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            submitCustom();
          }}
        >
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            placeholder="否，我有更好的选择"
            aria-label="输入其他职位"
            className="h-9 min-w-0 flex-1 rounded-[8px] border border-[var(--a-border-2)] bg-[#fafbf8] px-3 text-[12px] text-[var(--a-text-1)] outline-none transition-colors placeholder:text-[var(--a-text-4)] hover:border-[var(--a-border-3)] focus:border-[var(--a-border-3)]"
          />
          <button
            type="submit"
            disabled={!customValue.trim()}
            className="flex h-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--a-primary-1)] px-3 text-[11.5px] font-medium text-[var(--a-primary)] transition-colors hover:bg-[var(--a-primary-2)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            确认
          </button>
        </form>
      ) : null}

      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2">
        <span className="text-[10px] text-[var(--a-text-4)]">
          {showCustom ? "也可直接输入职位名称或编号，按 Enter 提交" : "选择一项继续"}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg bg-[#f2f4ef] px-3.5 py-1.5 text-[11px] text-ink-soft transition-colors hover:bg-[#e5e9e3]"
        >
          {prompt.skipLabel ?? "跳过"}
        </button>
      </div>
    </div>
  );
}
