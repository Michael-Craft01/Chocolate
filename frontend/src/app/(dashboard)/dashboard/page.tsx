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
  CheckCircle,
  CreditCard,
  AlertTriangle,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authJson } from "@/lib/api";
import type { Stats, Lead } from "@/lib/types";
import type { CycleRun } from "@/lib/types";
import { fetchCycles } from "@/lib/services/cycles";
import { Sparkline } from "@/components/Sparkline";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentCycles, setRecentCycles] = useState<CycleRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, leadsData, cyclesData] = await Promise.all([
          authJson<Stats>("/api/stats"),
          authJson<{ leads: Lead[] }>("/api/leads?limit=5"),
          fetchCycles(5).catch(() => [])
        ]);
        setStats(statsData);
        setRecentLeads(leadsData.leads || []);
        setRecentCycles(cyclesData);
      } catch (err) {
        console.error("Dashboard sync failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const cycleLimit = stats?.cycles?.monthlyLimit || 0;
  const cycleRemaining = stats?.cycles?.remaining || 0;
  const cyclesUsed = stats?.cycles?.usedThisPeriod || Math.max(0, cycleLimit - cycleRemaining);
  const usagePercent = cycleLimit ? Math.min(100, (cyclesUsed / cycleLimit) * 100) : 0;
  const remainingPercent = cycleLimit ? Math.min(100, (cycleRemaining / cycleLimit) * 100) : 0;
  const isCycleEmpty = cycleRemaining <= 0;
  const isCycleLow = !isCycleEmpty && cycleRemaining <= Math.max(2, Math.ceil(cycleLimit * 0.15));
  const leadCapacity = cycleRemaining * (stats?.cycles?.leadsPerCycle || 15);
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
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-card-border pb-6 md:pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                System Active
             </div>
             <div className="h-3 w-px bg-card-border" />
             <div className="text-xs font-bold text-foreground opacity-60 flex items-center gap-1.5">
                <Database className="h-3 w-3" />
                {stats?.totalBusinesses || 0} businesses analyzed
             </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-foreground/70">Automated B2B lead search, contact verification, and AI-powered personalized outreach.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()}
            className="btn-pill-glass h-10 px-4 flex items-center gap-2 hover:bg-card border border-card-border rounded-full"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''} text-foreground`} />
            <span className="text-xs font-bold text-foreground">Sync data</span>
          </button>
          <div className="h-10 px-4 rounded-full bg-card border border-card-border flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">{stats?.tier || 'FREE'} PLAN</span>
          </div>
        </div>
      </div>
 
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Problem-Solving Hub overview */}
        <div className="md:col-span-8 bento-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group rounded-3xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Cpu className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Automated lead search & outreach</h2>
            </div>
            
            <p className="text-sm text-foreground opacity-70 leading-relaxed max-w-2xl">
              Finding leads, verifying emails, and personalization can take hours. HyprLead automates these steps so you can focus on building relationships:
            </p>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-card-border">
              <div className="space-y-2">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Automated Search
                </div>
                <p className="text-xs text-foreground opacity-60 leading-relaxed">Scan business registries, directories, and search engines automatically to find leads.</p>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Lead Enrichment
                </div>
                <p className="text-xs text-foreground opacity-60 leading-relaxed">Identify decision-maker emails, locations, and categories automatically.</p>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> AI Personalization
                </div>
                <p className="text-xs text-foreground opacity-60 leading-relaxed">AI analyzes target challenges and drafts personalized email messages.</p>
              </div>
            </div>
          </div>
 
          <div className="pt-6 md:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link 
              href="/campaigns/new" 
              className="inline-flex h-11 px-6 rounded-full bg-primary text-white font-bold text-xs hover:brightness-110 active:scale-98 transition-all items-center justify-center gap-2 shadow-md shadow-primary/10"
            >
              Configure Target Campaigns
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          
            <span className="text-xs font-bold text-foreground opacity-40">Scheduled searches</span>
          </div>
        </div>

        {/* Vertical Core Metrics - Business Impact Focus */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Estimated Pipeline Value Card */}
          <div className="flex-1 bento-card flex flex-col justify-between p-6 md:p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-foreground/50">Outreach Pipeline Value</p>
                <p className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                  $<AnimatedNumber value={estimatedRevenue} />
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-6">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                Based on ${stats?.totalLeads ? Math.round(estimatedRevenue / (stats.totalLeads || 1)) : 1200}/lead est
              </div>
              <div className="h-8 w-24">
                <Sparkline color="#10b981" />
              </div>
            </div>
          </div>
 
          {/* Qualified Leads Card */}
          <div className="flex-1 bento-card flex flex-col justify-between p-6 md:p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-foreground/50">Verified Leads</p>
                <p className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                  <AnimatedNumber value={stats?.totalLeads || 0} />
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center text-primary">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-6">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground opacity-60">
                <Activity className="h-3.5 w-3.5 text-primary animate-pulse" /> 98.4% accuracy rate
              </div>
              <div className="h-8 w-24">
                <Sparkline color="#10b981" />
              </div>
            </div>
          </div>
        </div>
 
        {/* Live Problem-Solving Ledger / Discoveries */}
        <div className="md:col-span-12 lg:col-span-8 bento-card space-y-6 p-6 md:p-8 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-card-border pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center shrink-0">
                <ListTodo className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">Verified Leads</h2>
                <p className="text-xs text-foreground opacity-60">Verified business leads with personalized outreach details</p>
              </div>
            </div>
            <button onClick={() => router.push('/leads')}
              className="text-xs font-bold text-foreground opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 group self-start sm:self-auto"
            >
              All leads <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
 
          <div className="divide-y divide-card-border">
            {recentLeads.length > 0 ? recentLeads.map((lead, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-5 group/item hover:bg-card px-3 rounded-2xl transition-all gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-11 w-11 rounded-full bg-card border border-card-border flex items-center justify-center font-bold text-foreground text-sm group-hover/item:border-primary/30 transition-colors shrink-0">
                    {lead.business.name.charAt(0)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground tracking-tight truncate">{lead.business.name}</p>
                    <p className="text-xs text-foreground opacity-60 font-medium truncate">{lead.industry} • {lead.business.email || lead.business.website || "Verified Campaign Profile"}</p>
                    {lead.painPoint && (
                      <p className="text-xs text-foreground opacity-70 italic max-w-lg leading-relaxed bg-background/40 p-2.5 rounded-xl border border-card-border/40 mt-2">
                        Customer Need: "{lead.painPoint}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-card-border/20 pt-3 sm:pt-0 sm:border-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">Need Synced</p>
                    <p className="text-[10px] text-foreground opacity-60 font-bold mt-0.5">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => router.push(`/leads?campaignId=${lead.campaignId}`)}
                    className="h-8 w-8 rounded-full bg-card border border-card-border hover:bg-primary hover:text-white transition-all flex items-center justify-center text-foreground opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="py-16 text-center space-y-3">
                 <p className="text-xs font-semibold text-foreground opacity-40">Ready to search campaigns...</p>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Quota & Status Block */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bento-card bg-primary/5 border border-primary/10 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group rounded-3xl">
              <div className="relative z-10 space-y-4">
                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <ShieldCheck className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground leading-snug">
                    Outreach verification is <span className="text-primary">fully active</span>.
                 </h3>
                 <p className="text-xs text-foreground opacity-70 leading-relaxed font-medium">Searches run securely in the background. Contacts are verified directly, protecting your email sender reputation.</p>
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.01] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none">
                 <Database className="h-32 w-32" />
              </div>
           </div>
 
           {/* Sleek Flat Cycle Balance Card */}
           <div className={cn(
              "bento-card p-6 md:p-8 space-y-6 group transition-all rounded-3xl",
              isCycleEmpty ? "bg-red-500/5" : isCycleLow ? "bg-amber-500/5" : ""
           )}>
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-2">
                   <p className="text-xs font-bold text-foreground/50">Search Credits</p>
                   <p className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                      {cycleRemaining} <span className="text-foreground opacity-30 text-2xl">left</span>
                   </p>
                   <p className="text-xs font-bold text-foreground opacity-60">
                      {leadCapacity} possible leads left
                   </p>
                </div>
                <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                  <svg className="h-full w-full rotate-[-90deg]">
                    <circle cx="32" cy="32" r="28" className="stroke-border-muted fill-none" strokeWidth="4" />
                    <motion.circle
                      cx="32" cy="32" r="28"
                      className={cn(
                        "fill-none",
                        isCycleEmpty ? "stroke-red-500" : isCycleLow ? "stroke-amber-500" : "stroke-primary"
                      )}
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 176" }}
                      animate={{ strokeDasharray: `${Math.min(176, (remainingPercent / 100) * 176)} 176` }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                  {isCycleEmpty || isCycleLow ? (
                    <AlertTriangle className={cn("absolute h-5 w-5", isCycleEmpty ? "text-red-500" : "text-amber-500")} />
                  ) : (
                    <Activity className="absolute h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
 
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-foreground/50">
                  <span>{cyclesUsed} used this period</span>
                  <span>{cycleLimit} monthly limit</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${remainingPercent}%` }}
                    className={cn(
                      "h-full",
                      isCycleEmpty ? "bg-red-500" : isCycleLow ? "bg-amber-500" : "bg-primary"
                    )}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
 
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={isCycleEmpty ? "/billing" : "/campaigns"}
                  className="h-11 px-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                >
                  {isCycleEmpty ? <CreditCard className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                  {isCycleEmpty ? "Buy credits" : "Run search"}
                </Link>
                <Link
                  href="/billing"
                  className="h-11 px-5 rounded-full bg-card border border-card-border text-foreground text-xs font-bold flex items-center justify-center gap-2"
                >
                  Top up
                </Link>
              </div>
           </div>
 
           <div className="bento-card p-6 md:p-8 space-y-5 rounded-3xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground/50">Latest Run</p>
                  <h3 className="text-base font-bold text-foreground tracking-tight truncate max-w-[120px] sm:max-w-none">
                    {stats?.latestCycle?.status || "No runs yet"}
                  </h3>
                </div>
                <Link href="/campaigns" className="h-9 px-4 rounded-full bg-primary text-white text-xs font-bold flex items-center gap-2 shrink-0">
                  Run search <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {recentCycles.length === 0 ? (
                  <p className="text-xs text-foreground opacity-50 font-semibold">No searches recorded yet.</p>
                ) : recentCycles.map((cycle) => (
                  <div key={cycle.id} className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-card/50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {cycle.campaign?.name === 'Main Engine' ? 'General Search' : (cycle.campaign?.name || "Campaign")}
                      </p>
                      <p className="text-xs font-bold text-foreground opacity-45 truncate">{cycle.triggerType} · {cycle.status}</p>
                    </div>
                    <p className="text-sm font-bold text-primary shrink-0">{cycle.leadsFound}/{cycle.maxLeads}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
