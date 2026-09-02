"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Home, Shield, Compass, Settings, LogOut, Sun, Moon, Menu, X 
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Campaigns", href: "/campaigns", icon: Compass },
  { name: "Leads", href: "/leads", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
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

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b border-border bg-background/95 backdrop-blur px-4 flex items-center justify-between z-40">
        <Link href="/dashboard" className="font-semibold text-sm tracking-tight text-foreground">
          HyprLead
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-md hover:bg-accent text-foreground transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border p-6 flex flex-col justify-between shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm tracking-tight text-foreground">HyprLead</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md w-full transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar shrink-0 h-screen sticky top-0 justify-between p-4 selection:bg-primary/20">
        <div className="space-y-6">
          <div className="px-3 py-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-foreground">HyprLead</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">Open</span>
            </Link>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-muted-foreground font-medium">Theme</span>
            <button
              onClick={toggleTheme}
              className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md w-full transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
