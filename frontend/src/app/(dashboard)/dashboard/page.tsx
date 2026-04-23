"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  Target, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Radar,
  ArrowUpRight,
  BrainCircuit,
  Globe,
  Database,
  Sparkles
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
      {/* Control Center Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles className="h-4 w-4 glow-primary" /> System: Synchronized
          </div>
          <h1 className="text-4xl font-black tracking-tightest gradient-text">Command Center</h1>
          <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.1em]">Autonomous Lead Extraction & Intelligence Monitoring.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-card px-5 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 glow-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node: Active</span>
          </div>
          <div className="glass-card px-5 py-2.5 rounded-2xl bg-primary/10 border-primary/20 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{stats?.tier || 'FREE'} ENGINE</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Neural Pulse - Bento Core */}
        <div className="md:col-span-8 glass-card rounded-[2.5rem] overflow-hidden relative min-h-[400px] group">
          <div className="absolute top-0 left-0 p-10 z-20 pointer-events-none">
            <h2 className="text-lg font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              Neural Network <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Real-time Global Sync</p>
          </div>
          <NeuralPulse />
          <div className="absolute bottom-0 right-0 p-10 z-20 pointer-events-none text-right">
            <p className="text-4xl font-black tracking-tightest text-white glow-text">84.2%</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Extraction Yield</p>
          </div>
        </div>

        {/* Rapid Telemetry Stats - Sidebar of Bento */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex-1 glass-card rounded-3xl p-8 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Captures</p>
                <p className="text-4xl font-black tracking-tightest text-white">{stats?.totalLeads || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary glow-primary">
                <Target className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div className="text-[10px] text-emerald-400 font-black flex items-center gap-1.5 uppercase tracking-widest">
                <TrendingUp className="h-3.5 w-3.5" /> +12% Efficiency
              </div>
              <Sparkline color="#3b82f6" />
            </div>
          </div>

          <div className="flex-1 glass-card rounded-3xl p-8 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Nodes</p>
                <p className="text-4xl font-black tracking-tightest text-white">{stats?.activeCampaigns || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div className="text-[10px] text-zinc-500 font-black flex items-center gap-1.5 uppercase tracking-widest">
                <Globe className="h-3.5 w-3.5 text-primary" /> Global Reach
              </div>
              <Sparkline color="#8b5cf6" />
            </div>
          </div>
        </div>

        {/* Intelligence Feed - Bento Bottom Left */}
        <div className="md:col-span-7 glass-card rounded-[2.5rem] p-10 space-y-8 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary glow-primary">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest">Intelligence Feed</h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Live Extraction Telemetry</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 group/btn">
              System Logs <ArrowUpRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {(recentLeads?.length || 0) > 0 ? recentLeads.map((lead, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/item"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-zinc-400 text-sm group-hover/item:border-primary/30 transition-colors">
                    {lead.business.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight text-white">{lead.business.name}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.1em] mt-0.5">{lead.industry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] glow-text">Qualified</p>
                  <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
                Waiting for neural link synchronization...
              </div>
            )}
          </div>
        </div>

        {/* System Health & Insights - Bento Bottom Right */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-10 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group flex-1">
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <Radar className="h-6 w-6 animate-pulse glow-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Insight</span>
                </div>
                <h3 className="text-xl font-black leading-snug tracking-tight text-white">
                  Market velocity in <span className="text-primary">Harare</span> is increasing. 
                  High-intent clusters detected in <span className="text-violet-400">FinTech</span> sector.
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-black uppercase tracking-widest">OPTIMIZE EXTRACTION NODES FOR MAXIMUM CAPTURE.</p>
             </div>
             <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
               <Database className="h-32 w-32" />
             </div>
          </div>
          
          <div className="glass-card rounded-3xl p-8 flex items-center justify-between group border border-white/5">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Engine Quota</p>
              <p className="text-2xl font-black tracking-tightest text-white">{stats?.leadsToday || 0} / {stats?.dailyLimit || 10}</p>
            </div>
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]">
                <circle cx="32" cy="32" r="28" className="stroke-white/5 fill-none" strokeWidth="5" />
                <motion.circle 
                  cx="32" cy="32" r="28" 
                  className="stroke-primary fill-none glow-primary" 
                  strokeWidth="5" 
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${Math.min(176, ((stats?.leadsToday || 0) / (stats?.dailyLimit || 10)) * 176)} 176` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <Zap className="absolute h-6 w-6 text-primary fill-primary glow-primary" />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

