"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 glow-primary",
      outline: "bg-transparent border border-white/10 text-white hover:bg-white/5",
      ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20",
      secondary: "bg-white/5 text-zinc-300 hover:text-white border border-white/5",
    };

    const sizes = {
      sm: "h-9 px-4 text-[10px]",
      md: "h-11 px-6 text-[11px]",
      lg: "h-14 px-8 text-[12px]",
      xl: "h-16 px-10 text-sm",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[2px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
