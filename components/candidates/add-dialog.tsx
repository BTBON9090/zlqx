"use client";

import { useEffect, useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import type { CandidateStage } from "@/lib/types";

export function AddCandidateDialog({
  open,
  onOpenChange,
  defaultJobId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultJobId?: string;
  onCreated?: (id: string) => void;
}) {
  const { jobs, addCandidate } = useApp();
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState(defaultJobId ?? jobs[0].id);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("手动添加");
  const [stage, setStage] = useState<CandidateStage>("screening");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setJobId(defaultJobId ?? jobs[0].id);
      setEmail("");
      setPhone("");
      setSource("手动添加");
      setStage("screening");
      setSummary("");
    }
  }, [open, defaultJobId, jobs]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("请填写候选人姓名");
      return;
    }
    const c = addCandidate({
      name: name.trim(),
      jobId,
      email: email || undefined,
      phone: phone || undefined,
      source,
      stage,
      summary: summary || "手动添加的候选人，等待补充简历信息。",
      tags: ["手动添加"],
    });
    toast.success("候选人已添加");
    onOpenChange(false);
    onCreated?.(c.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0">
        <DialogHeader title="添加候选人" description="手动录入候选人基本信息，后续可补充简历与面试记录。" icon={<UserPlus />} />
        <DialogBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="姓名" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="候选人姓名" />
            </Field>
            <Field label="应聘职位">
              <Select value={jobId} onValueChange={setJobId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{jobs.filter((j) => j.status !== "closed").map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="手机号">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="138 0000 0000" />
            </Field>
            <Field label="邮箱">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </Field>
            <Field label="来源">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["手动添加", "内部推荐", "Boss 直聘", "猎聘", "官网", "校园招聘"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="初始阶段">
              <Select value={stage} onValueChange={(v) => setStage(v as CandidateStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="screening">待筛选</SelectItem>
                  <SelectItem value="interview">面试中</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">已入职</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="备注" className="sm:col-span-2">
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="例如：猎头推荐，擅长 B 端产品，当前在看机会。" className="min-h-[72px]" />
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}><Check /> 添加候选人</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
