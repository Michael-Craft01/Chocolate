"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Radar,
  ArrowUpRight,
  Database,
  Sparkles,
  Home,
  Shield,
  Compass,
  Search,
  Globe,
  Bell,
  RefreshCw,
  Target
} from "lucide-react";
import { authJson } from "@/lib/api";
import type { Stats, Lead } from "@/lib/types";
import { DiscoveryMonitor } from "@/components/DiscoveryMonitor";
import { Sparkline } from "@/components/Sparkline";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, leadsData] = await Promise.all([
          authJson<Stats>("/api/stats"),
          authJson<{leads: Lead[]}>("/api/leads?limit=5")
        ]);
        setStats(statsData);
        setRecentLeads(leadsData?.leads || []);
      } catch (err) {
        console.error("Dashboard sync failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 pb-20 px-8"
    >
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                <ShieldCheck className="h-3.5 w-3.5" /> Engine Active
             </div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <Globe className="h-3.5 w-3.5" /> 
                {stats?.totalBusinesses || 0} Businesses Discovered
             </div>
          </div>
          <h1 className="text-display !text-6xl">Operations Overview</h1>
          <p className="readable text-lg">Manage your automated lead discovery and revenue pipeline.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="btn-pill-glass h-12 px-6"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <div className="h-12 px-6 rounded-full bg-white/5 border border-white/10 flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">{stats?.tier || 'FREE'} PLAN</span>
          </div>
        </div>
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Main Monitor Card */}
        <div className="md:col-span-8 bento-card min-h-[450px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-10 z-20 space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              Live Discovery <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            </h2>
            <p className="tertiary !text-zinc-500">Real-time market scanning</p>
          </div>
          <DiscoveryMonitor />
          <div className="absolute bottom-0 right-0 p-10 z-20 text-right">
            <p className="text-5xl font-bold text-white tracking-[-0.06em]">92%</p>
            <p className="tertiary !text-zinc-500 mt-1">Pipeline Match</p>
          </div>
        </div>

        {/* Core Stats */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <div className="flex-1 bento-card group flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="tertiary">Active Leads</p>
                <p className="text-5xl font-bold tracking-[-0.06em] text-white">{stats?.totalLeads || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <TrendingUp className="h-4 w-4" /> +12.4% Growth
              </div>
              <div className="h-10 w-24">
                <Sparkline color="#10b981" />
              </div>
            </div>
          </div>

          <div className="flex-1 bento-card group flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="tertiary">Verified Businesses</p>
                <p className="text-5xl font-bold tracking-[-0.06em] text-white">{stats?.totalBusinesses || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <Activity className="h-4 w-4 text-primary animate-pulse" /> Scanning Global Map
              </div>
              <div className="h-10 w-24">
                <Sparkline color="#ff6d29" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="md:col-span-12 lg:col-span-7 bento-card space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Compass className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Activity Feed</h2>
                <p className="tertiary !text-zinc-600">Latest discoveries and enrichments</p>
              </div>
            </div>
            <button className="text-sm font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group">
              View All Logs <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {recentLeads.length > 0 ? recentLeads.map((lead, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group/item"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-xl bg-black border border-white/10 flex items-center justify-center font-bold text-zinc-500 text-xl group-hover/item:border-primary/40 transition-colors">
                    {lead.business.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white tracking-tight">{lead.business.name}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{lead.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Analysis Ready</p>
                    <p className="text-[9px] text-zinc-700 font-bold mt-1">
                      {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button className="h-10 w-10 rounded-xl bg-white/5 hover:bg-primary text-white hover:text-black transition-all flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center space-y-4">
                 <Search className="h-10 w-10 text-zinc-800 mx-auto" />
                 <p className="tertiary">Waiting for discoveries...</p>
              </div>
            )}
          </div>
        </div>

        {/* Quota & Insight */}
        <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-8">
           <div className="bento-card bg-primary/5 border-primary/20 p-10 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp className="h-6 w-6" />
                 </div>
                 <h3 className="text-2xl font-bold text-white leading-tight">
                    Market opportunities in your area are <span className="text-primary">trending up</span>.
                 </h3>
                 <p className="text-sm text-zinc-500 font-medium">New high-value targets detected in your core industry sectors.</p>
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] opacity-10 group-hover:opacity-20 transition-opacity">
                 <Database className="h-40 w-40" />
              </div>
           </div>

           <div className="bento-card p-8 flex items-center justify-between group">
              <div className="space-y-2">
                 <p className="tertiary">Daily Discovery Quota</p>
                 <p className="text-4xl font-bold text-white tracking-[-0.06em]">
                    {stats?.quota?.used || 0} <span className="text-zinc-800">/</span> {stats?.quota?.limit || 10}
                 </p>
              </div>
              <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="h-full w-full rotate-[-90deg]">
                  <circle cx="40" cy="40" r="35" className="stroke-white/5 fill-none" strokeWidth="6" />
                  <motion.circle 
                    cx="40" cy="40" r="35" 
                    className="stroke-primary fill-none" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 220" }}
                    animate={{ strokeDasharray: `${Math.min(220, (((stats?.quota?.used || 0) / (stats?.quota?.limit || 10)) || 0) * 220)} 220` }}
                    transition={{ duration: 1.5 }}
                  />
                </svg>
                <Activity className="absolute h-6 w-6 text-primary" />
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
