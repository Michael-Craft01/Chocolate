"use client";

import { motion } from "framer-motion";
import { Zap, Radar, Shield, Search, ShieldCheck, Heart, Home } from "lucide-react";

export function NeuralPulse() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden py-10">
      {/* Visual Rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 0.2, 0], 
            scale: [0.8, 1.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.3,
            ease: "easeOut"
          }}
          className="absolute h-64 w-64 rounded-full border border-primary/20"
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
            "0 0 20px rgba(59,130,246,0.1)",
            "0 0 40px rgba(59,130,246,0.3)",
            "0 0 20px rgba(59,130,246,0.1)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative z-10 h-28 w-28 rounded-3xl glass-card border border-primary/30 flex items-center justify-center group cursor-pointer bg-primary/5"
      >
        <Home className="h-12 w-12 text-primary fill-primary/10 group-hover:scale-110 transition-transform glow-primary" />
        
        {/* Floating Intelligence Nodes */}
        <motion.div 
          animate={{ y: [-12, 12, -12], x: [12, -12, 12] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-14 -right-10 p-3 rounded-xl glass-card border border-white/10 shadow-xl"
        >
          <Search className="h-4 w-4 text-primary" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [12, -12, 12], x: [-12, 12, -12] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -bottom-12 -left-8 p-3 rounded-xl glass-card border border-white/10 shadow-xl"
        >
          <Heart className="h-4 w-4 text-emerald-400" />
        </motion.div>

        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />
      </motion.div>

      {/* Status Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Discovery Sync: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Response Integrity: 100%</span>
        </div>
      </div>
    </div>
  );
}
