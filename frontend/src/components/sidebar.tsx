"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, CreditCard, Settings, LogOut, Zap, MessageSquare, User, ShieldCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

import { useState, useEffect } from "react";
import { authJson } from "@/lib/api";
import type { Stats } from "@/lib/types";

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
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authJson<Stats>("/api/stats");
        setStats(data);
      } catch (err) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const dailyLimit = stats?.quota?.limit || 10;
  const leadUsage = stats?.quota?.used || 0;
  const usagePercent = Math.min(100, (leadUsage / dailyLimit) * 100);
  const isFree = !stats?.tier || stats?.tier === 'FREE';

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/5 bg-[#050505]">
      <div className="flex h-24 items-center px-8">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-xl tracking-tighter">
          <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center glow-primary">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span>HyprLead</span>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <div className="px-4 py-2 rounded-sm bg-white/[0.02] border border-white/5 flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-primary" />
          <span className="text-xs font-semibold  tracking-normal text-zinc-500">Security: Active</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-sm px-4 py-2.5 text-sm font-bold  tracking-[0.15em] transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)] border border-primary/20"
                  : "text-zinc-500 hover:text-white hover:bg-white/[0.03] border border-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform duration-500", isActive ? "scale-110 glow-primary" : "group-hover:scale-110")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-sm glass-card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold  tracking-normal text-zinc-500">Subscription</p>
              <p className="text-xs font-semibold tracking-tight text-white">{isFree ? "Free Mode" : `${stats?.tier} Tier`}</p>
            </div>
            <div className={cn(
              "h-1.5 w-1.5 rounded-sm",
              isFree ? "bg-amber-500 animate-pulse" : "bg-primary glow-primary"
            )} />
          </div>
          
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm font-bold text-zinc-500  tracking-tight">
              <span>Quota Used</span>
              <span className="text-white">{leadUsage} / {dailyLimit}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-sm overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary glow-primary" 
              />
            </div>
          </div>

          {isFree && (
            <Link href="/billing" className="flex w-full h-10 items-center justify-center rounded-sm bg-primary text-white text-sm font-semibold  tracking-normal hover:scale-[1.02] active:scale-[0.98] transition-all glow-primary">
              Upgrade Engine
            </Link>
          )}
        </div>

        <button className="flex w-full items-center gap-3 rounded-sm px-4 py-3 mt-4 text-sm font-bold text-zinc-600 transition-all hover:text-white hover:bg-white/[0.02]  tracking-normal group">
          <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

