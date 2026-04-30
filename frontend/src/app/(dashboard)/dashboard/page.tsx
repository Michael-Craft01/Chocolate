"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Radar,
  ArrowUpRight,
  BrainCircuit,
  Database,
  Sparkles,
  Home,
  Shield,
  Compass
} from "lucide-react";
import { authJson } from "@/lib/api";
import type { Stats, Lead } from "@/lib/types";
import { NeuralPulse } from "@/components/NeuralPulse";
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
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-label text-primary">
               <ShieldCheck className="h-4 w-4 glow-primary" /> Engine Active
             </div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                <Radar className="h-3 w-3 animate-spin-slow" /> 
                System Scan: {stats?.totalBusinesses || 0} Entities Found
             </div>
          </div>
          <h1 className="text-display">Operations Overview</h1>
          <p className="readable">Real-time oversight of your autonomous lead discovery infrastructure.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setLoading(true);
              // Simple refresh logic
              window.location.reload();
            }}
            className="glass-card px-5 py-2.5 rounded-sm flex items-center gap-3 hover:bg-white/5 transition-all group/sync"
          >
            <Activity className={`h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors ${loading ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Refresh Data</span>
          </button>
          <div className="glass-card px-5 py-2.5 rounded-sm bg-primary/10 border-primary/20 flex items-center gap-2 orange-glow">
            <Sparkles className="h-4 w-4 text-primary fill-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">{stats?.tier || 'FREE'} PROTOCOL</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Activity - Bento Core */}
        <div className="md:col-span-8 glass-card rounded-sm overflow-hidden relative min-h-[400px] group">
          <div className="absolute top-0 left-0 p-10 z-20 pointer-events-none">
            <h2 className="text-lg font-black uppercase tracking-widest mb-2 flex items-center gap-2 text-white">
              Search Activity <div className="h-1.5 w-1.5 rounded-sm bg-primary animate-ping" />
            </h2>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Live monitoring</p>
          </div>
          <NeuralPulse />
          <div className="absolute bottom-0 right-0 p-10 z-20 pointer-events-none text-right">
            <p className="text-4xl font-black tracking-tightest text-white glow-text">92%</p>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Match Rate</p>
          </div>
        </div>

        {/* Rapid Stats - Sidebar of Bento */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex-1 glass-card rounded-sm p-8 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-label">Active Leads</p>
                <p className="text-stat">{stats?.totalLeads || 0}</p>
              </div>
              <div className="p-3 rounded-sm bg-primary/10 text-primary glow-primary transition-transform group-hover:scale-110">
                <Database className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div className="text-[11px] text-emerald-400 font-black flex items-center gap-1.5 uppercase tracking-widest">
                <TrendingUp className="h-3.5 w-3.5" /> +{Math.floor(Math.random() * 15) + 5}% Efficiency
              </div>
              <Sparkline color="#ff6d29" />
            </div>
          </div>

          <div className="flex-1 glass-card rounded-sm p-8 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-label">Verified Entities</p>
                <p className="text-4xl font-black tracking-tightest text-white">{stats?.totalBusinesses || 0}</p>
              </div>
              <div className="p-3 rounded-sm bg-primary/10 text-primary glow-primary transition-transform group-hover:scale-110">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div className="text-[11px] text-zinc-500 font-black flex items-center gap-1.5 uppercase tracking-widest">
                <Radar className="h-3.5 w-3.5 text-primary animate-pulse" /> Scanning Network
              </div>
              <Sparkline color="#ff8a54" />
            </div>
          </div>
        </div>

        {/* Discovery Feed - Bento Bottom Left */}
        <div className="md:col-span-7 glass-card rounded-sm p-10 space-y-8 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary glow-primary">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Recent Activity</h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Latest business leads</p>
              </div>
            </div>
            <button className="text-[11px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 group/btn">
              View Logs <ArrowUpRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {(recentLeads?.length || 0) > 0 ? recentLeads.map((lead, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-5 rounded-sm bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/item"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center font-black text-zinc-400 text-sm group-hover/item:border-primary/30 transition-colors">
                    {lead.business.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight text-white">{lead.business.name}</p>
                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.1em] mt-0.5">{lead.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] glow-text">Analysis Complete</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                       <Shield className="h-3 w-3 text-emerald-500" />
                       <BrainCircuit className="h-3 w-3 text-primary animate-pulse" />
                       <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                         {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/5 mx-2" />
                  <button className="p-2 rounded-sm bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                     <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
                Waiting for discoveries...
              </div>
            )}
          </div>
        </div>

        {/* Growth Insights - Bento Bottom Right */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="glass-card rounded-sm p-10 relative overflow-hidden group flex-1">
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck className="h-6 w-6 animate-pulse glow-primary" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Quick Insight</span>
                </div>
                <h3 className="text-xl font-black leading-snug tracking-tight text-white">
                  Opportunities in <span className="text-primary">your area</span> are growing. 
                  New potential clients found in your sector.
                </h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-black uppercase tracking-widest">Start a new search to find these leads.</p>
             </div>
             <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
               <Database className="h-32 w-32" />
             </div>
          </div>
          
          <div className="glass-card rounded-sm p-8 flex items-center justify-between group border border-white/5 overflow-hidden">
            <div className="space-y-2">
              <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Daily Discovery Quota</p>
              <p className="text-2xl font-black tracking-tightest text-white">
                {stats?.quota?.used || 0} <span className="text-zinc-700">/</span> {stats?.quota?.limit || 10}
              </p>
            </div>
            <div className="relative h-16 w-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl" />
              <svg className="h-full w-full rotate-[-90deg] relative z-10">
                <circle cx="32" cy="32" r="28" className="stroke-white/5 fill-none" strokeWidth="5" />
                <motion.circle 
                  cx="32" cy="32" r="28" 
                  className="stroke-primary fill-none glow-primary" 
                  strokeWidth="5" 
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${Math.min(176, (((stats?.quota?.used || 0) / (stats?.quota?.limit || 10)) || 0) * 176)} 176` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <Activity className="absolute h-5 w-5 text-primary glow-primary" />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

