"use client";

import { motion } from "framer-motion";
import { Zap, Radar, Shield, Compass, ShieldCheck, Home, Target, Globe } from "lucide-react";

export function DiscoveryMonitor() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden py-10">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />

      {/* Visual Activity Rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.1, 0], 
            scale: [0.8, 2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeOut"
          }}
          className="absolute h-80 w-80 rounded-full border border-primary/10"
        />
      ))}

      {/* Core Hub */}
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 40px rgba(16, 185, 129, 0.05)",
            "0 0 80px rgba(16, 185, 129, 0.15)",
            "0 0 40px rgba(16, 185, 129, 0.05)"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="relative z-10 h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] glass-morphism border-white/10 flex items-center justify-center group cursor-default shadow-2xl"
      >
        <Globe className="h-12 w-12 md:h-16 md:w-16 text-primary animate-pulse-slow" />
        
        {/* Floating Data Indicators */}
        <motion.div 
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-12 -right-8 p-3.5 rounded-2xl glass-panel border-white/10 shadow-2xl"
        >
          <Target className="h-5 w-5 text-primary" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [15, -15, 15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -bottom-12 -left-8 p-3.5 rounded-2xl glass-panel border-white/10 shadow-2xl"
        >
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        </motion.div>

        {/* Live Status Pip */}
        <div className="absolute top-4 right-4 h-3 w-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
      </motion.div>

      {/* Status Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 px-6 py-2 rounded-full glass-morphism border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scanner Online</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sync: 100%</span>
        </div>
      </div>
    </div>
  );
}
