"use client";
 
import Link from "next/link";
import { Zap, Activity, ShieldCheck, Cpu, Globe } from "lucide-react";
 
export default function Footer() {
  return (
    <footer className="relative py-16 bg-[#020202] overflow-hidden">
      {/* Top Gradient Separator */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
           <div className="flex items-center gap-3 font-extrabold text-xl tracking-tight text-white">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Zap className="h-5 w-5 text-black fill-black" />
             </div>
             <span className="tracking-tight">HyprLead</span>
           </div>
           <p className="text-xs font-semibold text-white/50 max-w-sm leading-relaxed">
             Next-generation lead generation platform built for growing teams. Find and reach decision-makers with ease.
           </p>
           <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                 <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                 <span className="text-xs font-bold text-white/60">Search Engine: Active</span>
              </div>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                 <span className="text-xs font-bold text-white/60">Security: Verified</span>
              </div>
           </div>
        </div>
        
        <div className="space-y-4">
           <p className="text-xs font-bold text-white flex items-center gap-2">
             <Cpu className="h-3.5 w-3.5 text-primary" /> Company
           </p>
           <div className="flex flex-col gap-2.5 text-xs font-semibold text-white/50">
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
 
        <div className="space-y-4">
           <p className="text-xs font-bold text-white flex items-center gap-2">
             <Globe className="h-3.5 w-3.5 text-primary" /> Links
           </p>
           <div className="flex flex-col gap-2.5 text-xs font-semibold text-white/50">
              <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Dashboard <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
              <Link href="/how-it-works" className="hover:text-primary transition-colors flex items-center gap-2 group">
                How It Works <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
              <Link href="/engine" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Search Engine <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
              <Link href="/pricing" className="hover:text-primary transition-colors flex items-center gap-2 group">
                Pricing <div className="h-[1px] w-0 group-hover:w-4 bg-primary transition-all" />
              </Link>
           </div>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-white/40">
         <div className="flex items-center gap-4">
           <span>© 2026 HyprLead Global</span>
           <span className="text-white/20">|</span>
           <span>Version 2.4.1</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>All systems operational</span>
         </div>
      </div>
    </footer>
  );
}
