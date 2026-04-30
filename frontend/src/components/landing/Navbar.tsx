"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Command } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'h-20 bg-black/60 border-b border-white/5' : 'h-24 bg-transparent'} backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-all duration-300">
             <Zap className="h-5 w-5 text-black fill-black" />
          </div>
          <span className="text-white font-bold text-xl tracking-[-0.04em]">HyprLead</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/pricing" className="hover:text-white transition-all relative group/link">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/#features" className="hover:text-white transition-all relative group/link">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/#how-it-works" className="hover:text-white transition-all relative group/link">
            How it works
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/engine" className="hover:text-white transition-all relative group/link">
            Engine
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Sign In</Link>
          <Link href={session ? "/dashboard" : "/signup"} className="btn-pill-white !h-10 !px-6 !text-[10px] !uppercase !tracking-[0.15em]">
            {session ? 'Dashboard' : 'Get Started'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
