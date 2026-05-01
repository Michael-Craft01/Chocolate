"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ScrollArea({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden group/scroll", className)}>
      <div className="h-full w-full overflow-y-auto scrollbar-neural px-1">
        {children}
      </div>
      
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-[2px] h-full bg-white/[0.02]" />
    </div>
  );
}
