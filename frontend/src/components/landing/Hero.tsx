"use client";

import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, Shield, Globe, Sparkles, Search } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const users = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&h=100&auto=format&fit=crop",
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-48 pb-20 overflow-hidden chocolate-gradient">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10 opacity-15">
        <img src="/images/office.png" className="w-full h-full object-cover" alt="Office Lifestyle" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#161316] via-transparent to-[#161316]" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="max-w-5xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-5 mb-12">
             <div className="flex -space-x-3">
               {users.map((url, i) => (
                 <img key={i} src={url} className="h-10 w-10 rounded-full border-2 border-[#161316] object-cover shadow-2xl" alt="User" />
               ))}
             </div>
             <div className="h-px w-10 bg-white/10" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary orange-glow">Trusted by 1,000+ Founders</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-12 tracking-tightest leading-[0.9] text-white">
            Finding leads <br />
            <span className="gradient-text glow-text">is now easy.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-16 leading-relaxed font-medium">
            We find businesses that need your help, understand their problems, and give you the perfect way to reach them. All in one safe place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-28">
            <Link href="/dashboard" className="h-16 px-12 rounded-sm bg-primary text-white font-black text-[12px] uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center gap-3 glow-primary shadow-2xl shadow-primary/30 orange-glow">
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#features" className="h-16 px-12 rounded-sm glass font-black text-[12px] uppercase tracking-widest transition-all inline-flex items-center hover:bg-white/5 border border-white/10 text-white">
              See How It Works
            </Link>
          </div>
        </motion.div>

        {/* Intelligence Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="glass rounded-[2rem] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden aspect-[16/9] md:aspect-[21/9] flex flex-col p-10 text-left group">
             <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 orange-glow">
                     <Compass className="h-6 w-6 text-white" />
                  </div>
                 <div>
                   <p className="text-sm font-black text-white tracking-tight">Market Search</p>
                   <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Looking for local businesses...</p>
                 </div>
               </div>
               <div className="flex items-center gap-2.5">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse glow-primary" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Engine Active</span>
               </div>
             </div>

             <div className="space-y-4">
               {[
                 { label: "Found", val: "Elite Design Studio", status: "New" },
                 { label: "How to help", val: "Needs more local customers", status: "Goal" },
                 { label: "Message Idea", val: "Hi, we can help you find more clients in your area...", status: "Ready" }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.5 + i * 0.2 }}
                   className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group-hover:bg-white/[0.04] transition-all hover:border-primary/10"
                 >
                   <div>
                     <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">{item.label}</p>
                     <p className="text-[14px] font-bold text-white tracking-tight">{item.val}</p>
                   </div>
                   <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">{item.status}</span>
                 </motion.div>
               ))}
             </div>
          </div>
          
          <div className="absolute -top-10 -right-20 h-48 w-48 bg-primary/10 rounded-full blur-[100px] opacity-50" />
          <div className="absolute -bottom-10 -left-20 h-48 w-48 bg-secondary/20 rounded-full blur-[100px] opacity-30" />
        </motion.div>
      </div>
    </section>
  );
}
