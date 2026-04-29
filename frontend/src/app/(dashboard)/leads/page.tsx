"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Compass, ExternalLink, MessageSquare, Filter, Loader2,
  FileDown, Phone, Globe, Calendar, Building2, CheckCircle2,
  Copy, Trash2, Check, Clock, BrainCircuit, Sparkles,
  Activity, ShieldCheck, Shield, ChevronDown, ChevronUp,
  TrendingUp, Zap, Search, RefreshCw, BarChart3, Users,
  ArrowUpRight, Star, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { authJson, getApiBaseUrl } from "@/lib/api";
import { createClient } from "@/lib/supabase";
import type { Lead, PaginationMeta, Campaign } from "@/lib/types";
import { fetchLeads as fetchLeadList } from "@/lib/services/leads";
import { fetchCampaigns } from "@/lib/services/campaigns";

// Group leads by calendar day, then by sweep within that day
function groupLeadsByDayAndSweep(leads: Lead[]) {
  const dayMap: Record<string, { date: string; sweeps: Record<string, { sweepId: string; time: string; leads: Lead[] }> }> = {};

  for (const lead of leads) {
    const d = new Date(lead.sweepDate || lead.createdAt);
    const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const sweepKey = lead.sweepId || "legacy";

    if (!dayMap[dayKey]) dayMap[dayKey] = { date: d.toISOString(), sweeps: {} };
    if (!dayMap[dayKey].sweeps[sweepKey]) {
      dayMap[dayKey].sweeps[sweepKey] = { sweepId: sweepKey, time: d.toISOString(), leads: [] };
    }
    dayMap[dayKey].sweeps[sweepKey].leads.push(lead);
  }

  return Object.entries(dayMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dayKey, { date, sweeps }]) => ({
      dayKey,
      date,
      sweeps: Object.values(sweeps).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
      total: Object.values(sweeps).reduce((n, s) => n + s.leads.length, 0),
    }));
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, totalLeads: 0 });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "all">("timeline");

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const campaignFilter = selectedCampaignId === "ALL" ? undefined : selectedCampaignId;
      const [leadsData, campaignsData] = await Promise.all([
        fetchLeadList(page, 200, campaignFilter),
        fetchCampaigns()
      ]);
      setLeads(leadsData.leads || []);
      setCampaigns(campaignsData || []);
      setPagination(leadsData.pagination || { page: 1, totalPages: 1, totalLeads: 0 });
      // Auto-expand the most recent day
      const groups = groupLeadsByDayAndSweep(leadsData.leads || []);
      if (groups.length > 0) setExpandedDays(new Set([groups[0].dayKey]));
    } catch (err) {
      setError("Unable to connect to your collection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, selectedCampaignId]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(l =>
      l.business.name.toLowerCase().includes(q) ||
      l.industry?.toLowerCase().includes(q) ||
      l.painPoint?.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const dayGroups = useMemo(() => groupLeadsByDayAndSweep(filteredLeads), [filteredLeads]);

  // Stats
  const todayLeads = dayGroups[0]?.dayKey === new Date().toISOString().slice(0, 10) ? dayGroups[0].total : 0;
  const totalSweeps = dayGroups.reduce((n, d) => n + d.sweeps.length, 0);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this lead from your collection?")) return;
    try {
      await authJson(`/api/leads/${id}`, { method: "DELETE" });
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch { alert("Failed to remove lead."); }
  };

  const copyIntel = async (lead: Lead) => {
    const text = `Business: ${lead.business.name}\nIndustry: ${lead.industry}\nOpportunity: ${lead.painPoint}\n\nSuggested Message:\n${lead.suggestedMessage}`;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportLeads = async (format: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    const filter = selectedCampaignId === "ALL" ? "" : `?campaignId=${selectedCampaignId}`;
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/leads/export${filter}${filter ? "&" : "?"}token=${encodeURIComponent(token)}&format=${format}`;
    
    window.open(url, "_blank");
    setShowExportOptions(false);
  };

  const toggleDay = (key: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-40 font-sans">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-label text-primary">
              <ShieldCheck className="h-4 w-4" /> Intelligence Collection
            </div>
            <h1 className="text-display">Leads</h1>
            <p className="text-label text-zinc-500">
              {pagination.totalLeads} total · grouped by sweep cycle
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Refresh */}
            <button
              onClick={() => fetchData(true)}
              className="h-10 w-10 rounded-sm bg-white/[0.03] border border-white/5 flex items-center justify-center hover:border-primary/20 hover:text-primary text-zinc-500 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
            </button>

            {/* Campaign filter */}
            <div className="h-10 px-4 rounded-sm bg-white/[0.03] border border-white/5 flex items-center gap-2 hover:border-primary/20 transition-all glass">
              <Filter className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={selectedCampaignId}
                onChange={e => { setSelectedCampaignId(e.target.value); setPage(1); }}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-zinc-400 hover:text-white transition-colors"
              >
                <option value="ALL">All Campaigns</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="h-10 px-6 rounded-sm bg-white text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-white/5"
              >
                <FileDown className="h-3.5 w-3.5" /> Export
              </button>
              <AnimatePresence>
                {showExportOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-44 bg-[#0a0a0b] border border-white/10 rounded-sm overflow-hidden z-50 shadow-2xl"
                  >
                    {["CSV", "Excel", "JSON"].map(f => (
                      <button key={f} onClick={() => exportLeads(f.toLowerCase())}
                        className="w-full px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >Export as {f}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Leads", value: pagination.totalLeads, icon: Users, color: "text-primary" },
            { label: "Today", value: todayLeads, icon: Zap, color: "text-white" },
            { label: "Sweep Cycles", value: totalSweeps, icon: RefreshCw, color: "text-primary" },
            { label: "Days Active", value: dayGroups.length, icon: Calendar, color: "text-zinc-300" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card rounded-sm border border-white/5 p-4 flex items-center gap-4">
              <div className={`h-9 w-9 rounded-sm bg-white/[0.03] border border-white/5 flex items-center justify-center ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-label text-zinc-600">{label}</p>
                <p className={`text-stat ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, industry, or opportunity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-sm pl-14 pr-6 text-sm font-medium outline-none focus:bg-primary/5 focus:border-primary/20 transition-all text-white placeholder:text-zinc-700 glass"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-sm w-fit">
          {[
            { id: "timeline", label: "By Day & Cycle", icon: Calendar },
            { id: "all", label: "All Leads", icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`h-8 px-5 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === id ? "bg-white text-black" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-sm bg-white/[0.02]" />)
            ) : dayGroups.length === 0 ? (
              <EmptyState title="No Leads Found" description="Start a discovery sweep to populate your collection." />
            ) : activeTab === "timeline" ? (
              // TIMELINE VIEW — grouped by day then by sweep
              dayGroups.map((day, di) => (
                <motion.div
                  key={day.dayKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: di * 0.04 }}
                  className="space-y-3"
                >
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDay(day.dayKey)}
                    className="w-full flex items-center gap-4 group"
                  >
                    <div className="h-px flex-1 bg-white/5 group-hover:bg-primary/20 transition-colors" />
                    <div className="flex items-center gap-3 px-4 py-2 rounded-sm bg-white/[0.03] border border-white/5 group-hover:border-primary/20 transition-all">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-white">{formatDay(day.date)}</span>
                      <div className="h-3 w-[1px] bg-white/10" />
                      <span className="text-[10px] font-black text-zinc-500">
                        <span className="text-primary">{day.total}</span> leads · <span className="text-white">{day.sweeps.length}</span> cycle{day.sweeps.length !== 1 ? "s" : ""}
                      </span>
                      {expandedDays.has(day.dayKey) ? <ChevronUp className="h-3 w-3 text-zinc-600" /> : <ChevronDown className="h-3 w-3 text-zinc-600" />}
                    </div>
                    <div className="h-px flex-1 bg-white/5 group-hover:bg-primary/20 transition-colors" />
                  </button>

                  {/* Sweeps for this day */}
                  <AnimatePresence>
                    {expandedDays.has(day.dayKey) && day.sweeps.map((sweep, si) => (
                      <motion.div
                        key={sweep.sweepId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 space-y-2"
                      >
                        {/* Sweep header */}
                        <div className="flex items-center gap-3 py-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Zap className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                            Cycle {si + 1} · {formatTime(sweep.time)}
                          </span>
                          <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{sweep.leads.length} leads</span>
                          </div>
                        </div>

                        {/* Lead cards */}
                        <div className="space-y-2 ml-9">
                          {sweep.leads.map((lead, idx) => (
                            <LeadCard
                              key={lead.id}
                              lead={lead}
                              idx={idx}
                              expanded={expandedId === lead.id}
                              copied={copiedId === lead.id}
                              onExpand={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                              onCopy={() => copyIntel(lead)}
                              onDelete={() => handleDelete(lead.id)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              // ALL VIEW — flat list
              <div className="space-y-2">
                {filteredLeads.map((lead, idx) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    idx={idx}
                    expanded={expandedId === lead.id}
                    copied={copiedId === lead.id}
                    onExpand={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    onCopy={() => copyIntel(lead)}
                    onDelete={() => handleDelete(lead.id)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-10 px-6 rounded-sm bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              Page <span className="text-primary">{page}</span> of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="h-10 px-6 rounded-sm bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Reusable Lead Card ----
function LeadCard({ lead, idx, expanded, copied, onExpand, onCopy, onDelete }: {
  lead: Lead; idx: number; expanded: boolean; copied: boolean;
  onExpand: () => void; onCopy: () => void; onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.02 }}
      className={`glass-card rounded-sm border transition-all duration-300 ${expanded ? "border-primary/30 ring-1 ring-primary/10" : "border-white/5 hover:border-white/10"}`}
    >
      {/* Row */}
      <div onClick={onExpand} className="flex items-center justify-between p-5 cursor-pointer group">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-sm bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-primary/20 transition-colors flex-shrink-0">
            <Building2 className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors truncate">{lead.business.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest truncate">{lead.industry}</span>
              {lead.business.phone && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" /> has phone
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {/* AI score bar */}
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">AI Score</span>
            <div className="flex items-center gap-2">
              <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-orange-400" style={{ width: "85%" }} />
              </div>
              <span className="text-[9px] font-black text-primary">8.5</span>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-zinc-600" /> : <ChevronDown className="h-4 w-4 text-zinc-600" />}
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-3 border-t border-white/5 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Intelligence */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                      <Target className="h-3 w-3 text-primary" /> Growth Opportunity
                    </label>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">{lead.painPoint}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-primary" /> Suggested Outreach
                    </label>
                    <p className="text-sm text-zinc-400 italic leading-relaxed font-medium border-l-2 border-primary/20 pl-4">
                      "{lead.suggestedMessage}"
                    </p>
                  </div>
                </div>

                {/* Right: Contact + Actions */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-sm bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Phone className="h-2.5 w-2.5" /> Phone
                      </p>
                      <p className="text-xs font-bold text-zinc-300">{lead.business.phone || "—"}</p>
                    </div>
                    <div className="p-4 rounded-sm bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Globe className="h-2.5 w-2.5" /> Website
                      </p>
                      <p className="text-xs font-bold text-zinc-300 truncate">
                        {lead.business.website?.replace(/https?:\/\//, "") || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onCopy}
                      className={`flex-1 h-10 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        copied ? "bg-primary text-white" : "bg-white text-black hover:bg-zinc-100"
                      }`}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy Intel"}
                    </button>
                    {lead.business.website && (
                      <a
                        href={lead.business.website} target="_blank" rel="noopener noreferrer"
                        className="h-10 w-10 rounded-sm bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/20 transition-all"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={onDelete}
                      className="h-10 w-10 rounded-sm bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-600 hover:text-primary hover:border-primary/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
