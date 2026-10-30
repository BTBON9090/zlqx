"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const overlayClass =
  "fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-fade";

export function DialogContent({
  className,
  children,
  size = "md",
  hideClose = false,
}: {
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
}) {
  const widths = {
    sm: "max-w-[440px]",
    md: "max-w-[560px]",
    lg: "max-w-[720px]",
    xl: "max-w-[920px]",
  };
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[51] max-h-[92vh] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] border border-white/60 bg-surface shadow-pop outline-none",
          widths[size],
          className
        )}
      >
        <DialogPrimitive.Title className="sr-only">对话框</DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">对话框内容</DialogPrimitive.Description>
        {children}
        {!hideClose ? (
          <DialogPrimitive.Close
            aria-label="关闭"
            className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#eef0ec] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  title,
  description,
  icon,
  className,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-3 border-b border-line px-6 py-5 pr-14", className)}>
      {icon ? (
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-pine-soft text-pine [&_svg]:size-[18px]">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description ? <p className="mt-1 text-[13.5px] leading-5 text-muted">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("max-h-[calc(92vh-150px)] overflow-y-auto px-6 py-5", className)}>{children}</div>;
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex items-center justify-end gap-2 border-t border-line bg-[#fafbf8] px-6 py-4", className)}>{children}</div>;
}

export function Sheet({
  open,
  onOpenChange,
  children,
  width = "720px",
  title = "详情",
  headerActions,
  onPrevious,
  onNext,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  width?: string;
  title?: string;
  headerActions?: React.ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content
          style={{ width }}
          className="fixed inset-y-0 right-0 z-[51] w-full max-w-[100vw] overflow-hidden border-l border-line bg-paper shadow-pop outline-none"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">查看详细信息</DialogPrimitive.Description>
          <div className="flex h-full animate-[sheetIn_.28s_cubic-bezier(.22,1,.36,1)] flex-col">
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-4 md:px-5">
              <span className="min-w-0 truncate text-[14px] font-semibold tracking-[-0.01em] text-ink">{title}</span>
              <div className="ml-auto flex items-center gap-1">
                {onPrevious ? <button onClick={onPrevious} aria-label="上一个" className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:bg-[#eef1ec] hover:text-ink"><ChevronLeft className="size-4" /></button> : null}
                {onNext ? <button onClick={onNext} aria-label="下一个" className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:bg-[#eef1ec] hover:text-ink"><ChevronRight className="size-4" /></button> : null}
                {headerActions}
                <DialogPrimitive.Close
                  aria-label="关闭"
                  className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#eef1ec] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40"
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
