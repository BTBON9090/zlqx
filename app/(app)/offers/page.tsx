"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  FileText,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet } from "@/components/ui/dialog";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { cn, offerStatusMeta } from "@/lib/utils";
import type { Offer } from "@/lib/types";

function NewOfferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { candidates, jobs, employees, addOffer } = useApp();
  const eligible = candidates.filter((c) => c.stage === "interview" || c.stage === "offer");
  const [candidateId, setCandidateId] = useState(eligible[0]?.id ?? "");
  const candidate = candidates.find((c) => c.id === candidateId);
  const [salary, setSalary] = useState("30K · 14薪");
  const [bonus, setBonus] = useState("年度绩效奖金 0–3 个月");
  const [startDate, setStartDate] = useState("2026-11-23");
  const [deadline, setDeadline] = useState("2026-11-10");
  const [approverId, setApproverId] = useState("emp-3");
  const [note, setNote] = useState("");

  const submit = () => {
    if (!candidate) {
      toast.error("请选择候选人");
      return;
    }
    addOffer({ candidateId, jobId: candidate.jobId, salary, bonus, startDate, deadline, approverId, note });
    toast.success("Offer 已创建，等待审批");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="创建 Offer" description="选择候选人并填写薪资方案，提交后进入审批流。" icon={<FileText />} />
        <DialogBody className="space-y-4">
          <Field label="候选人" required>
            <Select value={candidateId} onValueChange={setCandidateId}>
              <SelectTrigger><SelectValue placeholder="选择候选人" /></SelectTrigger>
              <SelectContent>{eligible.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {jobs.find((j) => j.id === c.jobId)?.title}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="薪资方案" required className="sm:col-span-2"><Input value={salary} onChange={(e) => setSalary(e.target.value)} /></Field>
            <Field label="奖金 / 补贴" className="sm:col-span-2"><Input value={bonus} onChange={(e) => setBonus(e.target.value)} /></Field>
            <Field label="入职日期"><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
            <Field label="Offer 有效期"><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
            <Field label="审批人" className="sm:col-span-2">
              <Select value={approverId} onValueChange={setApproverId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{employees.filter((e) => ["emp-3", "emp-5", "emp-4"].includes(e.id)).map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="备注" className="sm:col-span-2"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="给审批人的补充说明…" className="min-h-[64px]" /></Field>
          </div>
        </DialogBody>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={submit}><Check /> 创建并提交审批</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OfferDetail({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  const { candidates, jobs, employees, updateOffer } = useApp();
  if (!offer) return <Sheet open={false} onOpenChange={onClose}><div /></Sheet>;
  const candidate = candidates.find((c) => c.id === offer.candidateId);
  const job = jobs.find((j) => j.id === offer.jobId);
  const approver = employees.find((e) => e.id === offer.approverId);
  const status = offerStatusMeta[offer.status];

  const approve = () => {
    updateOffer(offer.id, { status: "sent" });
    toast.success("Offer 审批通过，已发送给候选人");
    onClose();
  };

  return (
    <Sheet open={!!offer} onOpenChange={(v) => !v && onClose()} width="620px">
      <div className="flex h-full flex-col bg-paper">
        <div className="border-b border-line bg-surface px-6 py-6">
          <div className="pr-8">
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium", status.tone)}><span className={cn("size-1.5 rounded-full", status.dot)} />{status.label}</span>
              <span className="text-[10px] text-muted">创建于 {offer.createdAt}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={candidate?.name ?? "候选人"} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[18px] font-semibold tracking-[-0.03em] text-ink">{candidate?.name}</div>
                <div className="mt-0.5 text-[10.5px] text-muted">{job?.title} · {job?.location}</div>
              </div>
              <div className="text-right"><div className="text-[9px] text-muted">薪资方案</div><div className="mt-0.5 text-[14px] font-semibold text-pine">{offer.salary}</div></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {offer.status === "approving" || offer.status === "draft" ? (
                <>
                  <Button size="sm" onClick={approve}><Check /> 审批通过并发送</Button>
                  <Button size="sm" variant="secondary" onClick={() => { updateOffer(offer.id, { status: "declined" }); toast.success("Offer 已拒绝"); onClose(); }}><X /> 拒绝</Button>
                </>
              ) : null}
              {offer.status === "sent" ? <Button size="sm" onClick={() => { updateOffer(offer.id, { status: "accepted" }); toast.success("已标记为接受"); onClose(); }}><ThumbsUp /> 标记已接受</Button> : null}
              {offer.status === "accepted" ? <Badge tone="pine" dot>候选人已接受 Offer</Badge> : null}
              <Button size="sm" variant="ghost" onClick={() => toast.success("Offer 邮件已发送")}><Send /> 重发 Offer 邮件</Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <div className="rounded-[18px] bg-pine-deep p-5 text-white">
            <div className="flex items-center gap-1.5 text-[10px] text-[#a9c3b5]"><Sparkles className="size-3 text-[#f2b3a1]" /> Offer 摘要</div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-[10.5px]">
              {[["基本薪资", offer.salary.split(" · ")[0]], ["奖金 / 补贴", offer.bonus], ["入职日期", offer.startDate], ["有效期至", offer.deadline]].map(([k, v]) => (
                <div key={k}><div className="text-[9px] text-[#8fae9f]">{k}</div><div className="mt-1 font-medium text-white">{v}</div></div>
              ))}
            </div>
          </div>
          <div className="surface mt-4 p-5">
            <SectionTitle title="审批流程" description={`当前审批人：${approver?.name}`} icon={<Timer />} />
            <div className="mt-4 space-y-0">
              {[["招聘负责人", "林岚", "已提交"], ["部门负责人", approver?.name ?? "待分配", offer.status === "approving" ? "审批中" : "已通过"], ["财务审批", "顾清", offer.status === "approving" ? "待审批" : "已通过"], ["Offer 发放", "系统自动", offer.status === "sent" || offer.status === "accepted" ? "已发送" : "待发送"]].map(([role, name, st], i) => (
                <div key={role} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className={cn("flex size-5 items-center justify-center rounded-full text-[8px] font-semibold", i === 0 ? "bg-pine text-white" : st === "已通过" || st === "已发送" ? "bg-pine-soft text-pine" : st === "审批中" ? "bg-amber-soft text-[#8a6a24]" : "bg-[#eef1ec] text-muted")}>{i === 0 ? <Check className="size-2.5" /> : i + 1}</span>
                    {i < 3 ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
                  </div>
                  <div className="flex-1 -mt-0.5"><div className="flex items-center justify-between gap-2"><span className="text-[10.5px] font-medium text-ink">{role} · {name}</span><span className={cn("text-[9px]", st === "审批中" ? "text-[#8a6a24]" : "text-muted")}>{st}</span></div></div>
                </div>
              ))}
            </div>
          </div>
          {offer.note ? <div className="mt-4 rounded-xl bg-[#fafbf8] p-4 text-[10.5px] leading-5 text-muted">{offer.note}</div> : null}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-signal-soft/50 p-3.5 text-[9.5px] leading-5 text-[#8a4a35]"><CircleAlert className="mt-0.5 size-3 shrink-0" /> Offer 一经发送，候选人将通过邮件收到正式 Offer，所有变更会记录在审计日志中。</div>
        </div>
      </div>
    </Sheet>
  );
}

export default function OffersPage() {
  const { offers, candidates, jobs, employees, updateOffer } = useApp();
  const [tab, setTab] = useState<"all" | Offer["status"]>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Offer | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => offers.filter((o) => {
    if (tab !== "all" && o.status !== tab) return false;
    if (query.trim()) {
      const c = candidates.find((x) => x.id === o.candidateId);
      return `${c?.name}${o.salary}`.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  }), [offers, tab, query, candidates]);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="招聘业务"
        title="Offer 管理"
        description="从一个薪资方案，到候选人正式接受：审批、发放与入职进度都在这里。"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus /> 创建 Offer</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["本月 Offer", offers.length, "份", "较上月 +2"],
          ["待审批", offers.filter((o) => o.status === "approving").length, "份", "平均 1.2 天"],
          ["已接受", offers.filter((o) => o.status === "accepted").length, "份", "等待入职"],
          ["接受率", "86", "%", "近 90 天"],
        ].map(([label, value, suffix, note]) => (
          <div key={String(label)} className="surface p-4"><div className="text-[10.5px] text-muted">{label}</div><div className="mt-1 flex items-baseline gap-1"><span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span><span className="text-[10px] text-muted">{suffix}</span></div><div className="mt-1 text-[9px] text-muted">{note}</div></div>
        ))}
      </div>

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pt-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="border-b-0">
              <TabsTrigger value="all">全部 <span className="num text-[10px] text-muted">{offers.length}</span></TabsTrigger>
              <TabsTrigger value="approving">审批中</TabsTrigger>
              <TabsTrigger value="sent">已发送</TabsTrigger>
              <TabsTrigger value="accepted">已接受</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2 pb-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索候选人" className="h-8 w-[180px] rounded-lg border border-line bg-[#fafbf8] px-2.5 text-[10.5px] outline-none focus:border-pine/50" />
            <Button size="sm" variant="secondary" asChild><Link href="/messages">Offer 模板</Link></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead><tr className="border-b border-line bg-[#fafbf8] text-[10px] text-muted">
              <th className="min-w-[190px] py-2.5 pl-5 font-medium">候选人</th>
              <th className="min-w-[160px] py-2.5 pr-4 font-medium">职位</th>
              <th className="w-[150px] py-2.5 pr-4 font-medium">薪资方案</th>
              <th className="w-[90px] py-2.5 pr-4 font-medium">状态</th>
              <th className="w-[110px] py-2.5 pr-4 font-medium">审批人</th>
              <th className="w-[100px] py-2.5 pr-4 font-medium">入职日期</th>
              <th className="w-[100px] py-2.5 pr-4 font-medium">有效期</th>
              <th className="w-[120px] px-4 py-2.5 text-right font-medium">操作</th>
            </tr></thead>
            <tbody>
              {filtered.map((o) => {
                const c = candidates.find((x) => x.id === o.candidateId);
                const j = jobs.find((x) => x.id === o.jobId);
                const approver = employees.find((x) => x.id === o.approverId);
                const st = offerStatusMeta[o.status];
                return (
                  <tr key={o.id} className="group cursor-pointer border-b border-line/70 last:border-0 hover:bg-[#fafbf8]" onClick={() => setSelected(o)}>
                    <td className="py-3.5 pl-5 pr-4"><div className="flex items-center gap-2.5"><Avatar name={c?.name ?? "候选人"} size={30} /><div><div className="text-[11.5px] font-medium text-ink group-hover:text-pine">{c?.name}</div><div className="mt-0.5 text-[9px] text-muted">{c?.currentTitle}</div></div></div></td>
                    <td className="py-3.5 pr-4"><div className="text-[10.5px] text-ink-soft">{j?.title}</div><div className="mt-0.5 text-[9px] text-muted">{j?.location}</div></td>
                    <td className="py-3.5 pr-4"><div className="text-[10.5px] font-medium text-ink">{o.salary}</div><div className="mt-0.5 text-[9px] text-muted">{o.bonus}</div></td>
                    <td className="py-3.5 pr-4"><span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-medium", st.tone)}><span className={cn("size-1.5 rounded-full", st.dot)} />{st.label}</span></td>
                    <td className="py-3.5 pr-4"><span className="text-[10px] text-ink-soft">{approver?.name}</span></td>
                    <td className="py-3.5 pr-4 text-[10px] text-ink-soft">{o.startDate.slice(5)}</td>
                    <td className="py-3.5 pr-4 text-[10px] text-muted">{o.deadline.slice(5)}</td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {o.status === "approving" ? <Button size="sm" variant="soft" className="h-7 px-2 text-[10px]" onClick={() => { updateOffer(o.id, { status: "sent" }); toast.success("Offer 已审批并发送"); }}>审批</Button> : <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => setSelected(o)}>查看</Button>}
                        <button className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? <EmptyState icon={<FileText />} title="没有符合条件的 Offer" description="创建一份新的 Offer，或切换筛选条件。" action={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus /> 创建 Offer</Button>} /> : null}
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[10px] text-muted"><span>共 {filtered.length} 份 Offer</span><span>审批通过后自动发送邮件</span></div>
      </div>

      <div className="flex items-center justify-between px-1 text-[10px] text-muted">
        <span>Offer 模板与发送记录可在消息管理中统一维护。</span>
        <Link href="/messages" className="flex items-center gap-1 font-medium text-pine hover:underline">管理 Offer 模板 <ArrowUpRight className="size-3" /></Link>
      </div>

      <OfferDetail offer={selected} onClose={() => setSelected(null)} />
      <NewOfferDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
