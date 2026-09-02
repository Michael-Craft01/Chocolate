"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { Menu, X, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
          <span>HyprLead</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">Open</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
          <Link href="/engine" className="hover:text-foreground transition-colors">Engine</Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          <Link href="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
            Sign In
          </Link>

          <Link 
            href={session ? "/dashboard" : "/signup"} 
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
          >
            {session ? 'Dashboard' : 'Get Started'}
          </Link>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 space-y-3">
          <Link href="/#features" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="/how-it-works" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">How it works</Link>
          <Link href="/engine" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">Engine</Link>
          <Link href="/login" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link>
        </div>
      )}
    </nav>
  );
}
