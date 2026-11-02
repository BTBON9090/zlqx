"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  CalendarClock,
  CalendarDays,
  Check,
  CircleAlert,
  Link2,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/toggle";
import { Avatar } from "@/components/ui/avatar";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { InterviewType } from "@/lib/types";

const typeOptions: { value: InterviewType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "video", label: "视频面试", icon: <Video />, desc: "自动生成会议链接" },
  { value: "onsite", label: "现场面试", icon: <MapPin />, desc: "到公司面对面沟通" },
  { value: "phone", label: "电话面试", icon: <Phone />, desc: "适合 15–30 分钟初聊" },
  { value: "ai", label: "数字人面试", icon: <AudioLines />, desc: "候选人可异步完成" },
];

const DURATION_OPTIONS = [30, 45, 60, 90];
const WORK_START = 9 * 60;
const WORK_END = 18 * 60;

const MOCK_CALENDAR: Record<string, [string, string][]> = {
  "emp-1": [["10:00", "11:00"], ["15:00", "15:30"]],
  "emp-2": [["09:30", "10:00"], ["14:00", "14:30"]],
  "emp-3": [["09:00", "10:00"], ["14:00", "15:00"]],
  "emp-4": [["11:00", "12:00"], ["16:00", "17:00"]],
  "emp-5": [["13:30", "14:30"]],
  "emp-7": [["10:30", "11:30"], ["15:30", "16:30"]],
  "emp-8": [["15:00", "16:00"]],
  "emp-9": [["14:00", "15:00"]],
  "emp-11": [["09:30", "10:30"]],
};

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd;

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  defaultCandidateId,
  defaultJobId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCandidateId?: string;
  defaultJobId?: string;
  onCreated?: (id: string) => void;
}) {
  const { candidates, jobs, employees, interviews, templates, addInterview } = useApp();
  const [candidateId, setCandidateId] = useState(defaultCandidateId ?? "");
  const [jobId, setJobId] = useState(defaultJobId ?? "");
  const [round, setRound] = useState("初试");
  const [type, setType] = useState<InterviewType>("video");
  const [date, setDate] = useState("2026-11-02");
  const [start, setStart] = useState("14:00");
  const [duration, setDuration] = useState("45");
  const [interviewerIds, setInterviewerIds] = useState<string[]>(["emp-3"]);
  const [note, setNote] = useState("");
  const [sendInvite, setSendInvite] = useState(true);
  const [inviteTemplateId, setInviteTemplateId] = useState("tpl-1");
  const [inviteChannels, setInviteChannels] = useState<("email" | "sms")[]>(["email", "sms"]);
  const [previewChannel, setPreviewChannel] = useState<"email" | "sms" | null>(null);

  useEffect(() => {
    if (open) {
      const c = defaultCandidateId ?? candidates[0]?.id;
      setCandidateId(defaultCandidateId ?? "");
      setJobId(defaultJobId ?? candidates.find((x) => x.id === c)?.jobId ?? jobs[0].id);
      setRound("初试");
      setType("video");
      setDate("2026-11-02");
      setStart("14:00");
      setDuration("45");
      setInterviewerIds(["emp-3"]);
      setNote("");
      setSendInvite(true);
      const inviteTemplate = templates.find((template) => template.scenario === "面试邀约" && template.enabled);
      setInviteTemplateId(inviteTemplate?.id ?? "");
      setInviteChannels(inviteTemplate ? inviteTemplate.channels.filter((channel): channel is "email" | "sms" => channel === "email" || channel === "sms") : ["email", "sms"]);
      setPreviewChannel(null);
    }
  }, [open, defaultCandidateId, defaultJobId, candidates, jobs, templates]);

  const job = jobs.find((j) => j.id === jobId);
  const scopedCandidates = useMemo(() => (jobId ? candidates.filter((c) => c.jobId === jobId) : candidates), [candidates, jobId]);
  const selectedCandidate = candidates.find((c) => c.id === candidateId);
  const interviewers = employees.filter((e) => ["emp-3", "emp-7", "emp-8", "emp-9", "emp-1", "emp-2", "emp-4", "emp-5", "emp-6", "emp-11"].includes(e.id));
  const owner = employees.find((e) => e.id === job?.ownerId);
  const assistants = (job?.assistantIds ?? []).map((id) => employees.find((e) => e.id === id)).filter(Boolean);
  const participantIds = Array.from(new Set([job?.ownerId, ...(job?.assistantIds ?? []), ...interviewerIds].filter(Boolean) as string[]));
  const participantNames = participantIds.map((id) => employees.find((e) => e.id === id)?.name ?? id);
  const inviteTemplates = templates.filter((template) => template.scenario === "面试邀约" && template.enabled);
  const inviteTemplate = inviteTemplates.find((template) => template.id === inviteTemplateId) ?? inviteTemplates[0];
  const inviteVariables: Record<string, string> = {
    company: "澄明科技",
    candidate_name: selectedCandidate?.name ?? "候选人",
    job_title: job?.title ?? "应聘职位",
    round,
    interview_time: `${date} ${start}`,
    interviewer: interviewerIds.map((id) => employees.find((e) => e.id === id)?.name ?? id).join("、") || "招聘团队",
    meeting_link: type === "video" ? `meeting.chengming.ai/${candidateId || "preview"}` : type === "phone" ? "电话沟通" : "北京 · 朝阳区望京 SOHO T3 18F",
    location: "北京 · 朝阳区望京 SOHO T3 18F",
  };
  const renderInvite = (text: string) => text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => inviteVariables[key] ?? `{{${key}}}`);

  const slots = useMemo(() => {
    const durationMinutes = Number(duration);
    const list: { start: string; end: string; work: boolean; busyNames: string[] }[] = [];
    for (let minutes = 8 * 60; minutes + durationMinutes <= 20 * 60; minutes += 30) {
      const start = toTime(minutes);
      const end = toTime(minutes + durationMinutes);
      const startMinutes = toMinutes(start);
      const endMinutes = toMinutes(end);
      const busyNames = participantIds.filter((id) => {
        const fixedBusy = MOCK_CALENDAR[id] ?? [];
        const scheduledBusy = interviews
          .filter((iv) => iv.date === date && !["cancelled", "no_show", "expired"].includes(iv.status) && iv.interviewers.includes(id))
          .map((iv) => [iv.start, iv.end] as [string, string]);
        return [...fixedBusy, ...scheduledBusy].some(([busyStart, busyEnd]) => overlaps(startMinutes, endMinutes, toMinutes(busyStart), toMinutes(busyEnd)));
      }).map((id) => employees.find((e) => e.id === id)?.name ?? id);
      list.push({ start, end, work: startMinutes >= WORK_START && endMinutes <= WORK_END, busyNames });
    }
    return list;
  }, [date, duration, participantIds.join(","), interviews, employees]);

  const selectedSlot = slots.find((slot) => slot.start === start);
  const nextAvailable = slots.find((slot) => slot.busyNames.length === 0 && slot.work) ?? slots.find((slot) => slot.busyNames.length === 0);

  useEffect(() => {
    if (!open) return;
    setStart((prev) => {
      const current = slots.find((slot) => slot.start === prev);
      return current && current.busyNames.length === 0 ? prev : nextAvailable?.start ?? prev;
    });
  }, [open, slots, nextAvailable]);

  const submit = () => {
    if (!candidateId) {
      toast.error("请选择候选人");
      return;
    }
    if (!date || !start) {
      toast.error("请选择面试时间");
      return;
    }
    if (selectedSlot && selectedSlot.busyNames.length > 0) {
      toast.error(`当前时段有冲突：${selectedSlot.busyNames.join("、")}忙碌`);
      return;
    }
    if (sendInvite && !inviteTemplate) {
      toast.error("请选择面试邀约模板");
      return;
    }
    if (sendInvite && inviteChannels.length === 0) {
      toast.error("请至少选择一个发送渠道");
      return;
    }
    const endMinutes = Number(start.split(":")[0]) * 60 + Number(start.split(":")[1]) + Number(duration);
    const end = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    const created = addInterview({
      candidateId,
      jobId,
      round,
      type,
      date,
      start,
      end,
      interviewers: interviewerIds,
      location: type === "onsite" ? "北京 · 朝阳区望京 SOHO T3 18F" : undefined,
      meetingLink: type === "video" ? `meeting.chengming.ai/${candidateId}-${Date.now().toString().slice(-4)}` : undefined,
    });
    toast.success(sendInvite ? "面试已安排，邀约已发送" : "面试已安排");
    onOpenChange(false);
    onCreated?.(created.id);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0">
        <DialogHeader title="安排面试" description="选择面试形式与时间，系统会自动发送邀约并同步给面试官。" icon={<CalendarClock />} />
        <DialogBody className="max-h-[calc(92vh-190px)] space-y-4">
          <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
            <div className="flex items-center gap-2 text-[12.5px] text-muted">
              <span className={cn("size-1.5 rounded-full", selectedCandidate ? "bg-pine" : "bg-[#c2cbc3]")} />
              {selectedCandidate ? `${selectedCandidate.name} · ${selectedCandidate.currentTitle}` : "尚未选择候选人"}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="候选人" required>
              <Select value={candidateId} onValueChange={(v) => { setCandidateId(v); const c = candidates.find((x) => x.id === v); if (c) setJobId(c.jobId); }}>
                <SelectTrigger><SelectValue placeholder="选择候选人" /></SelectTrigger>
                <SelectContent>
                  {scopedCandidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.currentTitle}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="应聘职位">
              <Select value={jobId} onValueChange={setJobId}>
                <SelectTrigger><SelectValue placeholder="选择职位" /></SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="面试轮次">
              <Select value={round} onValueChange={setRound}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["初试", "复试", "二面", "三面", "终面", "技术面", "业务面", "交叉面试"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="面试日期" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min="2026-10-30" />
            </Field>
          </div>

          <Field label="面试形式">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {typeOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    type === t.value ? "border-pine bg-pine-soft/60" : "border-line bg-white hover:border-line-strong"
                  )}
                >
                  <div className={cn("flex items-center gap-1.5 text-[13px] font-medium", type === t.value ? "text-pine" : "text-ink-soft")}>
                    <span className="[&_svg]:size-3.5">{t.icon}</span> {t.label}
                  </div>
                  <div className="mt-1 text-[11.5px] leading-4 text-muted">{t.desc}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="面试时长" hint="仅支持预设时长" required>
              <div className="flex h-10 items-center gap-1 rounded-[10px] border border-line bg-[#f7f8f4] p-1">
                {DURATION_OPTIONS.map((minutes) => (
                  <button key={minutes} type="button" onClick={() => setDuration(String(minutes))} className={cn("h-full flex-1 rounded-md text-[12px] font-medium transition-colors", duration === String(minutes) ? "bg-white text-pine shadow-sm" : "text-muted hover:text-ink")}>{minutes} 分钟</button>
                ))}
              </div>
            </Field>
            <Field label="会议 / 地点">
              <div className="flex h-10 items-center gap-1.5 rounded-[10px] border border-line bg-[#f7f8f4] px-3 text-[12.5px] text-muted">
                {type === "onsite" ? <><MapPin className="size-3" /> 望京 SOHO T3 18F</> : type === "phone" ? <><Phone className="size-3" /> 使用候选人手机号</> : <><Link2 className="size-3" /> 自动生成会议链接</>}
              </div>
            </Field>
          </div>

          <div className="rounded-xl border border-line bg-[#fafbf8] p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink"><CalendarDays className="size-3.5 text-pine" /> 可安排时间</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
                  <span>参考日历：{owner ? `${owner.name}（负责人）` : "未指定负责人"}</span>
                  {assistants.length ? <span>· 协助人 {assistants.map((person) => person?.name).filter(Boolean).join("、")}</span> : null}
                  <span>· 面试官 {interviewerIds.map((id) => employees.find((e) => e.id === id)?.name ?? id).join("、") || "未选择"}</span>
                </div>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-[11px] text-muted">{date} · {duration} 分钟</span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6 xl:grid-cols-8">
              {slots.map((slot) => {
                const busy = slot.busyNames.length > 0;
                const selected = start === slot.start;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={busy}
                    onClick={() => setStart(slot.start)}
                    title={busy ? `${slot.start}–${slot.end} · ${slot.busyNames.join("、")}忙碌` : `${slot.start}–${slot.end}${slot.work ? "" : " · 非工作时段"}`}
                    className={cn(
                      "rounded-lg border px-1.5 py-2 text-left transition-colors",
                      selected ? "border-pine bg-pine text-white" : busy ? "cursor-not-allowed border-line bg-[#f0f0ed] text-[#a6ada7]" : slot.work ? "border-line bg-white text-ink-soft hover:border-pine/40 hover:bg-pine-soft/25" : "border-dashed border-line bg-transparent text-muted hover:border-amber/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="num text-[11.5px] font-medium">{slot.start}</span>
                      <span className={cn("size-1.5 shrink-0 rounded-full", selected ? "bg-white" : busy ? "bg-amber" : "bg-success")} />
                    </div>
                    <div className={cn("mt-0.5 truncate text-[10px]", selected ? "text-white/65" : busy ? "text-[#b08c5a]" : "text-muted")}>
                      {busy ? `${slot.busyNames.length} 人忙` : slot.work ? "空闲" : "非工作"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-success" /> 全部空闲</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber" /> 有人忙碌，不可选</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded border border-dashed border-muted" /> 非工作时段（09:00–18:00 之外）</span>
            </div>
            {selectedSlot && !selectedSlot.work ? (
              <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-amber-soft px-2.5 py-2 text-[11.5px] leading-4 text-amber-deep">
                <CircleAlert className="mt-0.5 size-3 shrink-0" /> 当前选择的是非工作时段，发送邀约前请确认面试官是否接受。
              </div>
            ) : null}
          </div>

          <Field label="面试官" hint={`已选择 ${interviewerIds.length} 人`}>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {interviewers.map((e) => {
                const checked = interviewerIds.includes(e.id);
                return (
                  <label key={e.id} className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors", checked ? "border-pine/40 bg-pine-soft/40" : "border-line hover:bg-[#fafbf8]")}>
                    <Checkbox checked={checked} onCheckedChange={(v) => setInterviewerIds((prev) => v ? [...prev, e.id] : prev.filter((id) => id !== e.id))} />
                    <Avatar name={e.name} size={22} />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{e.name}</span>
                    <span className="text-[11.5px] text-muted">{e.title.slice(0, 4)}</span>
                  </label>
                );
              })}
            </div>
          </Field>

          <Field label="面试说明" hint="将同步给面试官">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：重点验证候选人的 B 端产品判断与跨团队推动经验。" className="min-h-[72px]" />
          </Field>

          <div className="rounded-xl border border-line bg-[#f7f8f4] p-3">
            <label className="flex cursor-pointer items-start gap-2.5">
              <Checkbox checked={sendInvite} onCheckedChange={(v) => setSendInvite(!!v)} className="mt-0.5" />
              <span>
                <span className="block text-[13px] font-medium text-ink">自动发送面试邀约</span>
                <span className="mt-0.5 block text-[12px] leading-4 text-muted">选择发送渠道，并可在发送前预览邮件与短信的实际样式。</span>
              </span>
            </label>
            {sendInvite ? (
              <div className="mt-3 space-y-3 border-t border-line pt-3">
                <Field label="邀约模板">
                  <Select
                    value={inviteTemplate?.id ?? ""}
                    onValueChange={(value) => {
                      setInviteTemplateId(value);
                      const template = inviteTemplates.find((item) => item.id === value);
                      setInviteChannels(template ? template.channels.filter((channel): channel is "email" | "sms" => channel === "email" || channel === "sms") : []);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="选择邀约模板" /></SelectTrigger>
                    <SelectContent>{inviteTemplates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <div>
                  <div className="mb-1.5 text-[12.5px] font-medium text-ink-soft">发送渠道</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {([
                      { value: "email" as const, label: "邮件", icon: Mail, hint: "发送完整面试信息与会议链接" },
                      { value: "sms" as const, label: "短信", icon: Smartphone, hint: "发送精简提醒与时间地点" },
                    ]).map((channel) => {
                      const supported = inviteTemplate?.channels.includes(channel.value) ?? false;
                      const checked = inviteChannels.includes(channel.value);
                      return (
                        <button
                          key={channel.value}
                          type="button"
                          disabled={!supported}
                          onClick={() => setInviteChannels((prev) => checked ? prev.filter((item) => item !== channel.value) : [...prev, channel.value])}
                          className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors", !supported ? "cursor-not-allowed border-line bg-[#f2f3ef] opacity-45" : checked ? "border-pine/40 bg-pine-soft/45" : "border-line bg-white hover:border-line-strong")}
                        >
                          <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md", checked ? "bg-pine text-white" : "bg-[#eef1ec] text-muted")}><channel.icon className="size-3.5" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">{channel.label}{checked ? <Check className="size-3 text-pine" /> : null}</span>
                            <span className="mt-0.5 block text-[11px] leading-4 text-muted">{channel.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={!inviteTemplate?.channels.includes("email")} onClick={() => setPreviewChannel("email")}><Mail /> 预览邮件</Button>
                  <Button type="button" variant="secondary" size="sm" disabled={!inviteTemplate?.channels.includes("sms")} onClick={() => setPreviewChannel("sms")}><Smartphone /> 预览短信</Button>
                  <span className="text-[11px] text-muted">变量会自动替换为候选人、职位与面试信息</span>
                </div>
              </div>
            ) : null}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}><Check /> 确认安排</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={previewChannel !== null} onOpenChange={(next) => { if (!next) setPreviewChannel(null); }}>
      <DialogContent size="lg" className="p-0">
        <DialogHeader
          title={previewChannel === "email" ? "邮件模板预览" : "短信模板预览"}
          description={previewChannel === "email" ? "候选人收到的邮件样式，发送前可确认内容与变量替换。" : "候选人收到的短信样式，发送前可确认内容长度与关键信息。"}
          icon={previewChannel === "email" ? <Mail /> : <Smartphone />}
        />
        <DialogBody>
          {!inviteTemplate ? (
            <div className="rounded-xl border border-dashed border-line bg-[#fafbf8] py-10 text-center text-[12.5px] text-muted">请选择面试邀约模板</div>
          ) : previewChannel === "email" ? (
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="space-y-1 border-b border-line bg-[#fafbf8] px-4 py-3 text-[12px]">
                <div className="flex gap-2"><span className="w-12 shrink-0 text-muted">发件人</span><span className="font-medium text-ink">澄明科技招聘团队 &lt;hire@chengming.ai&gt;</span></div>
                <div className="flex gap-2"><span className="w-12 shrink-0 text-muted">收件人</span><span className="font-medium text-ink">{selectedCandidate?.email ?? "candidate@example.com"}</span></div>
                <div className="flex gap-2"><span className="w-12 shrink-0 text-muted">主题</span><span className="font-medium text-ink">{renderInvite(inviteTemplate.subject)}</span></div>
              </div>
              <div className="whitespace-pre-wrap bg-white px-5 py-4 text-[12.5px] leading-6 text-ink-soft">{renderInvite(inviteTemplate.emailBody)}</div>
            </div>
          ) : (
            <div className="mx-auto max-w-[420px]">
              <div className="rounded-[22px] border border-line bg-[#f7f8f4] p-3">
                <div className="rounded-[16px] bg-white px-4 py-3 text-[12.5px] leading-6 text-ink-soft shadow-sm">{renderInvite(inviteTemplate.smsBody)}</div>
                <div className="mt-2 flex items-center justify-between px-1 text-[10.5px] text-muted"><span>澄明科技</span><span>{renderInvite(inviteTemplate.smsBody).length} / 70 字</span></div>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted">实际短信会按运营商规则拆分计费，建议关键信息保持在前 70 字内。</p>
            </div>
          )}
        </DialogBody>
        <DialogFooter><Button variant="secondary" onClick={() => setPreviewChannel(null)}>关闭</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
