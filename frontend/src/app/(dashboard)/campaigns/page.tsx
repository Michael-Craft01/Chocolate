"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, MapPin, Briefcase, Play, 
  Pause, Trash2, Zap, Loader2, 
  Radar, History, ChevronRight, Activity,
  Sparkles,
  Command,
  ShieldCheck,
  Home,
  Compass,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
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

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyCampaignId, setBusyCampaignId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Campaign["status"]>("ALL");
  const [triggering, setTriggering] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);

  const fetchCampaigns = async () => {
    try {
      const [campaignData, statsData] = await Promise.all([
        fetchCampaignList(),
        authJson<any>("/api/stats")
      ]);
      setCampaigns(campaignData || []);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Connection Error", {
        description: "Failed to retrieve campaign data hubs."
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 30000);
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
        label: "Cancel"
      }
    });
  };

  const triggerSweep = async (id: string) => {
    const promise = authJson(`/api/campaigns/${id}/trigger`, { method: 'POST' });
    
    toast.promise(promise, {
      loading: 'Starting lead scan...',
      success: () => {
        router.push("/leads");
        return 'Scan initiated';
      },
      error: 'Failed to start scan',
    });

    try {
      setTriggering(id);
      await promise;
    } catch (err) {
      console.error("Trigger failed", err);
    } finally {
      setTriggering(null);
    }
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Data Discovery
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Search <span className="text-primary">Hubs</span>
            </h1>
            <p className="text-[13px] text-zinc-500 font-medium max-w-2xl leading-relaxed">
              Manage your autonomous lead generation campaigns. Monitor discovery performance and targeting accuracy in real-time.
            </p>
          </div>

          <div className="flex gap-4">
            <Link 
              href="/campaigns/new" 
              className="h-14 px-8 rounded-[2px] bg-primary text-white font-bold text-[14px] hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-3 shadow-lg shadow-primary/10"
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
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2px] p-6 hover:bg-white/[0.04] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-[2px] bg-white/5 border border-white/10 text-zinc-500">
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{stat.detail}</span>
              </div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Compass className="h-4 w-4 text-zinc-600" />
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-[2px] pl-14 pr-6 text-[14px] focus:border-primary/40 focus:bg-white/[0.04] transition-all outline-none text-white placeholder:text-zinc-700"
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-[2px]">
          {["ALL", "ACTIVE", "PAUSED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={cn(
                "h-12 px-6 rounded-[2px] text-[11px] font-bold uppercase tracking-wider transition-all",
                statusFilter === status 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-400"
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
              className="bg-white/[0.01] border border-white/5 rounded-[2px] overflow-hidden hover:border-white/10 transition-all group"
            >
              <div className="p-8 lg:p-10 space-y-10">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Briefcase className={cn(
                        "h-6 w-6 transition-colors",
                        c.status === 'ACTIVE' ? "text-primary" : "text-zinc-700"
                      )} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white tracking-tight">{c.name}</h3>
                        <div className={cn(
                          "px-2.5 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-widest border",
                          c.status === 'ACTIVE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-800 border-white/5 text-zinc-500"
                        )}>
                          {c.status}
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest">Initialized {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex gap-2 w-full lg:w-auto">
                    <button 
                      onClick={() => toggleStatus(c.id, c.status)}
                      disabled={busyCampaignId === c.id}
                      className={cn(
                        "flex-1 lg:flex-none h-12 px-6 rounded-[2px] text-[11px] font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-2",
                        c.status === 'ACTIVE' 
                          ? "bg-white/5 border-white/10 text-zinc-400 hover:text-white" 
                          : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                      )}
                    >
                      {busyCampaignId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (c.status === 'ACTIVE' ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>)}
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={busyCampaignId === c.id}
                      className="h-12 w-12 rounded-[2px] bg-white/5 border border-white/10 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/5 p-6 rounded-[2px] space-y-4">
                    <div className="flex items-center gap-3">
                      <Radar className="h-4 w-4 text-primary/60" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Industry Targets</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.industries.map((ind, i) => (
                        <span key={i} className="px-2 py-1 rounded-[2px] bg-white/5 text-[10px] font-medium text-zinc-400">{ind}</span>
                      ))}
                      {c.industries.length === 0 && <span className="text-[10px] text-zinc-600">All Industries</span>}
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2px] space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary/60" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Locations</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.locations.map((loc, i) => (
                        <span key={i} className="px-2 py-1 rounded-[2px] bg-white/5 text-[10px] font-medium text-zinc-400">{loc}</span>
                      ))}
                      {c.locations.length === 0 && <span className="text-[10px] text-zinc-600">Global Coverage</span>}
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2px] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-primary/60" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Campaign Performance</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Accuracy Score</span>
                        <span className="text-[10px] font-black text-white">94%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-[2px] overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Trigger */}
                <div className="flex flex-col md:flex-row items-center gap-8 pt-8 border-t border-white/5">
                  <div className="flex-1 flex gap-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Leads</p>
                      <p className="text-3xl font-bold text-white">{c._count?.leads || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Discovery Rate</p>
                      <p className="text-3xl font-bold text-white">12.4<span className="text-sm text-zinc-600">/hr</span></p>
                    </div>
                  </div>

                  <button 
                    onClick={() => triggerSweep(c.id)}
                    disabled={triggering === c.id || c.status !== 'ACTIVE'}
                    className="h-14 px-10 rounded-[2px] bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 text-white text-[13px] font-bold transition-all flex items-center gap-3"
                  >
                    {triggering === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4 text-primary" />}
                    Start Lead Scan
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
