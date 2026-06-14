import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Apple Liquid Glass input — clear translucent, concentric pill
          "flex h-11 w-full rounded-2xl px-4 py-2 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-all",
          "bg-[hsla(var(--glass-bg))] backdrop-blur-xl backdrop-saturate-[1.8] border border-[hsla(var(--glass-border))]",
          "shadow-[inset_0_1px_0_hsla(0_0%_100%_/_0.5),0_1px_2px_hsla(var(--glass-shadow))]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0 focus-visible:border-[hsla(var(--glass-border))]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
