"use client";

import { motion } from "framer-motion";
import { Zap, Radar, Shield } from "lucide-react";

export function NeuralPulse() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden py-10">
      {/* Neural Rings */}
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
          className="absolute h-64 w-64 rounded-full border border-primary/30"
        />
      ))}

      {/* Connection Beams */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="relative w-full max-w-md h-full">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-beam" />
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-beam [animation-delay:2s]" />
        </div>
      </div>

      {/* Core Node */}
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(59,130,246,0.2)",
            "0 0 50px rgba(59,130,246,0.4)",
            "0 0 20px rgba(59,130,246,0.2)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative z-10 h-24 w-24 rounded-[2rem] glass border border-primary/40 flex items-center justify-center group cursor-pointer"
      >
        <Zap className="h-10 w-10 text-primary fill-primary/20 group-hover:scale-110 transition-transform" />
        
        {/* Floating Data Nodes */}
        <motion.div 
          animate={{ y: [-10, 10, -10], x: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-12 -right-8 p-2 rounded-lg glass border border-white/10"
        >
          <Radar className="h-3 w-3 text-emerald-400" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [10, -10, 10], x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -bottom-10 -left-6 p-2 rounded-lg glass border border-white/10"
        >
          <Shield className="h-3 w-3 text-primary" />
        </motion.div>
      </motion.div>

      {/* Activity Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Node Sync: 99.8%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Neural Latency: 24ms</span>
        </div>
      </div>
    </div>
  );
}
