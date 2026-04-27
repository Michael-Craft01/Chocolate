"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, User, ShieldCheck, Home, Shield, Compass, Sparkles, Zap } from "lucide-react";
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
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Search", href: "/campaigns", icon: Compass },
  { name: "Your Leads", href: "/leads", icon: Shield },
  { name: "Billing", href: "/billing", icon: ShieldCheck },
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
    <div className="flex h-screen w-64 flex-col border-r border-white/5 chocolate-gradient">
      <div className="flex h-24 items-center px-8">
        <Link href="/dashboard" className="flex items-center gap-3 font-black text-xl tracking-tighter">
          <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center glow-primary orange-glow">
            <Home className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="text-white tracking-tight">HyprLead</span>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <div className="px-4 py-2 rounded-sm bg-white/[0.03] border border-white/5 flex items-center gap-2 glass">
          <ShieldCheck className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Private Connection</span>
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
                "group flex items-center gap-3 rounded-sm px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                isActive 
                  ? "bg-primary/20 text-white shadow-[0_0_20px_-5px_rgba(255,109,41,0.2)] border border-primary/30 glass"
                  : "text-zinc-500 hover:text-white hover:bg-white/[0.03] border border-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform duration-500", isActive ? "scale-110 text-primary" : "group-hover:scale-110")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-sm glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Current Plan</p>
              <p className="text-xs font-black tracking-tight text-white">{isFree ? "Free Access" : `${stats?.tier} Plan`}</p>
            </div>
            <div className={cn(
              "h-1.5 w-1.5 rounded-sm",
              isFree ? "bg-amber-500 animate-pulse" : "bg-primary glow-primary orange-glow"
            )} />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
              <span>Daily Progress</span>
              <span className="text-white font-black">{leadUsage} / {dailyLimit}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary" 
              />
            </div>
          </div>

          {isFree && (
            <Link href="/billing" className="flex w-full h-11 items-center justify-center rounded-sm bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all glow-primary shadow-xl shadow-primary/20">
              Upgrade Now
            </Link>
          )}
        </div>

        <button className="flex w-full items-center gap-3 rounded-sm px-4 py-4 mt-4 text-[10px] font-bold text-zinc-600 transition-all hover:text-white hover:bg-white/[0.02] uppercase tracking-[0.2em] group">
          <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

