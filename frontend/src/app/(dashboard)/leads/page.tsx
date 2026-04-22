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
  Loader2,
  FileDown,
  Phone,
  Globe,
  Zap,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Copy,
  Trash2,
  Pencil,
  Check,
  X,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { authJson } from "@/lib/api";
import type { Lead, PaginationMeta, Campaign } from "@/lib/types";
import { fetchLeads as fetchLeadList, updateLeadStatus } from "@/lib/services/leads";
import { fetchCampaigns } from "@/lib/services/campaigns";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, totalLeads: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignFilter = selectedCampaignId === "ALL" ? undefined : selectedCampaignId;
      const [leadsData, campaignsData] = await Promise.all([
        fetchLeadList(page, 100, campaignFilter),
        fetchCampaigns()
      ]);
      setLeads(leadsData.leads || []);
      setCampaigns(campaignsData || []);
      setPagination(leadsData.pagination || { page: 1, totalPages: 1, totalLeads: 0 });
    } catch (err) {
      setError("Intelligence Hub unreachable. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, selectedCampaignId]);

  // Grouping Logic
  const groupedLeads = leads.reduce((acc: any, lead) => {
    const sweepKey = lead.sweepId || "legacy";
    if (!acc[sweepKey]) {
      acc[sweepKey] = {
        id: sweepKey,
        date: lead.sweepDate || lead.createdAt,
        leads: []
      };
    }
    acc[sweepKey].leads.push(lead);
    return acc;
  }, {});

  const sortedGroups = Object.values(groupedLeads).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this intelligence?")) return;
    try {
      await authJson(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const saveEdit = async (id: string) => {
    try {
      await authJson(`/api/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(editValues)
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...editValues } : l));
      setEditingId(null);
    } catch (err) {
      alert("Save failed.");
    }
  };

  const copyFullIntel = async (lead: Lead) => {
    const text = `Lead: ${lead.business.name}\nIndustry: ${lead.industry}\nPain: ${lead.painPoint}\n\nPitch: ${lead.suggestedMessage}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen pb-40">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="max-w-6xl mx-auto space-y-12 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10">
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter gradient-text">Intelligence</h1>
            <p className="text-zinc-500 font-medium max-w-md">Chronological feed of high-value business opportunities.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => {
                const token = localStorage.getItem("token");
                const filter = selectedCampaignId === "ALL" ? "" : `?campaignId=${selectedCampaignId}`;
                window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/leads/export${filter}${filter ? '&' : '?'}token=${token}`, "_blank");
              }}
              className="h-14 px-8 rounded-2xl bg-white text-black font-black text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-2xl shadow-white/10"
            >
              <FileDown className="h-5 w-5" /> Export Document
            </button>

            <div className="h-14 px-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md">
              <Filter className="h-4 w-4 text-zinc-500" />
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer pr-4"
              >
                <option value="ALL">All Engines</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-20 bg-white/[0.02] border border-white/5 rounded-[2rem] pl-16 pr-8 text-xl font-medium outline-none focus:bg-white/[0.05] focus:border-primary/20 transition-all shadow-inner"
          />
        </div>

        {/* The Timeline */}
        <div className="relative space-y-24 pt-10">
          {/* Timeline Center Line */}
          <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent" />

          {loading ? (
            [1,2].map(i => <Skeleton key={i} className="h-96 rounded-[3rem] ml-0 md:ml-20" />)
          ) : sortedGroups.length === 0 ? (
            <EmptyState title="Timeline Empty" description="Launch a sweep to see leads appear here." />
          ) : sortedGroups.map((group: any) => (
            <div key={group.id} className="relative">
              {/* Cycle Header */}
              <div className="sticky top-24 z-10 flex items-center gap-6 mb-12 -ml-2 md:-ml-0">
                <div className="h-12 w-12 rounded-full bg-[#070707] border-4 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="glass px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-black uppercase tracking-widest text-white">
                      {new Date(group.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="text-primary">{group.leads.length}</span> Intelligence Reports Found
                  </div>
                </div>
              </div>

              {/* Lead Cards for this Cycle */}
              <div className="grid grid-cols-1 gap-6 ml-0 md:ml-20">
                {group.leads.map((lead: any, idx: number) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative"
                  >
                    <div className="glass rounded-[2.5rem] border border-white/5 p-8 md:p-10 hover:border-primary/30 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/5">
                      <div className="flex flex-col lg:flex-row gap-10">
                        {/* Company Detail */}
                        <div className="flex-1 space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-1">
                                <Target className="h-3 w-3" /> {lead.campaign?.name || 'Main Engine'}
                              </div>
                              <h3 className="text-4xl font-black tracking-tighter">{lead.business.name}</h3>
                              <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                                <MapPin className="h-4 w-4 text-emerald-400" />
                                {editingId === lead.id ? (
                                  <input 
                                    value={editValues.industry}
                                    onChange={e => setEditValues({ ...editValues, industry: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none text-emerald-400"
                                  />
                                ) : lead.industry}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {editingId === lead.id ? (
                                <button onClick={() => saveEdit(lead.id)} className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center"><Check className="h-5 w-5" /></button>
                              ) : (
                                <button onClick={() => { setEditingId(lead.id); setEditValues({ industry: lead.industry, painPoint: lead.painPoint, suggestedMessage: lead.suggestedMessage }); }} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Pencil className="h-4 w-4" /></button>
                              )}
                              <button onClick={() => handleDelete(lead.id)} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {lead.business.phone && (
                              <a href={`tel:${lead.business.phone}`} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Mobile</p>
                                <p className="text-sm font-bold">{lead.business.phone}</p>
                              </a>
                            )}
                            {lead.business.website && (
                              <a href={lead.business.website} target="_blank" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Website</p>
                                <p className="text-sm font-bold truncate">{lead.business.website.replace(/https?:\/\//, '')}</p>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* AI Intelligence */}
                        <div className="flex-1 lg:max-w-md space-y-6">
                          <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                              <Zap className="h-5 w-5 text-primary opacity-20" />
                            </div>
                            
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pain Point</label>
                                {editingId === lead.id ? (
                                  <textarea value={editValues.painPoint} onChange={e => setEditValues({ ...editValues, painPoint: e.target.value })} className="w-full bg-black/40 rounded-xl p-3 text-sm outline-none border border-white/10" />
                                ) : (
                                  <p className="text-lg font-bold leading-tight">{lead.painPoint}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">AI Outreach Pitch</label>
                                {editingId === lead.id ? (
                                  <textarea value={editValues.suggestedMessage} onChange={e => setEditValues({ ...editValues, suggestedMessage: e.target.value })} className="w-full bg-black/40 rounded-xl p-3 text-sm outline-none border border-white/10 h-32" />
                                ) : (
                                  <p className="text-xs text-zinc-400 leading-relaxed italic">"{lead.suggestedMessage}"</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button 
                              onClick={() => copyFullIntel(lead)}
                              className={`flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                                copiedId === lead.id ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
                              }`}
                            >
                              <Copy className="h-4 w-4" /> {copiedId === lead.id ? "Report Copied" : "Copy Full Intel"}
                            </button>
                            <a 
                              href={`https://wa.me/${(lead.business.phone || '').replace(/\D/g, '')}`}
                              target="_blank"
                              className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                            >
                              <Phone className="h-5 w-5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
