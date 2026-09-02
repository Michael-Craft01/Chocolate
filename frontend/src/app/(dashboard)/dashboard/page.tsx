"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ArrowUpRight,
  RefreshCw,
  Target,
  ArrowRight,
  Activity,
  Layers
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authJson } from "@/lib/api";
import type { Stats, Lead, CycleRun } from "@/lib/types";
import { fetchCycles } from "@/lib/services/cycles";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentCycles, setRecentCycles] = useState<CycleRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalLeads = stats?.totalLeads || 0;
  const leadsToday = stats?.leadsToday || 0;
  const activeCampaigns = stats?.activeCampaigns || 0;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor campaigns, lead discovery metrics, and recent prospect activity.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="h-9 px-3 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <Link
            href="/campaigns/new"
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            New campaign
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <section className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Leads</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{totalLeads}</p>
            <p className="text-xs text-muted-foreground">Discovered prospects</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Leads Today</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{leadsToday}</p>
            <p className="text-xs text-muted-foreground">Harvested in last 24h</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Campaigns</span>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{activeCampaigns}</p>
            <p className="text-xs text-muted-foreground">Targeting active sectors</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Engine Status</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">Unmetered</p>
            <p className="text-xs text-muted-foreground">Open platform access</p>
          </div>
        </div>
      </section>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Leads */}
        <div className="lg:col-span-8 rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Leads</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verified business prospects discovered across target locations.
              </p>
            </div>
            <Link 
              href="/leads" 
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lead.business.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead.industry || "General"} • {lead.business.email || lead.business.phone || "Contact profile available"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => router.push(`/leads?campaignId=${lead.campaignId}`)}
                      className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="View Lead"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No leads discovered yet.</p>
                <p className="text-xs text-muted-foreground">Create a campaign or run a search cycle to begin finding leads.</p>
                <div className="pt-2">
                  <Link
                    href="/campaigns"
                    className="inline-flex h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium items-center gap-1 hover:bg-primary/90 transition-colors"
                  >
                    Go to Campaigns <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discovery Engine & Activity */}
        <div className="lg:col-span-4 rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground">Discovery Engine</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated multi-channel background scraping runs.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Execution</span>
                <span className="font-semibold text-foreground">Multi-Source</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-semibold text-foreground">50 leads / run</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Visual AI</span>
                <span className="font-semibold text-foreground">Active</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-muted-foreground">Recent Activity</span>
              {recentCycles.length > 0 ? (
                recentCycles.slice(0, 3).map((cycle) => (
                  <div key={cycle.id} className="flex items-center justify-between text-xs border border-border rounded-md px-3 py-2">
                    <span className="truncate font-medium text-foreground max-w-[140px]">
                      {cycle.campaign?.name || "Search Sweep"}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {cycle.leadsFound} leads
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No recent runs recorded.</p>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/campaigns"
                className="w-full h-9 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1 transition-colors"
              >
                Manage Campaigns
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
