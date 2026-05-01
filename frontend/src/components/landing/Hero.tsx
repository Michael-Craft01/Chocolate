"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, TrendingUp, BarChart3, Users, Zap, Search, Globe, Shield, Sparkles, Activity, Crosshair, Radar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const FloatingTelemetry = () => {
  const [items, setItems] = useState<{ id: number, text: string, x: number, y: number }[]>([]);

  useEffect(() => {
    const data = [
      "SCANNING: 12.8k leads",
      "MATCH FOUND: SaaS Founder",
      "VERIFYING: elon@x.com",
      "UPDATING: Revenue Pipeline",
      "SYNC: Hubspot CRM",
      "EXTRACTING: Pain Points",
      "GEMMA-4: Analyzing...",
      "GEO-LOCK: New York, US"
    ];

    const interval = setInterval(() => {
      setItems(prev => {
        const newItem = {
          id: Date.now(),
          text: data[Math.floor(Math.random() * data.length)],
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        };
        return [...prev.slice(-3), newItem];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute p-2 rounded-sm bg-primary/10 border border-primary/20 backdrop-blur-md flex items-center gap-2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-primary/80">{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center pt-32 pb-20 overflow-hidden bg-black">
      {/* Background System */}
      <div className="bg-animated-mesh" />
      <div className="bg-grid absolute inset-0 opacity-20 -z-10" />
      <div className="hero-glow" />
      <div className="neural-aura" />
      
      {/* Telemetry Corner Accents */}
      <div className="absolute top-40 left-10 telemetry-label flex flex-col gap-1">
        <span>LAT: 40.7128 N</span>
        <span>LNG: 74.0060 W</span>
      </div>
      <div className="absolute top-40 right-10 telemetry-label text-right flex flex-col gap-1">
        <span>EST: $84,503.00</span>
        <span>SYS: OPERATIONAL</span>
      </div>

      <FloatingTelemetry />

      <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Realigned Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-12 backdrop-blur-md">
            <div className="h-10 w-10 relative">
              <img 
                src="/logo.png" 
                alt="HyprLead Oracle" 
                className="h-full w-full object-contain animate-neural drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Next-Gen Revenue Discovery</span>
          </div>

          {/* The Hero Monolith (The "Big" Brand) */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-48 w-48 relative mb-12"
          >
             <img 
               src="/logo.png" 
               alt="HyprLead Oracle" 
               className="h-full w-full object-contain animate-neural drop-shadow-[0_0_80px_rgba(59,130,246,0.6)]"
             />
             <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full -z-10" />
          </motion.div>
          
          <h1 className="text-display mb-10">
            Infinite Revenue. <br />
            <span className="animate-text-shimmer bg-clip-text">Zero Friction.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-zinc-400 text-base md:text-lg font-medium mb-12 leading-relaxed">
            Automated lead discovery that builds your pipeline <br className="hidden md:block" />
            while you focus on closing. High-fidelity prospects, delivered daily.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="btn-pill-white relative group h-14 px-10">
               <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
               <span className="relative z-10 flex items-center gap-2">
                 Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </span>
            </Link>
            <Link href="#features" className="btn-pill-glass h-14 px-10 flex items-center gap-2 group">
              <Play className="h-3 w-3 fill-white group-hover:scale-110 transition-transform" /> Watch Demo
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Mockup (Image 1 Style) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 relative max-w-6xl mx-auto px-4"
        >
          {/* Dual Glows behind dashboard */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] opacity-30" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] opacity-30" />
          
          <div className="relative glow-boundary-neural prism-border rounded-[24px] overflow-hidden group/mockup">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/mockup:opacity-100 transition-opacity" />
            
            <div className="flex flex-col md:flex-row h-[500px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/5 bg-black/20 p-6 hidden md:block">
                 <div className="flex items-center gap-2 mb-10">
                   <div className="h-6 w-6 relative">
                     <img 
                       src="/logo.png" 
                       alt="HyprLead Oracle" 
                       className="h-full w-full object-contain animate-neural"
                     />
                   </div>
                   <span className="font-bold text-sm tracking-tight text-white">HyprLead</span>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Core Systems</p>
                       {[
                         { icon: Globe, label: "Mission Control", active: true },
                         { icon: Radar, label: "Discovery Engine" },
                         { icon: Crosshair, label: "Targeting" },
                         { icon: BarChart3, label: "Analytics" },
                         { icon: Activity, label: "Telemetry" }
                       ].map((item, i) => (
                         <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${item.active ? 'bg-primary/10 text-primary border border-primary/10' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}>
                            <item.icon className={`h-4 w-4 ${item.active ? 'animate-pulse' : ''}`} />
                            <span className="text-xs font-bold">{item.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 text-left space-y-10 bg-black/40">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Monitoring</h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/5">
                       <Search className="h-3 w-3 text-zinc-500" />
                       <span className="text-[9px] font-bold text-zinc-600">Search leads...</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2 group/card">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Total Pipeline Value</p>
                       <h4 className="text-4xl font-black tracking-[-0.06em] text-white group-hover/card:text-primary transition-colors">$84,503<span className="text-zinc-600">.00</span></h4>
                       <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                          <TrendingUp className="h-3 w-3" /> +12.4% Optimal
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Active Verification</p>
                       <h4 className="text-4xl font-black tracking-[-0.06em] text-white">98.2%</h4>
                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-2">
                         <Shield className="h-3 w-3 text-emerald-500" /> Verified Match
                       </p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Engine Pulse</p>
                       <div className="flex items-end gap-1.5 h-10">
                          {[...Array(15)].map((_, i) => (
                             <motion.div 
                              key={i} 
                              animate={{ height: [5, Math.random() * 30 + 10, 5] }} 
                              transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: i * 0.05 }} 
                              className="flex-1 bg-primary/30 rounded-t-sm" 
                            />
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                      { label: "Direct Access", value: "2.4k" },
                      { label: "Verified SMTP", value: "1.8k" },
                      { label: "Lead Quality", value: "S-Tier" },
                      { label: "Uptime", value: "99.9%" }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">{stat.label}</p>
                        <p className="text-lg font-black text-white tracking-tight">{stat.value}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
