"use client";

import { useEffect, useState } from "react";
import { Search, ExternalLink, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ApiAuthError, ApiRequestError } from "@/lib/api";
import type { Lead, PaginationMeta } from "@/lib/types";
import { fetchLeads as fetchLeadList, updateLeadStatus } from "@/lib/services/leads";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Lead["status"]>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, totalLeads: 0 });

  const fetchLeads = async () => {
    try {
      setError(null);
      const data = await fetchLeadList(page, 20);
      setLeads(data.leads || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, totalLeads: 0 });
      setLoading(false);
    } catch (err) {
      if (err instanceof ApiAuthError) {
        setError("Please sign in to view your leads.");
      } else if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        console.error("Error fetching leads:", err);
        setError("Unable to load leads right now. Please refresh.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page]);

  const updateStatus = async (id: string, status: Lead["status"]) => {
    try {
      await updateLeadStatus(id, status);
      fetchLeads();
    } catch (err) {
      if (err instanceof ApiAuthError) {
        setError("Authentication expired. Please sign in again.");
      } else if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        console.error("Status update failed", err);
      }
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
      setError("Could not copy message to clipboard.");
    }
  };

  const statusColors: Record<string, string> = {
    NEW: "bg-primary/10 text-primary",
    CONTACTED: "bg-warm/10 text-warm",
    CONVERTED: "bg-emerald-400/10 text-emerald-400",
    REJECTED: "bg-zinc-800 text-zinc-500",
  };

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query || (
      lead.business.name.toLowerCase().includes(query) ||
      lead.industry.toLowerCase().includes(query) ||
      lead.painPoint.toLowerCase().includes(query)
    );
    const statusMatch = statusFilter === "ALL" || lead.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Lead Hub</h1>
          <p className="text-zinc-400 text-sm">Real-time repository of enriched business intelligence.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl bg-zinc-900 border border-white/5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:border-primary/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | Lead["status"])}
            className="h-10 rounded-xl bg-zinc-900 border border-white/5 px-4 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:border-primary/50"
          >
            <option value="ALL">All statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONVERTED">Converted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl border border-white/5 p-4">
          <p className="muted-label mb-2">Total Leads</p>
          <p className="text-2xl font-bold">{pagination.totalLeads}</p>
        </div>
        <div className="glass rounded-xl border border-white/5 p-4">
          <p className="muted-label mb-2">Page</p>
          <p className="text-2xl font-bold">{pagination.page} / {pagination.totalPages}</p>
        </div>
        <div className="glass rounded-xl border border-white/5 p-4">
          <p className="muted-label mb-2">Visible</p>
          <p className="text-2xl font-bold">{filteredLeads.length}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-500 uppercase text-[10px] tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Lead Detail</th>
                <th className="px-6 py-4">Intelligence</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4">Captured</th>
                <th className="px-6 py-4 text-right">Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-5"><Skeleton className="h-6 w-44" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-6 w-40" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-7 w-24 rounded-full" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-5"><div className="ml-auto w-fit"><Skeleton className="h-9 w-28 rounded-xl" /></div></td>
                  </tr>
                ))
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState 
                      title="No matching leads"
                      description="Try a broader search term or clear your current query."
                    />
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-white text-base">{lead.business.name}</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                      {lead.business.website && (
                        <a href={lead.business.website} target="_blank" className="hover:text-primary transition-colors flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Visit Domain
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-zinc-300 font-medium">{lead.industry}</div>
                    <div className="text-[11px] text-zinc-500 mt-1 max-w-[200px] line-clamp-1 italic">"{lead.painPoint}"</div>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as Lead["status"])}
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase cursor-pointer border-none ring-1 ring-inset ring-white/10 focus:ring-primary/50 ${statusColors[lead.status] || "bg-zinc-800 text-zinc-400"}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 text-zinc-500 tabular-nums">
                    {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => copyToClipboard(lead.suggestedMessage, lead.id)}
                        className={`h-9 px-4 flex items-center gap-2 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider ${
                          copiedId === lead.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {copiedId === lead.id ? "Copied" : "Copy Message"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages || loading}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
