"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Brain, Cpu, MessageSquare, Check, Sparkles, Search, Heart, Compass, Shield, Home, Layout, Mic, BarChart3, ChevronRight, Globe, Layers, Command, Code2, Database, Network, Fingerprint, ZapOff, Activity, Sliders, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const logos = [
    "LOGOS", "LOOO", "LOGO", "LOGO IPSUM", "LINEAR", "VERCEL", "SUPABASE", "NEXTJS", "PRISMA"
  ];

  return (
    <div className="relative min-h-screen selection:bg-primary/30 font-sans bg-[#050505]">
      <Navbar />

      <Hero />

      {/* Infinite Logo Cloud */}
      <section className="py-16 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex gap-20 items-center whitespace-nowrap"
            >
              {[...logos, ...logos].map((logo, i) => (
                <span key={i} className="text-xl font-black tracking-[0.2em] text-zinc-800 hover:text-zinc-600 transition-colors cursor-default">{logo}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6">
        <div className="mb-24 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/20">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Architecture</span>
           </div>
           <h2 className="text-4xl md:text-6xl font-black tracking-tightest leading-tight text-white uppercase max-w-3xl">
             Everything you need to <br /> <span className="text-zinc-600">dominate your market.</span>
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-6 h-auto md:h-[800px]">
          {/* Big Bento Card: Neural Analysis */}
          <div className="md:col-span-8 md:row-span-1 glass rounded-sm border border-white/5 p-10 flex flex-col justify-between group hover:border-primary/20 transition-all overflow-hidden relative">
             <div className="relative z-10">
                <Brain className="h-10 w-10 text-primary mb-6" />
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Neural Pain Point Extraction</h3>
                <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">Our models don't just find businesses; they understand why they are struggling. We analyze thousands of data points to identify the exact problem you can solve.</p>
             </div>
             
             {/* Visual Detail */}
             <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent p-10 hidden md:flex items-center justify-center">
                <div className="relative h-48 w-48">
                   {[...Array(3)].map((_, i) => (
                     <motion.div 
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                        className={`absolute inset-0 rounded-full border border-primary/${10 + i * 10} ${i === 1 ? 'border-dashed' : ''}`}
                     />
                   ))}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="h-12 w-12 text-primary orange-glow" />
                   </div>
                </div>
             </div>
          </div>

          {/* Small Bento Card: Global Map */}
          <div className="md:col-span-4 md:row-span-1 glass rounded-sm border border-white/5 p-10 group hover:border-blue-500/20 transition-all relative overflow-hidden">
             <Globe className="h-10 w-10 text-blue-500 mb-6" />
             <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">Global Reach</h3>
             <p className="text-zinc-600 text-xs leading-relaxed">Scan any city on Earth. From Bulawayo to Berlin, HyprLead finds the local opportunities others miss.</p>
             
             <div className="mt-12 space-y-3 opacity-20 group-hover:opacity-40 transition-opacity">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                     <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} className="h-full w-1/3 bg-blue-500" />
                  </div>
                ))}
             </div>
          </div>

          {/* Small Bento Card: Real-time Sync */}
          <div className="md:col-span-4 md:row-span-1 glass rounded-sm border border-white/5 p-10 group hover:border-emerald-500/20 transition-all flex flex-col justify-between">
             <Activity className="h-10 w-10 text-emerald-500 mb-6" />
             <div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">Live Telemetry</h3>
                <p className="text-zinc-600 text-xs leading-relaxed">Real-time status updates for every lead. Know exactly when a new target appears.</p>
             </div>
             <div className="h-20 w-full bg-emerald-500/5 rounded-sm border border-emerald-500/10 mt-6 flex items-center justify-center">
                <div className="flex gap-1 h-8 items-end">
                  {[...Array(8)].map((_, i) => (
                    <motion.div key={i} animate={{ height: [5, Math.random() * 20 + 5, 5] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }} className="w-2 bg-emerald-500/40 rounded-t-sm" />
                  ))}
                </div>
             </div>
          </div>

          {/* Big Bento Card: Smart Outreach */}
          <div className="md:col-span-8 md:row-span-1 glass rounded-sm border border-white/5 p-10 flex flex-col md:flex-row group hover:border-primary/20 transition-all overflow-hidden bg-white/[0.01]">
             <div className="flex-1 space-y-6">
                <MessageSquare className="h-10 w-10 text-primary" />
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Pre-filled Intelligence</h3>
                <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">Don't waste time drafting emails. We generate high-conversion scripts based on the identified pain points, ready to send via WhatsApp or Email.</p>
                <div className="flex gap-4">
                   <div className="h-10 px-6 rounded-sm bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase flex items-center">WhatsApp DeepLink</div>
                   <div className="h-10 px-6 rounded-sm bg-white/5 border border-white/5 text-[9px] font-black text-zinc-500 uppercase flex items-center">Email Draft v2</div>
                </div>
             </div>
             
             <div className="flex-1 p-6 relative">
                <div className="h-full rounded-sm bg-[#050505] border border-white/5 p-6 space-y-3 shadow-2xl">
                   <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="h-2 w-20 bg-white/5 rounded-full" />
                   </div>
                   {[1, 2, 3].map(i => (
                     <div key={i} className={`h-2 rounded-full bg-white/5 ${i === 2 ? 'w-full' : 'w-3/4'}`} />
                   ))}
                   <div className="pt-6">
                      <div className="h-8 w-full rounded-sm bg-primary/20 border border-primary/20 flex items-center justify-center text-[8px] font-black text-primary uppercase">Send Outreach</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing - Extreme Minimalist */}
      <section id="pricing" className="py-40 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-end mb-24">
           <div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tightest leading-none text-white uppercase">Subscription <br /> Models.</h2>
           </div>
           <p className="text-zinc-600 text-lg font-medium leading-relaxed max-w-md">Scale your discovery engine as you grow. Transparent billing, no lock-ins, zero friction.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {[
             { name: "Node", price: "$0", desc: "Basic exploration", features: ["10 Leads / Day", "Manual Discovery", "Community Access"] },
             { name: "Cluster", price: "$49", desc: "For scaling teams", features: ["200 Leads / Day", "Neural Analysis", "WhatsApp Alerts"], premium: true },
             { name: "Mainframe", price: "$299", desc: "Total market domination", features: ["1,000+ Leads / Day", "Dedicated Manager", "White-label Output"] }
           ].map((p, i) => (
             <div key={i} className={`p-12 rounded-sm border transition-all ${p.premium ? 'bg-primary text-white border-primary glow-primary shadow-2xl' : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:border-white/20'}`}>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-8 ${p.premium ? 'text-white' : 'text-zinc-600'}`}>{p.name}</h4>
                <div className="flex items-baseline gap-1 mb-10">
                   <span className={`text-6xl font-black tracking-tighter ${p.premium ? 'text-white' : 'text-white'}`}>{p.price}</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${p.premium ? 'text-white/60' : 'text-zinc-700'}`}>/mo</span>
                </div>
                <ul className="space-y-6 mb-16">
                   {p.features.map((f, j) => (
                     <li key={j} className="flex items-center gap-3">
                        <Check className={`h-4 w-4 ${p.premium ? 'text-white' : 'text-primary'}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-tight ${p.premium ? 'text-white' : 'text-zinc-500'}`}>{f}</span>
                     </li>
                   ))}
                </ul>
                <button className={`h-14 w-full rounded-sm font-black text-[11px] uppercase tracking-widest transition-all ${p.premium ? 'bg-white text-black hover:bg-zinc-100' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                   Initialize {p.name}
                </button>
             </div>
           ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
