"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, MapPin, Briefcase, Play, 
  Pause, Trash2, Zap, Loader2, 
  Radar, History, ChevronRight, Activity,
  Command,
  ShieldCheck,
  Home,
  Compass,
  Shield,
  Info,
  Search,
  Target,
  Globe,
  Sparkles,
  ClipboardCheck,
  Settings,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useRouter } from "next/navigation";
import { authJson } from "@/lib/api";
import { fetchCampaigns as fetchCampaignList, updateCampaignStatus, deleteCampaign } from "@/lib/services/campaigns";
import type { Campaign } from "@/lib/types";
import { Sparkline } from "@/components/Sparkline";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { toast } from "sonner";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyCampaignId, setBusyCampaignId] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<Record<string, string>>({});
  const [loadingBrief, setLoadingBrief] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBrief = async (id: string) => {
    if (briefs[id] || loadingBrief === id) return;
    setLoadingBrief(id);
    try {
      const { brief } = await authJson<{ brief: string }>(`/api/campaigns/${id}/brief`);
      setBriefs(prev => ({ ...prev, [id]: brief }));
    } catch (err) {
      console.error("Failed to fetch mission brief:", err);
    } finally {
      setLoadingBrief(null);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Campaign["status"]>("ALL");
  const [triggering, setTriggering] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);

  const fetchCampaigns = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const [campaignData, statsData] = await Promise.all([
        fetchCampaignList(),
        authJson<any>("/api/stats")
      ]);
      setCampaigns(campaignData || []);
      setStats(statsData);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error("Failed to fetch data", err);
      toast.error("Connection Error", {
        description: err.message || "Failed to retrieve campaign data hubs."
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(() => fetchCampaigns(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setBusyCampaignId(id);
    
    const promise = updateCampaignStatus(id, nextStatus as any);
    
    toast.promise(promise, {
      loading: `${nextStatus === 'PAUSED' ? 'Pausing' : 'Resuming'} campaign...`,
      success: () => {
        fetchCampaigns();
        return `Campaign ${nextStatus === 'PAUSED' ? 'paused' : 'resumed'}`;
      },
      error: 'Failed to update campaign status',
    });

    try {
      await promise;
    } finally {
      setBusyCampaignId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    toast.warning(`Delete campaign: ${name}?`, {
      description: "All lead data for this search hub will be permanently removed.",
      action: {
        label: "Delete",
        onClick: async () => {
          setBusyCampaignId(id);
          try {
            await deleteCampaign(id);
            fetchCampaigns();
            toast.success("Campaign deleted", {
              description: "The campaign and its leads have been removed."
            });
          } catch (err: any) {
            toast.error("Failed to delete campaign", {
              description: err.response?.data?.message || err.message || "Decommission protocol failed."
            });
          } finally {
            setBusyCampaignId(null);
          }
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}
      }
    });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query || campaign.name.toLowerCase().includes(query);
    const statusMatch = statusFilter === "ALL" || campaign.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="w-full space-y-10 pb-32 font-sans selection:bg-primary/20">
      {/* Professional Header & Global Stats */}
      <div className="pt-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-card-border pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-60">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Data Discovery
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Search <span className="text-primary">Hubs</span>
            </h1>
            <p className="text-[13px] text-foreground opacity-60 font-medium max-w-2xl leading-relaxed">
              Manage your autonomous lead generation campaigns. Monitor discovery performance and targeting accuracy in real-time.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => fetchCampaigns(true)}
              className="h-14 w-14 rounded-full bg-card border border-card-border flex items-center justify-center hover:border-primary/20 hover:text-primary text-foreground transition-all"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            </button>
            <Link 
              href="/campaigns/new" 
              className="h-14 px-8 rounded-full bg-primary text-white font-bold text-[14px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 shadow-lg shadow-primary/10"
            >
              <Plus className="h-4 w-4" /> 
              New Campaign
            </Link>
          </div>
        </div>

        {/* Global Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'ACTIVE').length, icon: Activity, detail: 'Operational' },
            { label: 'Leads Found Today', value: stats?.leadsToday || '0', icon: Shield, detail: `${stats?.dailyLimit || 2500} Daily Limit` },
            { label: 'Average Accuracy', value: '98.4%', icon: Sparkles, detail: 'AI Verified' },
            { label: 'System Status', value: 'Optimal', icon: Compass, detail: 'Global Edge' },
          ].map((stat, i) => (
            <div key={i} className="bento-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-full bg-card border border-card-border text-foreground opacity-60">
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-foreground opacity-40 uppercase tracking-wider">{stat.detail}</span>
              </div>
              <p className="text-[11px] font-bold text-foreground opacity-60 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={typeof stat.value === 'string' ? parseFloat(stat.value.replace(/[^\d.]/g, '')) || 0 : stat.value} />
                {typeof stat.value === 'string' && stat.value.includes('%') && '%'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Compass className="h-4 w-4 text-foreground opacity-40" />
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full h-14 bg-card border border-card-border rounded-full pl-14 pr-6 text-[14px] transition-all outline-none text-foreground placeholder:text-foreground/40"
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-card border border-card-border rounded-full">
          {["ALL", "ACTIVE", "PAUSED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={cn(
                "h-12 px-6 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
                statusFilter === status 
                  ? "bg-primary text-white shadow-md shadow-primary/10 border border-primary/20" 
                  : "text-foreground hover:bg-card/50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Data Grid */}
      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1, 2, 3].map(i => <CardSkeleton key={i} />)
          ) : filteredCampaigns.length === 0 ? (
            <EmptyState title="No Campaigns Found" description="Create your first campaign to start finding leads." onAction={() => router.push("/campaigns/new")} actionText="New Campaign" />
          ) : filteredCampaigns.map((c, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              key={c.id} 
              className="bento-card overflow-hidden group"
            >
              <div className="p-8 lg:p-10 space-y-10">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-card border border-card-border flex items-center justify-center shrink-0">
                      <Briefcase className={cn(
                        "h-6 w-6 transition-colors",
                        c.status === 'ACTIVE' ? "text-primary" : "text-foreground opacity-40"
                      )} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">{c.name}</h3>
                        <div className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          c.status === 'ACTIVE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-card border-card-border text-foreground"
                        )}>
                          {c.status}
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-foreground opacity-60 uppercase tracking-widest">Initialized {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex gap-2 w-full lg:w-auto">
                    <button 
                      onClick={() => toggleStatus(c.id, c.status)}
                      disabled={busyCampaignId === c.id}
                      className={cn(
                        "flex-1 lg:flex-none h-12 px-6 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2",
                        c.status === 'ACTIVE' 
                          ? "bg-card border-card-border text-foreground hover:bg-card/80" 
                          : "bg-primary text-white border-primary hover:brightness-110 shadow-md shadow-primary/10"
                      )}
                    >
                      {busyCampaignId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (c.status === 'ACTIVE' ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>)}
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={busyCampaignId === c.id}
                      className="h-12 w-12 rounded-full bg-card border border-card-border text-foreground hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-card/50 border border-card-border p-6 rounded-card space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Radar className="h-4 w-4 text-primary/60" />
                      <span className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-widest">Industry Targets</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.industries.map((ind, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-card border border-card-border text-[10px] font-medium text-foreground">{ind}</span>
                      ))}
                      {c.industries.length === 0 && <span className="text-[10px] text-foreground opacity-40">All Industries</span>}
                    </div>
                  </div>

                  <div className="bg-card/50 border border-card-border p-6 rounded-card space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary/60" />
                      <span className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-widest">Target Locations</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.locations.map((loc, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-card border border-card-border text-[10px] font-medium text-foreground">{loc}</span>
                      ))}
                      {c.locations.length === 0 && <span className="text-[10px] text-foreground opacity-40">Global Coverage</span>}
                    </div>
                  </div>

                  <div className="bg-card/50 border border-card-border p-6 rounded-card space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-primary/60" />
                        <span className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-widest">Campaign Performance</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-medium text-foreground opacity-60 uppercase tracking-widest">Accuracy Score</span>
                        <span className="text-[10px] font-black text-foreground">94%</span>
                      </div>
                      <div className="h-1.5 w-full bg-border-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Trigger */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-card-border">
                  <div className="flex-1 flex gap-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-foreground opacity-40 uppercase tracking-widest">Total Leads</p>
                      <p className="text-3xl font-bold text-foreground">{c._count?.leads || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-foreground opacity-40 uppercase tracking-widest">Discovery Rate</p>
                      <p className="text-3xl font-bold text-foreground">12.4<span className="text-sm text-foreground opacity-40">/hr</span></p>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/campaigns/${c.id}/edit`)}
                      className="h-10 px-5 bg-card hover:bg-card border border-card-border rounded-full text-xs font-bold uppercase tracking-widest transition-all text-foreground"
                    >
                      <Settings className="h-3.5 w-3.5 mr-2 opacity-60" />
                      Edit Hub
                    </Button>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => fetchBrief(c.id)}
                          className="h-10 px-5 bg-card hover:bg-card border border-card-border rounded-full text-xs font-bold uppercase tracking-widest transition-all text-foreground"
                        >
                          <Info className="h-3.5 w-3.5 mr-2 opacity-60" />
                          Intelligence
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-lg border-l border-card-border bg-sidebar p-0 overflow-hidden shadow-2xl shadow-primary/10">
                        <div className="h-full flex flex-col font-sans relative">
                          {/* Atmospheric Background */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />

                          {/* Panel Header */}
                          <div className="relative p-10 border-b border-card-border bg-card/40 backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Search className="h-6 w-6 text-primary animate-pulse" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black tracking-tight text-foreground">{c.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  <p className="text-[10px] text-foreground opacity-60 font-bold uppercase tracking-[0.3em]">Neural Hub Intelligence</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <ScrollArea className="flex-1 px-10 py-12">
                            <motion.div 
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: { opacity: 0 },
                                visible: { 
                                  opacity: 1,
                                  transition: { staggerChildren: 0.1 }
                                }
                              }}
                              className="space-y-12 pb-10"
                            >
                              {/* Mission DNA Section */}
                              <motion.section 
                                variants={{
                                  hidden: { x: 20, opacity: 0 },
                                  visible: { x: 0, opacity: 1 }
                                }}
                                className="space-y-6"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-card border border-card-border flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-primary/60" />
                                  </div>
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-60">Mission DNA</h4>
                                </div>
                                
                                <div className="grid gap-6 bg-card p-8 rounded-card border border-card-border relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                                  
                                  <div className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2">
                                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground opacity-40 mb-2 block">Operational Product</label>
                                      <p className="text-lg font-bold text-foreground tracking-tight">{c.productName}</p>
                                    </div>
                                    
                                    <div>
                                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground opacity-40 mb-3 block">Regional Targets</label>
                                      <div className="flex flex-wrap gap-2">
                                        {c.locations.map(loc => (
                                          <span key={loc} className="px-3 py-1 bg-card border border-card-border rounded-full text-[10px] font-black text-foreground uppercase tracking-wider">{loc}</span>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground opacity-40 mb-3 block">Target Sectors</label>
                                      <div className="flex flex-wrap gap-2">
                                        {c.industries.map(ind => (
                                          <span key={ind} className="px-3 py-1 bg-primary/5 border border-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">{ind}</span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.section>

                              {/* AI Explanation Section */}
                              <motion.section 
                                variants={{
                                  hidden: { x: 20, opacity: 0 },
                                  visible: { x: 0, opacity: 1 }
                                }}
                                className="space-y-6"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-card border border-card-border flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-primary/60" />
                                  </div>
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-60">AI Synthesis</h4>
                                </div>
                                
                                <div className="relative group">
                                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-emerald-500/30 to-primary/30 rounded-card blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                                  <div className="relative bg-card border border-card-border p-8 rounded-card min-h-[160px] flex items-center shadow-2xl">
                                    {loadingBrief === c.id ? (
                                      <div className="w-full space-y-4">
                                        <div className="h-2 w-full bg-border-muted animate-pulse rounded-full" />
                                        <div className="h-2 w-[90%] bg-border-muted animate-pulse rounded-full" />
                                        <div className="h-2 w-[40%] bg-border-muted animate-pulse rounded-full" />
                                      </div>
                                    ) : (
                                      <p className="text-base leading-relaxed text-foreground font-medium italic selection:bg-primary/30">
                                        "{briefs[c.id] || "Analyzing mission parameters for strategic synthesis..."}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.section>

                              {/* Strategic Pain Points */}
                              <motion.section 
                                variants={{
                                  hidden: { x: 20, opacity: 0 },
                                  visible: { x: 0, opacity: 1 }
                                }}
                                className="space-y-6"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-card border border-card-border flex items-center justify-center">
                                    <Target className="h-4 w-4 text-primary/60" />
                                  </div>
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-60">Pain Point Matrix</h4>
                                </div>
                                <div className="p-8 bg-card/50 border border-dashed border-card-border rounded-card relative group">
                                  <div className="absolute top-4 right-4 text-[8px] font-black text-foreground opacity-40 uppercase tracking-widest group-hover:text-primary/40 transition-colors">Strategic Filter</div>
                                  <p className="text-sm text-foreground leading-relaxed font-medium">{c.targetPainPoints}</p>
                                </div>
                              </motion.section>
                            </motion.div>
                          </ScrollArea>

                          {/* Panel Footer */}
                          <div className="p-10 border-t border-card-border bg-card/20 backdrop-blur-md">
                            <Button 
                              variant="secondary" 
                              className="w-full h-14 bg-card hover:bg-primary hover:text-white border border-card-border rounded-full transition-all duration-500 flex items-center justify-center gap-3 group"
                              onClick={() => {
                                  if (briefs[c.id]) {
                                    navigator.clipboard.writeText(briefs[c.id]);
                                    toast.success("Intelligence Copied", { description: "Mission brief saved to clipboard." });
                                  }
                              }}
                            >
                              <ClipboardCheck className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Copy Intelligence Brief</span>
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={busyCampaignId === c.id}
                      onClick={() => handleDelete(c.id, c.name)}
                      className="w-12 h-9 border border-card-border bg-card text-foreground hover:text-destructive hover:border-destructive/40 transition-all duration-300 rounded-full flex items-center justify-center"
                    >
                      {busyCampaignId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
