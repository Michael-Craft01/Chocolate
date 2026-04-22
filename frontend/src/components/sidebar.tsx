"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, CreditCard, Settings, LogOut, Zap, MessageSquare, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Target },
  { name: "Leads", href: "/leads", icon: MessageSquare },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-card-border bg-card">
      <div className="flex h-20 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6 text-primary fill-primary" />
          <span className="gradient-text">Chocolate</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                isActive 
                  ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_0_1px_rgba(59,130,246,0.1)]"
                  : "border-transparent text-zinc-500 hover:border-white/10 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5 transition-transform", isActive ? "scale-105" : "group-hover:scale-105")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 space-y-4">
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Free Mode</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
              <span>Usage</span>
              <span>0 / 10 Leads</span>
            </div>
            <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[0%] transition-all duration-500" />
            </div>
          </div>
          <Link href="/billing" className="mt-3 block w-full py-2 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest text-center hover:brightness-110 transition-all">
            Upgrade
          </Link>
        </div>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-500 transition-all hover:text-zinc-200 uppercase tracking-wider">
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
