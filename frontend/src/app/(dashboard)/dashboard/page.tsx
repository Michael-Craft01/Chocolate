"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  TrendingUp, 
  ArrowUpRight,
  RefreshCw,
  Target,
  Layers,
  ArrowRight,
  Cpu,
  CreditCard,
  AlertTriangle
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
  const remainingPercent = cycleLimit ? Math.min(100, (cycleRemaining / cycleLimit) * 100) : 0;
  const isCycleEmpty = cycleRemaining <= 0;
  const isCycleLow = !isCycleEmpty && cycleRemaining <= Math.max(2, Math.ceil(cycleLimit * 0.15));
  
  const totalLeads = stats?.totalLeads || 0;
  const estimatedRevenue = totalLeads * 1200;

  // Dynamic smart marketing copy
  const totalCampaigns = stats?.totalCampaigns || 0;
  const activeCampaigns = stats?.activeCampaigns || 0;

  let hubTitle = "Sales Engine Active";
  let hubDesc = "Autonomous scraping is online. The system is sweeping targets and feeding fresh, enriched prospects directly to your sales pipeline.";
  let hubCTA = "View Campaigns";
  let hubHref = "/campaigns";

  if (totalCampaigns === 0) {
    hubTitle = "Launch Your First Campaign";
    hubDesc = "Your lead discovery engine is currently idling. Create a targeted search campaign specifying your ideal industries, cities, and value proposition to start gathering leads.";
    hubCTA = "Create New Campaign";
    hubHref = "/campaigns/new";
  } else if (activeCampaigns === 0) {
    hubTitle = "Campaign Scanner is Offline";
    hubDesc = "You have campaigns configured, but they are all paused. Activate a campaign or run a manual search cycle to restart background prospect harvesting.";
    hubCTA = "Manage Campaigns";
    hubHref = "/campaigns";
  } else if (totalLeads === 0) {
    hubTitle = "Enriching Search Grid";
    hubDesc = "Your campaign is active and scanning local grids in the background! The scraper is compiling prospects. Verify your targeting settings or refine your pitch criteria.";
    hubCTA = "Optimize Campaign Settings";
    hubHref = "/campaigns";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-20 font-sans selection:bg-primary/20"
    >
      {/* Sleek Minimalist Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-card-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
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
            <span className="text-xs font-bold text-foreground">OPEN ACCESS</span>
          </div>
        </div>
      </div>
 
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Hub Card */}
        <div id="tour-dashboard-hub" className="md:col-span-8 bento-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group rounded-3xl bg-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Cpu className={cn("h-5 w-5", activeCampaigns > 0 ? "animate-pulse" : "")} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{hubTitle}</h2>
            </div>
            
            <p className="text-sm text-foreground opacity-70 leading-relaxed max-w-lg">
              {hubDesc}
            </p>
          </div>
 
          <div className="pt-6 flex items-center justify-between gap-4">
            <Link 
              href={hubHref} 
              className="inline-flex h-11 px-6 rounded-full bg-primary text-white font-bold text-xs hover:brightness-110 active:scale-98 transition-all items-center justify-center gap-2 shadow-md shadow-primary/10"
            >
              {hubCTA}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
 
        {/* Vertical Core Metrics - Responsive Grid side-by-side on mobile */}
        <div id="tour-dashboard-stats" className="grid grid-cols-2 gap-4 md:flex md:flex-col md:gap-6 md:col-span-4">
          {/* Estimated Pipeline Value Card */}
          <div className="flex-1 bento-card flex flex-col justify-between p-6 rounded-3xl">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground/50">Pipeline Value</p>
                <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  $<AnimatedNumber value={estimatedRevenue} />
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center text-primary shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-6">
              <div className="h-8 w-24">
                <Sparkline color="#10b981" points={stats?.dailyTrend} />
              </div>
            </div>
          </div>
 
          {/* Qualified Leads Card */}
          <div className="flex-1 bento-card flex flex-col justify-between p-6 rounded-3xl">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground/50">Verified Leads</p>
                <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  <AnimatedNumber value={totalLeads} />
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center text-primary shrink-0">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-end justify-between mt-6">
              <div className="h-8 w-24">
                <Sparkline color="#10b981" points={stats?.dailyTrend} />
              </div>
            </div>
          </div>
        </div>
 
        {/* Verified Leads Ledger */}
        <div id="tour-dashboard-leads" className="md:col-span-12 lg:col-span-8 bento-card space-y-6 p-6 md:p-8 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-card-border pb-4 gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground tracking-tight">Verified Leads</h2>
            </div>
            <button onClick={() => router.push('/leads')}
              className="text-xs font-bold text-foreground opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 group self-start sm:self-auto"
            >
              All leads <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
 
          <div className="divide-y divide-card-border">
            {recentLeads.length > 0 ? recentLeads.map((lead, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between py-4 group/item hover:bg-card px-3 rounded-2xl transition-all gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-card border border-card-border flex items-center justify-center font-bold text-foreground text-sm group-hover/item:border-primary/30 transition-colors shrink-0">
                    {lead.business.name.charAt(0)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-foreground tracking-tight truncate">{lead.business.name}</p>
                    <p className="text-xs text-foreground opacity-60 font-medium truncate">{lead.industry} • {lead.business.email || lead.business.website || "Verified Campaign Profile"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-primary">Synced</p>
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
              </div>
            )) : (
              <div className="py-12 px-6 text-center border border-dashed border-card-border rounded-2xl bg-card/10 space-y-4">
                 <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Target className="h-6 w-6" />
                 </div>
                 <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-sm font-bold text-foreground">No Verified Prospects Yet</h3>
                    <p className="text-xs text-foreground opacity-60 leading-relaxed">
                      Our system performs deep multi-platform searches (Google Maps, Apple Maps, Google Search) to scrape emails, phone numbers, and social handles, then runs visual AI analysis to auto-draft personalized emails.
                    </p>
                 </div>
                 <Link href={totalCampaigns === 0 ? "/campaigns/new" : "/campaigns"}
                   className="inline-flex h-9 px-5 rounded-full bg-primary text-white text-xs font-bold items-center justify-center gap-1.5 hover:brightness-110 transition-all cursor-pointer"
                 >
                    {totalCampaigns === 0 ? "Launch First Campaign" : "Trigger Search Cycle"}
                    <ArrowRight className="h-3 w-3" />
                 </Link>
               </div>
            )}
          </div>
        </div>

        {/* Minimal Quota & Status Block */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
           {/* Unmetered Discovery Engine Card */}
           <div id="tour-dashboard-credits" className="bento-card p-6 md:p-8 space-y-6 group transition-all rounded-3xl">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                   <p className="text-xs font-bold text-foreground/50">Discovery Engine</p>
                   <p className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                      Unmetered <span className="text-primary text-xl font-bold">Active</span>
                   </p>
                   <p className="text-xs text-foreground/50">Multi-platform scraping & visual AI unlocked</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Activity className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/campaigns"
                  className="flex-1 h-10 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                >
                  Manage searches
                </Link>
                <Link
                  href="/campaigns/new"
                  className="flex-1 h-10 rounded-full bg-card border border-card-border text-foreground text-xs font-bold flex items-center justify-center"
                >
                  New campaign
                </Link>
              </div>
           </div>
 
           <div className="bento-card p-6 md:p-8 space-y-5 rounded-3xl">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
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

