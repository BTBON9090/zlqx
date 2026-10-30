"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  CircleAlert,
  Cloud,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe,
  HardDrive,
  KeyRound,
  LockKeyhole,
  Mail,
  Plug,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, InfoLine } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch, Checkbox } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const channels = [
  { id: "boss", name: "Boss 直聘", desc: "同步职位与候选人简历", color: "#4878c9", connected: true },
  { id: "liepin", name: "猎聘", desc: "同步高端职位与猎头候选人", color: "#c25b3c", connected: true },
  { id: "zhaopin", name: "智联招聘", desc: "同步职位与校招简历", color: "#3b7a67", connected: false },
  { id: "51job", name: "前程无忧", desc: "同步职位与简历", color: "#c48a35", connected: false },
  { id: "wecom", name: "企业微信", desc: "面试提醒与候选人沟通", color: "#2f7fd1", connected: true },
  { id: "feishu", name: "飞书", desc: "面试日历与审批同步", color: "#3d6edb", connected: false },
  { id: "dingtalk", name: "钉钉", desc: "审批与组织架构同步", color: "#2f6fd1", connected: false },
];

export default function SettingsPage() {
  const { settings, updateCompany, updateSettings } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [form, setForm] = useState(settings.company);
  const [recruit, setRecruit] = useState(settings.recruit);
  const [upload, setUpload] = useState(settings.upload);
  const [connected, setConnected] = useState<Record<string, boolean>>(Object.fromEntries(channels.map((c) => [c.id, c.connected])));
  const [verifyContact, setVerifyContact] = useState("林岚");
  const [verifyPhone, setVerifyPhone] = useState("138 1033 6291");
  const [verifyFile, setVerifyFile] = useState("招聘业务授权书.pdf");

  const saveCompany = () => {
    updateCompany(form);
    setEditOpen(false);
    toast.success("企业信息已更新");
  };

  const submitVerify = () => {
    updateCompany({ recruitAuthorized: true });
    setVerifyOpen(false);
    toast.success("招聘业务授权已提交，预计 1 个工作日内完成审核");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="企业"
        title="企业设置"
        description="维护企业身份、招聘偏好、渠道授权与文件存储策略。认证信息仅管理员可见。"
        actions={<Button variant="secondary" onClick={() => { updateCompany(form); updateSettings({ recruit, upload }); toast.success("企业设置已保存"); }}><Check /> 保存变更</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface flex items-center gap-3 p-4 lg:col-span-2">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e7ede4] text-[18px] font-semibold text-pine">澄</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="text-[14px] font-semibold text-ink">{settings.company.name}</span><Badge tone="pine" dot>企业已认证</Badge></div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-muted"><span>{settings.company.industry}</span><span className="size-0.5 rounded-full bg-muted" /><span>{settings.company.size}</span><span className="size-0.5 rounded-full bg-muted" /><span>{settings.company.stage}</span></div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => { setForm(settings.company); setEditOpen(true); }}><Settings2 /> 编辑资料</Button>
        </div>
        <div className="surface flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-soft text-[#8a6a24]"><ShieldCheck className="size-4.5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] text-muted">认证进度</div>
            <div className="mt-0.5 text-[13.5px] font-semibold text-ink">2 / 3 项已完成</div>
            <Progress value={2} max={3} className="mt-1.5 h-1" />
          </div>
          {!settings.company.recruitAuthorized ? <button onClick={() => setVerifyOpen(true)} className="text-[12.5px] font-medium text-pine hover:underline">去认证</button> : null}
        </div>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company"><Building2 className="size-3.5" /> 企业信息</TabsTrigger>
          <TabsTrigger value="recruit"><Settings2 className="size-3.5" /> 招聘设置</TabsTrigger>
          <TabsTrigger value="auth"><Plug className="size-3.5" /> 业务授权</TabsTrigger>
          <TabsTrigger value="upload"><Cloud className="size-3.5" /> 上传与存储</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4 space-y-4">
          <div className="surface p-5 md:p-6">
            <div className="flex items-start justify-between gap-3"><SectionTitle title="基础信息" description="展示在企业主页与候选人投递页" icon={<Building2 />} /><Button size="sm" variant="secondary" onClick={() => { setForm(settings.company); setEditOpen(true); }}>编辑</Button></div>
            <div className="mt-5 grid gap-x-10 sm:grid-cols-2">
              <InfoLine label="企业简称">{settings.company.shortName}</InfoLine>
              <InfoLine label="企业编号">{settings.company.code}</InfoLine>
              <InfoLine label="所属行业">{settings.company.industry}</InfoLine>
              <InfoLine label="企业规模">{settings.company.size}</InfoLine>
              <InfoLine label="融资阶段">{settings.company.stage}</InfoLine>
              <InfoLine label="公司官网"><a href={`https://${settings.company.website}`} target="_blank" className="flex items-center gap-1 text-pine hover:underline">{settings.company.website} <ExternalLink className="size-3" /></a></InfoLine>
              <InfoLine label="公司地址">{settings.company.address}</InfoLine>
              <InfoLine label="招聘负责人">林岚 · 招聘负责人</InfoLine>
            </div>
            <div className="mt-2 border-t border-line pt-3">
              <div className="text-[12.5px] text-muted">企业介绍</div>
              <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-ink-soft">{settings.company.intro}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-pine-soft text-pine"><FileCheck2 className="size-4" /></div><div><div className="text-[13.5px] font-semibold text-ink">企业工商登记信息</div><div className="mt-0.5 text-[12px] text-muted">统一社会信用代码与营业执照</div></div></div>
                <Badge tone="pine" dot>已认证</Badge>
              </div>
              <div className="mt-4 rounded-xl bg-[#fafbf8] p-3.5 text-[12.5px]">
                <div className="flex justify-between py-1"><span className="text-muted">统一社会信用代码</span><span className="font-medium text-ink">{settings.company.code}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted">法定代表人</span><span className="font-medium text-ink">顾清</span></div>
                <div className="flex justify-between py-1"><span className="text-muted">认证时间</span><span className="font-medium text-ink">2024-06-18</span></div>
                <div className="flex justify-between py-1"><span className="text-muted">有效期至</span><span className="font-medium text-ink">长期</span></div>
              </div>
              <button onClick={() => toast.info("认证材料由管理员在认证详情中查看")} className="mt-3 flex items-center gap-1 text-[12px] font-medium text-pine hover:underline">查看认证材料 <ArrowUpRight className="size-3" /></button>
            </div>
            <div className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3"><div className={cn("flex size-9 items-center justify-center rounded-xl", settings.company.recruitAuthorized ? "bg-pine-soft text-pine" : "bg-amber-soft text-[#8a6a24]")}><ShieldCheck className="size-4" /></div><div><div className="text-[13.5px] font-semibold text-ink">招聘业务授权</div><div className="mt-0.5 text-[12px] text-muted">用于发布职位、发送面试邀约与 Offer</div></div></div>
                <Badge tone={settings.company.recruitAuthorized ? "pine" : "amber"} dot>{settings.company.recruitAuthorized ? "已认证" : "待认证"}</Badge>
              </div>
              <div className="mt-4 rounded-xl bg-[#fafbf8] p-3.5 text-[12.5px] leading-5 text-muted">
                {settings.company.recruitAuthorized ? "招聘业务授权已生效。企业可以发布职位、向候选人发送消息并发放 Offer。" : "完成招聘业务授权后，企业才能发布职位并向候选人发送面试邀约与 Offer。授权书需加盖企业公章。"}
              </div>
              <Button size="sm" className="mt-3" variant={settings.company.recruitAuthorized ? "secondary" : "primary"} onClick={() => setVerifyOpen(true)}>{settings.company.recruitAuthorized ? "查看授权信息" : "前往认证"}</Button>
            </div>
          </div>

          <div className="surface p-5">
            <SectionTitle title="企业认证流程" description="完成认证后可解锁全部招聘能力" icon={<ShieldCheck />} />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["企业基本信息", "已完成", "2024-06-12", true],
                ["工商登记认证", "已完成", "2024-06-18", true],
                ["招聘业务授权", settings.company.recruitAuthorized ? "已完成" : "待认证", settings.company.recruitAuthorized ? "2026-10-30" : "预计 1 个工作日", !!settings.company.recruitAuthorized],
              ].map(([title, status, date, done], i) => (
                <div key={String(title)} className={cn("rounded-xl border p-4", done ? "border-pine/15 bg-pine-soft/25" : "border-amber/20 bg-amber-soft/25")}>
                  <div className="flex items-center justify-between"><span className="flex size-6 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-pine">{done ? <Check className="size-3" /> : i + 1}</span><span className={cn("rounded px-1.5 py-0.5 text-[11.5px]", done ? "bg-pine text-white" : "bg-amber text-white")}>{status}</span></div>
                  <div className="mt-2 text-[13px] font-medium text-ink">{title}</div>
                  <div className="mt-0.5 text-[12px] text-muted">{date}</div>
                  {!done ? <button onClick={() => setVerifyOpen(true)} className="mt-2 text-[12px] font-medium text-pine hover:underline">继续认证</button> : null}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recruit" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <div className="surface p-5 md:p-6">
              <SectionTitle title="招聘偏好" description="这些设置会应用于全公司的招聘流程" icon={<Settings2 />} />
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="发件人名称"><Input value={recruit.senderName} onChange={(e) => setRecruit({ ...recruit, senderName: e.target.value })} /></Field>
                <Field label="发件邮箱"><Input type="email" value={recruit.senderEmail} onChange={(e) => setRecruit({ ...recruit, senderEmail: e.target.value })} /></Field>
                <Field label="默认面试时长"><Select value={String(recruit.defaultDuration)} onValueChange={(v) => setRecruit({ ...recruit, defaultDuration: Number(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[30, 45, 60, 90].map((n) => <SelectItem key={n} value={String(n)}>{n} 分钟</SelectItem>)}</SelectContent></Select></Field>
                <Field label="自动归档天数"><Input type="number" value={recruit.autoArchiveDays} onChange={(e) => setRecruit({ ...recruit, autoArchiveDays: Number(e.target.value) })} /></Field>
              </div>
              <div className="mt-6 space-y-3 border-t border-line pt-5">
                {[
                  { key: "aiScreening" as const, title: "AI 简历初筛", desc: "自动解析新简历并给出岗位匹配度与风险提示。" },
                  { key: "requireFeedback" as const, title: "面试反馈必填", desc: "面试官需在面试结束后 24 小时内提交反馈，否则提醒负责人。" },
                  { key: "offerApproval" as const, title: "Offer 审批流", desc: "所有 Offer 需经过部门负责人与财务审批后才能发送。" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 rounded-xl border border-line p-3.5">
                    <div><div className="text-[13px] font-medium text-ink">{item.title}</div><div className="mt-0.5 text-[12px] leading-5 text-muted">{item.desc}</div></div>
                    <Switch checked={recruit[item.key]} onCheckedChange={(v) => setRecruit({ ...recruit, [item.key]: v })} />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end"><Button onClick={() => { updateSettings({ recruit }); toast.success("招聘设置已保存"); }}><Check /> 保存设置</Button></div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[18px] bg-pine-deep p-5 text-white">
                <div className="flex items-center gap-1.5 text-[12.5px] text-[#a9c3b5]"><Sparkles className="size-3 text-[#f2b3a1]" /> 小聘建议</div>
                <p className="mt-2 text-[12.5px] leading-5 text-[#b7cbbf]">你的团队平均面试反馈时间为 31 小时。将反馈时限设为 24 小时，可以让人均招聘周期缩短约 2.4 天。</p>
                <button onClick={() => setRecruit({ ...recruit, requireFeedback: true })} className="mt-3 text-[12px] font-medium text-[#f0b09d] hover:text-white">启用 24 小时反馈提醒</button>
              </div>
              <div className="surface p-5">
                <SectionTitle title="招聘团队" description="拥有招聘权限的成员" icon={<Users />} />
                <div className="mt-3 space-y-2">
                  {[["林岚", "超级管理员"], ["温梨", "HRBP"], ["苏晚", "招聘专员"]].map(([name, role]) => (
                    <div key={name} className="flex items-center justify-between rounded-lg bg-[#fafbf8] px-3 py-2 text-[12.5px]"><span className="text-ink">{name}</span><span className="text-muted">{role}</span></div>
                  ))}
                </div>
                <Link href="/roles" className="mt-3 flex items-center gap-1 text-[12px] font-medium text-pine hover:underline">管理角色权限 <ArrowUpRight className="size-3" /></Link>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="auth" className="mt-4 space-y-4">
          <div className="surface p-5 md:p-6">
            <SectionTitle title="招聘渠道授权" description="连接招聘渠道，自动同步职位与候选人简历" icon={<Plug />} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {channels.map((ch) => (
                <div key={ch.id} className="flex items-start gap-3 rounded-xl border border-line p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-semibold text-white" style={{ background: ch.color }}>{ch.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-medium text-ink">{ch.name}</span><Switch checked={connected[ch.id]} onCheckedChange={(v) => { setConnected((prev) => ({ ...prev, [ch.id]: v })); toast.success(v ? `${ch.name} 已连接` : `${ch.name} 已断开`); }} /></div>
                    <div className="mt-0.5 text-[12px] leading-4 text-muted">{ch.desc}</div>
                    <div className="mt-1.5 flex items-center gap-1 text-[11.5px]">{connected[ch.id] ? <><span className="size-1.5 rounded-full bg-[#6fae8c]" /><span className="text-pine">已连接</span></> : <span className="text-muted">未连接</span>}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface p-5">
              <SectionTitle title="API 访问" description="用于企业自有系统对接" icon={<KeyRound />} />
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-[#fafbf8] px-3 py-2.5"><code className="min-w-0 flex-1 truncate text-[12.5px] text-ink-soft">wl_live_sk_7f3a...c92e</code><button onClick={() => { navigator.clipboard?.writeText("wl_live_sk_7f3a...c92e"); toast.success("API Key 已复制"); }} className="text-muted hover:text-ink"><Copy className="size-3.5" /></button></div>
              <div className="mt-2 text-[12px] leading-5 text-muted">请勿在客户端暴露 API Key。最近使用：今天 09:42 · 招聘数据同步服务</div>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => toast.info("API 文档即将开放")}><FileText /> 查看 API 文档</Button>
            </div>
            <div className="surface p-5">
              <SectionTitle title="Webhook" description="招聘事件推送到企业系统" icon={<Globe />} />
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-[#fafbf8] px-3 py-2.5"><code className="min-w-0 flex-1 truncate text-[12.5px] text-ink-soft">https://api.chengming.ai/hooks/recruit</code><span className="rounded bg-pine-soft px-1.5 py-0.5 text-[11.5px] text-pine">已启用</span></div>
              <div className="mt-2 flex flex-wrap gap-1">{["candidate.created", "interview.scheduled", "offer.sent"].map((e) => <span key={e} className="rounded bg-[#eef1ec] px-1.5 py-1 font-mono text-[11.5px] text-muted">{e}</span>)}</div>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => toast.success("测试事件已发送")}><Plug /> 发送测试事件</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <div className="surface p-5 md:p-6">
              <SectionTitle title="文件上传" description="简历、附件与认证材料的上传限制" icon={<Upload />} />
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="单文件大小上限"><Select value={String(upload.maxSize)} onValueChange={(v) => setUpload({ ...upload, maxSize: Number(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[10, 20, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n} MB</SelectItem>)}</SelectContent></Select></Field>
                <Field label="文件保留天数"><Input type="number" value={upload.retentionDays} onChange={(e) => setUpload({ ...upload, retentionDays: Number(e.target.value) })} /></Field>
                <Field label="允许的格式" className="sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {["PDF", "DOCX", "DOC", "JPG", "PNG"].map((f) => <label key={f} className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px]", upload.formats.includes(f) ? "border-pine/30 bg-pine-soft/50 text-pine" : "border-line text-muted")}><Checkbox checked={upload.formats.includes(f)} onCheckedChange={(v) => setUpload({ ...upload, formats: v ? [...upload.formats, f] : upload.formats.filter((x) => x !== f) })} />{f}</label>)}
                  </div>
                </Field>
              </div>
              <div className="mt-6 flex justify-end"><Button onClick={() => { updateSettings({ upload }); toast.success("上传设置已保存"); }}><Check /> 保存设置</Button></div>
            </div>
            <div className="space-y-4">
              <div className="surface p-5">
                <SectionTitle title="存储空间" description="简历与附件占用" icon={<HardDrive />} />
                <div className="mt-4 flex items-baseline justify-between"><span className="num text-[24px] font-semibold text-ink">{upload.used.toFixed(1)} GB</span><span className="text-[12.5px] text-muted">/ {upload.quota} GB</span></div>
                <Progress value={upload.used} max={upload.quota} className="mt-3 h-2" />
                <div className="mt-2 flex justify-between text-[12px] text-muted"><span>已使用 {Math.round((upload.used / upload.quota) * 100)}%</span><span>企业版配额</span></div>
                <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => toast.success("已清理 1.2 GB 过期文件")}><Cloud /> 清理过期文件</Button>
              </div>
              <div className="surface p-5">
                <SectionTitle title="安全与合规" icon={<LockKeyhole />} />
                <div className="mt-3 space-y-2 text-[12px] text-muted">
                  <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-pine" /> 文件加密存储（AES-256）</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-pine" /> 仅授权成员可下载附件</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-pine" /> 操作日志保留 180 天</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent size="lg" className="p-0">
          <DialogHeader title="编辑企业信息" description="这些信息会展示在企业主页与候选人投递页。" icon={<Building2 />} />
          <DialogBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="企业全称" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="企业简称"><Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} /></Field>
              <Field label="所属行业"><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
              <Field label="企业规模"><Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["20–99 人", "100–499 人", "500–999 人", "1000 人以上"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="融资阶段"><Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["天使轮", "A 轮", "B 轮", "C 轮", "D 轮及以上", "已上市"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="公司地址" className="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
              <Field label="公司官网" className="sm:col-span-2"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
              <Field label="企业介绍" className="sm:col-span-2"><Textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className="min-h-[100px]" /></Field>
            </div>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={saveCompany}><Check /> 保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent size="md" className="p-0">
          <DialogHeader title="招聘业务授权" description="上传加盖公章的授权书，审核通过后即可发布职位。" icon={<ShieldCheck />} />
          <DialogBody className="space-y-4">
            <div className="rounded-xl bg-amber-soft/50 p-3.5 text-[12.5px] leading-5 text-[#7a5412]">
              {settings.company.recruitAuthorized ? "招聘业务授权已通过。如需更新授权书，可重新上传。" : "请上传企业营业执照副本与招聘业务授权书。文件需加盖企业公章，支持 PDF / JPG / PNG。"}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="授权联系人"><Input value={verifyContact} onChange={(e) => setVerifyContact(e.target.value)} /></Field>
              <Field label="联系电话"><Input value={verifyPhone} onChange={(e) => setVerifyPhone(e.target.value)} /></Field>
            </div>
            <Field label="授权书">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-[#fafbf8] p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-signal-soft text-signal"><FileText className="size-4" /></span>
                <div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium text-ink">{verifyFile}</div><div className="mt-0.5 text-[12px] text-muted">PDF · 1.8 MB · 已上传</div></div>
                <button onClick={() => { setVerifyFile(""); toast.info("请选择新的授权书"); }} className="text-[12px] text-muted hover:text-ink">替换</button>
              </div>
            </Field>
            <div className="flex items-start gap-2 rounded-lg bg-[#fafbf8] p-3 text-[12px] leading-5 text-muted"><CircleAlert className="mt-0.5 size-3 shrink-0" /> 提交后预计 1 个工作日内完成审核。审核结果会通过站内信与邮件通知。</div>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setVerifyOpen(false)}>取消</Button><Button onClick={submitVerify}><Check /> 提交认证</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
