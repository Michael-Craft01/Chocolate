"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Target, MapPin, Briefcase, Play, 
  Pause, Trash2, Search, Zap, Loader2, 
  Radar, History, ChevronRight, Activity 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import { authJson, ApiAuthError, ApiRequestError } from "@/lib/api";
import { fetchCampaigns as fetchCampaignList, updateCampaignStatus } from "@/lib/services/campaigns";
import type { Campaign } from "@/lib/types";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyCampaignId, setBusyCampaignId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Campaign["status"]>("ALL");
  const [triggering, setTriggering] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const data = await fetchCampaignList();
      setCampaigns(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
      setError("Could not load campaigns. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setBusyCampaignId(id);
    try {
      await updateCampaignStatus(id, nextStatus);
      await fetchCampaigns();
    } finally {
      setBusyCampaignId(null);
    }
  };

  const triggerSweep = async (id: string) => {
    try {
      setTriggering(id);
      await authJson(`/api/campaigns/${id}/trigger`, { method: 'POST' });
      // Redirect to leads page to see it happening live
      router.push("/leads");
    } catch (err) {
      console.error("Trigger failed", err);
      setError("Failed to trigger sweep. Please check your connection.");
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <Activity className="h-4 w-4" /> System Health: Operational
          </div>
          <h1 className="text-4xl font-black tracking-tight gradient-text">Lead Engines</h1>
          <p className="text-zinc-400">Deploy and monitor your autonomous lead generation agents.</p>
        </div>
        <button 
          onClick={() => router.push("/campaigns/new")}
          className="flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-bold text-white hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Deploy New Engine
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Engines", value: campaigns.filter(c => c.status === 'ACTIVE').length, icon: Zap, color: "text-emerald-400" },
          { label: "Total Intelligence", value: campaigns.reduce((acc, c) => acc + (c._count?.leads || 0), 0), icon: Target, color: "text-primary" },
          { label: "Paused", value: campaigns.filter(c => c.status === 'PAUSED').length, icon: Pause, color: "text-zinc-500" },
          { label: "Total Sweeps", value: campaigns.length * 12, icon: History, color: "text-zinc-500" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search engines by name..."
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:border-primary/50 transition-colors outline-none"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-12 bg-white/5 border border-white/10 rounded-xl px-6 text-sm focus:border-primary/50 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="PAUSED">Paused Only</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1, 2].map(i => <CardSkeleton key={i} />)
          ) : filteredCampaigns.length === 0 ? (
            <div className="md:col-span-2">
              <EmptyState title="No Engines Found" description="Launch your first campaign to start finding leads." onAction={() => router.push("/campaigns/new")} actionText="Deploy Engine" />
            </div>
          ) : filteredCampaigns.map((c) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={c.id} 
              className="glass rounded-2xl border border-white/5 overflow-hidden group interactive-card"
            >
              {/* Header */}
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center relative overflow-hidden">
                      {c.status === 'ACTIVE' && (
                        <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                      )}
                      <Target className="h-7 w-7 text-primary relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{c.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`h-2 w-2 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-600'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{c.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleStatus(c.id, c.status)}
                      disabled={busyCampaignId === c.id}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                    >
                      {c.status === 'ACTIVE' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Industry focus</p>
                    <p className="text-sm font-medium truncate">{c.industries.join(", ") || 'General'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Targeting</p>
                    <p className="text-sm font-medium truncate">{c.locations.join(", ") || 'Global'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Radar className={`h-5 w-5 text-primary ${c.status === 'ACTIVE' ? 'animate-spin-slow' : ''}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{c._count?.leads || 0} Leads Found</p>
                      <p className="text-[10px] text-zinc-500">Last sweep: {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => triggerSweep(c.id)}
                    disabled={triggering === c.id || c.status !== 'ACTIVE'}
                    className="h-10 px-4 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {triggering === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Sweep Now"}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white/5 px-8 py-4 flex justify-between items-center border-t border-white/5">
                <button className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest">
                  View Leads <ChevronRight className="h-3 w-3" />
                </button>
                <button className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest">
                  Engine Settings
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
