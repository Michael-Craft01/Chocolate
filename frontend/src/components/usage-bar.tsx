"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
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
        if (!(error instanceof ApiAuthError)) {
          console.error(error);
        }
      }
    }

    fetchUsage();
  }, []);

  const percentage = Math.min((usage.used / usage.limit) * 100, 100);
  const color = percentage > 90 ? "bg-hot" : percentage > 70 ? "bg-warm" : "bg-primary";

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
        <span>Daily Quota</span>
        <span className="text-zinc-300">{usage.used} / {usage.limit}</span>
      </div>
      
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={usage.limit} aria-valuenow={usage.used}>
        <div 
          className={`h-full transition-all duration-1000 ${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-warm bg-warm/10 px-2 py-0.5 rounded-full">
           <Zap className="h-3 w-3 fill-warm" />
           {usage.credits} Credits
        </div>
        <button className="rounded px-1.5 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10 hover:text-blue-300">Top Up</button>
      </div>
    </div>
  );
}
