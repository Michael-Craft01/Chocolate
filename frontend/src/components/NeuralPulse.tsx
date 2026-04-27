"use client";

import { motion } from "framer-motion";
import { Zap, Radar, Shield, Compass, ShieldCheck, Home } from "lucide-react";

export function NeuralPulse() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden py-10">
      {/* Visual Rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.15, 0], 
            scale: [0.8, 1.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.3,
            ease: "easeOut"
          }}
          className="absolute h-64 w-64 rounded-full border border-primary/10"
        />
      ))}

      {/* Discovery Beams */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="relative w-full max-w-md h-full">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-beam" />
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-beam [animation-delay:2s]" />
        </div>
      </div>

      {/* Core Hub Node */}
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(255, 109, 41, 0.05)",
            "0 0 40px rgba(255, 109, 41, 0.15)",
            "0 0 20px rgba(255, 109, 41, 0.05)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative z-10 h-24 w-24 md:h-32 md:w-32 rounded-[1.5rem] md:rounded-[2rem] glass-card border border-primary/20 flex items-center justify-center group cursor-pointer bg-primary/5 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Home className="h-10 w-10 md:h-14 md:w-14 text-primary fill-primary/10 group-hover:scale-110 transition-transform glow-primary orange-glow" />
        
        {/* Floating Intelligence Nodes */}
        <motion.div 
          animate={{ y: [-10, 10, -10], x: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-12 -right-8 md:-top-16 md:-right-12 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl glass-card border border-white/10 shadow-2xl bg-white/[0.02]"
        >
          <Compass className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [10, -10, 10], x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -bottom-10 -left-6 md:-bottom-14 md:-left-10 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl glass-card border border-white/10 shadow-2xl bg-white/[0.02]"
        >
          <Shield className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
        </motion.div>

        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 h-3 w-3 md:h-3.5 md:w-3.5 bg-emerald-500 rounded-full border-2 border-background shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />
      </motion.div>

      {/* Status Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse glow-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Sync: Active</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse orange-glow" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Engine: Online</span>
        </div>
      </div>
    </div>
  );
}
