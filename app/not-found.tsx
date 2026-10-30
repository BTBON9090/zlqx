import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex h-[64px] items-center border-b border-line px-6">
        <BrandLockup />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-line bg-white text-muted">
          <SearchX className="size-6" />
        </div>
        <div className="mt-5 text-[13px] font-medium text-pine">404 · 信号丢失</div>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-ink">这个页面不在招聘流程里</h1>
        <p className="mt-2 max-w-[400px] text-[13.5px] leading-6 text-muted">
          链接可能已经失效，或者你没有查看权限。回到工作台，继续处理今天的候选人。
        </p>
        <Button className="mt-6" asChild><Link href="/"><ArrowLeft /> 返回工作台</Link></Button>
      </div>
      <div className="pb-6 text-center text-[12px] text-muted">智聘千寻 · AI 招聘工作台</div>
    </div>
  );
}
