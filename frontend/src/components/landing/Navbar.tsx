"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/5 bg-[#050505]/60 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tighter group">
          <div className="h-9 w-9 rounded-sm bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,109,41,0.2)] group-hover:scale-105 transition-all">
             <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-white uppercase">HyprLead</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">
          <Link href="/engine" className="hover:text-primary transition-colors">Engine</Link>
          <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-white transition-colors">Sign In</Link>
          <Link href={session ? "/dashboard" : "/login"} className="h-10 px-6 rounded-sm bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center font-black">
            {session ? 'Dashboard' : 'Try Free'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
