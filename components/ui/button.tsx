import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-pine text-white shadow-[0_1px_0_rgba(255,255,255,.12)_inset,0_6px_16px_-10px_rgba(12,69,57,.6)] hover:bg-pine-deep active:translate-y-px",
        secondary:
          "border border-line bg-surface text-ink hover:border-line-strong hover:bg-[#f8f9f6] active:translate-y-px",
        ghost: "text-ink-soft hover:bg-[#e9ede6] hover:text-ink",
        outline: "border border-pine/30 bg-transparent text-pine hover:bg-pine-soft/60",
        accent:
          "bg-signal text-white shadow-[0_6px_16px_-10px_rgba(223,79,44,.7)] hover:bg-[#c94425] active:translate-y-px",
        soft: "bg-pine-soft text-pine hover:bg-[#cee3d9]",
        danger: "bg-[#fbe9e4] text-danger hover:bg-[#f6d8d0]",
        link: "h-auto p-0 text-pine underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-[13.5px] [&_svg]:size-3.5",
        md: "h-10 rounded-[10px] px-4 text-[14px] [&_svg]:size-4",
        lg: "h-11 rounded-xl px-5 text-sm [&_svg]:size-[18px]",
        icon: "size-9 rounded-[10px] [&_svg]:size-4",
        iconSm: "size-7 rounded-lg [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
