"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex flex-col gap-4">
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white">
             <Zap className="h-6 w-6 text-primary" />
             <span className="uppercase">HyprLead</span>
           </div>
           <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest max-w-xs leading-relaxed">Autonomous Lead Generation Infrastructure. Designed for elite founders and scaling teams.</p>
        </div>
        
        <div className="flex gap-16">
           <div className="space-y-4">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Protocol</p>
              <div className="flex flex-col gap-3 text-[10px] font-bold text-zinc-700 uppercase tracking-tight">
                 <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                 <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                 <Link href="#" className="hover:text-white transition-colors">Security</Link>
              </div>
           </div>
           <div className="space-y-4">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Systems</p>
              <div className="flex flex-col gap-3 text-[10px] font-bold text-zinc-700 uppercase tracking-tight">
                 <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                 <Link href="/engine" className="hover:text-white transition-colors">Neural Log</Link>
                 <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              </div>
           </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pt-20 flex justify-between items-center text-[8px] font-black text-zinc-800 uppercase tracking-[0.4em]">
         <span>HyprLead Terminal v2.4.1</span>
         <span>EST. 2026 // Zimbabwe</span>
      </div>
    </footer>
  );
}
