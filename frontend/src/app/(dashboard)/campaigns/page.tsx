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
  RefreshCw,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useRouter } from "next/navigation";
import { authJson } from "@/lib/api";
import { fetchCampaigns as fetchCampaignList, updateCampaignStatus, deleteCampaign } from "@/lib/services/campaigns";
import { runCampaignCycle } from "@/lib/services/cycles";
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
        description: err.message || "Failed to retrieve campaigns."
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
      description: "All lead data for this campaign will be permanently removed.",
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
              description: err.response?.data?.message || err.message || "Failed to delete campaign."
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

  const cyclesRemaining = stats?.cycles?.remaining || 0;
  const cycleLimit = stats?.cycles?.monthlyLimit || 0;
  const isCycleEmpty = cyclesRemaining <= 0;
  const isCycleLow = !isCycleEmpty && cyclesRemaining <= Math.max(2, Math.ceil(cycleLimit * 0.15));

  const handleRunCycle = async (id: string) => {
    setTriggering(id);
    const promise = runCampaignCycle(id);

    toast.promise(promise, {
      loading: "Queueing search...",
      success: "Search queued.",
      error: (err: any) => err.message || "Failed to queue cycle",
    });

    try {
      await promise;
      await fetchCampaigns(true);
    } finally {
      setTriggering(null);
    }
  };

  const cycleBadgeClass = (status?: string) => {
    if (status === "COMPLETED") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
    if (status === "RUNNING" || status === "QUEUED") return "bg-primary/10 border-primary/20 text-primary";
    if (status === "FAILED") return "bg-red-500/10 border-red-500/20 text-red-500";
    if (status === "PARTIAL") return "bg-amber-500/10 border-amber-500/20 text-amber-500";
    return "bg-card border-card-border text-foreground";
  };

  return (
    <div className="w-full space-y-8 pb-32 font-sans selection:bg-primary/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-card-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Campaigns
          </h1>
        </div>

        <div className="flex gap-4">
          <button onClick={() => fetchCampaigns(true)}
            className="h-12 w-12 rounded-full bg-card border border-card-border flex items-center justify-center hover:border-primary/20 hover:text-primary text-foreground transition-all cursor-pointer"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
          <Link 
            href="/campaigns/new" 
            id="tour-campaigns-create"
            className="h-12 px-6 rounded-full bg-primary text-white font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
          >
            <Plus className="h-4 w-4" /> 
            New Campaign
          </Link>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div id="tour-campaigns-search" className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-foreground opacity-40" />
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full h-14 bg-card border border-card-border rounded-full pl-14 pr-6 text-[14px] transition-all outline-none text-foreground placeholder:text-foreground/40"
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-card border border-card-border rounded-full shrink-0">
          {[
            { id: "ALL", label: "All" },
            { id: "ACTIVE", label: "Active" },
            { id: "PAUSED", label: "Paused" }
          ].map((status) => (
            <button key={status.id} onClick={() => setStatusFilter(status.id as any)}
              className={cn(
                "h-10 px-5 rounded-full text-xs font-bold transition-all cursor-pointer",
                statusFilter === status.id 
                  ? "bg-primary text-white shadow-md shadow-primary/10 border border-primary/20" 
                  : "text-foreground hover:bg-card/50"
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Data Grid */}
      <div id="tour-campaigns-list" className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1, 2, 3].map(i => <CardSkeleton key={i} />)
          ) : filteredCampaigns.length === 0 ? (
            <EmptyState title="No Campaigns" description="Create a campaign to start finding leads." onAction={() => router.push("/campaigns/new")} actionText="New Campaign" />
          ) : filteredCampaigns.map((c, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              key={c.id} 
              className="bento-card overflow-hidden group rounded-3xl"
            >
              <div className="p-6 md:p-8 space-y-6">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-card border border-card-border flex items-center justify-center shrink-0">
                      <Briefcase className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                        c.status === 'ACTIVE' ? "text-primary" : "text-foreground opacity-40"
                      )} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">{c.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          c.status === 'ACTIVE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-card border-card-border text-foreground"
                        )}>
                          {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          cycleBadgeClass(c.cycleRuns?.[0]?.status)
                        )}>
                          {c.cycleRuns?.[0]?.status ? c.cycleRuns[0].status.charAt(0) + c.cycleRuns[0].status.slice(1).toLowerCase() : "No runs"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCycleEmpty ? (
                      <Link
                        href="/billing"
                        className="h-9 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 bg-primary text-white hover:brightness-110 shadow-md shadow-primary/10"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Buy credits</span>
                      </Link>
                    ) : c.status !== "ACTIVE" ? (
                      <button
                        onClick={() => toggleStatus(c.id, c.status)}
                        disabled={busyCampaignId === c.id}
                        className="h-9 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 bg-primary text-white hover:brightness-110 shadow-md shadow-primary/10 disabled:opacity-50 cursor-pointer"
                      >
                        {busyCampaignId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Activate</span></>}
                      </button>
                    ) : c.cycleRuns?.[0]?.status === "RUNNING" || c.cycleRuns?.[0]?.status === "QUEUED" ? (
                      <div className="h-9 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 bg-primary/10 text-primary">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> <span className="hidden sm:inline">Running</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRunCycle(c.id)}
                        disabled={triggering === c.id}
                        className="h-9 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 bg-primary text-white hover:brightness-110 disabled:opacity-50 shadow-md shadow-primary/10 cursor-pointer"
                      >
                        {triggering === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Run search</span></>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Simplified sectors and locations tags row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-foreground/60 pt-2">
                  {c.industries.length > 0 && (
                    <div>
                      <span className="opacity-50">Sectors: </span>
                      {c.industries.join(", ")}
                    </div>
                  )}
                  {c.locations.length > 0 && (
                    <div>
                      <span className="opacity-50">Locations: </span>
                      {c.locations.join(", ")}
                    </div>
                  )}
                  {c.cycleRuns?.[0] && (
                    <div>
                      <span className="opacity-50">Last Run: </span>
                      {c.cycleRuns[0].leadsFound}/{c.cycleRuns[0].maxLeads} found
                    </div>
                  )}
                </div>
 
                {/* Footer: stats + actions */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-card-border">
                  <div className="flex gap-6">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-foreground opacity-40">Total Leads</p>
                      <p className="text-lg font-bold text-foreground">{c._count?.leads || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(c.id, c.status)}
                      disabled={busyCampaignId === c.id}
                      title={c.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                      className={cn(
                        "h-9 w-9 rounded-full border flex items-center justify-center transition-all cursor-pointer",
                        c.status === 'ACTIVE'
                          ? "bg-card border-card-border text-foreground hover:text-amber-500 hover:border-amber-500/30"
                          : "bg-primary/10 border-primary/20 text-primary hover:brightness-110"
                      )}
                    >
                      {busyCampaignId === c.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : c.status === 'ACTIVE' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>

                    <Button variant="outline" size="sm" onClick={() => router.push(`/campaigns/${c.id}/edit`)}
                      className="h-9 px-3 bg-card hover:bg-card border border-card-border rounded-full text-xs font-bold transition-all text-foreground cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5 sm:mr-2 opacity-60" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => fetchBrief(c.id)}
                          className="h-9 px-3 bg-card hover:bg-card border border-card-border rounded-full text-xs font-bold transition-all text-foreground cursor-pointer"
                        >
                          <Info className="h-3.5 w-3.5 sm:mr-2 opacity-60" />
                          <span className="hidden sm:inline">Insights</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-lg border-l border-card-border bg-sidebar p-0 overflow-hidden shadow-2xl shadow-primary/10">
                        <div className="h-full flex flex-col font-sans relative">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />

                          <div className="relative p-8 md:p-10 border-b border-card-border bg-card/40 backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <Search className="h-6 w-6 text-primary animate-pulse" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold tracking-tight text-foreground">{c.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  <p className="text-xs font-bold text-foreground opacity-60">AI Strategy summary</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <ScrollArea className="flex-1 px-8 md:px-10 py-8">
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
                              className="space-y-10 pb-10"
                            >
                              <motion.section 
                                variants={{
                                  hidden: { x: 20, opacity: 0 },
                                  visible: { x: 0, opacity: 1 }
                                }}
                                className="space-y-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-card border border-card-border flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-primary/60" />
                                  </div>
                                  <h4 className="text-xs font-bold text-foreground opacity-60">Campaign criteria</h4>
                                </div>
                                
                                <div className="grid gap-6 bg-card p-6 md:p-8 rounded-2xl border border-card-border relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                                  
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                      <label className="text-xs font-bold text-foreground opacity-40 mb-1.5 block">Product/Service</label>
                                      <p className="text-base font-bold text-foreground tracking-tight">{c.productName}</p>
                                    </div>
                                    
                                    <div>
                                      <label className="text-xs font-bold text-foreground opacity-40 mb-2 block">Regions</label>
                                      <div className="flex flex-wrap gap-1.5">
                                        {c.locations.map(loc => (
                                          <span key={loc} className="px-2.5 py-1 bg-card border border-card-border rounded-full text-xs font-bold text-foreground">{loc}</span>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-xs font-bold text-foreground opacity-40 mb-2 block">Target sectors</label>
                                      <div className="flex flex-wrap gap-1.5">
                                        {c.industries.map(ind => (
                                          <span key={ind} className="px-2.5 py-1 bg-primary/5 border border-primary/20 text-primary rounded-full text-xs font-bold">{ind}</span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.section>

                              <motion.section 
                                variants={{
                                  hidden: { x: 20, opacity: 0 },
                                  visible: { x: 0, opacity: 1 }
                                }}
                                className="space-y-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-card border border-card-border flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-primary/60" />
                                  </div>
                                  <h4 className="text-xs font-bold text-foreground opacity-60">AI Strategy summary</h4>
                                </div>
                                
                                <div className="relative group">
                                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-emerald-500/30 to-primary/30 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                                  <div className="relative bg-card border border-card-border p-6 md:p-8 rounded-2xl min-h-[140px] flex items-center shadow-xl">
                                    {loadingBrief === c.id ? (
                                      <div className="w-full space-y-3">
                                        <div className="h-2 w-full bg-border-muted animate-pulse rounded-full" />
                                        <div className="h-2 w-[90%] bg-border-muted animate-pulse rounded-full" />
                                        <div className="h-2 w-[40%] bg-border-muted animate-pulse rounded-full" />
                                      </div>
                                    ) : (
                                      <p className="text-sm md:text-base leading-relaxed text-foreground font-medium italic selection:bg-primary/30">
                                        "{briefs[c.id] || "Analyzing campaign criteria for strategy summary..."}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.section>

                              <motion.section 
                                variants={{
                                  hidden: { x: 20, opacity: 0 },
                                  visible: { x: 0, opacity: 1 }
                                }}
                                className="space-y-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-card border border-card-border flex items-center justify-center">
                                    <Target className="h-4 w-4 text-primary/60" />
                                  </div>
                                  <h4 className="text-xs font-bold text-foreground opacity-60">Customer Needs Matrix</h4>
                                </div>
                                <div className="p-6 md:p-8 bg-card/50 border border-dashed border-card-border rounded-2xl relative group">
                                  <div className="absolute top-3 right-4 text-[10px] font-bold text-foreground opacity-40 group-hover:text-primary/40 transition-colors">Strategy</div>
                                  <p className="text-xs md:text-sm text-foreground leading-relaxed font-medium">{c.targetPainPoints}</p>
                                </div>
                              </motion.section>
                            </motion.div>
                          </ScrollArea>

                          <div className="p-8 md:p-10 border-t border-card-border bg-card/20 backdrop-blur-md">
                            <Button variant="secondary" className="w-full h-12 bg-card hover:bg-primary hover:text-white rounded-full transition-all duration-500 flex items-center justify-center gap-2 group cursor-pointer" onClick={() => {
                                  if (briefs[c.id]) {
                                    navigator.clipboard.writeText(briefs[c.id]);
                                    toast.success("Insights Copied", { description: "Strategy summary saved to clipboard." });
                                  }
                              }}
                            >
                              <ClipboardCheck className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                              <span className="text-xs font-bold">Copy strategy summary</span>
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Button variant="outline" size="sm" disabled={busyCampaignId === c.id} onClick={() => handleDelete(c.id, c.name)}
                      className="h-9 w-9 border border-card-border bg-card text-foreground hover:text-destructive hover:border-destructive/40 transition-all duration-300 rounded-full flex items-center justify-center cursor-pointer"
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
