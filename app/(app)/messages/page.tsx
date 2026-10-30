"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Check,
  CircleAlert,
  Copy,
  Eye,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput, Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch, Checkbox } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MessageTemplate } from "@/lib/types";

const scenarioOptions = ["面试邀约", "面试改期", "面试取消", "Offer", "入职", "简历投递"];
const channelLabel: Record<string, string> = { email: "邮件", sms: "短信", inapp: "站内信" };

function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template?: MessageTemplate | null;
}) {
  const { addTemplate, updateTemplate } = useApp();
  const [name, setName] = useState("");
  const [scenario, setScenario] = useState("面试邀约");
  const [audience, setAudience] = useState("候选人");
  const [channels, setChannels] = useState<("email" | "sms" | "inapp")[]>(["email", "sms"]);
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsBody, setSmsBody] = useState("");

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setScenario(template?.scenario ?? "面试邀约");
      setAudience(template?.audience ?? "候选人");
      setChannels(template?.channels ?? ["email", "sms"]);
      setSubject(template?.subject ?? "{{company}} 邀请你参加 {{job_title}} 面试");
      setEmailBody(template?.emailBody ?? "{{candidate_name}}，你好：\n\n邀请你参加 {{company}} 的 {{job_title}} 面试。\n\n时间：{{interview_time}}\n\n{{company}} 招聘团队");
      setSmsBody(template?.smsBody ?? "【{{company}}】{{candidate_name}} 你好，邀请你参加 {{job_title}} 面试，时间 {{interview_time}}。");
    }
  }, [open, template]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("请填写模板名称");
      return;
    }
    if (template) {
      updateTemplate(template.id, { name, scenario, audience, channels, subject, emailBody, smsBody });
      toast.success("模板已更新");
    } else {
      addTemplate({ name, scenario, audience, channels, subject, emailBody, smsBody });
      toast.success("模板已创建");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0">
        <DialogHeader title={template ? "编辑消息模板" : "新建消息模板"} description="使用变量让每条消息都带上下文。" icon={<MessageSquare />} />
        <DialogBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="模板名称" required className="sm:col-span-2"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：面试邀约 · 视频面试" /></Field>
            <Field label="业务场景"><Select value={scenario} onValueChange={setScenario}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{scenarioOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="发送对象"><Select value={audience} onValueChange={setAudience}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["候选人", "面试官", "HR", "全员"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="发送渠道" className="sm:col-span-2">
              <div className="flex h-10 items-center gap-4 rounded-[10px] border border-line px-3">
                {(["email", "sms", "inapp"] as const).map((ch) => (
                  <label key={ch} className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                    <Checkbox checked={channels.includes(ch)} onCheckedChange={(v) => setChannels((prev) => v ? [...prev, ch] : prev.filter((x) => x !== ch))} />
                    {channelLabel[ch]}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <Field label="邮件主题"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="邮件正文" hint="支持 {{candidate_name}} 等变量">
            <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="min-h-[150px] font-sans text-[13px] leading-6" />
          </Field>
          <Field label="短信正文" hint={`${smsBody.length}/140 字`}>
            <Textarea value={smsBody} onChange={(e) => setSmsBody(e.target.value)} className="min-h-[72px] text-[13px]" />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {["{{candidate_name}}", "{{company}}", "{{job_title}}", "{{interview_time}}", "{{meeting_link}}", "{{salary}}"].map((v) => (
              <button key={v} onClick={() => setEmailBody((prev) => `${prev}${v}`)} className="rounded border border-line bg-[#fafbf8] px-1.5 py-1 text-[12px] text-muted hover:border-pine/30 hover:text-pine">{v}</button>
            ))}
          </div>
        </DialogBody>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={submit}><Check /> {template ? "保存修改" : "创建模板"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplateSheet({ template, onClose }: { template: MessageTemplate | null; onClose: () => void }) {
  const { templates, toggleTemplate } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const live = template ? templates.find((t) => t.id === template.id) ?? template : null;
  if (!live) return <Sheet open={false} onOpenChange={onClose} title="消息模板"><div /></Sheet>;
  const sampleEmail = live.emailBody
    .replace(/\{\{candidate_name\}\}/g, "周予安")
    .replace(/\{\{company\}\}/g, "澄明科技")
    .replace(/\{\{job_title\}\}/g, "高级产品经理")
    .replace(/\{\{interview_time\}\}/g, "11月2日 14:00")
    .replace(/\{\{meeting_link\}\}/g, "meeting.chengming.ai/int-42")
    .replace(/\{\{round\}\}/g, "二面")
    .replace(/\{\{interviewer\}\}/g, "陈墨、林岚")
    .replace(/\{\{interview_type\}\}/g, "视频面试")
    .replace(/\{\{original_time\}\}/g, "10月30日 10:00")
    .replace(/\{\{new_time\}\}/g, "11月2日 14:00")
    .replace(/\{\{salary\}\}/g, "30K · 14薪")
    .replace(/\{\{start_date\}\}/g, "2026-11-23")
    .replace(/\{\{deadline\}\}/g, "2026-11-10")
    .replace(/\{\{location\}\}/g, "北京 · 望京 SOHO T3 18F");
  const sampleSms = live.smsBody
    .replace(/\{\{candidate_name\}\}/g, "周予安")
    .replace(/\{\{company\}\}/g, "澄明科技")
    .replace(/\{\{job_title\}\}/g, "高级产品经理")
    .replace(/\{\{interview_time\}\}/g, "11月2日 14:00")
    .replace(/\{\{meeting_link\}\}/g, "meeting.chengming.ai/int-42")
    .replace(/\{\{round\}\}/g, "二面");

  return (
    <>
      <Sheet open={!!template} onOpenChange={(v) => !v && onClose()} width="560px" title="消息模板">
        <div className="flex h-full flex-col bg-paper">
          <div className="border-b border-line bg-surface px-6 py-6">
            <div className="pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={live.enabled ? "pine" : "neutral"} dot>{live.enabled ? "启用中" : "已停用"}</Badge>
                <span className="text-[12.5px] text-muted">{live.code}</span>
              </div>
              <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.03em] text-ink">{live.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted"><span>{live.scenario}</span><span className="size-0.5 rounded-full bg-muted" /><span>发送给{live.audience}</span><span className="size-0.5 rounded-full bg-muted" /><span>更新于 {live.updatedAt}</span></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => setEditOpen(true)}><Pencil /> 编辑模板</Button>
              <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard?.writeText(live.emailBody); toast.success("模板内容已复制"); }}><Copy /> 复制内容</Button>
              <label className="ml-auto flex items-center gap-2 text-[12.5px] text-muted">启用 <Switch checked={live.enabled} onCheckedChange={() => { toggleTemplate(live.id); toast.success(live.enabled ? "模板已停用" : "模板已启用"); }} /></label>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 md:p-6">
            <SectionTitle title="消息预览" description="变量已替换为示例数据" icon={<Eye />} />
            <div className="mt-4 space-y-4">
              {live.channels.includes("email") ? (
                <div className="surface overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-line bg-[#fafbf8] px-4 py-2.5 text-[12px] text-muted"><Mail className="size-3" /> 邮件预览 · {live.subject.replace(/\{\{company\}\}/g, "澄明科技").replace(/\{\{job_title\}\}/g, "高级产品经理")}</div>
                  <div className="p-4 text-[12.5px] leading-6 text-ink-soft">
                    <div className="mb-3 flex items-center gap-2 border-b border-line pb-3"><span className="flex size-7 items-center justify-center rounded-lg bg-pine text-white"><Sparkles className="size-3" /></span><div><div className="text-[12.5px] font-medium text-ink">澄明科技招聘团队</div><div className="text-[11.5px] text-muted">talent@chengming.ai</div></div></div>
                    <p className="whitespace-pre-wrap">{sampleEmail}</p>
                  </div>
                </div>
              ) : null}
              {live.channels.includes("sms") ? (
                <div className="flex justify-center rounded-[18px] bg-[#e9ede6] p-5">
                  <div className="w-[260px] rounded-[28px] border-[6px] border-[#13201b] bg-[#fbfbf8] p-3 shadow-xl">
                    <div className="mx-auto mb-3 h-1 w-14 rounded-full bg-[#13201b]/20" />
                    <div className="flex items-center gap-2 border-b border-line pb-2"><div className="flex size-6 items-center justify-center rounded-full bg-pine text-[11.5px] text-white">澄</div><div><div className="text-[11.5px] font-medium">澄明科技</div><div className="text-[11.5px] text-muted">短信 · 现在</div></div></div>
                    <div className="mt-3 rounded-xl rounded-tl-sm bg-[#eef1ec] p-2.5 text-[11.5px] leading-4 text-ink-soft">{sampleSms}</div>
                    <div className="mt-2 text-center text-[11.5px] text-muted">已送达</div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="surface mt-4 p-4">
              <div className="text-[12.5px] font-medium text-ink">模板变量</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {live.variables.map((v) => <span key={v} className="rounded border border-line bg-[#fafbf8] px-1.5 py-1 font-mono text-[11.5px] text-muted">{`{{${v}}}`}</span>)}
              </div>
              <p className="mt-2 text-[12px] leading-4 text-muted">发送时会自动替换为候选人、职位与面试信息。缺失变量会导致发送失败。</p>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fafbf8] p-3.5 text-[12px] leading-5 text-muted"><CircleAlert className="mt-0.5 size-3 shrink-0" /> 修改模板后，仅影响后续发送，历史通知记录不会改变。</div>
          </div>
        </div>
      </Sheet>
      <TemplateEditorDialog open={editOpen} onOpenChange={setEditOpen} template={live} />
    </>
  );
}

export default function MessagesPage() {
  const { templates, notifications, jobs, candidates, employees, retryNotification, toggleTemplate, addTemplate } = useApp();
  const [tab, setTab] = useState("templates");
  const [query, setQuery] = useState("");
  const [scenario, setScenario] = useState("all");
  const [channel, setChannel] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [recordStatus, setRecordStatus] = useState("all");

  const filteredTemplates = useMemo(() => templates.filter((t) => {
    if (scenario !== "all" && t.scenario !== scenario) return false;
    if (channel !== "all" && !t.channels.includes(channel as "email" | "sms")) return false;
    if (query.trim() && !`${t.name}${t.code}${t.scenario}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [templates, scenario, channel, query]);

  const filteredRecords = useMemo(() => notifications.filter((n) => {
    if (recordStatus !== "all" && n.status !== recordStatus) return false;
    if (query.trim() && !`${n.recipient}${n.scenario}${n.templateId}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [notifications, recordStatus, query]);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="企业"
        title="消息管理"
        description="统一管理面试邀约、Offer 与入职通知：模板、渠道、发送状态与失败重试。"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus /> 新建模板</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["本月发送", "1,284", "条", "较上月 +12%"],
          ["送达率", "98.2", "%", "邮件 + 短信"],
          ["打开 / 阅读率", "64", "%", "打开邮件或阅读短信"],
          ["发送失败", String(notifications.filter((n) => n.status === "failed").length), "条", "需要人工处理"],
        ].map(([label, value, suffix, note]) => (
          <div key={label} className="surface p-4"><div className="text-[12.5px] text-muted">{label}</div><div className="mt-1 flex items-baseline gap-1"><span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span><span className="text-[12.5px] text-muted">{suffix}</span></div><div className="mt-1 text-[12px] text-muted">{note}</div></div>
        ))}
      </div>

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 pt-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="border-b-0">
              <TabsTrigger value="templates">消息模板 <span className="num text-[12.5px] text-muted">{templates.length}</span></TabsTrigger>
              <TabsTrigger value="records">通知记录 <span className="num text-[12.5px] text-muted">{notifications.length}</span></TabsTrigger>
            </TabsList>
          </Tabs>
          <Link href="/settings" className="flex items-center gap-1 pb-2 text-[12.5px] text-muted hover:text-pine">发送设置 <Settings2 className="size-3" /></Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#fcfcf9] px-4 py-3">
          <SearchInput placeholder={tab === "templates" ? "搜索模板名称或编号" : "搜索接收人或场景"} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-[230px]" />
          {tab === "templates" ? (
            <>
              <Select value={scenario} onValueChange={setScenario}><SelectTrigger className="w-[140px]"><SelectValue placeholder="全部场景" /></SelectTrigger><SelectContent><SelectItem value="all">全部场景</SelectItem>{scenarioOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              <Select value={channel} onValueChange={setChannel}><SelectTrigger className="w-[124px]"><SelectValue placeholder="全部渠道" /></SelectTrigger><SelectContent><SelectItem value="all">全部渠道</SelectItem><SelectItem value="email">邮件</SelectItem><SelectItem value="sms">短信</SelectItem><SelectItem value="inapp">站内信</SelectItem></SelectContent></Select>
            </>
          ) : (
            <Select value={recordStatus} onValueChange={setRecordStatus}><SelectTrigger className="w-[130px]"><SelectValue placeholder="全部状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="delivered">已送达</SelectItem><SelectItem value="read">已读</SelectItem><SelectItem value="failed">发送失败</SelectItem><SelectItem value="queued">待发送</SelectItem></SelectContent></Select>
          )}
          <span className="ml-auto text-[12.5px] text-muted">共 <span className="num font-medium text-ink">{tab === "templates" ? filteredTemplates.length : filteredRecords.length}</span> 条</span>
        </div>

        {tab === "templates" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead><tr className="border-b border-line bg-[#fafbf8] text-[12.5px] text-muted">
                <th className="min-w-[240px] py-2.5 pl-5 font-medium">模板名称</th>
                <th className="w-[110px] py-2.5 pr-4 font-medium">业务场景</th>
                <th className="w-[90px] py-2.5 pr-4 font-medium">发送对象</th>
                <th className="w-[130px] py-2.5 pr-4 font-medium">发送渠道</th>
                <th className="w-[88px] py-2.5 pr-4 font-medium">启用</th>
                <th className="w-[150px] py-2.5 pr-4 font-medium">更新 / 创建人</th>
                <th className="w-[100px] px-4 py-2.5 text-right font-medium">操作</th>
              </tr></thead>
              <tbody>
                {filteredTemplates.map((t) => (
                  <tr key={t.id} className="group cursor-pointer border-b border-line/70 last:border-0 hover:bg-[#fafbf8]" onClick={() => setSelectedTemplate(t)}>
                    <td className="py-3.5 pl-5 pr-4"><div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-lg bg-[#eef2ea] text-pine"><MessageSquare className="size-3.5" /></span><div><div className="text-[13px] font-medium text-ink group-hover:text-pine">{t.name}</div><div className="mt-0.5 text-[12px] text-muted">{t.code} · 更新于 {t.updatedAt.slice(5)}</div></div></div></td>
                    <td className="py-3.5 pr-4"><span className="rounded bg-[#f0f3ee] px-1.5 py-1 text-[12px] text-ink-soft">{t.scenario}</span></td>
                    <td className="py-3.5 pr-4 text-[12.5px] text-ink-soft">{t.audience}</td>
                    <td className="py-3.5 pr-4"><div className="flex items-center gap-1">{t.channels.map((ch) => <span key={ch} className={cn("flex items-center gap-1 rounded px-1.5 py-1 text-[11.5px]", ch === "email" ? "bg-info-soft text-info-ink" : ch === "sms" ? "bg-amber-soft text-amber-deep" : "bg-[#eef1ec] text-muted")}>{ch === "email" ? <Mail className="size-2.5" /> : ch === "sms" ? <Smartphone className="size-2.5" /> : <Bell className="size-2.5" />}{channelLabel[ch]}</span>)}</div></td>
                    <td className="py-3.5 pr-4" onClick={(e) => e.stopPropagation()}><Switch checked={t.enabled} onCheckedChange={() => { toggleTemplate(t.id); toast.success(t.enabled ? "模板已停用" : "模板已启用"); }} /></td>
                    <td className="py-3.5 pr-4"><div className="text-[12.5px] text-ink-soft">{t.creator}</div><div className="mt-0.5 text-[12px] text-muted">{t.updatedAt}</div></td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" className="h-7 px-2 text-[12.5px]" onClick={() => setSelectedTemplate(t)}><Eye /> 预览</Button><DropdownMenu><DropdownMenuTrigger asChild><button className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => setSelectedTemplate(t)}><Pencil /> 编辑模板</DropdownMenuItem><DropdownMenuItem onClick={() => { addTemplate({ name: `${t.name} 副本`, scenario: t.scenario, audience: t.audience, channels: t.channels, subject: t.subject, emailBody: t.emailBody, smsBody: t.smsBody }); toast.success("模板已复制"); }}><Copy /> 复制模板</DropdownMenuItem><DropdownMenuItem onClick={() => setCreateOpen(true)}><Plus /> 新建模板</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead><tr className="border-b border-line bg-[#fafbf8] text-[12.5px] text-muted">
                <th className="min-w-[170px] py-2.5 pl-5 font-medium">发送对象</th>
                <th className="w-[100px] py-2.5 pr-4 font-medium">业务场景</th>
                <th className="min-w-[150px] py-2.5 pr-4 font-medium">应聘职位</th>
                <th className="w-[150px] py-2.5 pr-4 font-medium">模板</th>
                <th className="w-[80px] py-2.5 pr-4 font-medium">渠道</th>
                <th className="w-[100px] py-2.5 pr-4 font-medium">状态</th>
                <th className="w-[130px] py-2.5 pr-4 font-medium">发送时间</th>
                <th className="w-[100px] py-2.5 pr-4 font-medium">操作人</th>
                <th className="w-[70px] px-4 py-2.5 text-right font-medium">操作</th>
              </tr></thead>
              <tbody>
                {filteredRecords.map((n) => {
                  const job = jobs.find((j) => j.id === n.jobId);
                  const template = templates.find((t) => t.id === n.templateId);
                  return (
                    <tr key={n.id} className="border-b border-line/70 last:border-0 hover:bg-[#fafbf8]">
                      <td className="py-3.5 pl-5 pr-4"><div className="text-[13px] font-medium text-ink">{n.recipient}</div><div className="mt-0.5 max-w-[170px] truncate text-[12px] text-muted">{n.recipientEmail}</div></td>
                      <td className="py-3.5 pr-4"><span className="rounded bg-[#f0f3ee] px-1.5 py-1 text-[12px] text-ink-soft">{n.scenario}</span></td>
                      <td className="py-3.5 pr-4 text-[12.5px] text-ink-soft">{job?.title}</td>
                      <td className="py-3.5 pr-4"><div className="max-w-[150px] truncate text-[12.5px] text-ink-soft">{template?.name}</div><div className="mt-0.5 text-[11.5px] text-muted">{template?.code}</div></td>
                      <td className="py-3.5 pr-4"><span className="flex items-center gap-1 text-[12px] text-muted">{n.channel === "email" ? <Mail className="size-3" /> : <Smartphone className="size-3" />}{n.channel === "email" ? "邮件" : "短信"}</span></td>
                      <td className="py-3.5 pr-4"><span className={cn("inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[12px]", n.status === "failed" ? "bg-signal-soft text-signal" : n.status === "read" ? "bg-pine-soft text-pine" : n.status === "delivered" ? "bg-[#eef1ec] text-ink-soft" : "bg-amber-soft text-amber-deep")}><span className="size-1.5 rounded-full bg-current" />{n.status === "failed" ? "发送失败" : n.status === "read" ? "已读" : n.status === "delivered" ? "已送达" : "待发送"}</span></td>
                      <td className="py-3.5 pr-4 text-[12px] text-muted">{n.sentAt}</td>
                      <td className="py-3.5 pr-4"><div className="flex items-center gap-1.5"><Avatar name={n.operator} size={20} /><span className="text-[12px] text-ink-soft">{n.operator}</span></div></td>
                      <td className="px-4 py-3.5 text-right">{n.status === "failed" ? <button onClick={() => { retryNotification(n.id); toast.success("已重新发送"); }} className="text-[12px] font-medium text-signal hover:underline">重发</button> : <button onClick={() => toast.info(n.error ?? "消息已送达")} className="text-[13.5px] text-muted hover:text-ink">···</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {((tab === "templates" && filteredTemplates.length === 0) || (tab === "records" && filteredRecords.length === 0)) ? <EmptyState icon={<MessageSquare />} title="没有匹配的消息" description="调整筛选条件，或新建一个模板。" /> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-[12.5px] text-muted">
          <span>发送失败会在 10 分钟后自动重试 1 次</span>
          <div className="flex gap-1"><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">‹</button><span className="flex size-7 items-center justify-center rounded-md bg-pine text-white">1</span><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">2</button><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">›</button></div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[12.5px] text-muted"><span>消息模板会自动应用于候选人流程推进与 Offer 发放。</span><Link href="/settings" className="flex items-center gap-1 font-medium text-pine hover:underline">配置发件邮箱 <ArrowUpRight className="size-3" /></Link></div>

      <TemplateSheet template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />
      <TemplateEditorDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
