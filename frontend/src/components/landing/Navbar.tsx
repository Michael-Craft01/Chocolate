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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'h-16 bg-black/40 backdrop-blur-3xl border-b border-white/10' : 'h-24'}`}>
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all">
             <Zap className="h-5 w-5 text-black" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">HyprLead</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/engine" className="hover:text-white transition-colors">Engine</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Sign In</Link>
          <Link href={session ? "/dashboard" : "/signup"} className="button-premium button-primary !h-10 !px-6 !rounded-xl text-xs">
            {session ? 'Dashboard' : 'Get Started'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
