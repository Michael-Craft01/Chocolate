"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ExternalLink, MoreVertical, MessageSquare } from "lucide-react";

interface Lead {
  id: string;
  industry: string;
  painPoint: string;
  suggestedMessage: string;
  status: string;
  createdAt: string;
  business: {
    name: string;
    website: string;
    phone: string;
  };
}

import { motion } from "framer-motion";
import { Skeleton, TableSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusColors: Record<string, string> = {
    NEW: "bg-primary/10 text-primary",
    CONTACTED: "bg-warm/10 text-warm",
    CONVERTED: "bg-emerald-400/10 text-emerald-400",
    REJECTED: "bg-zinc-800 text-zinc-500",
  };

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
              className="h-10 rounded-xl bg-zinc-900 border border-white/5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:border-primary/50"
            />
          </div>
          <button className="flex h-10 items-center gap-2 rounded-xl bg-zinc-900 border border-white/5 px-4 text-sm font-medium hover:bg-zinc-800 transition-all">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

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
                <TableSkeleton rows={8} />
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState 
                      title="No leads captured yet"
                      description="Launch a campaign or refine your search targets to start populating your hub with AI-enriched leads."
                    />
                  </td>
                </tr>
              ) : leads.map((lead) => (
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
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
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
    </motion.div>
  );
}
