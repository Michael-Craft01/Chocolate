"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ApiAuthError } from "@/lib/api";
import { fetchDashboardStats } from "@/lib/services/dashboard";

export function UsageBar() {
  const [usage, setUsage] = useState({ used: 0, limit: 100, credits: 0 });

  useEffect(() => {
    async function fetchUsage() {
      try {
        const data = await fetchDashboardStats();
        if (data.quota) setUsage(data.quota);
      } catch (error) {
        // If the backend is offline or unauthenticated, we fail silently or show default
        if (error instanceof ApiAuthError) {
          // Normal: user just isn't logged in yet
        } else {
          console.warn("Usage data unavailable (Backend likely offline)");
        }
      }
    }

    fetchUsage();
  }, []);

  const percentage = Math.min((usage.used / usage.limit) * 100, 100);
  const color = percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-primary";

  return (
    <div className="px-5 py-6 space-y-4 bg-white/[0.02] border-t border-white/5">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        <span>Daily Quota</span>
        <span className="text-white">{usage.used} / {usage.limit}</span>
      </div>
      
      <div className="h-2 w-full bg-white/5 rounded-[2px] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={usage.limit} aria-valuenow={usage.used}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]", color)} 
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-[2px] border border-primary/20 uppercase tracking-widest">
           <Zap className="h-3 w-3 fill-primary" />
           {usage.credits} Credits
        </div>
        <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Top Up</button>
      </div>
    </div>
  );
}
