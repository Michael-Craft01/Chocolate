"use client";

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Zap } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BrandedLoaderProps {
  message?: string;
  fullscreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandedLoader({ 
  message = "Loading...", 
  fullscreen = false,
  size = "md" 
}: BrandedLoaderProps) {
  
  const loaderContent = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-5 text-center select-none",
      fullscreen ? "p-8" : "py-12 px-6"
    )}>
      {/* Pristine Circular Spinner branded with Zap Logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Track */}
        <div 
          className={cn(
            "animate-spin rounded-full border-[3px] border-white/10 shrink-0",
            size === "sm" && "h-10 w-10 border-t-primary",
            size === "md" && "h-16 w-16 border-t-primary",
            size === "lg" && "h-24 w-24 border-t-primary"
          )} 
        />
        
        {/* Centered Glowing Zap Icon */}
        <div className="absolute flex items-center justify-center">
          <Zap 
            className={cn(
              "text-primary fill-primary/20 animate-pulse",
              size === "sm" && "h-4 w-4",
              size === "md" && "h-6 w-6",
              size === "lg" && "h-10 w-10"
            )} 
          />
        </div>
      </div>

      {/* Typography */}
      {message && (
        <p className={cn(
          "font-bold uppercase tracking-[0.2em] text-foreground text-center animate-pulse",
          size === "sm" && "text-[10px]",
          size === "md" && "text-[12px]",
          size === "lg" && "text-[14px]"
        )}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-[9999] flex items-center justify-center transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-full bg-card border border-card-border shadow-xl p-8 w-72 h-72 mx-4 flex items-center justify-center"
        >
          {loaderContent}
        </motion.div>
      </div>
    );
  }

  return loaderContent;
}
