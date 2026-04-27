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
import { fetchCampaigns as fetchCampaignList, updateCampaignStatus } from "@/lib/services/campaigns";
import type { Campaign } from "@/lib/types";
import { Sparkline } from "@/components/Sparkline";

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
      setError("Could not load discovery hubs. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 30000); // Au every 30s
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
      router.push("/leads");
    } catch (err) {
      console.error("Trigger failed", err);
      setError("Failed to start scan. Please check your connection.");
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
    <div className="w-full space-y-10 pb-20 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-6 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary text-[11px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck className="h-4 w-4 glow-primary" /> Safe & Private
          </div>
          <h1 className="text-4xl font-black tracking-tightest gradient-text">Search</h1>
          <p className="text-[13px] text-zinc-500 font-bold uppercase tracking-[0.15em]">Find new business leads in any city or industry.</p>
        </div>
        <Link 
          href="/campaigns/new" 
          className="h-14 px-10 rounded-sm bg-primary text-white font-black text-[14px] uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center gap-3 glow-primary shadow-xl shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> New Search
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Active', value: campaigns.filter(c => c.status === 'ACTIVE').length, icon: Compass, color: 'text-primary' },
          { label: 'Found Today', value: '12', icon: Shield, color: 'text-zinc-500' },
          { label: 'Total Searches', value: campaigns.length, icon: Activity, color: 'text-zinc-500' },
          { label: "Cycles", value: campaigns.length * 12, icon: History, color: "text-violet-400" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-sm border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color} ${stat.label === 'Active' ? 'glow-primary' : ''}`} />
            </div>
            <p className="text-3xl font-black tracking-tightest text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Compass className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-sm pl-14 pr-6 text-[14px] font-bold uppercase tracking-[0.1em] focus:border-primary/40 transition-all outline-none text-white placeholder:text-zinc-700"
          />
        </div>
        <div className="relative">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-14 bg-white/[0.03] border border-white/5 rounded-sm px-8 text-[12px] font-black uppercase tracking-widest focus:border-primary/40 outline-none cursor-pointer appearance-none text-zinc-400 hover:text-white transition-colors"
          >
            <option value="ALL">All Categories</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PAUSED">Paused Only</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
            <ChevronRight className="h-4 w-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-10">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
          ) : filteredCampaigns.length === 0 ? (
            <div className="md:col-span-2">
              <EmptyState title="No Hubs Found" description="Create your first discovery hub to start finding leads." onAction={() => router.push("/campaigns/new")} actionText="New Hub" />
            </div>
          ) : filteredCampaigns.map((c, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              key={c.id} 
              className="glass-card rounded-sm border border-white/5 overflow-hidden group"
            >
              <div className="p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center relative overflow-hidden group-hover:border-primary/30 transition-all shadow-2xl shadow-primary/5 shrink-0">
                      {c.status === 'ACTIVE' && (
                        <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                      )}
                      <Home className="h-7 w-7 text-primary relative z-10 glow-primary orange-glow" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black tracking-tightest text-white group-hover:text-primary transition-colors uppercase truncate">{c.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`h-2 w-2 rounded-sm ${c.status === 'ACTIVE' ? 'bg-primary glow-primary shadow-[0_0_10px_rgba(255,109,41,0.8)] animate-pulse' : 'bg-zinc-800'}`} />
                        <span className={`text-[11px] font-black uppercase tracking-[0.25em] ${c.status === 'ACTIVE' ? 'text-primary' : 'text-zinc-600'}`}>
                          {c.status} MODE
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 sm:-translate-y-2 sm:group-hover:translate-y-0">
                    <button 
                      onClick={() => toggleStatus(c.id, c.status)}
                      disabled={busyCampaignId === c.id}
                      className="flex-1 sm:flex-none p-3.5 rounded-sm bg-white/[0.03] border border-white/5 hover:border-primary/30 text-zinc-500 hover:text-primary transition-all disabled:opacity-50 glass flex items-center justify-center"
                    >
                      {c.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button className="flex-1 sm:flex-none p-3.5 rounded-sm bg-white/[0.03] border border-white/5 hover:border-red-500/30 text-zinc-500 hover:text-red-500 transition-all glass flex items-center justify-center">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-sm bg-white/[0.01] border border-white/5 space-y-2 hover:bg-white/[0.03] transition-colors group/hub">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3 text-zinc-600 group-hover/hub:text-primary transition-colors" />
                      <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover/hub:text-zinc-500 transition-colors">Target Industry</p>
                    </div>
                    <p className="text-[13px] font-bold text-zinc-400 truncate">{c.industries.join(", ") || 'All Industries'}</p>
                  </div>
                  <div className="p-5 rounded-sm bg-white/[0.01] border border-white/5 space-y-2 hover:bg-white/[0.03] transition-colors group/hub">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-zinc-600 group-hover/hub:text-primary transition-colors" />
                      <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover/hub:text-zinc-500 transition-colors">Target Location</p>
                    </div>
                    <p className="text-[13px] font-bold text-zinc-400 truncate">{c.locations.join(", ") || 'All Locations'}</p>
                  </div>
                </div>

                <div className="relative p-6 rounded-sm bg-primary/[0.03] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  
                  <div className="flex-1 flex items-center gap-5 relative z-10">
                    <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                      <Radar className={`h-6 w-6 text-primary ${c.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-black tracking-tight text-white uppercase">{c._count?.leads || 0} Businesses Found</p>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 bg-primary/10 rounded-sm overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            className="h-full bg-gradient-to-r from-primary to-primary-hover shadow-[0_0_10px_rgba(255,109,41,0.5)]" 
                          />
                        </div>
                        <span className="text-[11px] text-primary font-black uppercase tracking-widest">85% SCORE</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block px-6 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Sparkline color="#ff6d29" />
                  </div>

                  <button 
                    onClick={() => triggerSweep(c.id)}
                    disabled={triggering === c.id || c.status !== 'ACTIVE'}
                    className="h-12 px-8 rounded-sm bg-primary text-white text-[14px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 glow-primary shadow-xl shadow-primary/20 relative z-10"
                  >
                    {triggering === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan for Leads"}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white/[0.02] px-8 py-5 flex justify-between items-center border-t border-white/5">
                <button className="text-[11px] font-black text-zinc-500 hover:text-white transition-all flex items-center gap-3 uppercase tracking-[0.25em] group/act">
                  <Activity className="h-3.5 w-3.5 text-primary/50 group-hover/act:text-primary transition-colors" />
                  Discovery Logs <ChevronRight className="h-3 w-3 group-hover/act:translate-x-1 transition-transform" />
                </button>
                <button className="text-[11px] font-black text-zinc-500 hover:text-white transition-all flex items-center gap-3 uppercase tracking-[0.25em] group/act">
                   Targeting Setup <Command className="h-3.5 w-3.5 text-zinc-600 group-hover/act:text-white transition-colors" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
