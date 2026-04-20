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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-zinc-400">Welcome back. Here is what has happened in the last 24 hours.</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          System status healthy
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
            <div key={stat.name} className="glass rounded-xl p-6 interactive-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{stat.name}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <p className="text-3xl font-bold">{stat.value ?? 0}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass rounded-xl p-6 relative overflow-hidden group interactive-card">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Real-time activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">Engine currently scanning for new opportunities...</span>
          </div>
          <div className="flex items-center gap-4 text-sm px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 text-zinc-500">
            <Zap className="h-4 w-4 text-warm" />
            <span>AI logic optimized for high-priority leads in 3 campaigns.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/campaigns/new" className="glass rounded-xl p-5 interactive-card border border-white/5">
          <p className="muted-label mb-2">Quick Action</p>
          <p className="font-semibold">Create Campaign</p>
          <p className="mt-1 text-sm text-zinc-400">Start a new lead engine with custom filters.</p>
        </Link>
        <Link href="/campaigns" className="glass rounded-xl p-5 interactive-card border border-white/5">
          <p className="muted-label mb-2">Optimization</p>
          <p className="font-semibold">Review Performance</p>
          <p className="mt-1 text-sm text-zinc-400">Pause underperforming campaigns and scale winners.</p>
        </Link>
        <Link href="/billing" className="glass rounded-xl p-5 interactive-card border border-white/5">
          <p className="muted-label mb-2">Capacity</p>
          <p className="font-semibold">Manage Quota</p>
          <p className="mt-1 text-sm text-zinc-400">Upgrade plans or top up credits before hitting limits.</p>
        </Link>
      </div>
    </motion.div>
  );
}
