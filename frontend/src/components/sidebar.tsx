"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Settings, LogOut, User, ShieldCheck, 
  Home, Shield, Compass, Sparkles, Zap, ChevronRight, X,
  ArrowRight, Sun, Moon, Menu, MessageSquare
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect } from "react";
import { authJson } from "@/lib/api";
import type { Stats } from "@/lib/types";
import { createClient } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Search", href: "/campaigns", icon: Compass },
  { name: "Your Leads", href: "/leads", icon: Shield },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Discord Guide", href: "/docs/discord", icon: MessageSquare },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [width, setWidth] = useState(256); // Default 64 (256px)
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedWidth = localStorage.getItem("sidebarWidth");
    if (savedWidth) setWidth(parseInt(savedWidth));
    
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed === "true") setIsCollapsed(true);

    const activeTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

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

  const cycleLimit = stats?.cycles?.monthlyLimit || 0;
  const cyclesRemaining = stats?.cycles?.remaining || 0;
  const cyclesUsed = stats?.cycles?.usedThisPeriod || Math.max(0, cycleLimit - cyclesRemaining);
  const usagePercent = cycleLimit ? Math.min(100, (cyclesUsed / cycleLimit) * 100) : 0;
  const isFree = !stats?.tier || stats?.tier === 'FREE';

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar/85 backdrop-blur-md border-b border-card-border flex items-center justify-between px-6 z-[90]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-foreground hover:bg-card/85 rounded-full transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-extrabold text-sm tracking-widest text-foreground uppercase">
            {navItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.name || "HyprLead"}
          </span>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
        </Link>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[120] md:hidden flex flex-col bg-sidebar border-r border-card-border"
            >
               <div className="flex flex-col h-full">
                  <div className="flex h-24 items-center justify-between px-8 border-b border-card-border">
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-black text-lg tracking-tighter">
                      <div className="h-12 w-12 relative">
                        <img 
                          src="/logo.png" 
                          alt="HyprLead Oracle" 
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="text-foreground tracking-tight font-black">HyprLead</span>
                    </Link>
                    <button onClick={() => setMobileOpen(false)} className="p-2 text-foreground">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-4 px-6 py-3 rounded-full text-sm font-semibold transition-all",
                            isActive 
                              ? "bg-primary text-white shadow-md shadow-primary/10" 
                              : "text-foreground hover:bg-card"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="p-6 border-t border-card-border">
                    <button onClick={handleSignOut} className="flex w-full items-center gap-4 px-6 py-3 text-foreground text-sm font-semibold hover:bg-card rounded-full transition-colors" >
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
          "hidden md:flex h-screen flex-col border-r border-card-border bg-sidebar relative group/sidebar select-none transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : ""
        )}
        style={{ width: isCollapsed ? '80px' : `${width}px` }}
      >
      {/* Collapse Toggle */}
      <button onClick={toggleCollapse} className="absolute -right-3 top-10 h-6 w-6 rounded-full bg-card flex items-center justify-center z-[60] shadow-md hover:scale-110 transition-transform active:scale-95 text-foreground" >
        <ChevronRight className={cn("h-3 w-3 transition-transform duration-500", isCollapsed ? "" : "rotate-180")} />
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
      
      <div className={cn("flex h-20 items-center transition-all duration-300", isCollapsed ? "justify-center" : "px-8")}>
        <Link href="/dashboard" className="flex items-center gap-3 font-black text-lg tracking-tighter">
          <div className={cn("relative transition-all duration-500", isCollapsed ? "h-8 w-8" : "h-11 w-11")}>
            <img 
              src="/logo.png" 
              alt="HyprLead Oracle" 
              className="h-full w-full object-contain"
            />
          </div>
          {!isCollapsed && <span className="text-foreground tracking-tight font-black text-base">HyprLead</span>}
        </Link>
      </div>

      <nav className={cn("flex-1 px-4 space-y-1 transition-all mt-4", isCollapsed ? "px-2" : "px-4")}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`tour-nav-${item.name.toLowerCase().replace(" ", "-")}`}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group flex items-center transition-all duration-300",
                isCollapsed 
                  ? "justify-center h-10 w-10 mx-auto px-0 rounded-full" 
                  : "gap-3 px-4 py-2.5 text-sm font-semibold rounded-full",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-foreground hover:bg-card"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform duration-500 shrink-0", isActive ? "scale-110 text-white" : "group-hover:scale-110 text-foreground")} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-4 mt-auto transition-all", isCollapsed ? "p-2" : "p-4")}>
        {!isCollapsed ? (
          <div className="rounded-card bg-card border border-card-border p-5 space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between relative">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground opacity-60">Platform Access</p>
                <p className="text-sm font-bold tracking-tight text-foreground">Open Edition</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-primary glow-primary" />
            </div>
            
            <div className="space-y-1 relative">
              <div className="flex justify-between text-xs font-semibold text-foreground opacity-60">
                <span>Lead Engine</span>
                <span className="text-primary font-bold">Unmetered</span>
              </div>
              <p className="text-[11px] text-foreground/50">Full AI search & dispatch active</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
             <div className="h-2 w-2 rounded-full bg-primary glow-primary" />
          </div>
        )}

        <button onClick={handleSignOut} className={cn( "flex items-center rounded-full transition-all hover:bg-card group text-foreground w-full", isCollapsed ? "justify-center h-10 w-10 mx-auto mt-2" : "gap-3 px-4 py-2 mt-1 text-sm font-semibold" )} >
          <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
          {!isCollapsed && "Sign Out"}
        </button>
      </div>
    </div>
    </>
  );
}

