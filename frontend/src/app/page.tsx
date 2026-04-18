"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Target, Zap, TrendingUp, Plus } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface Stats {
  totalLeads: number;
  leadsToday: number;
  totalBusinesses: number;
  quota: {
    used: number;
    limit: number;
    credits: number;
  };
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/stats", {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

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
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-zinc-400">Welcome back. Here is what has happened in the last 24 hours.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass rounded-xl p-6 transition-all hover:border-white/10">
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

      <div className="glass rounded-xl p-6 relative overflow-hidden group">
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
    </motion.div>
  );
}
