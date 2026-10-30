"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Copy,
  Crown,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput, Field, Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/toggle";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { useApp } from "@/lib/store";
import { permissionActionLabels, permissionModules } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const scopeLabels: Record<string, string> = {
  r1: "全部数据",
  r2: "全部数据",
  r3: "全部数据",
  r4: "仅本人面试",
  r5: "本部门",
  r6: "财务相关",
  r7: "只读",
};

function PermissionDialog({
  role,
  open,
  onOpenChange,
  readOnly,
}: {
  role: Role | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  readOnly: boolean;
}) {
  const { updateRolePermissions } = useApp();
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  useEffect(() => {
    if (open && role) setDraft(JSON.parse(JSON.stringify(role.permissions)));
  }, [open, role]);
  if (!role) return null;

  const toggle = (moduleKey: string, action: string) => {
    if (readOnly) return;
    setDraft((prev) => {
      const current = prev[moduleKey] ?? [];
      return { ...prev, [moduleKey]: current.includes(action) ? current.filter((a) => a !== action) : [...current, action] };
    });
  };

  const toggleAll = (moduleKey: string, actions: readonly string[]) => {
    if (readOnly) return;
    setDraft((prev) => {
      const current = prev[moduleKey] ?? [];
      return { ...prev, [moduleKey]: current.length === actions.length ? [] : [...actions] };
    });
  };

  const total = Object.values(draft).reduce((sum, arr) => sum + arr.length, 0);
  const allTotal = permissionModules.reduce((sum, m) => sum + m.actions.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="p-0">
        <DialogHeader title={`${readOnly ? "查看" : "设置"}「${role.name}」权限`} description={readOnly ? "系统内置角色，权限不可修改。你可以复制它来创建自定义角色。" : "按模块配置权限，保存后立即对角色成员生效。"} icon={<ShieldCheck />} />
        <DialogBody className="space-y-4">
          {readOnly ? (
            <div className="flex items-start gap-2 rounded-xl bg-amber-soft/60 p-3 text-[12.5px] leading-5 text-amber-deep"><Lock className="mt-0.5 size-3.5 shrink-0" /> 系统内置角色用于保障平台基础能力，不可编辑或删除。如需调整，请复制为新角色。</div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12.5px] text-muted">已选择 <span className="num font-semibold text-ink">{total}</span> / {allTotal} 项权限</span>
              <button onClick={() => { if (readOnly) return; const all = Object.fromEntries(permissionModules.map((m) => [m.key, [...m.actions]])); setDraft(all); }} className="text-[12.5px] font-medium text-pine hover:underline disabled:opacity-40" disabled={readOnly}>全选所有权限</button>
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="hidden grid-cols-[180px_1fr] border-b border-line bg-[#fafbf8] px-4 py-2.5 text-[12px] font-medium text-muted sm:grid">
              <span>功能模块</span><span>可用操作</span>
            </div>
            {permissionModules.map((m) => {
              const actions = draft[m.key] ?? [];
              const all = actions.length === m.actions.length;
              return (
                <div key={m.key} className="grid grid-cols-1 gap-2 border-b border-line/70 px-4 py-3 last:border-0 sm:grid-cols-[180px_1fr] sm:items-center">
                  <button onClick={() => toggleAll(m.key, m.actions)} className={cn("flex items-center gap-2 text-left text-[13px] font-medium", readOnly ? "cursor-default" : "hover:text-pine")}>
                    <span className={cn("flex size-4 items-center justify-center rounded border", all ? "border-pine bg-pine text-white" : "border-[#c7d0c6] bg-white")}>{all ? <Check className="size-2.5" /> : null}</span>
                    {m.label}
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    {m.actions.map((a) => {
                      const checked = actions.includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() => toggle(m.key, a)}
                          disabled={readOnly}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[12px] transition-colors",
                            checked ? "border-pine/30 bg-pine-soft/60 text-pine" : "border-line bg-white text-muted hover:border-line-strong",
                            readOnly && "cursor-default"
                          )}
                        >
                          <span className={cn("flex size-2.5 items-center justify-center rounded-[3px] border", checked ? "border-pine bg-pine text-white" : "border-[#c7d0c6]")}>{checked ? <Check className="size-2" strokeWidth={4} /> : null}</span>
                          {permissionActionLabels[a] ?? a}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>{readOnly ? "关闭" : "取消"}</Button>
          {readOnly ? <Button onClick={() => { navigator.clipboard?.writeText(role.name); toast.success("角色已复制为「" + role.name + " 副本」"); onOpenChange(false); }}><Copy /> 复制为新角色</Button> : <Button onClick={() => { updateRolePermissions(role.id, draft); toast.success("权限已保存"); onOpenChange(false); }}><Check /> 保存权限</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMemberDialog({ role, open, onOpenChange }: { role: Role | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { employees, departments, updateRoleMembers } = useApp();
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { if (open && role) { setMemberIds(role.memberIds); setQuery(""); } }, [open, role]);
  if (!role) return null;
  const list = employees.filter((e) => `${e.name}${e.email}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="管理角色成员" description={`「${role.name}」当前有 ${role.memberIds.length} 位成员。`} icon={<UserPlus />} />
        <DialogBody className="space-y-3">
          <SearchInput placeholder="搜索成员姓名或邮箱" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="max-h-[360px] overflow-y-auto rounded-xl border border-line">
            {list.map((e) => {
              const checked = memberIds.includes(e.id);
              return (
                <label key={e.id} className={cn("flex cursor-pointer items-center gap-2.5 border-b border-line/70 px-3 py-2.5 last:border-0", checked ? "bg-pine-soft/30" : "hover:bg-[#fafbf8]")}>
                  <Checkbox checked={checked} onCheckedChange={(v) => setMemberIds((prev) => v ? [...prev, e.id] : prev.filter((id) => id !== e.id))} />
                  <Avatar name={e.name} size={26} />
                  <div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium text-ink">{e.name}</div><div className="mt-0.5 text-[12px] text-muted">{e.email}</div></div>
                  <span className="text-[12px] text-muted">{departments.find((d) => d.id === e.departmentId)?.name}</span>
                </label>
              );
            })}
          </div>
          <div className="text-[12px] text-muted">已选择 {memberIds.length} 位成员</div>
        </DialogBody>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={() => { updateRoleMembers(role.id, memberIds); toast.success("角色成员已更新"); onOpenChange(false); }}><Check /> 保存成员</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RolesPage() {
  const { roles, employees, departments, addRole, duplicateRole, updateRoleMembers, updateRoleMeta, deleteRole } = useApp();
  const [selectedId, setSelectedId] = useState("r1");
  const [query, setQuery] = useState("");
  const [permOpen, setPermOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#2f6f8f");
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");
  const [editRoleColor, setEditRoleColor] = useState("#2f6f8f");

  const role = roles.find((r) => r.id === selectedId) ?? roles[0];
  const members = employees.filter((e) => role.memberIds.includes(e.id) || e.roleIds.includes(role.id));
  const filteredRoles = roles.filter((r) => r.name.includes(query));
  const totalPermissions = Object.values(role.permissions).reduce((sum, arr) => sum + arr.length, 0);

  const createRole = () => {
    if (!newRoleName.trim()) {
      toast.error("请填写角色名称");
      return;
    }
    const created = addRole({ name: newRoleName, description: newRoleDesc || "自定义角色。", color: newRoleColor });
    setSelectedId(created.id);
    setCreateOpen(false);
    setNewRoleName("");
    setNewRoleDesc("");
    toast.success("角色已创建");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="组织与权限"
        title="角色权限"
        description="用角色定义每个人能看到什么、能做什么。系统角色不可修改，业务角色可以自由组合权限。"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus /> 新建角色</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["角色总数", roles.length, "个", "包含 1 个系统角色"],
          ["成员覆盖", employees.length, "人", "全部企业成员"],
          ["权限项", permissionModules.reduce((sum, m) => sum + m.actions.length, 0), "项", "可组合授权"],
          ["待分配角色", employees.filter((e) => e.roleIds.length === 0).length, "人", "需要管理员处理"],
        ].map(([label, value, suffix, note]) => (
          <div key={String(label)} className="surface p-4"><div className="text-[12.5px] text-muted">{label}</div><div className="mt-1 flex items-baseline gap-1"><span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span><span className="text-[12.5px] text-muted">{suffix}</span></div><div className="mt-1 text-[12px] text-muted">{note}</div></div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="surface col-span-12 self-start overflow-hidden xl:col-span-3">
          <div className="border-b border-line p-3.5">
            <div className="flex items-center justify-between"><SectionTitle title="角色" /><button onClick={() => setCreateOpen(true)} className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="新建角色"><Plus className="size-3.5" /></button></div>
            <div className="relative mt-3"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索角色" className="h-8 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-2.5 text-[12.5px] outline-none focus:border-pine/50" /></div>
          </div>
          <div className="max-h-[520px] overflow-y-auto p-2">
            {filteredRoles.map((r) => (
              <button key={r.id} onClick={() => setSelectedId(r.id)} className={cn("mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors", selectedId === r.id ? "bg-pine-soft/70" : "hover:bg-[#f5f7f2]")}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${r.color}18`, color: r.color }}><ShieldCheck className="size-3.5" /></span>
                <span className="min-w-0 flex-1"><span className={cn("block truncate text-[13px]", selectedId === r.id ? "font-semibold text-pine" : "font-medium text-ink")}>{r.name}</span><span className="mt-0.5 block text-[11.5px] text-muted">{r.memberIds.length} 位成员</span></span>
                {r.system ? <Lock className="size-3 text-muted" /> : null}
              </button>
            ))}
          </div>
          <div className="border-t border-line p-2.5"><button onClick={() => setCreateOpen(true)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-[12.5px] text-muted hover:border-pine/30 hover:text-pine"><Plus className="size-3" /> 新建角色</button></div>
        </div>

        <div className="col-span-12 space-y-4 xl:col-span-9">
          <div className="surface overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: `${role.color}16`, color: role.color }}>{role.system ? <Crown className="size-5" /> : <ShieldCheck className="size-5" />}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{role.name}</h2>{role.system ? <Badge tone="amber" dot>系统角色</Badge> : <Badge tone="pine" dot>自定义角色</Badge>}</div>
                  <p className="mt-1.5 max-w-[520px] text-[12.5px] leading-5 text-muted">{role.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-[12px] text-muted"><span>{members.length} 位成员</span><span className="size-0.5 rounded-full bg-muted" /><span>{totalPermissions} 项权限</span><span className="size-0.5 rounded-full bg-muted" /><span>数据范围：{scopeLabels[role.id] ?? "自定义"}</span></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPermOpen(true)}>{role.system ? <><Lock /> 查看权限</> : <><ShieldCheck /> 设置角色权限</>}</Button>
                <Button size="sm" onClick={() => setAddMemberOpen(true)}><UserPlus /> 添加成员</Button>
                <DropdownMenu><DropdownMenuTrigger asChild><button className="flex size-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-4" /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => { const copy = duplicateRole(role.id); if (copy) { setSelectedId(copy.id); toast.success("角色已复制"); } }}><Copy /> 复制角色</DropdownMenuItem><DropdownMenuItem onClick={() => { setEditRoleName(role.name); setEditRoleDesc(role.description); setEditRoleColor(role.color); setEditRoleOpen(true); }}><ShieldCheck /> 编辑角色</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem danger onClick={() => { if (role.system) { toast.info("系统角色不可删除"); return; } deleteRole(role.id); setSelectedId("r1"); toast.success("角色已删除"); }}><Trash2 /> 删除角色</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
              {permissionModules.map((m) => {
                const count = (role.permissions[m.key] ?? []).length;
                return (
                  <button key={m.key} onClick={() => setPermOpen(true)} className="group bg-surface p-3.5 text-left transition-colors hover:bg-[#fafbf8]">
                    <div className="flex items-center justify-between gap-2"><span className="text-[12px] text-muted">{m.label}</span><ChevronRight className="size-3 text-[#c2ccc4] transition-transform group-hover:translate-x-0.5" /></div>
                    <div className="mt-1.5 flex items-baseline gap-1"><span className="num text-[16px] font-semibold text-ink">{count}</span><span className="text-[11.5px] text-muted">/ {m.actions.length} 项</span></div>
                    <div className="mt-2 flex gap-0.5">{m.actions.map((a) => <span key={a} className={cn("h-1 flex-1 rounded-full", (role.permissions[m.key] ?? []).includes(a) ? "bg-pine" : "bg-[#e9ede7]")} />)}</div>
                  </button>
                );
              })}
              <div className="col-span-2 bg-surface p-3.5 sm:col-span-3 lg:col-span-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[12px] text-muted">数据范围</div>
                    <div className="mt-1.5 text-[13.5px] font-semibold text-ink">{scopeLabels[role.id] ?? "自定义"}</div>
                  </div>
                  <div className="text-[11.5px] leading-4 text-muted">由角色与部门共同决定 · 数据范围变更需管理员审批</div>
                  <Link href="/organization" className="flex items-center gap-1 text-[12px] font-medium text-pine hover:underline">查看组织架构 <ChevronRight className="size-3" /></Link>
                </div>
              </div>
            </div>
          </div>

          <div className="surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <SectionTitle title="角色成员" description={`${members.length} 位成员拥有此角色`} icon={<Users />} />
              <div className="flex items-center gap-2"><Button size="sm" variant="secondary" onClick={() => setAddMemberOpen(true)}><UserPlus /> 管理成员</Button></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead><tr className="border-y border-line bg-[#fafbf8] text-[12.5px] text-muted">
                  <th className="min-w-[180px] py-2.5 pl-5 font-medium">姓名</th>
                  <th className="min-w-[170px] py-2.5 pr-4 font-medium">工作邮箱</th>
                  <th className="min-w-[130px] py-2.5 pr-4 font-medium">所属部门</th>
                  <th className="w-[100px] py-2.5 pr-4 font-medium">管理范围</th>
                  <th className="w-[90px] py-2.5 pr-4 font-medium">状态</th>
                  <th className="w-[120px] px-4 py-2.5 text-right font-medium">操作</th>
                </tr></thead>
                <tbody>
                  {members.map((e) => (
                    <tr key={e.id} className="border-b border-line/70 last:border-0 hover:bg-[#fafbf8]">
                      <td className="py-3 pl-5 pr-4"><div className="flex items-center gap-2.5"><Avatar name={e.name} size={28} /><div><div className="text-[12.5px] font-medium text-ink">{e.name}</div><div className="mt-0.5 text-[11.5px] text-muted">{e.title}</div></div></div></td>
                      <td className="py-3 pr-4 text-[12px] text-ink-soft">{e.email}</td>
                      <td className="py-3 pr-4 text-[12px] text-ink-soft">{departments.find((d) => d.id === e.departmentId)?.name}</td>
                      <td className="py-3 pr-4 text-[12px] text-muted">{scopeLabels[role.id] ?? "自定义"}</td>
                      <td className="py-3 pr-4"><span className={cn("rounded px-1.5 py-0.5 text-[11.5px]", e.status === "active" ? "bg-pine-soft text-pine" : e.status === "invited" ? "bg-amber-soft text-amber-deep" : "bg-[#eef1ec] text-muted")}>{e.status === "active" ? "正常" : e.status === "invited" ? "待激活" : "已停用"}</span></td>
                      <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" className="h-7 px-2 text-[12px]" onClick={() => toast.info("成员详情可在员工与部门中查看")}>详情</Button><button onClick={() => { updateRoleMembers(role.id, role.memberIds.filter((id) => id !== e.id)); toast.success("成员已移出角色"); }} className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-signal-soft hover:text-signal" aria-label="移除角色"><UserMinus className="size-3.5" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length === 0 ? <EmptyState icon={<Users />} title="这个角色还没有成员" description="添加成员后，他们将获得该角色的权限。" action={<Button size="sm" onClick={() => setAddMemberOpen(true)}><UserPlus /> 添加成员</Button>} /> : null}
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12.5px] text-muted"><span>权限变更将在成员下次刷新时生效</span><button onClick={() => setPermOpen(true)} className="flex items-center gap-1 font-medium text-pine hover:underline">查看权限详情 <ChevronRight className="size-3" /></button></div>
          </div>
        </div>
      </div>

      <PermissionDialog role={role} open={permOpen} onOpenChange={setPermOpen} readOnly={!!role.system} />
      <AddMemberDialog role={role} open={addMemberOpen} onOpenChange={setAddMemberOpen} />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="sm" className="p-0">
          <DialogHeader title="新建角色" description="创建后可以分配权限与成员。" icon={<ShieldCheck />} />
          <DialogBody className="space-y-4">
            <Field label="角色名称" required><Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="例如：招聘协调员" /></Field>
            <Field label="角色说明"><Textarea value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} placeholder="说明这个角色负责什么…" className="min-h-[72px]" /></Field>
            <Field label="角色颜色"><div className="flex gap-2">{["#0c4539", "#2f6f8f", "#8a4b4b", "#7a5c3e", "#4b7c66", "#6a6455"].map((c) => <button key={c} onClick={() => setNewRoleColor(c)} style={{ background: c }} className={cn("size-7 rounded-full border-2", newRoleColor === c ? "border-ink" : "border-white")} aria-label={c} />)}</div></Field>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setCreateOpen(false)}>取消</Button><Button onClick={createRole}><Check /> 创建角色</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent size="sm" className="p-0">
          <DialogHeader title="编辑角色" description="修改角色名称、说明与标识颜色。" icon={<ShieldCheck />} />
          <DialogBody className="space-y-4">
            <Field label="角色名称" required><Input value={editRoleName} onChange={(e) => setEditRoleName(e.target.value)} /></Field>
            <Field label="角色说明"><Textarea value={editRoleDesc} onChange={(e) => setEditRoleDesc(e.target.value)} className="min-h-[72px]" /></Field>
            <Field label="角色颜色"><div className="flex gap-2">{["#0c4539", "#2f6f8f", "#8a4b4b", "#7a5c3e", "#4b7c66", "#6a6455"].map((c) => <button key={c} onClick={() => setEditRoleColor(c)} style={{ background: c }} className={cn("size-7 rounded-full border-2", editRoleColor === c ? "border-ink" : "border-white")} aria-label={c} />)}</div></Field>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setEditRoleOpen(false)}>取消</Button><Button onClick={() => { if (!editRoleName.trim()) { toast.error("角色名称不能为空"); return; } updateRoleMeta(role.id, { name: editRoleName, description: editRoleDesc, color: editRoleColor }); setEditRoleOpen(false); toast.success("角色已更新"); }}><Check /> 保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
