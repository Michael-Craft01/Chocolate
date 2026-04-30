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

      {/* Protocol Section: Clarity & Professionalism */}
      <section id="protocol" className="py-40 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-sm bg-primary/5 border border-primary/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">How It Works</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tightest leading-[0.9] text-white uppercase">
              How we build <br /> your <span className="text-primary">pipeline.</span>
            </h2>
            <p className="readable max-w-lg">
              HyprLead operates as an autonomous layer on top of your existing sales stack, 
              eliminating the friction of manual discovery and unqualified outreach.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10">
              <div className="space-y-4">
                <div className="h-1 w-10 bg-primary" />
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Discovery Phase</h4>
                <p className="readable">Systematic crawling of global registries and digital footprints to identify active revenue-generating entities.</p>
              </div>
              <div className="space-y-4">
                <div className="h-1 w-10 bg-zinc-800" />
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Verification Phase</h4>
                <p className="readable">AI-driven analysis of identified entities to pinpoint structural gaps and service-specific pain points.</p>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-square glass rounded-sm border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,109,41,0.1),transparent_70%)]" />
                <div className="relative text-center space-y-4 z-10">
                   <div className="text-6xl font-black text-white tracking-tightest">98.4%</div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Data Accuracy Rate</p>
                </div>
                {/* Decorative scanning line */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-px bg-primary/40 shadow-[0_0_15px_rgba(255,109,41,0.5)] z-20" 
                />
             </div>
          </div>
        </div>
      </section>

      {/* Advanced Capabilities: Deep Transparency */}
      <section className="py-40 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24 space-y-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tightest text-white uppercase">Platform <span className="text-primary">Features.</span></h2>
            <p className="tertiary">The technical engineering behind every lead</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Shield, 
                title: "Discovery Engine", 
                desc: "Our engine uses distributed cloud nodes to bypass site security and capture data where traditional tools are blocked." 
              },
              { 
                icon: Layers, 
                title: "Visual Analysis", 
                desc: "We don't just read text. Our system analyzes website design to detect design quality, outdated tech stacks, and branding gaps." 
              },
              { 
                icon: Search, 
                title: "Contact Discovery", 
                desc: "Multi-layer verification cross-references public records and social signals to extract direct business contacts." 
              },
              { 
                icon: Zap, 
                title: "Message Generation", 
                desc: "AI models produce contextually relevant outreach scripts that reference specific, detected pain points for maximum response." 
              }
            ].map((module, i) => (
              <div key={i} className="p-10 rounded-sm bg-[#050505] border border-white/5 space-y-6 group hover:border-primary/20 transition-all">
                <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center">
                  <module.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tighter">{module.title}</h4>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6">
        <div className="mb-24 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/20">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">System Architecture</span>
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
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Automatic Pain Point Detection</h3>
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
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">High-Conversion Outreach</h3>
                <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">Don't waste time drafting manual communication. We generate professional, context-aware scripts tailored to specific pain points, ready for instant dispatch via WhatsApp or Email.</p>
                <div className="flex gap-4">
                   <div className="h-10 px-6 rounded-sm bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase flex items-center">WhatsApp Integration</div>
                   <div className="h-10 px-6 rounded-sm bg-white/5 border border-white/5 text-[9px] font-black text-zinc-500 uppercase flex items-center">B2B Email Protocols</div>
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

      {/* Strategic Advantage Section: Business Clarity */}
      <section className="py-40 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-20">
            <div className="space-y-6">
              <h4 className="tertiary">01 / Efficiency</h4>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Eliminate Lead Decay</h3>
              <p className="readable">Lead lists often decay at 3% per month. HyprLead's autonomous cycles ensure 100% data freshness through real-time discovery and validation protocols.</p>
            </div>
            <div className="space-y-6">
              <h4 className="tertiary">02 / Intelligence</h4>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Beyond Firmographics</h3>
              <p className="readable">Don't just target by size or location. We extract technical debt, workflow inefficiencies, and growth signals to provide a unique value proposition for every lead.</p>
            </div>
            <div className="space-y-6">
              <h4 className="tertiary">03 / ROI</h4>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Scalable Infrastructure</h3>
              <p className="readable">Reduce your acquisition cost by 70%. HyprLead handles the work of a 5-person SDR team, allowing you to focus purely on high-leverage closing activities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Use Cases */}
      <section className="py-40 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 gap-40 items-center">
            <div className="relative">
               <div className="h-[500px] w-full rounded-sm border border-white/5 glass relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
                  <div className="text-center space-y-6 relative z-10">
                     <div className="text-8xl font-black text-white opacity-10">ROI</div>
                     <div className="h-px w-40 bg-primary mx-auto" />
                     <p className="tertiary">Optimized for Conversion</p>
                  </div>
               </div>
            </div>
            
            <div className="space-y-12">
               <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tightest">Built for <br /> <span className="text-primary">Every Scale.</span></h2>
               <div className="space-y-10">
                  {[
                    { label: "B2B SaaS", desc: "Target businesses using competitor stacks and identify technical gaps your product solves." },
                    { label: "Marketing Agencies", desc: "Identify local businesses with poor web presence or zero social proof in real-time." },
                    { label: "High-Ticket Services", desc: "Find companies in growth phases and pitch fractional services based on detected needs." },
                  ].map((useCase, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="h-10 w-10 shrink-0 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black text-zinc-700 group-hover:text-primary group-hover:border-primary transition-all">0{i+1}</div>
                       <div className="space-y-2">
                          <h4 className="text-lg font-black text-white uppercase tracking-tight">{useCase.label}</h4>
                          <p className="readable">{useCase.desc}</p>
                       </div>
                    </div>
                  ))}
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { name: "Free", price: "$0", desc: "Basic exploration", features: ["10 Leads / Day", "Manual Discovery", "Community Access"] },
             { name: "Starter", price: "$20", desc: "For small teams", features: ["50 Leads / Day", "Priority Support", "Email Summaries"] },
             { name: "Professional", price: "$49", desc: "For scaling leaders", features: ["200 Leads / Day", "AI Data Analysis", "WhatsApp Alerts"], premium: true },
             { name: "Elite", price: "$300", desc: "Total domination", features: ["1,000+ Leads / Day", "Custom Models", "White-label Output"] }
           ].map((p, i) => (
             <div key={i} className={`p-10 rounded-sm border transition-all flex flex-col ${p.premium ? 'bg-primary text-white border-primary glow-primary shadow-2xl' : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:border-white/20'}`}>
                <h4 className={`text-[9px] font-black uppercase tracking-[0.4em] mb-8 ${p.premium ? 'text-white' : 'text-zinc-600'}`}>{p.name}</h4>
                <div className="flex items-baseline gap-1 mb-10">
                   <span className="text-5xl font-black tracking-tighter text-white">{p.price}</span>
                   <span className={`text-[9px] font-black uppercase tracking-widest ${p.premium ? 'text-white/60' : 'text-zinc-700'}`}>/mo</span>
                </div>
                <p className={`text-[10px] font-bold uppercase mb-10 ${p.premium ? 'text-white/80' : 'text-zinc-500'}`}>{p.desc}</p>
                <ul className="space-y-4 mb-12 flex-grow">
                   {p.features.map((f, j) => (
                     <li key={j} className="flex items-center gap-3">
                        <Check className={`h-3 w-3 ${p.premium ? 'text-white' : 'text-primary'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-tight ${p.premium ? 'text-white' : 'text-zinc-500'}`}>{f}</span>
                     </li>
                   ))}
                </ul>
                <Link href="/signup" className={`h-12 w-full rounded-sm font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center ${p.premium ? 'bg-white text-black hover:bg-zinc-100' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                   Get Started
                </Link>
             </div>
           ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
