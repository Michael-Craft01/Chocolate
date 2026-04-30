"use client";

import Link from "next/link";
import { Zap, Activity, ShieldCheck, Cpu, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative py-24 bg-[#020202] overflow-hidden">
      {/* Top Gradient Separator */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Zap className="h-5 w-5 text-black fill-black" />
             </div>
             <span className="uppercase tracking-tight">HyprLead</span>
           </div>
           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-sm leading-relaxed">
             Next-generation lead discovery infrastructure. <br />
             Engineered for scaling teams and high-fidelity output.
           </p>
           <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                 <Activity className="h-3 w-3 text-primary animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700">Engine: Active</span>
              </div>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-3 w-3 text-emerald-500" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700">Vault: Secure</span>
              </div>
           </div>
        </div>
        
        <div className="space-y-6">
           <p className="text-[9px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
             <Cpu className="h-3 w-3 text-primary" /> Protocol
           </p>
           <div className="flex flex-col gap-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Privacy <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Terms <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Security <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
           </div>
        </div>

        <div className="space-y-6">
           <p className="text-[9px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
             <Globe className="h-3 w-3 text-primary" /> Systems
           </p>
           <div className="flex flex-col gap-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Dashboard <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
              <Link href="/engine" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Neural Log <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
              <Link href="/pricing" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Subscription <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black text-zinc-800 uppercase tracking-[0.4em]">
         <div className="flex items-center gap-4">
           <span>© 2026 HyprLead Global</span>
           <span className="text-zinc-900">|</span>
           <span>v2.4.1-STABLE</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Operational // Region: ZW-1</span>
         </div>
      </div>
    </footer>
  );
}
