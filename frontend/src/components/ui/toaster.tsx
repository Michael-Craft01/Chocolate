"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group-[.toaster]:bg-zinc-900 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-[2px] group-[.toaster]:p-6 group-[.toaster]:font-sans group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-zinc-400 group-[.toast]:text-[13px] group-[.toast]:font-medium group-[.toast]:mt-1",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-[2px] group-[.toast]:font-bold group-[.toast]:text-[11px] group-[.toast]:px-5 group-[.toast]:h-10 group-[.toast]:uppercase group-[.toast]:tracking-widest transition-all hover:bg-primary/90",
          cancelButton: "group-[.toast]:bg-white/5 group-[.toast]:text-zinc-300 group-[.toast]:rounded-[2px] group-[.toast]:font-bold group-[.toast]:text-[11px] group-[.toast]:px-5 group-[.toast]:h-10 group-[.toast]:uppercase group-[.toast]:tracking-widest transition-all hover:bg-white/10",
          success: "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-500/[0.03]",
          error: "group-[.toaster]:border-red-500/30 group-[.toaster]:bg-red-500/[0.03]",
          warning: "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-500/[0.03]",
        },
      }}
    />
  );
}
