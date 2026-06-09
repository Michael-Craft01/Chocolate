"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CreditCard, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ApiAuthError } from "@/lib/api";
import { fetchDashboardStats } from "@/lib/services/dashboard";

export function UsageBar() {
  const [usage, setUsage] = useState({ remaining: 0, monthlyLimit: 0, leadsPerCycle: 15 });

  useEffect(() => {
    async function fetchUsage() {
      try {
        const data = await fetchDashboardStats();
        if (data.cycles) setUsage(data.cycles);
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

  const used = Math.max(0, usage.monthlyLimit - usage.remaining);
  const percentage = usage.monthlyLimit ? Math.min((used / usage.monthlyLimit) * 100, 100) : 0;
  const remainingPercentage = usage.monthlyLimit ? Math.min((usage.remaining / usage.monthlyLimit) * 100, 100) : 0;
  const isEmpty = usage.remaining <= 0;
  const isLow = !isEmpty && usage.remaining <= Math.max(2, Math.ceil(usage.monthlyLimit * 0.15));
  const color = percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-primary";

  return (
    <div className="px-5 py-6 space-y-4 bg-white/[0.02] border-t border-white/5">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        <span>Search Wallet</span>
        <span className={cn("text-white", isEmpty && "text-red-400", isLow && "text-amber-400")}>{usage.remaining} left</span>
      </div>
      
      <div className="h-2 w-full bg-white/5 rounded-[2px] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={usage.monthlyLimit} aria-valuenow={usage.remaining}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${remainingPercentage}%` }}
          className={cn("h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]", isEmpty ? "bg-red-500" : isLow ? "bg-amber-500" : color)}
        />
      </div>

      {(isEmpty || isLow) && (
        <div className={cn(
          "flex items-start gap-2 rounded-[10px] px-3 py-2 text-[10px] font-bold leading-relaxed",
          isEmpty ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"
        )}>
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {isEmpty ? "Add credits to run search campaigns." : "Top up before automation pauses."}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-[2px] uppercase tracking-widest">
           <Zap className="h-3 w-3 fill-primary" />
           {usage.leadsPerCycle} Leads / Search
        </div>
        <Link href="/billing" className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          Add
        </Link>
      </div>
    </div>
  );
}
