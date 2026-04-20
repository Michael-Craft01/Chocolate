"use client";

import { useState, useEffect } from "react";
import { Plus, Target, MapPin, Briefcase, Play, Pause, Trash2, Search } from "lucide-react";

import { motion } from "framer-motion";
import { CardSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import { ApiAuthError, ApiRequestError } from "@/lib/api";
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

  const fetchCampaigns = async () => {
    try {
      setError(null);
      const data = await fetchCampaignList();
      setCampaigns(data || []);
      setLoading(false);
    } catch (err) {
      if (err instanceof ApiAuthError) {
        setError("Please sign in to view your campaigns.");
      } else if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        console.error("Failed to fetch campaigns", err);
        setError("Could not load campaigns. Please try again.");
      }
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      campaign.name.toLowerCase().includes(query) ||
      campaign.industries.join(", ").toLowerCase().includes(query) ||
      campaign.locations.join(", ").toLowerCase().includes(query);
    const statusMatch = statusFilter === "ALL" || campaign.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const activeCount = campaigns.filter((campaign) => campaign.status === "ACTIVE").length;
  const pausedCount = campaigns.filter((campaign) => campaign.status === "PAUSED").length;
  const totalLeads = campaigns.reduce((acc, campaign) => acc + (campaign._count?.leads ?? 0), 0);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setBusyCampaignId(id);
    try {
      await updateCampaignStatus(id, nextStatus);
      fetchCampaigns();
    } catch (err) {
      if (err instanceof ApiAuthError) {
        setError("Authentication expired. Please sign in again.");
      } else if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        console.error("Failed to toggle campaign status", err);
        setError("Status update failed. Please try again.");
      }
    } finally {
      setBusyCampaignId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Campaign Manager</h1>
          <p className="text-zinc-400 text-sm">Orchestrate and monitor your automated lead engines.</p>
        </div>
        <button 
          onClick={() => router.push("/campaigns/new")}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl border border-white/5 p-4">
          <p className="muted-label mb-2">Active Campaigns</p>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
        <div className="glass rounded-xl border border-white/5 p-4">
          <p className="muted-label mb-2">Paused Campaigns</p>
          <p className="text-2xl font-bold">{pausedCount}</p>
        </div>
        <div className="glass rounded-xl border border-white/5 p-4">
          <p className="muted-label mb-2">Total Leads Captured</p>
          <p className="text-2xl font-bold">{totalLeads}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name, location, industry..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-zinc-200 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | Campaign["status"])}
          className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-200 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/40"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="EXHAUSTED">Exhausted</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {error && (
          <div className="lg:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filteredCampaigns.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState 
              title={campaigns.length ? "No matching campaigns" : "No campaigns yet"}
              description={
                campaigns.length
                  ? "Try clearing search or switching status filters."
                  : "Your specialized lead generation engines will appear here. Start by creating your first campaign to begin capturing high-value leads."
              }
              actionText={campaigns.length ? "Create Campaign" : "Create Campaign"}
              onAction={() => router.push("/campaigns/new")}
            />
          </div>
        ) : filteredCampaigns.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group interactive-card">
            <div className={`absolute top-0 right-0 h-1.5 w-24 ${c.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-700'}`} />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{c.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStatus(c.id, c.status)}
                  disabled={busyCampaignId === c.id}
                  aria-label={c.status === "ACTIVE" ? "Pause campaign" : "Activate campaign"}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {c.status === 'ACTIVE' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button aria-label="Delete campaign" className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all active:scale-90">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Briefcase className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-300 font-medium truncate">{c.industries.join(", ")}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-300 font-medium truncate">{c.locations.join(", ")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Intelligence Found</span>
                <span className="text-2xl font-black text-white">{c._count?.leads || 0}</span>
              </div>
              <button className="h-9 px-4 rounded-lg bg-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                Campaign Settings
              </button>
            </div>
          </div>
        ))}
      </div>

    </motion.div>
  );
}
