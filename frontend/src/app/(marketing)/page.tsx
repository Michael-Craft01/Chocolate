"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, MessageSquare, Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";

import Hero from "@/components/landing/Hero";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const features = [
    {
      title: "Stealth Extraction",
      desc: "Engineered to bypass detection and extract clean lead data from dynamic sources without 429 errors.",
      icon: Cpu,
      color: "text-blue-400"
    },
    {
      title: "AI Enrichment",
      desc: "Goes beyond raw data. AI classifies business intent and identifies specific pain points before you even reach out.",
      icon: Brain,
      color: "text-violet-400"
    },
    {
      title: "Hyper Personalization",
      desc: "Generates laser-focused outreach copy tailored to the unique niche of reaching every single business.",
      icon: MessageSquare,
      color: "text-blue-300"
    }
  ];

  const steps = [
    { title: "Target Context", desc: "Define your ideal industry and global region.", icon: Target },
    { title: "Engine Sweep", desc: "The engine runs a high-speed batch extraction across all channels.", icon: Zap },
    { title: "AI Research", desc: "Every business is scanned for pain points and growth opportunities.", icon: Brain },
    { title: "Headless Dispatch", desc: "Leads land directly in your Discord or CRM automatically.", icon: MessageSquare }
  ];

  const pricing = [
    { 
      name: "Starter", 
      price: "$20", 
      leads: "50 Leads / day", 
      perks: ["Standard AI Enrichment", "Discord Dispatcher", "1 Engine", "CSV Data Export"] 
    },
    { 
      name: "Professional", 
      price: "$49", 
      leads: "200 Leads / day", 
      perks: ["Advanced GPT-4 Research", "Priority Sweep Logic", "5 Engines", "Discord Webhooks"], 
      featured: true 
    },
    { 
      name: "Elite", 
      price: "$300", 
      leads: "1,000 Leads / day", 
      perks: ["Instant WhatsApp Alerts", "Full White-label Engine", "Unlimited Engines", "Deep-Dive AI Intelligence"] 
    }
  ];

  return (
    <div className="relative min-h-screen selection:bg-primary/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl mx-auto px-6 py-2 flex items-center justify-between rounded-2xl glass-card border-white/5 shadow-2xl backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span>HyprLead</span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
          <Link href="#features" className="hover:text-white transition-colors">Technology</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <Link href={session ? "/dashboard" : "/login"} className="h-10 px-6 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center">
          {session ? 'Dashboard' : 'Sign In'}
        </Link>
      </nav>

      <Hero />

      {/* Stats/Social Proof */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[["1k+", "Global Users"], ["2M+", "Leads Analyzed"], ["98%", "Detection Bypass"], ["0s", "Manual Work"]].map(([val, label]) => (
            <div key={label} className="group">
              <div className="text-4xl font-black mb-2 gradient-text group-hover:scale-110 transition-transform duration-500">{val}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Automation as Art</h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed">How the HyprLead engine transforms the web into a sales machine.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="relative group glass-card rounded-3xl p-8 border border-white/5"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:glow-primary transition-all duration-500">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-3 tracking-tight">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                <div className="absolute top-8 right-8 text-4xl font-black text-white/5 select-none">{i + 1}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card rounded-[2.5rem] p-12 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <Icon className={`h-12 w-12 mb-10 ${f.color}`} />
                <h3 className="text-3xl font-black mb-6 tracking-tight">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed mb-8 text-lg">{f.desc}</p>
                <div className="flex gap-3">
                   <span className="px-3 py-1 rounded-lg bg-white/5 text-[9px] uppercase font-bold tracking-widest text-zinc-500">Headless</span>
                   <span className="px-3 py-1 rounded-lg bg-white/5 text-[9px] uppercase font-bold tracking-widest text-zinc-500">AI-Powered</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Transparent Scale</h2>
          <p className="text-zinc-500 text-lg">Choose the volume your business needs to grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricing.map((p, i) => (
            <div key={i} className={`glass-card rounded-[2rem] p-10 relative overflow-hidden flex flex-col ${p.featured ? 'border-primary/40 shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)]' : 'border-white/5'}`}>
              {p.featured && (
                <div className="absolute top-0 right-0 px-5 py-1.5 bg-primary text-[9px] font-black uppercase tracking-[0.2em] text-white">
                  Most Popular
                </div>
              )}
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">{p.name}</div>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-5xl font-black tracking-tight">{p.price}</span>
                <span className="text-zinc-500 text-sm font-medium">/mo</span>
              </div>
              <div className="flex flex-col gap-5 mb-12 flex-grow">
                {p.perks.map((perk, j) => (
                  <div key={j} className="flex items-center gap-4 text-[13px] text-zinc-300 font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {perk}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className={`w-full h-14 rounded-2xl flex items-center justify-center font-bold text-sm tracking-tight transition-all ${p.featured ? 'bg-primary text-white glow-primary hover:scale-[1.02]' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <div className="border-t border-white/5 pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-2 font-black text-lg tracking-tight">
             <Zap className="h-5 w-5 text-primary fill-primary" />
             <span>HyprLead</span>
           </div>
           <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.25em]">© 2026 HyprLead Engine. Globally Distributed.</div>
           <div className="flex gap-10">
              <Link href="#" className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-[0.25em]">Terms</Link>
              <Link href="#" className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-[0.25em]">Privacy</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
