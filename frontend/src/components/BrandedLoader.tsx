"use client";

import { motion } from "framer-motion";

interface BrandedLoaderProps {
  message?: string;
}

export function BrandedLoader({ message = "Synchronizing Intelligence..." }: BrandedLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-12 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full"
      />

      <div className="relative h-40 w-40 flex items-center justify-center">
        {/* Liquid Rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1],
              borderWidth: [1, 2, 1]
            }}
            transition={{ 
              rotate: { duration: 10 / i, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              borderWidth: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(255,109,41,0.1)]"
            style={{ 
              padding: `${i * 12}px`,
              margin: `${i * -4}px`
            }}
          />
        ))}

        {/* The Core Pulsating "Chocolate" Drop */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 20px rgba(255,109,41,0.2)",
              "0 0 40px rgba(255,109,41,0.4)",
              "0 0 20px rgba(255,109,41,0.2)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-12 w-12 bg-primary rounded-sm flex items-center justify-center relative z-10"
        >
          <motion.div 
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="h-6 w-6 border-2 border-white/30 rounded-sm"
          />
        </motion.div>

        {/* Orbiting Elements */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="h-2 w-2 bg-white rounded-full glow-primary" />
          </div>
        </motion.div>
      </div>

      {/* Message System */}
      <div className="text-center space-y-4 relative z-20">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-label text-primary animate-pulse tracking-[0.4em]"
        >
          {message}
        </motion.p>
        
        <div className="h-[1px] w-48 bg-white/5 rounded-full overflow-hidden mx-auto">
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-2/3 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>
        
        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
          High Fidelity Lead Discovery in Progress
        </p>
      </div>
    </div>
  );
}
