import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground rounded-2xl font-bold text-[14px] tracking-[-0.01em] bg-gradient-to-b from-[hsl(211_100%_56%)] to-[hsl(211_100%_42%)] border border-[hsla(211_100%_72%_/_0.3)] shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.25),0_1px_3px_hsl(var(--primary)/0.15),0_6px_20px_hsl(var(--primary)/0.2)] hover:shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.3),0_2px_8px_hsl(var(--primary)/0.2),0_12px_32px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 hover:brightness-[1.04] active:scale-[0.97] active:duration-[80ms] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] backdrop-blur-xl",
        destructive:
          "text-destructive-foreground rounded-2xl font-bold text-[14px] bg-gradient-to-b from-destructive to-[hsl(0_68%_42%)] border border-[hsla(0_68%_72%_/_0.25)] shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.2),0_1px_3px_hsl(var(--destructive)/0.15),0_6px_16px_hsl(var(--destructive)/0.15)] hover:shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.25),0_4px_24px_hsl(var(--destructive)/0.2)] hover:-translate-y-0.5 active:scale-[0.97] active:duration-[80ms] transition-all duration-300 backdrop-blur-xl",
        outline:
          "rounded-2xl text-[13px] font-semibold text-foreground bg-[hsla(var(--glass-bg))] backdrop-blur-xl border border-[hsla(var(--glass-border))] shadow-[inset_0_1px_0_hsla(var(--glass-highlight)),0_1px_3px_hsla(var(--glass-shadow)),0_4px_16px_hsla(var(--glass-shadow))] hover:bg-[hsla(var(--glass-bg-heavy))] hover:shadow-[inset_0_1px_0_hsla(var(--glass-highlight)),0_2px_8px_hsla(var(--glass-shadow)),0_8px_28px_hsla(var(--glass-shadow-lg))] hover:-translate-y-0.5 active:scale-[0.97] active:duration-[80ms] transition-all duration-300",
        secondary:
          "rounded-2xl text-[13px] font-semibold text-foreground bg-[hsla(var(--glass-bg))] backdrop-blur-xl border border-[hsla(var(--glass-border))] shadow-[inset_0_1px_0_hsla(var(--glass-highlight)),0_1px_3px_hsla(var(--glass-shadow)),0_4px_16px_hsla(var(--glass-shadow))] hover:bg-[hsla(var(--glass-bg-heavy))] hover:shadow-[inset_0_1px_0_hsla(var(--glass-highlight)),0_2px_8px_hsla(var(--glass-shadow)),0_8px_28px_hsla(var(--glass-shadow-lg))] hover:-translate-y-0.5 active:scale-[0.97] active:duration-[80ms] transition-all duration-300",
        ghost:
          "text-muted-foreground rounded-2xl text-[13px] hover:bg-[hsla(var(--glass-bg))] hover:text-foreground hover:shadow-[inset_0_0.5px_0_hsla(var(--glass-highlight)),0_1px_4px_hsla(var(--glass-shadow))] hover:backdrop-blur-xl active:scale-[0.97] active:duration-[80ms] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline text-[13px]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-[12px]",
        lg: "h-13 px-8 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
