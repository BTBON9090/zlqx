"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  FolderPlus,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionTitle, EmptyState, InfoLine } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput, Field, Input } from "@/components/ui/input";
import { MultiPicker } from "@/components/ui/multi-picker";
import { OrgTreeSelect } from "@/components/ui/org-tree-select";
import { OverflowTags } from "@/components/ui/tag-overflow";
import { useConfirm } from "@/components/ui/confirm";
import { InfoTip } from "@/components/ui/info-tip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox, Switch } from "@/components/ui/toggle";
import { Sheet, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown";
import { useApp } from "@/lib/store";
import { cn, departmentPickerItems, employeeDepartmentIds } from "@/lib/utils";
import type { Employee } from "@/lib/types";

const statusMeta: Record<string, { label: string; tone: string }> = {
  active: { label: "正常", tone: "bg-pine-soft text-pine" },
  invited: { label: "待激活", tone: "bg-amber-soft text-amber-deep" },
  disabled: { label: "已停用", tone: "bg-[#eef1ec] text-muted" },
};

function EditMemberDialog({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { departments, roles, updateEmployee } = useApp();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>(["dept-11"]);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [status, setStatus] = useState<Employee["status"]>("active");

  useEffect(() => {
    if (open && employee) {
      setName(employee.name);
      setTitle(employee.title);
      setEmail(employee.email);
      setPhone(employee.phone);
      setDepartmentIds(employeeDepartmentIds(employee));
      setRoleIds(employee.roleIds);
      setStatus(employee.status);
    }
  }, [open, employee]);

  if (!employee) return null;
  const save = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("请填写姓名与工作邮箱");
      return;
    }
    updateEmployee(employee.id, { name, email, title, phone, departmentId: departmentIds[0] ?? employee.departmentId, departmentIds, roleIds, status });
    toast.success("成员信息已更新");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="编辑成员" description={`${employee.email}`} icon={<UserCheck />} />
        <DialogBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="姓名" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="工作邮箱" required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="手机号"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="职位"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="账号状态"><Select value={status} onValueChange={(v) => setStatus(v as Employee["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">正常</SelectItem><SelectItem value="invited">待激活</SelectItem><SelectItem value="disabled">已停用</SelectItem></SelectContent></Select></Field>
            <Field label="所属部门" hint="可多选" className="sm:col-span-2"><OrgTreeSelect departments={departments} value={departmentIds} onChange={setDepartmentIds} placeholder="选择部门" maxVisible={3} /></Field>
          </div>
          <Field label="角色" hint="可多选">
            <MultiPicker items={roles.map((r) => ({ id: r.id, name: r.name, description: r.description }))} value={roleIds} onChange={setRoleIds} placeholder="选择角色" searchPlaceholder="搜索角色" maxVisible={2} />
          </Field>
        </DialogBody>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={save}><Check /> 保存修改</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrganizationPage() {
  const { departments, employees, roles, addEmployee, addDepartment, updateDepartment, updateEmployee } = useApp();
  const confirm = useConfirm();
  const [selectedDept, setSelectedDept] = useState("all");
  const [deptQuery, setDeptQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [includeSub, setIncludeSub] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(departments.map((d) => d.id)));
  const [addOpen, setAddOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [detail, setDetail] = useState<Employee | null>(null);
  const [editMember, setEditMember] = useState<Employee | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDeptIds, setNewDeptIds] = useState<string[]>(["dept-11"]);
  const [newRoles, setNewRoles] = useState<string[]>(["r3"]);
  const [deptName, setDeptName] = useState("");
  const [deptParent, setDeptParent] = useState("dept-1");
  const [deptHead, setDeptHead] = useState("");
  const [editDeptOpen, setEditDeptOpen] = useState(false);
  const [editDeptId, setEditDeptId] = useState("");
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptParent, setEditDeptParent] = useState<string | null>(null);
  const [editDeptHead, setEditDeptHead] = useState("");

  useEffect(() => {
    const employeeId = new URLSearchParams(window.location.search).get("employee");
    if (!employeeId) return;
    const target = employees.find((employee) => employee.id === employeeId);
    if (target) setDetail(target);
  }, [employees]);

  const childrenOf = (id: string) => departments.filter((d) => d.parentId === id);
  const descendants = (id: string): string[] => {
    const kids = childrenOf(id);
    return [id, ...kids.flatMap((k) => descendants(k.id))];
  };
  const countFor = (id: string) => employees.filter((e) => employeeDepartmentIds(e).some((deptId) => descendants(id).includes(deptId))).length;

  const selectedName = selectedDept === "all" ? "全部成员" : departments.find((d) => d.id === selectedDept)?.name ?? "全部成员";
  const scopedIds = selectedDept === "all" ? null : includeSub ? descendants(selectedDept) : [selectedDept];

  const visibleEmployees = useMemo(() => employees.filter((e) => {
    if (scopedIds && !employeeDepartmentIds(e).some((deptId) => scopedIds.includes(deptId))) return false;
    if (roleFilter !== "all" && !e.roleIds.includes(roleFilter)) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (memberQuery.trim()) {
      const q = memberQuery.toLowerCase();
      return `${e.name}${e.email}${e.title}${e.phone}`.toLowerCase().includes(q);
    }
    return true;
  }), [employees, scopedIds, memberQuery, roleFilter, statusFilter]);

  const renderNode = (id: string, depth = 0): React.ReactNode => {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return null;
    if (deptQuery.trim() && !dept.name.includes(deptQuery) && childrenOf(id).every((c) => !c.name.includes(deptQuery))) return null;
    const kids = childrenOf(id);
    const isOpen = expanded.has(id);
    return (
      <div key={id}>
        <div
          className={cn(
            "group flex h-8 items-center gap-1.5 rounded-lg pr-1 text-[13px] transition-colors",
            selectedDept === id ? "bg-pine-soft/70 text-pine" : "text-ink-soft hover:bg-[#f5f7f2]"
          )}
          style={{ paddingLeft: depth * 14 + 4 }}
        >
          <button
            aria-label={isOpen ? "折叠" : "展开"}
            onClick={() => setExpanded((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; })}
            className={cn("flex size-4 items-center justify-center text-muted", kids.length === 0 && "invisible")}
          >
            {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </button>
          <button onClick={() => setSelectedDept(id)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
            <Building2 className={cn("size-3.5 shrink-0", selectedDept === id ? "text-pine" : "text-[#9aa69e]")} />
            <span className="truncate">{dept.name}</span>
            <span className={cn("num ml-auto text-[12px]", selectedDept === id ? "text-pine/70" : "text-muted")}>{countFor(id)}</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex size-5 items-center justify-center rounded text-muted opacity-0 hover:bg-white hover:text-ink group-hover:opacity-100" aria-label="部门操作"><MoreHorizontal className="size-3" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setDeptParent(id); setDeptOpen(true); }}><FolderPlus /> 新建子部门</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setEditDeptId(id); setEditDeptName(dept.name); setEditDeptParent(dept.parentId); setEditDeptHead(dept.headId ?? ""); setEditDeptOpen(true); }}><Building2 /> 编辑部门</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setNewDeptIds([dept.id]); setAddOpen(true); }}><UserPlus /> 添加成员</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isOpen && kids.length > 0 ? <div>{kids.map((k) => renderNode(k.id, depth + 1))}</div> : null}
      </div>
    );
  };

  const submitMember = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("请填写姓名与工作邮箱");
      return;
    }
    addEmployee({ name: newName, email: newEmail, phone: newPhone || "待补充", departmentIds: newDeptIds, title: newTitle || "待定", roleIds: newRoles });
    toast.success("邀请已发送，等待成员接受");
    setAddOpen(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewTitle("");
  };

  const submitDept = () => {
    if (!deptName.trim()) {
      toast.error("请填写部门名称");
      return;
    }
    addDepartment(deptName, deptParent, deptHead || undefined);
    toast.success("部门已创建");
    setDeptOpen(false);
    setDeptName("");
    setDeptHead("");
  };

  const totalActive = employees.filter((e) => e.status === "active").length;
  const totalInvited = employees.filter((e) => e.status === "invited").length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.035em] text-ink">员工与部门</h1>
          <span className="text-[12px] text-muted">{employees.length} 位成员 · {departments.length} 个部门</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => toast.success("通讯录已导出")}><Download /> 导出通讯录</Button>
          <Button onClick={() => setAddOpen(true)}><UserPlus /> 邀请成员</Button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "员工总数", value: employees.length, suffix: "人", tip: "包含在岗、待激活和已停用成员", icon: Users },
          { label: "在岗员工", value: totalActive, suffix: "人", tip: "账号状态正常的成员", icon: UserCheck },
          { label: "待激活", value: totalInvited, suffix: "人", tip: "已发送邀请，尚未接受", icon: Mail },
          { label: "已停用", value: employees.filter((e) => e.status === "disabled").length, suffix: "人", tip: "停用后保留历史数据", icon: UserX },
        ].map(({ label, value, suffix, tip, icon: Icon }) => (
          <div key={label} className="surface flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] text-muted">{label}<InfoTip text={tip} /></div>
              <div className="mt-1.5 flex items-baseline gap-1"><span className="num text-[23px] font-semibold tracking-[-0.04em] text-ink">{value}</span><span className="text-[12px] text-muted">{suffix}</span></div>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-pine"><Icon className="size-4" /></span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 items-start gap-5">
        <div className="surface col-span-12 flex flex-col overflow-hidden xl:sticky xl:top-[76px] xl:col-span-3">
          <div className="border-b border-line p-3.5">
            <div className="flex items-center justify-between">
              <SectionTitle title="组织架构" />
              <button onClick={() => setDeptOpen(true)} className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="新建部门"><FolderPlus className="size-3.5" /></button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input value={deptQuery} onChange={(e) => setDeptQuery(e.target.value)} placeholder="搜索部门" className="h-8 w-full rounded-lg border border-line bg-[#fafbf8] pl-8 pr-2.5 text-[12.5px] outline-none focus:border-pine/50" />
            </div>
          </div>
          <div className="max-h-[calc(100vh-250px)] flex-1 overflow-y-auto p-2.5">
            <button onClick={() => setSelectedDept("all")} className={cn("mb-1 flex h-8 w-full items-center gap-2 rounded-lg px-2 text-[13px] transition-colors", selectedDept === "all" ? "bg-pine-soft/70 font-medium text-pine" : "text-ink-soft hover:bg-[#f5f7f2]")}>
              <Users className="size-3.5" /> 全部成员<span className="num ml-auto text-[12px] text-muted">{employees.length}</span>
            </button>
            {departments.filter((d) => !d.parentId).map((d) => renderNode(d.id))}
          </div>
          <div className="border-t border-line p-2.5">
            <button onClick={() => { setDeptParent("dept-1"); setDeptOpen(true); }} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-[12.5px] text-muted transition-colors hover:border-pine/30 hover:text-pine"><Plus className="size-3" /> 新建部门</button>
          </div>
        </div>

        <div className="surface col-span-12 overflow-visible xl:col-span-9">
          <div className="flex flex-wrap items-center gap-2 rounded-t-[17px] border-b border-line bg-[#fcfcf9] px-4 py-3 xl:sticky xl:top-[60px] xl:z-20">
            <SearchInput placeholder="搜索姓名、邮箱、职位" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} className="w-full sm:w-[240px]" />
            <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-[130px]"><SelectValue placeholder="全部角色" /></SelectTrigger><SelectContent><SelectItem value="all">全部角色</SelectItem>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[124px]"><SelectValue placeholder="全部状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="active">正常</SelectItem><SelectItem value="invited">待激活</SelectItem><SelectItem value="disabled">已停用</SelectItem></SelectContent></Select>
            <label className="flex items-center gap-1.5 text-[12px] text-muted">包含子部门 <Switch checked={includeSub} onCheckedChange={setIncludeSub} /></label>
            <span className="ml-auto text-[12px] text-muted">共 <span className="num font-medium text-ink">{visibleEmployees.length}</span> 人</span>
          </div>

          <div className="hidden overflow-x-auto md:block 2xl:overflow-visible">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="z-10 bg-[#fafbf8] 2xl:[&>tr>th]:sticky 2xl:[&>tr>th]:top-[117px] 2xl:[&>tr>th]:z-10 2xl:[&>tr>th]:bg-[#fafbf8]"><tr className="border-b border-line bg-[#fafbf8] text-[12.5px] text-muted">
                <th className="min-w-[180px] py-2.5 pl-5 font-medium">姓名</th>
                <th className="min-w-[220px] py-2.5 pr-4 font-medium">联系方式</th>
                <th className="min-w-[118px] py-2.5 pr-4 font-medium">部门</th>
                <th className="min-w-[155px] py-2.5 pr-4 font-medium">角色</th>
                <th className="w-[80px] py-2.5 pr-4 font-medium">状态</th>
                <th className="w-[108px] py-2.5 pr-4 font-medium">最后活跃</th>
                <th className="w-[110px] px-4 py-2.5 text-right font-medium">操作</th>
              </tr></thead>
              <tbody>
                {visibleEmployees.map((e) => {
                  const deptNames = employeeDepartmentIds(e).map((id) => departments.find((d) => d.id === id)?.name ?? id);
                  const roleNames = e.roleIds.map((id) => roles.find((r) => r.id === id)?.name ?? id);
                  const st = statusMeta[e.status];
                  return (
                    <tr key={e.id} className="group cursor-pointer border-b border-line/70 last:border-0 hover:bg-[#fafbf8]" onClick={() => setDetail(e)}>
                      <td className="py-3.5 pl-5 pr-4"><div className="flex items-center gap-2.5"><Avatar name={e.name} size={30} /><div><div className="flex items-center gap-1.5"><span className="text-[13px] font-medium text-ink group-hover:text-pine">{e.name}</span>{e.id === "emp-1" ? <span className="rounded bg-pine-soft px-1 py-0.5 text-[11.5px] text-pine">我</span> : null}</div><div className="mt-0.5 text-[12px] text-muted">{e.title}</div></div></div></td>
                      <td className="py-3.5 pr-4"><div className="text-[12.5px] text-ink-soft">{e.email}</div><div className="mt-0.5 text-[12px] text-muted">{e.phone}</div></td>
                      <td className="py-3.5 pr-4"><OverflowTags items={deptNames} max={1} tooltipLabel="所属部门" /></td>
                      <td className="py-3.5 pr-4"><OverflowTags items={roleNames} max={2} tooltipLabel="全部角色" /></td>
                      <td className="whitespace-nowrap py-3.5 pr-4"><span className={cn("rounded px-1.5 py-0.5 text-[12px] font-medium", st.tone)}>{st.label}</span></td>
                      <td className="whitespace-nowrap py-3.5 pr-4 text-[12px] text-muted">{e.lastActive}</td>
                      <td className="px-4 py-3.5 text-right" onClick={(ev) => ev.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><button className="flex size-7 items-center justify-center rounded-lg text-muted hover:bg-[#eef1ec] hover:text-ink" aria-label="更多"><MoreHorizontal className="size-3.5" /></button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => setDetail(e)}><Users /> 查看详情</DropdownMenuItem><DropdownMenuItem onClick={() => setEditMember(e)}><UserCheck /> 编辑成员</DropdownMenuItem>{e.status === "disabled" ? <DropdownMenuItem onClick={() => { updateEmployee(e.id, { status: "active" }); toast.success("成员已启用"); }}><UserCheck /> 启用账号</DropdownMenuItem> : <DropdownMenuItem danger onClick={async () => { const ok = await confirm({ title: "停用该成员？", description: "停用后该成员将无法登录企业工作台，但历史数据会保留。", confirmText: "停用账号", tone: "danger" }); if (!ok) return; updateEmployee(e.id, { status: "disabled" }); toast.success("成员已停用"); }}><UserX /> 停用账号</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-line md:hidden">
            {visibleEmployees.map((e) => {
              const deptNames = employeeDepartmentIds(e).map((id) => departments.find((d) => d.id === id)?.name ?? id);
              const roleNames = e.roleIds.map((id) => roles.find((r) => r.id === id)?.name ?? id);
              const st = statusMeta[e.status];
              return (
                <button key={e.id} onClick={() => setDetail(e)} className="flex w-full items-start gap-3 p-4 text-left transition-colors active:bg-[#fafbf8]">
                  <Avatar name={e.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5"><span className="truncate text-[13.5px] font-semibold text-ink">{e.name}</span><span className={cn("rounded px-1.5 py-0.5 text-[11.5px]", st.tone)}>{st.label}</span></div>
                    <div className="mt-0.5 truncate text-[12px] text-muted">{e.title} · {deptNames.join(" / ")}</div>
                    <div className="mt-1 truncate text-[12px] text-muted">{e.email}</div>
                    <div className="mt-1.5"><OverflowTags items={roleNames} max={2} tooltipLabel="全部角色" /></div>
                  </div>
                  <ChevronRight className="mt-2 size-3.5 text-muted" />
                </button>
              );
            })}
          </div>

          {visibleEmployees.length === 0 ? <EmptyState icon={<Users />} title="这个部门还没有成员" description="邀请成员加入，或切换到其他部门查看。" action={<Button size="sm" onClick={() => setAddOpen(true)}><UserPlus /> 邀请成员</Button>} /> : null}
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12.5px] text-muted"><span>共 {visibleEmployees.length} 位成员</span><div className="flex gap-1"><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">‹</button><span className="flex size-7 items-center justify-center rounded-md bg-pine text-white">1</span><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">2</button><button className="flex size-7 items-center justify-center rounded-md hover:bg-[#eef1ec]">›</button></div></div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent size="md" className="p-0">
          <DialogHeader title="邀请成员" description="成员会收到一封邀请邮件，接受后即可加入企业。" icon={<UserPlus />} />
          <DialogBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="姓名" required><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="成员姓名" /></Field>
              <Field label="工作邮箱" required><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@chengming.ai" /></Field>
              <Field label="手机号"><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="138 0000 0000" /></Field>
              <Field label="职位"><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="例如：产品经理" /></Field>
              <Field label="所属部门" hint="可多选" className="sm:col-span-2"><OrgTreeSelect departments={departments} value={newDeptIds} onChange={setNewDeptIds} placeholder="选择部门" maxVisible={3} /></Field>
            </div>
            <Field label="分配角色" hint="可多选">
              <MultiPicker items={roles.map((r) => ({ id: r.id, name: r.name, description: r.description }))} value={newRoles} onChange={setNewRoles} placeholder="选择角色" searchPlaceholder="搜索角色" maxVisible={2} />
            </Field>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={submitMember}><Check /> 发送邀请</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
        <DialogContent size="sm" className="p-0">
          <DialogHeader title="新建部门" description="部门会出现在组织架构与职位所属部门中。" icon={<FolderPlus />} />
          <DialogBody className="space-y-4">
            <Field label="部门名称" required><Input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="例如：增长运营组" /></Field>
            <Field label="上级部门"><Select value={deptParent} onValueChange={setDeptParent}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="部门负责人" hint="将同步负责人角色">
              <Select value={deptHead || "none"} onValueChange={(v) => setDeptHead(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="暂不指定" /></SelectTrigger>
                <SelectContent><SelectItem value="none">暂不指定</SelectItem>{employees.filter((e) => e.status !== "disabled").map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </DialogBody>
          <DialogFooter><Button variant="secondary" onClick={() => setDeptOpen(false)}>取消</Button><Button onClick={submitDept}><Check /> 创建部门</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)} width="540px" title="成员详情" onPrevious={detail && visibleEmployees.findIndex((e) => e.id === detail.id) > 0 ? () => { const i = visibleEmployees.findIndex((e) => e.id === detail.id); setDetail(visibleEmployees[i - 1]); } : undefined} onNext={detail && visibleEmployees.findIndex((e) => e.id === detail.id) >= 0 && visibleEmployees.findIndex((e) => e.id === detail.id) < visibleEmployees.length - 1 ? () => { const i = visibleEmployees.findIndex((e) => e.id === detail.id); setDetail(visibleEmployees[i + 1]); } : undefined}>
        {detail ? (
          <div className="flex h-full flex-col bg-paper">
            <div className="border-b border-line bg-surface px-6 py-6">
              <div className="pr-8">
                <div className="flex items-center gap-3.5">
                  <Avatar name={detail.name} size={52} />
                  <div><div className="flex items-center gap-2"><h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{detail.name}</h2><Badge tone={detail.status === "active" ? "pine" : detail.status === "invited" ? "amber" : "neutral"}>{statusMeta[detail.status].label}</Badge></div><div className="mt-1 text-[12.5px] text-muted">{detail.title} · {employeeDepartmentIds(detail).map((id) => departments.find((d) => d.id === id)?.name).filter(Boolean).join(" / ")}</div></div>
                </div>
                <div className="mt-4"><OverflowTags items={detail.roleIds.map((rid) => roles.find((r) => r.id === rid)?.name ?? rid)} max={3} tooltipLabel="全部角色" /></div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Tabs defaultValue="profile">
                <div className="sticky top-0 z-10 border-b border-line bg-surface px-5">
                  <TabsList className="border-b-0">
                    <TabsTrigger value="profile">基本信息</TabsTrigger>
                    <TabsTrigger value="permissions">角色与权限</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="profile" className="p-5 md:p-6">
                  <div className="surface p-4">
                    <InfoLine label="工作邮箱">{detail.email}</InfoLine>
                    <InfoLine label="手机号">{detail.phone}</InfoLine>
                    <div className="flex items-start justify-between gap-4 py-2.5">
                      <span className="shrink-0 text-[12px] text-muted">所属部门</span>
                      <div className="max-w-[68%]"><OverflowTags items={employeeDepartmentIds(detail).map((id) => departments.find((d) => d.id === id)?.name ?? id)} max={2} tooltipLabel="所属部门" /></div>
                    </div>
                    <InfoLine label="直属上级">{employees.find((e) => e.id === detail.managerId)?.name ?? "—"}</InfoLine>
                    <InfoLine label="负责部门">{departments.filter((d) => d.headId === detail.id).map((d) => d.name).join("、") || "—"}</InfoLine>
                    <InfoLine label="入职日期">{detail.joinedAt}</InfoLine>
                    <InfoLine label="最后活跃">{detail.lastActive}</InfoLine>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditMember(detail)}><UserCheck /> 编辑成员</Button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      if (detail.status !== "disabled") {
                        const ok = await confirm({ title: "停用该成员？", description: "停用后该成员将无法登录企业工作台，但历史数据会保留。", confirmText: "停用账号", tone: "danger" });
                        if (!ok) return;
                      }
                      updateEmployee(detail.id, { status: detail.status === "disabled" ? "active" : "disabled" });
                      toast.success(detail.status === "disabled" ? "账号已启用" : "账号已停用");
                      setDetail(null);
                    }}><UserX /> {detail.status === "disabled" ? "启用账号" : "停用账号"}</Button>
                  </div>
                </TabsContent>
                <TabsContent value="permissions" className="space-y-3 p-5 md:p-6">
                  <SectionTitle title="角色与权限范围" description="来自所分配角色的合并权限" icon={<ShieldCheck />} />
                  {detail.roleIds.map((rid) => {
                    const r = roles.find((x) => x.id === rid);
                    return r ? <div key={rid} className="surface p-4"><div className="flex items-center justify-between gap-2"><div className="text-[13px] font-medium text-ink">{r.name}</div>{r.system ? <Badge tone="amber">系统角色</Badge> : null}</div><p className="mt-1 text-[12px] leading-5 text-muted">{r.description}</p><div className="mt-2 flex flex-wrap gap-1">{Object.entries(r.permissions).filter(([, actions]) => actions.length > 0).slice(0, 10).map(([key]) => <span key={key} className="rounded bg-[#fafbf8] px-1.5 py-0.5 text-[11.5px] text-muted">{({ jobs: "职位", candidates: "候选人", interviews: "面试", messages: "消息", ai: "AI", settings: "设置", org: "组织", roles: "角色", dashboard: "工作台", pipeline: "流程" } as Record<string, string>)[key] ?? key}</span>)}</div></div> : null;
                  })}
                  {detail.roleIds.length === 0 ? <div className="surface p-6 text-center text-[12px] text-muted">暂未分配角色</div> : null}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : null}
      </Sheet>
      <Dialog open={editDeptOpen} onOpenChange={setEditDeptOpen}>
        <DialogContent size="sm" className="p-0">
          <DialogHeader title="编辑部门" description="修改部门名称或调整上级部门。" icon={<Building2 />} />
          <DialogBody className="space-y-4">
            <Field label="部门名称" required><Input value={editDeptName} onChange={(e) => setEditDeptName(e.target.value)} /></Field>
            <Field label="上级部门">
              <Select value={editDeptParent ?? "none"} onValueChange={(v) => setEditDeptParent(v === "none" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">作为一级部门</SelectItem>
                  {departments.filter((d) => d.id !== editDeptId).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="部门负责人" hint="将同步负责人角色">
              <Select value={editDeptHead || "none"} onValueChange={(v) => setEditDeptHead(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="暂不指定" /></SelectTrigger>
                <SelectContent><SelectItem value="none">暂不指定</SelectItem>{employees.filter((e) => e.status !== "disabled").map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditDeptOpen(false)}>取消</Button>
            <Button onClick={() => { if (!editDeptName.trim()) { toast.error("部门名称不能为空"); return; } updateDepartment(editDeptId, { name: editDeptName, parentId: editDeptParent, headId: editDeptHead || undefined }); toast.success("部门已更新"); setEditDeptOpen(false); }}><Check /> 保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditMemberDialog employee={editMember} open={!!editMember} onOpenChange={(v) => !v && setEditMember(null)} />
    </div>
  );
}
