"use client";

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
      "flex flex-col items-center justify-center gap-4 text-center select-none",
      fullscreen ? "p-8" : "py-12 px-6"
    )}>
      {/* Pristine Circular Spinner */}
      <div className="relative">
        <div 
          className={cn(
            "animate-spin rounded-full border-[3px] border-card-border shrink-0",
            size === "sm" && "h-6 w-6 border-t-primary",
            size === "md" && "h-10 w-10 border-t-primary",
            size === "lg" && "h-14 w-14 border-t-primary"
          )} 
        />
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
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-card bg-card border border-card-border shadow-xl p-8 max-w-sm w-full mx-4"
        >
          {loaderContent}
        </motion.div>
      </div>
    );
  }

  return loaderContent;
}
