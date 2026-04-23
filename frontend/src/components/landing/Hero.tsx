"use client";

import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, Shield, Globe, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow opacity-50" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px] animate-pulse-slow delay-1000 opacity-30" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-10 glow-primary">
            <Sparkles className="h-3 w-3 fill-primary" />
            Intelligence Engine V3.0
          </span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tightest leading-[0.95]">
            Automate the <br />
            <span className="gradient-text glow-text">High-Ticket Chase.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base md:text-lg text-zinc-400 mb-12 leading-relaxed">
            HyprLead is a high-velocity lead engine that finds, researches, and classifies high-intent businesses autonomously. Stop searching, start closing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/dashboard" className="h-14 px-10 rounded-2xl bg-primary text-white font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 glow-primary">
              Launch Engine
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#features" className="h-14 px-10 rounded-2xl glass-card font-bold text-sm uppercase tracking-widest transition-all inline-flex items-center">
              View Technology
            </Link>
          </div>
        </motion.div>

        {/* Intelligence Visual - Terminal Style */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] flex flex-col p-6 text-left font-mono">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                System Live: hyper_sweep_active
              </div>
            </div>

            <div className="space-y-3 overflow-hidden">
              {[
                { time: "18:42:01", msg: "Establishing stealth connection to target registry...", color: "text-zinc-500" },
                { time: "18:42:05", msg: "Extracting metadata for 124 high-intent candidates.", color: "text-zinc-300" },
                { time: "18:42:09", msg: "AI Analysis: TechNova Solutions identified as 'High Intent'.", color: "text-primary" },
                { time: "18:42:12", msg: "Generating personalized outreach for Founder/CEO.", color: "text-zinc-300" },
                { time: "18:42:15", msg: "Dispatched to Discord webhook successfully.", color: "text-accent" },
              ].map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.2 }}
                  className="flex gap-4 text-[11px] md:text-xs"
                >
                  <span className="text-zinc-600 shrink-0">{log.time}</span>
                  <span className={log.color}>{log.msg}</span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-primary inline-block ml-16"
              />
            </div>
          </div>
          
          {/* Decorative Glows */}
          <div className="absolute -top-10 -right-20 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-20 h-40 w-40 bg-accent/10 rounded-full blur-3xl" />
        </motion.div>
      </div>

      <div className="mt-20 flex flex-wrap justify-center gap-10 text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-500">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          Stealth Extraction
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-primary" />
          Global Reach
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-primary" />
          AI Intelligence
        </div>
      </div>
    </section>
  );
}
