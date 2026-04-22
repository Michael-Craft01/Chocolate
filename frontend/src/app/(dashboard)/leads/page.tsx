"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  ExternalLink, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Target,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { authJson, ApiAuthError, ApiRequestError } from "@/lib/api";
import type { Lead, PaginationMeta, Campaign } from "@/lib/types";
import { fetchLeads as fetchLeadList, updateLeadStatus } from "@/lib/services/leads";
import { fetchCampaigns } from "@/lib/services/campaigns";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Lead["status"]>("ALL");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, totalLeads: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const campaignFilter = selectedCampaignId === "ALL" ? undefined : selectedCampaignId;
      
      const [leadsData, campaignsData] = await Promise.all([
        fetchLeadList(page, 50, campaignFilter),
        fetchCampaigns()
      ]);

      setLeads(leadsData.leads || []);
      setCampaigns(campaignsData || []);
      setPagination(leadsData.pagination || { page: 1, totalPages: 1, totalLeads: 0 });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Unable to load intelligence hub. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, selectedCampaignId]);

  const updateStatus = async (id: string, status: Lead["status"]) => {
    try {
      await updateLeadStatus(id, status);
      fetchData();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const statusColors: Record<string, string> = {
    NEW: "bg-primary/10 text-primary",
    CONTACTED: "bg-amber-500/10 text-amber-400",
    CONVERTED: "bg-emerald-400/10 text-emerald-400",
    REJECTED: "bg-zinc-800 text-zinc-500",
  };

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase().trim();
    return !query || (
      lead.business.name.toLowerCase().includes(query) ||
      lead.industry.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header & Global Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight gradient-text">Intelligence Hub</h1>
          <p className="text-zinc-400">Manage and export high-value leads captured by your engines.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-12 pr-4 text-sm outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-2 h-12 px-4 rounded-xl bg-white/5 border border-white/10">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-2xl border border-white/5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Leads</p>
          <p className="text-3xl font-black">{pagination.totalLeads}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Filter</p>
          <p className="text-xl font-bold text-primary truncate">
            {selectedCampaignId === 'ALL' ? 'All Engines' : campaigns.find(c => c.id === selectedCampaignId)?.name}
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Success Rate</p>
          <p className="text-3xl font-black text-emerald-400">0%</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Leads Table */}
      <div className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                <th className="px-8 py-5">Company & Engine</th>
                <th className="px-8 py-5">Intelligence Found</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-40" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-full" /></td>
                    <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-32 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <EmptyState title="No intelligence found" description="Adjust your filters or launch a new sweep." />
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-white">{lead.business.name}</p>
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {lead.campaign?.name || 'Unknown Engine'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-300">{lead.industry}</p>
                      <p className="text-xs text-zinc-500 italic max-w-xs line-clamp-1">{lead.painPoint}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as any)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase outline-none cursor-pointer border border-white/10 ${statusColors[lead.status]}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-3">
                      {lead.business.website && (
                        <a 
                          href={lead.business.website} 
                          target="_blank" 
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => copyToClipboard(lead.suggestedMessage, lead.id)}
                        className={`h-11 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                          copiedId === lead.id ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
                        }`}
                      >
                        {copiedId === lead.id ? "Copied" : "Copy Pitch"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-white/5 ${className}`} />;
}
