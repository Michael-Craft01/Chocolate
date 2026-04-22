"use client";

import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, MessageSquare, Shield, Globe, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 overflow-hidden">
      {/* Dynamic Data Flow Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[140px] animate-pulse delay-700" />
        
        {/* Premium Chocolate Splash */}
        <motion.img 
          src="/splash.png" 
          alt="Chocolate Splash"
          className="absolute -right-20 top-40 w-full max-w-[800px] opacity-40 mix-blend-screen pointer-events-none select-none"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.4, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Intelligence Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content: Messaging */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
            <Zap className="h-3 w-3" />
            Intelligence Engine V2.0
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tighter leading-[1.1] max-w-4xl mx-auto">
            Automate the <br />
            <span className="gradient-text">High-Ticket Chase.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 mb-8 leading-relaxed">
            Chocolate is a headless lead engine that finds, researches, and classifies high-intent businesses so you only talk to people ready to buy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="h-11 px-8 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-xl shadow-primary/20">
              Launch Engine
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="#features" className="h-11 px-8 rounded-full bg-white/[0.03] border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/[0.08] transition-all inline-flex items-center">
              View Technology
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-secondary-foreground/40">
            <div className="flex items-center gap-2 italic">
              <Shield className="h-3 w-3" />
              Stealth Extraction
            </div>
            <div className="flex items-center gap-2 italic">
              <Globe className="h-3 w-3" />
              Global Reach
            </div>
            <div className="flex items-center gap-2 italic">
              <Brain className="h-3 w-3" />
              AI Enrichment
            </div>
          </div>
        </motion.div>

        {/* Right Content: Intelligence Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 glass rounded-[2.5rem] border border-primary/20 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col p-8 group">
            {/* Mock Dashboard UI */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black tracking-widest text-primary uppercase animate-pulse">
                Squeezing Leads...
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: "TechNova Solutions", loc: "Mutare, ZW", status: "High Intent", delay: 0 },
                { name: "Harare Med Center", loc: "Harare, ZW", status: "Enriching...", delay: 0.2 },
                { name: "BlueSky Logistics", loc: "Bulawayo, ZW", status: "Waiting...", delay: 0.4 }
              ].map((lead, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 + lead.delay }}
                  className="p-5 rounded-2xl bg-background/40 border border-primary/5 flex items-center justify-between group-hover:border-primary/20 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{lead.name}</div>
                      <div className="text-[10px] text-secondary-foreground font-medium uppercase tracking-tight">{lead.loc}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                    {lead.status}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Status Beam */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm animate-beam" />
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-secondary/30 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
