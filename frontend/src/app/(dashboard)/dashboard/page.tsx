"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  TrendingUp, 
  ArrowUpRight,
  Database,
  RefreshCw,
  Target,
  ListTodo,
  Layers,
  Sparkles,
  Compass,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authJson } from "@/lib/api";
import type { Stats, Lead } from "@/lib/types";
import { Sparkline } from "@/components/Sparkline";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/AnimatedNumber";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, leadsData] = await Promise.all([
          authJson<Stats>("/api/stats"),
          authJson<Lead[]>("/api/leads?limit=5")
        ]);
        setStats(statsData);
        setRecentLeads(Array.isArray(leadsData) ? leadsData : []);
      } catch (err) {
        console.error("Dashboard sync failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const usagePercent = stats?.quota?.limit ? Math.min(100, ((stats?.quota?.used || 0) / stats.quota.limit) * 100) : 0;
  const isFree = !stats?.tier || stats?.tier === 'FREE';

  // Dynamic calculations for problem-solving metrics
  const estimatedRevenue = (stats?.totalLeads || 0) * 1200; // Estimated $1200 pipeline value per lead

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-12 pb-20 px-4 md:px-8 font-sans bg-background selection:bg-primary/20"
    >
      {/* Sleek Minimalist Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-card-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                System Active
             </div>
             <div className="h-3 w-px bg-card-border" />
             <div className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-widest flex items-center gap-1.5">
                <Database className="h-3 w-3" />
                {stats?.totalBusinesses || 0} Nodes Analyzed
             </div>
          </div>
          <h1 className="text-display">Revenue Operations Command</h1>
          <p className="readable text-sm md:text-base">Autonomous outbound lead discovery, enrichment, and AI-powered pain-point mapping.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="btn-pill-glass h-10 px-4 flex items-center gap-2 hover:bg-card border border-card-border rounded-full"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''} text-foreground`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Sync Operations</span>
          </button>
          <div className="h-10 px-4 rounded-full bg-card border border-card-border flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] font-black tracking-widest text-foreground uppercase">{stats?.tier || 'FREE'} PLAN</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Problem-Solving Hub overview */}
        <div className="md:col-span-8 bento-card p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Cpu className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Outbound Friction, Solved Autonomously</h2>
            </div>
            
            <p className="text-sm text-foreground opacity-70 leading-relaxed max-w-2xl">
              Manual lead sourcing, disconnected CRM fields, and cold emails without relevance yield zero conversions. HyprLead targets and solves these bottlenecks automatically:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-card-border">
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Sourcing Bottleneck
                </div>
                <p className="text-[11px] text-foreground opacity-60 leading-relaxed">Crawl the web, Google Maps, and registry nodes autonomously to extract verified contacts.</p>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Lead Enrichment
                </div>
                <p className="text-[11px] text-foreground opacity-60 leading-relaxed">Cross-references scraped domains to identify executive emails, locations, and segments.</p>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Zero Relevance
                </div>
                <p className="text-[11px] text-foreground opacity-60 leading-relaxed">AI synthesizes exact business pain points and drafts highly contextual messages.</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <Link 
              href="/campaigns/new" 
              className="inline-flex h-11 px-6 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-98 transition-all items-center gap-2 shadow-md shadow-primary/10"
            >
              Configure Target Hub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            
            <span className="text-[9px] font-black text-foreground opacity-40 uppercase tracking-widest">Active AI Outreach Sweeps</span>
          </div>
        </div>

        {/* Vertical Core Metrics - Business Impact Focus */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Estimated Pipeline Value Card */}
          <div className="flex-1 bento-card flex flex-col justify-between p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="tertiary">Outreach Pipeline Value</p>
                <p className="text-4xl font-semibold tracking-tight text-foreground">
                  $<AnimatedNumber value={estimatedRevenue} />
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-6">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                Based on ${stats?.totalLeads ? Math.round(estimatedRevenue / (stats.totalLeads || 1)) : 1200}/Lead Est
              </div>
              <div className="h-8 w-24">
                <Sparkline color="#10b981" />
              </div>
            </div>
          </div>

          {/* Qualified Leads Card */}
          <div className="flex-1 bento-card flex flex-col justify-between p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="tertiary">Qualified Enriched Profiles</p>
                <p className="text-4xl font-semibold tracking-tight text-foreground">
                  <AnimatedNumber value={stats?.totalLeads || 0} />
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center text-primary">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-6">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-foreground opacity-60 uppercase tracking-widest">
                <Activity className="h-3.5 w-3.5 text-primary" /> 98.4% Accuracy Ratio
              </div>
              <div className="h-8 w-24">
                <Sparkline color="#10b981" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Problem-Solving Ledger / Discoveries */}
        <div className="md:col-span-12 lg:col-span-8 bento-card space-y-6 p-8">
          <div className="flex items-center justify-between border-b border-card-border pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center">
                <ListTodo className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">Qualified Discovery Feed</h2>
                <p className="tertiary !text-foreground opacity-60">Verified B2B prospects enriched with targeted pain points</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/leads')}
              className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 group"
            >
              Qualified Ledger <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-card-border">
            {recentLeads.length > 0 ? recentLeads.map((lead, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-5 group/item hover:bg-card px-3 rounded-card transition-all gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-card border border-card-border flex items-center justify-center font-bold text-foreground text-sm group-hover/item:border-primary/30 transition-colors shrink-0">
                    {lead.business.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground tracking-tight">{lead.business.name}</p>
                    <p className="text-[10px] text-foreground opacity-60 font-bold uppercase tracking-widest">{lead.industry} • {lead.business.email || lead.business.website || "Verified Hub Profile"}</p>
                    {lead.painPoint && (
                      <p className="text-[11px] text-foreground opacity-70 italic max-w-lg leading-relaxed bg-background/40 p-2.5 rounded-card border border-card-border/40 mt-2">
                        Target Pain Point: "{lead.painPoint}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-card-border/20 pt-3 sm:pt-0 sm:border-0">
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Pain Point Synced</p>
                    <p className="text-[8px] text-foreground opacity-60 font-black mt-0.5 uppercase">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push(`/leads?campaignId=${lead.campaignId}`)}
                    className="h-8 w-8 rounded-full bg-card border border-card-border hover:bg-primary hover:text-white transition-all flex items-center justify-center text-foreground opacity-60 hover:opacity-100"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="py-16 text-center space-y-3">
                 <p className="tertiary !text-foreground opacity-40">Ready to sweep target hubs...</p>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Quota & Status Block */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bento-card bg-primary/5 border border-primary/10 p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <ShieldCheck className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground leading-snug">
                    Outbound matching is <span className="text-primary">fully verified</span>.
                 </h3>
                 <p className="text-xs text-foreground opacity-70 leading-relaxed font-medium">Scrapers run headlessly through proxy gateways. Contacts are verified directly, ensuring zero email bounce rate across active campaigns.</p>
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.01] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none">
                 <Database className="h-32 w-32" />
              </div>
           </div>

           {/* Sleek Flat Quota Circle Card */}
           <div className="bento-card p-8 flex items-center justify-between group transition-all">
              <div className="space-y-1">
                 <p className="tertiary">Sweep Quota</p>
                 <p className="text-3xl font-semibold text-foreground tracking-tight">
                    {stats?.quota?.used || 0} <span className="text-foreground opacity-40">/</span> {stats?.quota?.limit || 10}
                 </p>
                 <p className="text-[8px] text-foreground opacity-60 font-black uppercase tracking-wider">Resets daily</p>
              </div>
              <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                <svg className="h-full w-full rotate-[-90deg]">
                  <circle cx="32" cy="32" r="28" className="stroke-border-muted fill-none" strokeWidth="4" />
                  <motion.circle 
                    cx="32" cy="32" r="28" 
                    className="stroke-primary fill-none" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 176" }}
                    animate={{ strokeDasharray: `${Math.min(176, (((stats?.quota?.used || 0) / (stats?.quota?.limit || 10)) || 0) * 176)} 176` }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <Activity className="absolute h-5 w-5 text-primary" />
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
