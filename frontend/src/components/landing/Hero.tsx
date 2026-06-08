"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Compass, Globe, Shield, Sparkles, Activity, Crosshair, Radar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import B2BDemoProspector from "./B2BDemoProspector";

const FloatingTelemetry = () => {
  const [items, setItems] = useState<{ id: number, text: string, x: number, y: number }[]>([]);

  useEffect(() => {
    const data = [
      "SEARCHING: 18k leads",
      "CHALLENGE FOUND: Wholesale supply",
      "VERIFYING: info@company.com",
      "SAVING: CRM pipeline leads",
      "EXTRACTING: operational pain points",
      "HyprLead AI: Analyzing website...",
      "EMAIL VALID: Address verified",
      "DRAFT READY: Outreach email prepared"
    ];

    const interval = setInterval(() => {
      setItems(prev => {
        const newItem = {
          id: Date.now(),
          text: data[Math.floor(Math.random() * data.length)],
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        };
        return [...prev.slice(-2), newItem];
      });
    }, 2500);

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
            className="absolute p-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md flex items-center gap-2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary/80 tracking-wide">{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center pt-36 pb-20 overflow-hidden bg-background text-foreground">
      {/* Background System */}
      <div className="bg-animated-mesh" />
      <div className="bg-grid absolute inset-0 opacity-10 -z-10" />
      <div className="hero-glow" />
      
      {/* Telemetry Corner Accents (Outcome-focused) */}
      <div className="absolute top-40 left-10 telemetry-label flex flex-col gap-1 hidden lg:flex text-xs text-foreground/55 font-bold">
        <span>Engine Status: Active</span>
        <span>Verified Leads: +18,492</span>
      </div>
      <div className="absolute top-40 right-10 telemetry-label text-right flex flex-col gap-1 hidden lg:flex text-xs text-foreground/55 font-bold">
        <span>Conversion Increase: +4.2x</span>
        <span>Sync Mode: Live</span>
      </div>

      <FloatingTelemetry />

      <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Realigned Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-card border border-card-border mb-12 backdrop-blur-md shadow-sm">
            <div className="h-10 w-10 relative">
              <img 
                src="/logo.png" 
                alt="HyprLead Oracle" 
                className="h-full w-full object-contain animate-neural drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              />
            </div>
            <span className="text-xs font-bold text-foreground tracking-wide">Automated Lead Intelligence</span>
          </div>

          {/* The Hero Monolith */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-28 w-28 relative mb-10"
          >
             <img 
               src="/logo.png" 
               alt="HyprLead Oracle" 
               className="h-full w-full object-contain animate-neural drop-shadow-[0_0_80px_rgba(16,185,129,0.6)]"
             />
             <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full -z-10" />
          </motion.div>
          
          <h1 className="text-4xl md:text-display mb-10 leading-tight">
            Automated Outbound. <br />
            <span className="animate-text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary">Infinite Pipeline.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-foreground/80 text-sm md:text-lg font-medium mb-12 leading-relaxed px-4">
            The self-driving B2B lead generation engine. Scheduled background searches find high-intent business profiles, HyprLead AI analyzes their current challenges, and verified workflows draft personalized outreach emails.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full px-4">
            <Link href="/signup" className="h-12 w-full sm:w-auto px-8 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative group">
               <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
               <span className="relative z-10 flex items-center gap-2">
                 Start Free Search <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </span>
            </Link>
            <a 
              href="https://www.linkedin.com/in/michael-ragu-aa215035a/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-12 w-full sm:w-auto px-6 rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.06] text-foreground font-semibold text-xs flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer shadow-sm border border-foreground/5"
            >
              <img 
                src="/developer.png" 
                alt="Developer Avatar" 
                className="h-5 w-5 rounded-full object-cover ring-1 ring-primary/30 shrink-0" 
              />
              Visit Developer
            </a>
          </div>
        </motion.div>

        {/* B2B Sales Prospector Centerpiece */}
        <motion.div
          id="demo-prospector"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative w-full"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-40 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-40 pointer-events-none" />
          
          <B2BDemoProspector />
        </motion.div>
      </div>
    </section>
  );
}
