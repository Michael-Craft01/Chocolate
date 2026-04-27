"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, User, ShieldCheck, Home, Shield, Compass, Sparkles, Zap, ChevronRight, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

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
  const [width, setWidth] = useState(256); // Default 64 (256px)
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedWidth = localStorage.getItem("sidebarWidth");
    if (savedWidth) setWidth(parseInt(savedWidth));
    
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", next.toString());
    
    // When collapsing, reset to standard small width
    if (next) {
      document.documentElement.style.setProperty('--sidebar-width', `80px`);
    } else {
      document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    if (isCollapsed) return;
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.min(Math.max(200, e.clientX), 400);
      setWidth(newWidth);
      localStorage.setItem("sidebarWidth", newWidth.toString());
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      document.documentElement.style.setProperty('--sidebar-width', isMobile ? '0px' : (isCollapsed ? '80px' : `${width}px`));
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, width, isCollapsed]);

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
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-8 right-8 h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center z-[100] shadow-2xl glow-primary active:scale-95 transition-all border border-white/20"
      >
        <Compass className={cn("h-7 w-7", mobileOpen && "animate-spin")} />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[120] md:hidden flex flex-col chocolate-gradient border-r border-white/10"
            >
               <div className="flex flex-col h-full">
                  <div className="flex h-24 items-center justify-between px-8 border-b border-white/5">
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-black text-xl tracking-tighter">
                      <img src="/logo.png" alt="" className="h-12 w-12 invert" />
                      <span className="text-white">HyprLead</span>
                    </Link>
                    <button onClick={() => setMobileOpen(false)} className="p-2 text-zinc-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-4 px-6 py-4 rounded-sm text-[14px] font-bold uppercase tracking-widest transition-all",
                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="p-6 border-t border-white/5">
                    <button className="flex w-full items-center gap-4 px-6 py-4 text-zinc-500 text-[14px] font-bold uppercase tracking-widest">
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div 
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-white/5 chocolate-gradient relative group/sidebar select-none transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : ""
        )}
        style={{ width: isCollapsed ? '80px' : `${width}px` }}
      >
      {/* Collapse Toggle */}
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-10 h-6 w-6 rounded-full bg-primary border border-white/10 flex items-center justify-center z-[60] shadow-xl hover:scale-110 transition-transform active:scale-95"
      >
        <ChevronRight className={cn("h-3 w-3 text-white transition-transform duration-500", isCollapsed ? "" : "rotate-180")} />
      </button>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div 
          onMouseDown={startResizing}
          className={cn(
            "absolute right-0 top-0 w-1 h-full cursor-col-resize transition-all z-50",
            isResizing ? "bg-primary w-0.5" : "hover:bg-primary/30 w-1"
          )}
        />
      )}
      
      <div className={cn("flex h-24 items-center transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-8")}>
        <Link href="/dashboard" className="flex items-center gap-3 font-black text-xl tracking-tighter shrink-0">
          <img
            src="/logo.png"
            alt="HyprLead Logo"
            className={cn("object-contain transition-all duration-500", isCollapsed ? "h-10 w-10" : "h-16 w-16")}
            style={{ filter: 'invert(1)' }}
          />
          {!isCollapsed && <span className="text-white tracking-tight">HyprLead</span>}
        </Link>
      </div>

      <div className={cn("px-4 mb-4 transition-all", isCollapsed ? "px-2" : "px-4")}>
        <div className={cn("py-2 rounded-sm bg-white/[0.03] border border-white/5 flex items-center glass transition-all", isCollapsed ? "justify-center px-0" : "px-4 gap-2")}>
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Private Connection</span>}
        </div>
      </div>

      <nav className={cn("flex-1 px-4 space-y-1.5 transition-all", isCollapsed ? "px-2" : "px-4")}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group flex items-center rounded-sm transition-all duration-300",
                isCollapsed ? "justify-center h-12 w-12 mx-auto px-0" : "gap-3 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.15em]",
                isActive 
                  ? "bg-primary/20 text-white shadow-[0_0_20px_-5px_rgba(255,109,41,0.2)] border border-primary/30 glass"
                  : "text-zinc-500 hover:text-white hover:bg-white/[0.03] border border-transparent"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 transition-transform duration-500 shrink-0", isActive ? "scale-110 text-primary" : "group-hover:scale-110")} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-4 mt-auto transition-all", isCollapsed ? "p-2" : "p-4")}>
        {!isCollapsed ? (
          <div className="rounded-sm glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Current Plan</p>
                <p className="text-sm font-black tracking-tight text-white">{isFree ? "Free Access" : `${stats?.tier} Plan`}</p>
              </div>
              <div className={cn(
                "h-1.5 w-1.5 rounded-sm",
                isFree ? "bg-amber-500 animate-pulse" : "bg-primary glow-primary orange-glow"
              )} />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
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
              <Link href="/billing" className="flex w-full h-11 items-center justify-center rounded-sm bg-primary text-white text-[12px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all glow-primary shadow-xl shadow-primary/20">
                Upgrade Now
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
             <div className={cn(
                "h-2 w-2 rounded-full",
                isFree ? "bg-amber-500" : "bg-primary glow-primary"
              )} />
          </div>
        )}

        <button className={cn("flex items-center rounded-sm transition-all hover:text-white hover:bg-white/[0.02] uppercase tracking-[0.2em] group", isCollapsed ? "justify-center h-12 w-12 mx-auto mt-2" : "gap-3 px-4 py-4 mt-4 text-[12px] font-bold text-zinc-600")}>
          <LogOut className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          {!isCollapsed && "Sign Out"}
        </button>
      </div>
    </div>
    </>
  );
}

