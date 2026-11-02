"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Crown,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { SectionTitle, EmptyState, InfoLine } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput, Field, Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/toggle";
import { Sheet, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { useApp } from "@/lib/store";
import { InfoTip } from "@/components/ui/info-tip";
import { MultiPicker } from "@/components/ui/multi-picker";
import { OrgTreeSelect } from "@/components/ui/org-tree-select";
import { permissionActionLabels, permissionGroups, permissionModules } from "@/lib/data";
import { cn, departmentPickerItems, employeeDepartmentIds } from "@/lib/utils";
import { OverflowTags } from "@/components/ui/tag-overflow";
import { useConfirm } from "@/components/ui/confirm";
import type { Role } from "@/lib/types";

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
  const [activeKey, setActiveKey] = useState("jobs");

  useEffect(() => {
    if (open && role) {
      setDraft(JSON.parse(JSON.stringify(role.permissions)));
      const first = permissionModules.find((m) => (role.permissions[m.key] ?? []).length > 0 && m.key !== "dashboard");
      setActiveKey(first?.key ?? "jobs");
    }
  }, [open, role]);

  if (!role) return null;
  const active = permissionModules.find((m) => m.key === activeKey) ?? permissionModules[1];
  const allTotal = permissionModules.reduce((sum, m) => sum + m.actions.length, 0);
  const total = Object.values(draft).reduce((sum, arr) => sum + arr.length, 0);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-[940px] p-0">
        <DialogHeader
          title={`${readOnly ? "查看" : "设置"}「${role.name}」权限`}
          description={readOnly ? "系统内置角色，权限不可修改。你可以复制该角色后调整。" : `按业务域 → 功能模块配置，保存后立即对角色成员生效。已选择 ${total} / ${allTotal} 项。`}
          icon={<ShieldCheck />}
        />
        <DialogBody className="max-h-[calc(92vh-160px)] !p-0">
          {readOnly ? (
            <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl bg-amber-soft/60 p-3 text-[12px] leading-5 text-amber-deep"><Lock className="mt-0.5 size-3.5 shrink-0" /> 系统内置角色用于保障平台基础能力，不可编辑或删除。如需调整，请从左侧角色列表复制为新角色。</div>
          ) : null}
          <div className="grid min-h-[420px] md:grid-cols-[260px_1fr]">
            <div className="max-h-[calc(92vh-230px)] overflow-y-auto border-b border-line bg-[#fafbf8] p-3 md:border-b-0 md:border-r">
              <div className="mb-2 flex items-center justify-between px-1.5">
                <span className="text-[11px] font-medium tracking-[0.04em] text-muted">业务域 / 功能模块</span>
                <button onClick={() => { if (readOnly) return; setDraft(Object.fromEntries(permissionModules.map((m) => [m.key, [...m.actions]]))); }} disabled={readOnly} className="text-[11.5px] font-medium text-pine hover:underline disabled:opacity-40">全选所有</button>
              </div>
              <div className="space-y-3">
                {permissionGroups.map((group) => (
                  <div key={group.key}>
                    <div className="px-1.5 pb-1 text-[11.5px] font-medium text-muted">{group.label}</div>
                    <div className="space-y-0.5">
                      {group.modules.map((key) => {
                        const module = permissionModules.find((m) => m.key === key);
                        if (!module) return null;
                        const selected = (draft[key] ?? []).length;
                        const all = selected === module.actions.length;
                        const some = selected > 0 && !all;
                        return (
                          <button
                            key={key}
                            onClick={() => setActiveKey(key)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-colors",
                              activeKey === key ? "bg-pine-soft/60 font-medium text-pine" : "text-ink-soft hover:bg-white"
                            )}
                          >
                            <span className={cn("flex size-4 shrink-0 items-center justify-center rounded border", all ? "border-pine bg-pine text-white" : some ? "border-pine/40 bg-pine-soft text-pine" : "border-[#d4dbd2] bg-white text-transparent")}>
                              {all ? <Check className="size-2.5" strokeWidth={3} /> : some ? <span className="h-0.5 w-2 rounded-full bg-pine" /> : null}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{module.label}</span>
                            <span className={cn("num text-[10.5px]", all ? "text-pine" : "text-muted")}>{selected}/{module.actions.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex max-h-[calc(92vh-230px)] min-h-0 flex-col overflow-y-auto p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[16px] font-semibold tracking-[-0.02em] text-ink">{active.label}</div>
                  <p className="mt-1 text-[12px] text-muted">选择该功能模块下允许执行的操作。操作较多时可滚动查看，不会挤压其他模块。</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-[12px] text-muted">{(draft[active.key] ?? []).length} / {active.actions.length}</span>
                  <Button variant="secondary" size="sm" onClick={() => toggleAll(active.key, active.actions)} disabled={readOnly}>{((draft[active.key] ?? []).length === active.actions.length) ? "清空本模块" : "全选本模块"}</Button>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {active.actions.map((action) => {
                  const checked = (draft[active.key] ?? []).includes(action);
                  return (
                    <button
                      key={action}
                      onClick={() => toggle(active.key, action)}
                      disabled={readOnly}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[12.5px] transition-colors",
                        checked ? "border-pine/35 bg-pine-soft/40 text-ink" : "border-line bg-white text-ink-soft hover:border-line-strong hover:bg-[#fafbf8]",
                        readOnly && "cursor-default"
                      )}
                    >
                      <span className={cn("flex size-4 shrink-0 items-center justify-center rounded border", checked ? "border-pine bg-pine text-white" : "border-[#d4dbd2] bg-white text-transparent")}>{checked ? <Check className="size-2.5" strokeWidth={3} /> : null}</span>
                      <span className="flex-1">{permissionActionLabels[action] ?? action}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-auto pt-5 text-[11px] leading-5 text-muted">
                权限只控制功能入口与操作范围；数据可见范围在角色的「数据范围」中单独设置。
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>{readOnly ? "关闭" : "取消"}</Button>
          {readOnly ? null : <Button onClick={() => { updateRolePermissions(role.id, draft); toast.success("权限已保存"); onOpenChange(false); }}><Check /> 保存权限</Button>}
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
                  <OverflowTags items={employeeDepartmentIds(e).map((id) => departments.find((d) => d.id === id)?.name ?? id)} max={1} tooltipLabel="所属部门" />
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

function scopeShort(role: Role) {
  const scope = role.dataScope ?? (role.id === "r5" ? "dept" : role.id === "r4" || role.id === "r7" ? "self" : "all");
  if (scope === "all") return "全部数据";
  if (scope === "dept") return "部门及下级";
  if (scope === "custom") return "指定部门";
  return "仅本人";
}

function scopeText(role: Role, departments: { id: string; name: string }[]) {
  const scope = role.dataScope ?? (role.id === "r5" ? "dept" : role.id === "r4" || role.id === "r7" ? "self" : "all");
  if (scope === "all") return "全部企业数据";
  if (scope === "dept") return "成员所属部门及下级";
  if (scope === "custom") {
    const names = (role.dataScopeDepartments ?? []).map((id) => departments.find((d) => d.id === id)?.name).filter(Boolean);
    return names.length ? `指定部门：${names.join("、")}` : "指定部门（未选择）";
  }
  return "仅本人负责的数据";
}

function ScopeDialog({
  role,
  open,
  onOpenChange,
}: {
  role: Role | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { departments, updateRoleScope } = useApp();
  const [scope, setScope] = useState<Role["dataScope"]>("self");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);

  useEffect(() => {
    if (open && role) {
      setScope(role.dataScope ?? (role.id === "r5" ? "dept" : role.id === "r4" || role.id === "r7" ? "self" : "all"));
      setDepartmentIds(role.dataScopeDepartments ?? []);
    }
  }, [open, role]);

  if (!role) return null;
  const options: { key: Role["dataScope"]; title: string; description: string }[] = [
    { key: "all", title: "全部数据", description: "可查看企业内全部职位、候选人和面试数据" },
    { key: "dept", title: "本部门及下级", description: "仅查看成员所属部门及其下级部门的数据" },
    { key: "self", title: "仅本人数据", description: "仅查看本人负责的职位、候选人与面试" },
    { key: "custom", title: "指定部门", description: "手动选择该角色可查看的部门范围" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="设置数据范围" description={`「${role.name}」的成员可以查看哪些数据。`} icon={<ShieldCheck />} />
        <DialogBody className="space-y-3">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => setScope(option.key)}
              className={cn("flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors", scope === option.key ? "border-pine/35 bg-pine-soft/40" : "border-line hover:bg-[#fafbf8]")}
            >
              <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border", scope === option.key ? "border-pine" : "border-[#c7d0c6]")}>
                {scope === option.key ? <span className="size-2 rounded-full bg-pine" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-ink">{option.title}</span>
                <span className="mt-0.5 block text-[12px] leading-5 text-muted">{option.description}</span>
              </span>
            </button>
          ))}
          {scope === "custom" ? (
            <Field label="可查看的部门">
              <OrgTreeSelect departments={departments} value={departmentIds} onChange={setDepartmentIds} placeholder="选择部门" maxVisible={3} />
            </Field>
          ) : null}
          <div className="rounded-xl bg-[#fafbf8] p-3 text-[11.5px] leading-5 text-muted">数据范围按角色生效，成员的实际可见数据同时受所属部门与角色范围约束。精确范围：{scopeText({ ...role, dataScope: scope, dataScopeDepartments: departmentIds }, departments)}</div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => { updateRoleScope(role.id, scope, departmentIds); toast.success("数据范围已更新"); onOpenChange(false); }}><Check /> 保存范围</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleMemberSheet({
  employeeId,
  onClose,
  onPrevious,
  onNext,
}: {
  employeeId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const { employees, departments, roles, updateEmployee } = useApp();
  const confirm = useConfirm();
  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) return <Sheet open={false} onOpenChange={onClose} title="成员详情"><div /></Sheet>;
  const deptNames = employeeDepartmentIds(employee).map((id) => departments.find((d) => d.id === id)?.name ?? id);
  const assignedRoles = employee.roleIds.map((id) => roles.find((r) => r.id === id)).filter(Boolean);
  const isDisabled = employee.status === "disabled";

  return (
    <Sheet open={!!employeeId} onOpenChange={(open) => !open && onClose()} width="540px" title="成员详情" onPrevious={onPrevious} onNext={onNext}>
      <div className="flex h-full flex-col bg-paper">
        <div className="border-b border-line bg-surface px-6 py-5">
          <div className="flex items-start gap-3.5">
            <Avatar name={employee.name} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink">{employee.name}</h2>
                <Badge tone={employee.status === "active" ? "pine" : employee.status === "invited" ? "amber" : "neutral"}>{employee.status === "active" ? "正常" : employee.status === "invited" ? "待激活" : "已停用"}</Badge>
              </div>
              <div className="mt-1 text-[12px] text-muted">{employee.title} · {deptNames.join(" / ")}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {assignedRoles.map((role) => role ? <span key={role.id} className="rounded-md bg-pine-soft px-1.5 py-0.5 text-[11.5px] text-pine">{role.name}</span> : null)}
              </div>
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Tabs defaultValue="profile">
            <div className="sticky top-0 z-10 border-b border-line bg-surface px-5">
              <TabsList className="border-b-0"><TabsTrigger value="profile">基本信息</TabsTrigger><TabsTrigger value="permissions">角色与权限</TabsTrigger></TabsList>
            </div>
            <TabsContent value="profile" className="p-5">
              <div className="surface p-4">
                <InfoLine label="工作邮箱">{employee.email}</InfoLine>
                <InfoLine label="手机号">{employee.phone}</InfoLine>
                <div className="flex flex-col gap-1 py-2.5"><span className="text-[11.5px] text-muted">所属部门</span><OverflowTags items={deptNames} max={2} tooltipLabel="所属部门" /></div>
                <InfoLine label="直属上级">{employees.find((e) => e.id === employee.managerId)?.name ?? "—"}</InfoLine>
                <InfoLine label="负责部门">{departments.filter((d) => d.headId === employee.id).map((d) => d.name).join("、") || "—"}</InfoLine>
                <InfoLine label="入职日期">{employee.joinedAt}</InfoLine>
                <InfoLine label="最后活跃">{employee.lastActive}</InfoLine>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="ghost" onClick={async () => {
                  if (!isDisabled) {
                    const ok = await confirm({ title: "停用该成员？", description: "停用后该成员将无法登录企业工作台，但历史数据会保留。", confirmText: "停用账号", tone: "danger" });
                    if (!ok) return;
                  }
                  updateEmployee(employee.id, { status: isDisabled ? "active" : "disabled" });
                  toast.success(isDisabled ? "账号已启用" : "账号已停用");
                  onClose();
                }}>{isDisabled ? "启用账号" : "停用账号"}</Button>
              </div>
            </TabsContent>
            <TabsContent value="permissions" className="space-y-3 p-5">
              <SectionTitle title="角色与权限范围" description="来自所分配角色的合并权限" icon={<ShieldCheck />} />
              {assignedRoles.map((role) => role ? <div key={role.id} className="surface p-4"><div className="flex items-center justify-between gap-2"><span className="text-[13px] font-medium text-ink">{role.name}</span>{role.system ? <Badge tone="amber">系统角色</Badge> : null}</div><p className="mt-1 text-[12px] leading-5 text-muted">{role.description}</p></div> : null)}
              {assignedRoles.length === 0 ? <div className="surface p-6 text-center text-[12px] text-muted">暂未分配角色</div> : null}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Sheet>
  );
}

export default function RolesPage() {
  const { roles, employees, departments, addRole, duplicateRole, updateRoleMembers, updateRoleMeta, deleteRole } = useApp();
  const confirm = useConfirm();
  const [selectedId, setSelectedId] = useState("r1");
  const [scopeOpen, setScopeOpen] = useState(false);
  const [memberDetailId, setMemberDetailId] = useState<string | null>(null);
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.035em] text-ink">角色权限</h1>
          <span className="text-[12px] text-muted">{roles.length} 个角色 · {employees.length} 位成员</span>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus /> 新建角色</Button>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "角色总数", value: roles.length, suffix: "个", tip: "包含系统角色与自定义角色" },
          { label: "成员覆盖", value: employees.length, suffix: "人", tip: "已分配至少一个角色的成员" },
          { label: "权限项", value: permissionModules.reduce((sum, m) => sum + m.actions.length, 0), suffix: "项", tip: "可授权的功能操作总数" },
          { label: "待分配角色", value: employees.filter((e) => e.roleIds.length === 0).length, suffix: "人", tip: "尚未分配任何角色的成员" },
        ].map(({ label, value, suffix, tip }) => (
          <div key={label} className="surface p-4">
            <div className="flex items-center gap-1.5 text-[12px] text-muted">{label}<InfoTip text={tip} /></div>
            <div className="mt-1.5 flex items-baseline gap-1"><span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span><span className="text-[12px] text-muted">{suffix}</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="surface col-span-12 self-start overflow-hidden xl:sticky xl:top-[76px] xl:col-span-3">
          <div className="border-b border-line p-3.5">
            <SectionTitle title="角色" />
            <div className="relative mt-3"><Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索角色" className="h-8 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-2.5 text-[12.5px] outline-none focus:border-pine/50" /></div>
          </div>
          <div className="max-h-[520px] overflow-y-auto p-2">
            {filteredRoles.map((r) => (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(r.id)}
                onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(r.id); }}
                className={cn("group/role mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-signal/40", selectedId === r.id ? "bg-pine-soft/70" : "hover:bg-[#f5f7f2]")}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${r.color}18`, color: r.color }}><ShieldCheck className="size-3.5" /></span>
                <span className="min-w-0 flex-1"><span className={cn("block truncate text-[13px]", selectedId === r.id ? "font-semibold text-pine" : "font-medium text-ink")}>{r.name}</span><span className="mt-0.5 block text-[11.5px] text-muted">{r.memberIds.length} 位成员</span></span>
                {r.system ? <Lock className="size-3 text-muted" /> : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button onClick={(e) => e.stopPropagation()} aria-label={`${r.name}更多操作`} className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted opacity-60 transition-opacity hover:bg-white hover:text-ink group-hover/role:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled={r.system} onClick={() => { setSelectedId(r.id); setEditRoleName(r.name); setEditRoleDesc(r.description); setEditRoleColor(r.color); setEditRoleOpen(true); }}><Pencil /> 编辑角色</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { const copy = duplicateRole(r.id); if (copy) { setSelectedId(copy.id); toast.success("角色已复制"); } }}><Copy /> 复制角色</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={r.system} danger onClick={async () => { const ok = await confirm({ title: "删除该角色？", description: `删除「${r.name}」后，该角色会从所有成员身上移除，此操作不可撤销。`, confirmText: "删除角色", tone: "danger" }); if (!ok) return; deleteRole(r.id); setSelectedId("r1"); toast.success("角色已删除"); }}><Trash2 /> 删除角色</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 space-y-4 xl:col-span-9">
          <div className="surface overflow-visible">
            <div className="sticky top-[60px] z-20 flex flex-wrap items-start justify-between gap-4 rounded-t-[17px] border-b border-line bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: `${role.color}16`, color: role.color }}>{role.system ? <Crown className="size-5" /> : <ShieldCheck className="size-5" />}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{role.name}</h2>{role.system ? <Badge tone="amber" dot>系统角色</Badge> : <Badge tone="pine" dot>自定义角色</Badge>}</div>
                  <p className="mt-1.5 line-clamp-2 max-w-[520px] text-[12.5px] leading-5 text-muted" title={role.description}>{role.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-muted"><span>{members.length} 位成员</span><span className="size-0.5 rounded-full bg-muted" /><span>{totalPermissions} 项权限</span><span className="size-0.5 rounded-full bg-muted" /><button onClick={() => setScopeOpen(true)} className="inline-flex items-center whitespace-nowrap gap-1 text-pine hover:underline">数据范围：{scopeText(role, departments)} <Pencil className="size-3" /></button></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPermOpen(true)}>{role.system ? <><Lock /> 查看权限</> : <><ShieldCheck /> 设置角色权限</>}</Button>
                <Button size="sm" onClick={() => setAddMemberOpen(true)}><UserPlus /> 添加成员</Button>
                <DropdownMenu><DropdownMenuTrigger asChild><button className="flex size-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-4" /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => { const copy = duplicateRole(role.id); if (copy) { setSelectedId(copy.id); toast.success("角色已复制"); } }}><Copy /> 复制角色</DropdownMenuItem><DropdownMenuItem onClick={() => { setEditRoleName(role.name); setEditRoleDesc(role.description); setEditRoleColor(role.color); setEditRoleOpen(true); }}><ShieldCheck /> 编辑角色</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem danger onClick={async () => { if (role.system) { toast.info("系统角色不可删除"); return; } const ok = await confirm({ title: "删除该角色？", description: `删除「${role.name}」后，该角色会从所有成员身上移除，此操作不可撤销。`, confirmText: "删除角色", tone: "danger" }); if (!ok) return; deleteRole(role.id); setSelectedId("r1"); toast.success("角色已删除"); }}><Trash2 /> 删除角色</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
              </div>
            </div>
            <div className="overflow-x-auto xl:overflow-visible">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-[#fafbf8] xl:[&>tr>th]:sticky xl:[&>tr>th]:top-[171px] xl:[&>tr>th]:z-10 xl:[&>tr>th]:bg-[#fafbf8]"><tr className="border-y border-line bg-[#fafbf8] text-[12.5px] text-muted">
                  <th className="min-w-[180px] py-2.5 pl-5 font-medium">姓名</th>
                  <th className="min-w-[170px] py-2.5 pr-4 font-medium">工作邮箱</th>
                  <th className="min-w-[130px] py-2.5 pr-4 font-medium">所属部门</th>
                  <th className="w-[100px] py-2.5 pr-4 font-medium">管理范围</th>
                  <th className="w-[90px] py-2.5 pr-4 font-medium">状态</th>
                  <th className="w-[120px] px-4 py-2.5 text-right font-medium">操作</th>
                </tr></thead>
                <tbody>
                  {members.map((e) => (
                    <tr key={e.id} className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-[#fafbf8]" onClick={() => setMemberDetailId(e.id)}>
                      <td className="py-3 pl-5 pr-4"><div className="flex items-center gap-2.5"><Avatar name={e.name} size={28} /><div><div className="text-[12.5px] font-medium text-ink">{e.name}</div><div className="mt-0.5 text-[11.5px] text-muted">{e.title}</div></div></div></td>
                      <td className="py-3 pr-4 text-[12px] text-ink-soft">{e.email}</td>
                      <td className="py-3 pr-4"><OverflowTags items={employeeDepartmentIds(e).map((id) => departments.find((d) => d.id === id)?.name ?? id)} max={1} tooltipLabel="所属部门" /></td>
                      <td className="py-3 pr-4 text-[12px] text-muted"><span title={scopeText(role, departments)}>{scopeShort(role)}</span></td>
                      <td className="py-3 pr-4"><span className={cn("rounded px-1.5 py-0.5 text-[11.5px]", e.status === "active" ? "bg-pine-soft text-pine" : e.status === "invited" ? "bg-amber-soft text-amber-deep" : "bg-[#eef1ec] text-muted")}>{e.status === "active" ? "正常" : e.status === "invited" ? "待激活" : "已停用"}</span></td>
                      <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}><div className="flex justify-end gap-1"><button onClick={async () => { const ok = await confirm({ title: "移出该成员？", description: `确定将「${e.name}」从「${role.name}」中移除吗？`, confirmText: "移出角色", tone: "danger" }); if (!ok) return; updateRoleMembers(role.id, role.memberIds.filter((id) => id !== e.id)); toast.success("成员已移出角色"); }} className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-signal-soft hover:text-signal" aria-label="移除角色"><UserMinus className="size-3.5" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length === 0 ? <EmptyState icon={<Users />} title="这个角色还没有成员" description="添加成员后，他们将获得该角色的权限。" action={<Button size="sm" onClick={() => setAddMemberOpen(true)}><UserPlus /> 添加成员</Button>} /> : null}
            <div className="border-t border-line px-5 py-3 text-[12.5px] text-muted">权限变更将在成员下次刷新时生效</div>
          </div>
        </div>
      </div>

      <PermissionDialog role={role} open={permOpen} onOpenChange={setPermOpen} readOnly={!!role.system} />
      <ScopeDialog role={role} open={scopeOpen} onOpenChange={setScopeOpen} />
      <RoleMemberSheet employeeId={memberDetailId} onClose={() => setMemberDetailId(null)} onPrevious={memberDetailId && members.findIndex((e) => e.id === memberDetailId) > 0 ? () => { const i = members.findIndex((e) => e.id === memberDetailId); setMemberDetailId(members[i - 1].id); } : undefined} onNext={memberDetailId && members.findIndex((e) => e.id === memberDetailId) < members.length - 1 ? () => { const i = members.findIndex((e) => e.id === memberDetailId); setMemberDetailId(members[i + 1].id); } : undefined} />
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
