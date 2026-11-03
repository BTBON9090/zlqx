import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-line-strong focus:ring-4 focus:ring-[#e9ede6] disabled:cursor-not-allowed disabled:bg-[#f4f6f2] disabled:text-muted",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full resize-y rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[14px] leading-6 text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-line-strong focus:ring-4 focus:ring-[#e9ede6] disabled:cursor-not-allowed disabled:bg-[#f4f6f2]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-2 block text-[13.5px] font-medium text-ink-soft", className)} {...props} />;
}

export function Field({
  label,
  hint,
  required,
  error,
  action,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  required?: boolean;
  error?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label className="mb-0">
            {label}
            {required ? <span className="ml-1 text-danger">*</span> : null}
          </Label>
          <div className="flex min-w-0 items-center gap-2">
            {hint ? <span className="truncate text-[13px] text-muted">{hint}</span> : null}
            {action}
          </div>
        </div>
      ) : null}
      {children}
      {error ? <p className="mt-1.5 text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}

export function SearchInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </svg>
      <input
        className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-[14px] text-ink outline-none transition-colors placeholder:text-[#9ba69f] hover:border-line-strong focus:border-line-strong focus:ring-4 focus:ring-[#e9ede6]"
        {...props}
      />
    </div>
  );
}
