"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  CalendarClock,
  Check,
  Link2,
  MapPin,
  Phone,
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
  const { candidates, jobs, employees, addInterview } = useApp();
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
    }
  }, [open, defaultCandidateId, defaultJobId, candidates, jobs]);

  const job = jobs.find((j) => j.id === jobId);
  const scopedCandidates = useMemo(() => (jobId ? candidates.filter((c) => c.jobId === jobId) : candidates), [candidates, jobId]);
  const selectedCandidate = candidates.find((c) => c.id === candidateId);
  const interviewers = employees.filter((e) => ["emp-3", "emp-7", "emp-8", "emp-9", "emp-1", "emp-2", "emp-4", "emp-5", "emp-6", "emp-11"].includes(e.id));

  const submit = () => {
    if (!candidateId) {
      toast.error("请选择候选人");
      return;
    }
    if (!date || !start) {
      toast.error("请选择面试时间");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0">
        <DialogHeader title="安排面试" description="选择面试形式与时间，系统会自动发送邀约并同步给面试官。" icon={<CalendarClock />} />
        <DialogBody className="space-y-4">
          <div className="rounded-xl border border-line bg-[#fafbf8] p-3">
            <div className="flex items-center gap-2 text-[10.5px] text-muted">
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
                  <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", type === t.value ? "text-pine" : "text-ink-soft")}>
                    <span className="[&_svg]:size-3.5">{t.icon}</span> {t.label}
                  </div>
                  <div className="mt-1 text-[8.5px] leading-4 text-muted">{t.desc}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="开始时间" required><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="时长">
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[["30", "30 分钟"], ["45", "45 分钟"], ["60", "60 分钟"], ["90", "90 分钟"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="会议 / 地点">
              <div className="flex h-10 items-center gap-1.5 rounded-[10px] border border-line bg-[#f7f8f4] px-3 text-[10px] text-muted">
                {type === "onsite" ? <><MapPin className="size-3" /> 望京 SOHO T3 18F</> : type === "phone" ? <><Phone className="size-3" /> 使用候选人手机号</> : <><Link2 className="size-3" /> 自动生成会议链接</>}
              </div>
            </Field>
          </div>

          <Field label="面试官" hint={`已选择 ${interviewerIds.length} 人`}>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {interviewers.map((e) => {
                const checked = interviewerIds.includes(e.id);
                return (
                  <label key={e.id} className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors", checked ? "border-pine/40 bg-pine-soft/40" : "border-line hover:bg-[#fafbf8]")}>
                    <Checkbox checked={checked} onCheckedChange={(v) => setInterviewerIds((prev) => v ? [...prev, e.id] : prev.filter((id) => id !== e.id))} />
                    <Avatar name={e.name} size={22} />
                    <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink">{e.name}</span>
                    <span className="text-[8.5px] text-muted">{e.title.slice(0, 4)}</span>
                  </label>
                );
              })}
            </div>
          </Field>

          <Field label="面试说明" hint="将同步给面试官">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：重点验证候选人的 B 端产品判断与跨团队推动经验。" className="min-h-[72px]" />
          </Field>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-[#f7f8f4] p-3">
            <Checkbox checked={sendInvite} onCheckedChange={(v) => setSendInvite(!!v)} className="mt-0.5" />
            <span>
              <span className="block text-[11px] font-medium text-ink">自动发送面试邀约</span>
              <span className="mt-0.5 block text-[9.5px] leading-4 text-muted">使用「面试邀约」模板，通过邮件与短信通知候选人。</span>
            </span>
          </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}><Check /> 确认安排</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
