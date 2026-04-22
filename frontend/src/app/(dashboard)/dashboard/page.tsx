"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Target, Zap, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { ApiAuthError, ApiRequestError } from "@/lib/api";
import Link from "next/link";
import type { Stats } from "@/lib/types";
import { fetchDashboardStats } from "@/lib/services/dashboard";

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setError(null);
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        if (err instanceof ApiAuthError) {
          setError("Please sign in to load your dashboard.");
        } else if (err instanceof ApiRequestError) {
          setError(err.message);
        } else {
          console.error("Error fetching stats:", err);
          setError("Unable to load dashboard stats right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Leads", value: stats?.totalLeads, icon: Users, color: "text-primary" },
    { name: "Leads Today", value: stats?.leadsToday, icon: Zap, color: "text-warm" },
    { name: "Businesses Scraped", value: stats?.totalBusinesses, icon: Target, color: "text-zinc-400" },
    { name: "Enrichment Rate", value: "98.2%", icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black gradient-text tracking-tighter">Control Center</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
              {stats?.tier === 'FREE' ? 'Free Mode' : stats?.tier || 'Loading...'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Real-time engine intelligence and lead telemetry.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Neural Link Active
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {error && (
          <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass rounded-xl p-4 border border-white/5 interactive-card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">{stat.name}</p>
                <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
              {loading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-black tracking-tight">{stat.value ?? 0}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass rounded-xl p-5 relative overflow-hidden group interactive-card border border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Live Telemetry
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs px-4 py-2.5 rounded-lg bg-white/[0.01] border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400 font-medium">Engine scanning global nodes for high-intent business clusters...</span>
          </div>
          <div className="flex items-center gap-3 text-xs px-4 py-2.5 rounded-lg bg-white/[0.01] border border-white/5 text-zinc-500">
            <Zap className="h-3.5 w-3.5 text-warm" />
            <span className="font-medium">AI research cycles optimized for {stats?.tier === 'FREE' ? 'Free' : 'Pro'} priority logic.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/campaigns/new" className="glass rounded-xl p-4 interactive-card border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Initialize</p>
          <p className="text-sm font-bold">New Engine Sweep</p>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">Deploy a specialized AI cluster to hunt for niche opportunities.</p>
        </Link>
        <Link href="/campaigns" className="glass rounded-xl p-4 interactive-card border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Optimization</p>
          <p className="text-sm font-bold">Scale Performance</p>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">Analyze conversion rates and reallocate resources to winners.</p>
        </Link>
        <Link href="/billing" className="glass rounded-xl p-4 interactive-card border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-warm mb-2">Resource</p>
          <p className="text-sm font-bold">Manage Capacity</p>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">Upgrade neural processing power and expand lead daily limits.</p>
        </Link>
      </div>
    </motion.div>
  );
}
