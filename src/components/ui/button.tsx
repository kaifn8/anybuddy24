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
          // glassProminent — Apple Liquid Glass tinted primary
          "text-primary-foreground rounded-full font-semibold text-[15px] tracking-[-0.01em] bg-gradient-to-b from-[hsl(211_100%_56%)] to-[hsl(211_100%_44%)] border border-[hsla(0_0%_100%_/_0.35)] shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.4),inset_0_-1px_0_hsla(220_40%_15%_/_0.18),0_8px_24px_-6px_hsl(var(--primary)/0.45)] hover:brightness-[1.04] active:scale-[0.97] active:[transition-duration:80ms] transition-all duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)] backdrop-blur-xl backdrop-saturate-200",
        destructive:
          "text-destructive-foreground rounded-full font-semibold text-[15px] bg-gradient-to-b from-destructive to-[hsl(0_68%_44%)] border border-[hsla(0_0%_100%_/_0.3)] shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.35),inset_0_-1px_0_hsla(220_40%_15%_/_0.18),0_8px_24px_-6px_hsl(var(--destructive)/0.45)] hover:brightness-[1.04] active:scale-[0.97] active:[transition-duration:80ms] transition-all duration-300 backdrop-blur-xl backdrop-saturate-200",
        outline:
          // glass — Apple Liquid Glass clear translucent
          "rounded-full text-[14px] font-semibold text-foreground bg-[hsla(var(--glass-bg))] backdrop-blur-xl backdrop-saturate-[1.8] border border-[hsla(var(--glass-border))] shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.5),0_4px_16px_-4px_hsla(var(--glass-shadow))] hover:bg-[hsla(var(--glass-bg-heavy))] active:scale-[0.97] active:[transition-duration:80ms] transition-all duration-300",
        secondary:
          // glass — clear Liquid Glass
          "rounded-full text-[14px] font-semibold text-foreground bg-[hsla(var(--glass-bg))] backdrop-blur-xl backdrop-saturate-[1.8] border border-[hsla(var(--glass-border))] shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.5),0_4px_16px_-4px_hsla(var(--glass-shadow))] hover:bg-[hsla(var(--glass-bg-heavy))] active:scale-[0.97] active:[transition-duration:80ms] transition-all duration-300",
        ghost:
          "text-muted-foreground rounded-full text-[14px] hover:bg-[hsla(var(--glass-bg))] hover:text-foreground hover:backdrop-blur-xl active:scale-[0.97] active:[transition-duration:80ms] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline text-[14px]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-14 px-8 text-[16px]",
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
