"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'h-20 bg-background/80 border-b border-card-border shadow-sm' : 'h-24 bg-transparent'
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3 group">
          <div className="h-12 w-12 sm:h-14 sm:w-14 relative shrink-0">
             <img 
               src="/logo.png" 
               alt="HyprLead Oracle" 
               className="h-full w-full object-contain animate-neural drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
             />
          </div>
          <span className="text-foreground font-extrabold text-xl tracking-tight truncate">HyprLead</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-foreground/75">
          <Link href="/pricing" className="hover:text-primary transition-all relative group/link">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/#features" className="hover:text-primary transition-all relative group/link">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/#demo-prospector" className="hover:text-primary transition-all relative group/link">
            How it works
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/engine" className="hover:text-primary transition-all relative group/link">
            Engine
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-8">
          <Link href="/login" className="hidden sm:inline text-xs font-black uppercase tracking-[0.2em] text-foreground/75 hover:text-primary transition-colors">Sign In</Link>
          <Link href={session ? "/dashboard" : "/signup"} className="btn-pill-white !bg-primary hover:!bg-primary-hover !text-white border border-primary/20 shadow-sm !h-10 !px-5 sm:!px-6 !text-[10px] !uppercase !tracking-[0.15em] cursor-pointer">
            {session ? 'Dashboard' : 'Get Started'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
