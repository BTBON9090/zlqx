"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("lin.lan@chengming.ai");
  const [password, setPassword] = useState("demo2026");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("请输入企业邮箱与密码");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 650));
    setLoading(false);
    toast.success("欢迎回来，林岚");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="relative hidden w-[56%] overflow-hidden bg-pine-deep p-10 text-white lg:flex lg:flex-col xl:w-[58%] xl:p-14">
        <div className="signal-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-24 top-1/4 size-[420px] rounded-full bg-[#3f8068]/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 size-[420px] rounded-full bg-[#df4f2c]/10 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <BrandLockup light />
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[12px] text-[#a9c3b5]">企业版 · AI 招聘工作台</span>
        </div>

        <div className="relative z-10 flex flex-1 items-center">
          <div className="w-full max-w-[560px]">
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#f0b09d]">
              <span className="h-px w-6 bg-[#df4f2c]/70" />
              招聘，是一场关于人的判断
            </div>
            <h1 className="mt-6 text-balance text-[40px] font-semibold leading-[1.2] tracking-[-0.04em] xl:text-[48px]">
              招聘的下一程，
              <br />
              <span className="text-[#a9c3b5]">由信号驱动。</span>
            </h1>
            <p className="mt-5 max-w-[440px] text-[13.5px] leading-7 text-[#a9c3b5]">
              从一份简历到一次正确的录用，智聘千寻把分散的信号收拢成清晰的判断。小聘替你做重复的事，你把时间留给真正重要的人。
            </p>

            <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-[#8fae9f]">
                <span>今日招聘信号</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#7fd2a8]" /> 实时</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {[
                  ["周予安 · 高级产品经理", "二面 · 10:00", "92", "bg-[#f2b3a1]"],
                  ["裴然 · 解决方案顾问", "Offer 审批 · 待处理", "92", "bg-[#e7c06d]"],
                  ["江屿 · 前端工程师", "数字人初试 · 11:30", "84", "bg-[#7fd2a8]"],
                ].map(([name, note, score, dot]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`size-1.5 rounded-full ${dot}`} />
                    <span className="flex-1 text-[12.5px] text-[#d5e4da]">{name}</span>
                    <span className="hidden text-[12px] text-[#8fae9f] sm:block">{note}</span>
                    <span className="num text-[13px] font-semibold text-white">{score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-5">
              <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/8"><Sparkles className="size-3 text-[#f2b3a1]" /></span>
              <div>
                <p className="max-w-[420px] text-[12.5px] leading-5 text-[#b7cbbf]">“小聘把筛选、安排和提醒接了过去，我们终于有时间与候选人真正对话。招聘第一次不像在追进度。”</p>
                <div className="mt-2 text-[12px] text-[#7d9a8c]">林岚 · 招聘负责人 · 澄明科技</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[12px] text-[#7d9a8c]">
          <span>© 2026 智聘千寻</span>
          <div className="flex items-center gap-4"><span>隐私政策</span><span>服务条款</span><span className="flex items-center gap-1"><ShieldCheck className="size-2.5" /> 等保三级</span></div>
        </div>
      </div>

      <div className="flex min-h-screen flex-1 flex-col px-6 py-7 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><BrandLockup /></div>
          <a href="https://chengming.ai" className="flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-pine">访问企业官网 <ArrowRight className="size-3" /></a>
        </div>

        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-12">
          <div className="flex size-11 items-center justify-center rounded-xl bg-pine-soft text-pine"><LockKeyhole className="size-5" /></div>
          <h2 className="mt-5 text-[26px] font-semibold tracking-[-0.035em] text-ink">欢迎回来</h2>
          <p className="mt-1.5 text-[13px] leading-5 text-muted">登录澄明科技的招聘工作台，继续今天的招聘进程。</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-ink-soft">企业邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="h-11 w-full rounded-[11px] border border-line bg-white pl-10 pr-3 text-[13.5px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-pine/60 focus:ring-4 focus:ring-pine/8" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-[13px] font-medium text-ink-soft">密码</label><button type="button" onClick={() => toast.info("请联系企业管理员重置密码")} className="text-[12.5px] text-pine hover:underline">忘记密码？</button></div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input id="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" className="h-11 w-full rounded-[11px] border border-line bg-white pl-10 pr-10 text-[13.5px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-pine/60 focus:ring-4 focus:ring-pine/8" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "隐藏密码" : "显示密码"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-muted">
              <span className={`flex size-4 items-center justify-center rounded border ${remember ? "border-pine bg-pine text-white" : "border-[#c7d0c6] bg-white"}`}>{remember ? <Check className="size-2.5" strokeWidth={3} /> : null}</span>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only" />
              在这台设备上保持登录
            </label>
            <Button type="submit" className="h-11 w-full rounded-[11px] text-[14px]" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              {loading ? "正在登录…" : "登录工作台"}
              {!loading ? <ArrowRight /> : null}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-line bg-[#fafbf8] px-3 py-2.5 text-[12px] text-muted">
            <Sparkles className="size-3 text-signal" />
            演示账号已填入，直接点击「登录工作台」即可体验
          </div>

          <div className="mt-7 flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-[12px] text-muted">或使用企业账号登录</span><span className="h-px flex-1 bg-line" /></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["企业微信", "飞书"].map((name) => (
              <button key={name} onClick={() => toast.info(`${name} 扫码登录即将开放`)} className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-line bg-white text-[13px] font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-[#fafbf8]">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#eef1ec] text-[11.5px] text-pine">{name.slice(0, 1)}</span>{name}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 text-[12px] text-muted"><Users className="size-3" /> 还没有企业账号？<button onClick={() => toast.info("请联系企业管理员开通账号")} className="font-medium text-pine hover:underline">联系管理员</button></div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted">
          <span>登录即表示你同意《服务条款》与《隐私政策》</span>
          <span className="flex items-center gap-1"><ShieldCheck className="size-2.5 text-pine" /> 安全连接</span>
        </div>
      </div>
    </div>
  );
}
