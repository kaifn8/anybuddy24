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
          // glassProminent — iOS 26 tinted Liquid Glass (translucent + refractive)
          "text-primary-foreground rounded-full font-semibold text-[15px] tracking-[-0.015em] bg-[hsl(var(--primary)/0.88)] backdrop-blur-2xl backdrop-saturate-[2] border border-[hsla(0_0%_100%_/_0.28)] shadow-[inset_0_1px_0.5px_hsla(0_0%_100%_/_0.55),inset_0_-1px_0.5px_hsla(220_60%_10%_/_0.25),inset_0_0_0_0.5px_hsla(0_0%_100%_/_0.12),0_1px_2px_hsla(220_60%_10%_/_0.12),0_10px_28px_-6px_hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.94)] hover:shadow-[inset_0_1px_0.5px_hsla(0_0%_100%_/_0.6),inset_0_-1px_0.5px_hsla(220_60%_10%_/_0.28),0_2px_4px_hsla(220_60%_10%_/_0.14),0_14px_36px_-6px_hsl(var(--primary)/0.55)] active:scale-[0.96] active:[transition-duration:80ms] transition-all duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]",
        destructive:
          "text-destructive-foreground rounded-full font-semibold text-[15px] tracking-[-0.015em] bg-[hsl(var(--destructive)/0.88)] backdrop-blur-2xl backdrop-saturate-[2] border border-[hsla(0_0%_100%_/_0.28)] shadow-[inset_0_1px_0.5px_hsla(0_0%_100%_/_0.55),inset_0_-1px_0.5px_hsla(0_60%_10%_/_0.25),0_1px_2px_hsla(0_60%_10%_/_0.12),0_10px_28px_-6px_hsl(var(--destructive)/0.5)] hover:bg-[hsl(var(--destructive)/0.94)] active:scale-[0.96] active:[transition-duration:80ms] transition-all duration-300",
        outline:
          // glass — clear Liquid Glass with refractive edge
          "rounded-full text-[14px] font-semibold text-foreground tracking-[-0.015em] bg-[hsla(var(--glass-bg))] backdrop-blur-2xl backdrop-saturate-[2] border border-[hsla(var(--glass-border))] shadow-[inset_0_1px_0.5px_hsla(var(--glass-edge)),inset_0_-1px_0.5px_hsla(var(--glass-edge-bottom)),0_1px_2px_hsla(var(--glass-shadow)),0_8px_24px_-6px_hsla(var(--glass-shadow-lg))] hover:bg-[hsla(var(--glass-bg-heavy))] active:scale-[0.96] active:[transition-duration:80ms] transition-all duration-300",
        secondary:
          "rounded-full text-[14px] font-semibold text-foreground tracking-[-0.015em] bg-[hsla(var(--glass-bg))] backdrop-blur-2xl backdrop-saturate-[2] border border-[hsla(var(--glass-border))] shadow-[inset_0_1px_0.5px_hsla(var(--glass-edge)),inset_0_-1px_0.5px_hsla(var(--glass-edge-bottom)),0_1px_2px_hsla(var(--glass-shadow)),0_8px_24px_-6px_hsla(var(--glass-shadow-lg))] hover:bg-[hsla(var(--glass-bg-heavy))] active:scale-[0.96] active:[transition-duration:80ms] transition-all duration-300",
        ghost:
          "text-muted-foreground rounded-full text-[14px] font-medium hover:bg-[hsla(var(--glass-bg))] hover:text-foreground hover:backdrop-blur-xl active:scale-[0.96] active:[transition-duration:80ms] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline text-[14px]",
      },
      size: {
        default: "h-[44px] px-6 py-2.5",
        sm: "h-[34px] px-4 text-[13px]",
        lg: "h-[52px] px-8 text-[17px]",
        icon: "h-11 w-11",
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
