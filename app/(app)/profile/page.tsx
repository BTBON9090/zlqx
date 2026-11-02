"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronRight,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, InfoLine } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApp } from "@/lib/store";
import { permissionModules } from "@/lib/data";
import { cn, employeeDepartmentIds } from "@/lib/utils";

export default function ProfilePage() {
  const { employees, roles, departments, updateEmployee, settings } = useApp();
  const me = employees.find((e) => e.id === "emp-1") ?? employees[0];
  const myRoles = roles.filter((r) => me.roleIds.includes(r.id));
  const deptNames = employeeDepartmentIds(me).map((id) => departments.find((d) => d.id === id)?.name).filter(Boolean);
  const dept = departments.find((d) => d.id === me.departmentId);
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [title, setTitle] = useState(me.title);
  const [bio, setBio] = useState("负责澄明科技的招聘体系与 AI 招聘实践，关注候选人体验与招聘效率。");
  const [tab, setTab] = useState("info");
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);
  const [smsNotify, setSmsNotify] = useState(true);
  const [inappNotify, setInappNotify] = useState(true);
  const [digest, setDigest] = useState(false);

  const saveProfile = () => {
    updateEmployee(me.id, { name, phone, title });
    toast.success("个人信息已更新");
  };

  return (
    <div className="space-y-5">
      <PageHeader title="个人中心" description="管理你的账号、安全设置与通知偏好。" />

      <div className="relative overflow-hidden rounded-[22px] bg-pine-deep p-6 text-white md:p-7">
        <div className="signal-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar name={me.name} size={72} ring />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-[23px] font-semibold tracking-[-0.03em]">{me.name}</h2><Badge className="bg-white/10 text-white">{myRoles[0]?.name ?? "成员"}</Badge></div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-white/60"><span>{me.title}</span><span className="flex items-center gap-1"><Building2 className="size-3" /> {(deptNames.length ? deptNames.join(" / ") : dept?.name) ?? ""}</span><span className="flex items-center gap-1"><MapPin className="size-3" /> 北京</span><span className="flex items-center gap-1"><Mail className="size-3" /> {me.email}</span></div>
            <div className="mt-3 flex flex-wrap gap-1.5">{myRoles.map((r) => <span key={r.id} className="rounded-md border border-white/12 bg-white/6 px-2 py-1 text-[12px] text-white/80">{r.name}</span>)}</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[var(--surface)] text-pine hover:bg-white" onClick={() => setTab("info")}><User /> 编辑资料</Button>
            <Button size="sm" variant="ghost" className="text-white/75 hover:bg-white/10 hover:text-white" onClick={() => setTab("security")}><KeyRound /> 修改密码</Button>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="info"><UserRound className="size-3.5" /> 个人信息</TabsTrigger>
          <TabsTrigger value="security"><LockKeyhole className="size-3.5" /> 安全设置</TabsTrigger>
          <TabsTrigger value="permissions"><ShieldCheck className="size-3.5" /> 我的权限</TabsTrigger>
          <TabsTrigger value="notify"><Bell className="size-3.5" /> 通知偏好</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="surface p-5 md:p-6">
            <SectionTitle title="基本信息" description="这些信息会展示给团队成员" icon={<User />} />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="姓名"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="工作邮箱"><Input value={me.email} disabled /></Field>
              <Field label="手机号"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <Field label="职位"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
              <Field label="所属部门"><Input value={deptNames.join(" / ")} disabled /></Field>
              <Field label="直属上级"><Input value={employees.find((e) => e.id === me.managerId)?.name ?? "—"} disabled /></Field>
              <Field label="个人简介" className="sm:col-span-2"><Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[90px]" /></Field>
            </div>
            <div className="mt-5 flex justify-end"><Button onClick={saveProfile}><Check /> 保存修改</Button></div>
          </div>
          <div className="space-y-4">
            <div className="surface p-5">
              <SectionTitle title="账号信息" />
              <div className="mt-2 divide-y divide-line">
                <InfoLine label="账号状态"><span className="flex items-center gap-1.5 text-pine"><span className="size-1.5 rounded-full bg-success" /> 正常</span></InfoLine>
                <InfoLine label="加入时间">{me.joinedAt}</InfoLine>
                <InfoLine label="最后登录">2026-10-30 08:04</InfoLine>
                <InfoLine label="登录设备">Chrome · macOS</InfoLine>
              </div>
            </div>
            <div className="rounded-[18px] bg-pine-deep p-5 text-white">
              <div className="flex items-center gap-1.5 text-[12.5px] text-white/65"><Sparkles className="size-3 theme-accent-text" /> 小聘提示</div>
              <p className="mt-2 text-[12.5px] leading-5 text-white/60">你本周已完成 18 次招聘操作，平均响应候选人时间 2.1 小时，比团队均值快 34%。</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="surface p-5 md:p-6">
              <SectionTitle title="修改密码" description="建议每 90 天更新一次密码" icon={<KeyRound />} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="当前密码" className="sm:col-span-2"><Input type="password" placeholder="••••••••" /></Field>
                <Field label="新密码"><Input type="password" placeholder="至少 8 位，包含字母与数字" /></Field>
                <Field label="确认新密码"><Input type="password" placeholder="再次输入新密码" /></Field>
              </div>
              <div className="mt-4 flex items-center justify-between"><span className="text-[12px] text-muted">上次修改：2026-08-12</span><Button onClick={() => toast.success("密码已更新")}><Check /> 更新密码</Button></div>
            </div>
            <div className="surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div><SectionTitle title="两步验证" description="使用验证器 App 增加账号安全" icon={<Smartphone />} /></div>
                <Switch checked={twoFactor} onCheckedChange={(v) => { setTwoFactor(v); toast.success(v ? "已开启两步验证" : "已关闭两步验证"); }} />
              </div>
              <div className="mt-3 rounded-xl bg-[#fafbf8] p-3 text-[12px] leading-5 text-muted">已绑定验证器：Authenticator · 2026-08-12。开启后登录需要输入动态验证码。</div>
            </div>
            <div className="surface p-5">
              <SectionTitle title="登录设备" description="如发现异常设备，请立即退出" icon={<Laptop />} />
              <div className="mt-3 space-y-2">
                {[
                  ["Chrome · macOS", "北京 · 当前设备", "现在", true],
                  ["Safari · iPhone", "北京", "10-28 19:42", false],
                  ["Chrome · Windows", "上海", "10-22 09:15", false],
                ].map(([device, loc, time, current]) => (
                  <div key={String(device)} className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
                    <div><div className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">{device}{current ? <span className="rounded bg-pine-soft px-1 py-0.5 text-[11.5px] text-pine">当前</span> : null}</div><div className="mt-0.5 text-[12px] text-muted">{loc} · {time}</div></div>
                    {!current ? <button onClick={() => toast.success("设备已退出")} className="text-[12px] font-medium text-signal hover:underline">退出</button> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="surface p-5">
              <SectionTitle title="安全评分" icon={<ShieldCheck />} />
              <div className="mt-4 flex items-center gap-4"><div className="relative flex size-16 items-center justify-center rounded-full border-4 border-pine"><span className="num text-[18px] font-semibold text-pine">86</span></div><div className="text-[12.5px] leading-5 text-muted">你的账号安全良好。<br />开启两步验证可提升至 95 分。</div></div>
            </div>
            <div className="surface p-5">
              <SectionTitle title="最近安全活动" />
              <div className="mt-3 space-y-2 text-[12px] text-muted">
                <div>10-30 08:04 · 登录成功 · 北京</div>
                <div>10-28 19:42 · 登录成功 · iPhone</div>
                <div>10-22 09:15 · 密码修改 · 北京</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4 space-y-4">
          <div className="surface p-5 md:p-6">
            <SectionTitle title="我的角色" description="权限由角色与数据范围共同决定" icon={<ShieldCheck />} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {myRoles.map((r) => (
                <div key={r.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${r.color}16`, color: r.color }}><ShieldCheck className="size-4" /></span><span className="text-[13.5px] font-semibold text-ink">{r.name}</span></div>{r.system ? <Badge tone="amber">系统角色</Badge> : <Badge tone="pine">自定义</Badge>}</div>
                  <p className="mt-2 text-[12px] leading-5 text-muted">{r.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">{permissionModules.filter((m) => (r.permissions[m.key] ?? []).length > 0).map((m) => <span key={m.key} className="rounded bg-[#f0f3ee] px-1.5 py-0.5 text-[11.5px] text-ink-soft">{m.label}</span>)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#fafbf8] px-4 py-3"><span className="text-[12.5px] text-muted">需要调整权限？请联系超级管理员或前往角色权限页面。</span><Button size="sm" variant="secondary" asChild><Link href="/roles">查看角色权限 <ArrowUpRight /></Link></Button></div>
          </div>
          <div className="surface overflow-hidden">
            <div className="p-5"><SectionTitle title="权限明细" description={`${myRoles.length} 个角色合并后的权限`} /></div>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
              {permissionModules.map((m) => {
                const actions = new Set(myRoles.flatMap((r) => r.permissions[m.key] ?? []));
                return (
                  <div key={m.key} className="bg-surface p-4"><div className="text-[12.5px] font-medium text-ink">{m.label}</div><div className="mt-1.5 flex flex-wrap gap-1">{[...actions].length ? [...actions].map((a) => <span key={a} className="rounded bg-pine-soft px-1.5 py-0.5 text-[11.5px] text-pine">{a}</span>) : <span className="text-[11.5px] text-muted">无权限</span>}</div></div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notify" className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="surface p-5 md:p-6">
            <SectionTitle title="通知渠道" description="选择你希望接收通知的方式" icon={<Bell />} />
            <div className="mt-5 space-y-3">
              {[
                { value: emailNotify, setter: setEmailNotify, title: "邮件通知", desc: "面试安排、Offer 审批与每周招聘简报", icon: Mail },
                { value: smsNotify, setter: setSmsNotify, title: "短信提醒", desc: "仅用于紧急面试变更与审批提醒", icon: Smartphone },
                { value: inappNotify, setter: setInappNotify, title: "站内通知", desc: "招聘动态、@提醒与系统消息", icon: Bell },
              ].map(({ value, setter, title, desc, icon: Icon }) => (
                <div key={title} className="flex items-start justify-between gap-4 rounded-xl border border-line p-4">
                  <div className="flex items-start gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-pine-soft text-pine"><Icon className="size-4" /></span><div><div className="text-[13px] font-medium text-ink">{title}</div><div className="mt-0.5 text-[12px] text-muted">{desc}</div></div></div>
                  <Switch checked={value} onCheckedChange={setter} />
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-line p-4"><div><div className="text-[13px] font-medium text-ink">每日招聘简报</div><div className="mt-0.5 text-[12px] text-muted">每天 09:00 汇总昨日招聘进展与今日待办</div></div><Switch checked={digest} onCheckedChange={(v) => { setDigest(v); toast.success(v ? "已开启每日简报" : "已关闭每日简报"); }} /></div>
            </div>
            <div className="mt-5 flex justify-end"><Button onClick={() => toast.success("通知偏好已保存")}><Check /> 保存偏好</Button></div>
          </div>
          <div className="surface p-5">
            <SectionTitle title="通知预览" description="每日 09:00 发送" icon={<Mail />} />
            <div className="mt-3 overflow-hidden rounded-xl border border-line">
              <div className="bg-pine-deep px-4 py-3 text-white"><div className="text-[12px] text-white/65">澄明科技 · 招聘简报</div><div className="mt-0.5 text-[13px] font-medium">10月30日 · 今日 5 场面试</div></div>
              <div className="space-y-2 bg-white p-4 text-[12px] leading-5 text-ink-soft">
                <div>· 周予安 10:00 二面，请提前查看面试准备。</div>
                <div>· 裴然的 Offer 仍在财务审批，已停留 1 天。</div>
                <div>· 新增 6 份简历，3 份匹配度超过 85%。</div>
              </div>
            </div>
            <div className="mt-3 text-[12px] text-muted">你可以在通知记录中查看所有已发送消息。</div>
            <Button variant="secondary" size="sm" className="mt-3 w-full" asChild><Link href="/messages">查看通知记录 <ChevronRight /></Link></Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
