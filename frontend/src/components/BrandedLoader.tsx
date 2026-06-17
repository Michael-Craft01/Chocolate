"use client";

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

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
      <Loader2 
        className={cn(
          "animate-spin text-primary shrink-0",
          size === "sm" && "h-6 w-6",
          size === "md" && "h-8 w-8",
          size === "lg" && "h-12 w-12"
        )} 
      />

      {message && (
        <p className={cn(
          "text-zinc-500 font-medium text-center",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {loaderContent}
        </motion.div>
      </div>
    );
  }

  return loaderContent;
}
