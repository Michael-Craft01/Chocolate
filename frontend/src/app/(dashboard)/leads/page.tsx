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
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Command,
  Activity
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

  const copyFullIntel = async (lead: Lead) => {
    const text = `Lead: ${lead.business.name}\nIndustry: ${lead.industry}\nPain: ${lead.painPoint}\n\nPitch: ${lead.suggestedMessage}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen pb-40 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-sm  -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-sm  translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="max-w-6xl mx-auto space-y-10 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-6 border-b border-white/5 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles className="h-4 w-4 glow-primary" /> Intelligence Core
            </div>
            <h1 className="text-4xl font-black tracking-tightest gradient-text">Intelligence Hub</h1>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.15em]">Chronological telemetry of high-value business opportunities.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => {
                const token = localStorage.getItem("token");
                const filter = selectedCampaignId === "ALL" ? "" : `?campaignId=${selectedCampaignId}`;
                window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/leads/export${filter}${filter ? '&' : '?'}token=${token}`, "_blank");
              }}
              className="h-12 px-8 rounded-sm bg-white text-black font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3  shadow-white/5"
            >
              <FileDown className="h-4 w-4" /> Export Data
            </button>

            <div className="relative group">
              <div className="h-12 px-6 rounded-sm bg-white/[0.03] border border-white/5 flex items-center gap-3 group-hover:border-white/10 transition-all">
                <Filter className="h-4 w-4 text-zinc-500" />
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer pr-6 appearance-none text-zinc-400 group-hover:text-white transition-colors"
                >
                  <option value="ALL">All Cluster Nodes</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search extraction telemetry..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-sm pl-16 pr-8 text-sm font-bold uppercase tracking-widest outline-none focus:bg-white/[0.05] focus:border-primary/30 transition-all text-white placeholder:text-zinc-700"
          />
        </div>

        {/* The Timeline */}
        <div className="relative space-y-24 pt-10">
          {/* Timeline Center Line */}
          <div className="absolute left-0 md:left-10 top-0 bottom-0 w-[2px]   via-white/5 " />

          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-96 rounded-sm ml-0 md:ml-24 bg-white/[0.02]" />)
            ) : sortedGroups.length === 0 ? (
              <EmptyState title="Timeline Offline" description="Launch an extraction engine sweep to begin populating this hub." />
            ) : sortedGroups.map((group: any) => (
              <div key={group.id} className="relative">
                {/* Cycle Header */}
                <div className="sticky top-28 z-10 flex items-center gap-8 mb-12 -ml-2 md:-ml-0">
                  <div className="h-16 w-16 rounded-sm bg-background border border-white/5 flex items-center justify-center  relative group/node">
                    <div className="absolute inset-0 bg-primary/10 rounded-sm animate-pulse" />
                    <Activity className="h-6 w-6 text-primary glow-primary relative z-10" />
                  </div>
                  <div className="glass-card px-6 py-3 rounded-sm border border-white/5 flex items-center gap-6 ">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary glow-primary" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-white">
                        {new Date(group.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-primary glow-text">{group.leads.length}</span> EXTRACTION RESULTS
                    </div>
                  </div>
                </div>

                {/* Lead Cards for this Cycle */}
                <div className="grid grid-cols-1 gap-6 ml-0 md:ml-24">
                  {group.leads.map((lead: any, idx: number) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative"
                    >
                      <div className="glass-card rounded-sm border border-white/5 p-8 md:p-10 hover:border-primary/20 transition-all duration-500">
                        <div className="flex flex-col lg:flex-row gap-12">
                          {/* Company Detail */}
                          <div className="flex-1 space-y-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                                  <Target className="h-3 w-3 glow-primary" /> {lead.campaign?.name || 'Legacy Sweep'}
                                </div>
                                <h3 className="text-3xl font-black tracking-tightest text-white group-hover:text-primary transition-colors">{lead.business.name}</h3>
                                <div className="flex items-center gap-3 text-zinc-500 font-black text-[11px] uppercase tracking-widest">
                                  <div className="h-5 w-5 rounded-sm bg-emerald-500/10 flex items-center justify-center">
                                    <MapPin className="h-3 w-3 text-emerald-500" />
                                  </div>
                                  {lead.industry}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button onClick={() => handleDelete(lead.id)} className="h-10 w-10 rounded-sm bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-zinc-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {lead.business.phone && (
                                <div className="p-4 rounded-sm bg-white/[0.02] border border-white/5 group/info">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 group-hover:text-zinc-500 transition-colors">Neural Frequency (Phone)</p>
                                  <p className="text-[13px] font-bold text-zinc-300">{lead.business.phone}</p>
                                </div>
                              )}
                              {lead.business.website && (
                                <div className="p-4 rounded-sm bg-white/[0.02] border border-white/5 group/info">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 group-hover:text-zinc-500 transition-colors">Source Node (Website)</p>
                                  <p className="text-[13px] font-bold text-zinc-300 truncate">{lead.business.website.replace(/https?:\/\//, '')}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* AI Intelligence */}
                          <div className="flex-1 lg:max-w-md space-y-6">
                            <div className="p-8 rounded-sm bg-primary/5 border border-primary/10 relative overflow-hidden group/intel">
                              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/intel:opacity-[0.08] transition-opacity duration-700">
                                <BrainCircuit className="h-20 w-20" />
                              </div>
                              <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] glow-text">Neural Match Confidence</label>
                                  <span className="text-[11px] font-black text-primary">8.4 / 10</span>
                                </div>
                                <div className="h-2 w-full bg-primary/10 rounded-sm overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "84%" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-primary glow-primary" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Detected Pain Vector</label>
                                  <p className="text-[15px] font-bold leading-snug text-white">{lead.painPoint}</p>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Suggested Outreach Protocol</label>
                                  <p className="text-[12px] text-zinc-400 leading-relaxed font-medium italic">"{lead.suggestedMessage}"</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <button 
                                onClick={() => copyFullIntel(lead)}
                                className={`flex-1 h-14 rounded-sm font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 ${
                                  copiedId === lead.id ? "bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]" : "bg-white text-black hover:bg-zinc-200"
                                }`}
                              >
                                {copiedId === lead.id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />} 
                                {copiedId === lead.id ? "Telemetry Copied" : "Copy Intel Packet"}
                              </button>
                              <a 
                                href={lead.business.website}
                                target="_blank"
                                className="h-14 w-14 rounded-sm bg-white/[0.03] border border-white/5 text-zinc-500 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group/src"
                              >
                                <Globe className="h-5 w-5 group-hover/src:glow-primary" />
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
