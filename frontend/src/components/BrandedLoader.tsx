"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface BrandedLoaderProps {
  message?: string;
}

export function BrandedLoader({ message = "Synchronizing Systems..." }: BrandedLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
      <div className="relative">
        {/* Outer Glowing Rings */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -m-10"
        />
        
        {/* The Core Icon */}
        <motion.div
          animate={{ 
            rotateY: [0, 180, 360],
            filter: ["drop-shadow(0 0 0px var(--primary))", "drop-shadow(0 0 20px var(--primary))", "drop-shadow(0 0 0px var(--primary))"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative h-16 w-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20"
        >
          <Zap className="h-8 w-8 text-primary fill-primary/20" />
        </motion.div>

        {/* Orbiting Particles */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div 
              className="h-1 w-1 bg-primary rounded-full absolute" 
              style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }} 
            />
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
          {message}
        </p>
        <div className="h-0.5 w-40 bg-white/5 rounded-full overflow-hidden mx-auto">
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
